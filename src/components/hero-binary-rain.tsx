"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

const LANES = 8; // primary lanes
const SUB_TRAILS_MIN = 1;
const SUB_TRAILS_MAX = 5; // inclusive — each lane randomly gets 1–5 sub-trails
const IPS_PER_LANE = 6; // continuous repeating sequence of IPs per trail
const MAX_CHARS = 15; // "255.255.255.255" — longest possible IP string
const CHAR_SPACING = 3.2; // extremely tight — reads as one cohesive string
const IP_GAP = 30; // visibly larger gap between consecutive IPs on a trail
const LANE_WIDTH = 78;
const Z_FAR = -1000; // far anchor of every trail's spline — tracks the glow's X
const Z_NEAR = -8; // near anchor of every trail's spline, close to the camera
const PATH_LENGTH = Z_NEAR - Z_FAR; // total travel distance from spawn to respawn
const GLOBAL_SPEED = 150; // shared by every trail — perfectly synchronized traffic

const BASE_CHAR_WIDTH = 3.4;
const BASE_CHAR_HEIGHT = 4.6;
const NEAR_SCALE_BOOST = 1.5; // digits grow 50% larger still, on top of natural perspective, as they near the camera

const GLYPHS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
const DOT_INDEX = 10;

interface IpSlot {
  headDist: number; // distance traveled along this trail's curve, from the far anchor
  offsetFromLaneOrigin: number; // fixed — preserves rhythm across respawns
  chars: number[];
}

interface Trail {
  baseX: number; // this trail's lane-adjacent target X near the camera
  loopLength: number;
  slots: IpSlot[];
  // 4-point spline from the glow's current X (far) to this trail's baseX
  // (near). Points are mutated in place every frame — never reallocated.
  curve: THREE.CatmullRomCurve3;
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomIpChars(): number[] {
  const octets = [
    Math.floor(randRange(1, 256)),
    Math.floor(randRange(0, 256)),
    Math.floor(randRange(0, 256)),
    Math.floor(randRange(0, 256)),
  ];
  const str = octets.join(".");
  return str.split("").map((c) => (c === "." ? DOT_INDEX : Number(c)));
}

function buildSlots(): { slots: IpSlot[]; loopLength: number } {
  const slots: IpSlot[] = [];
  let cursor = 0;
  for (let i = 0; i < IPS_PER_LANE; i++) {
    const chars = randomIpChars();
    slots.push({ offsetFromLaneOrigin: cursor, chars, headDist: 0 });
    cursor += chars.length * CHAR_SPACING + IP_GAP;
  }
  const loopLength = cursor;
  // Randomized spawn/start offset — keeps gaps on adjacent trails from
  // ever lining up in a grid.
  const startOffset = Math.random() * loopLength;
  slots.forEach((s) => {
    s.headDist = (s.offsetFromLaneOrigin + startOffset) % loopLength;
  });
  return { slots, loopLength };
}

function initTrail(baseX: number): Trail {
  const { slots, loopLength } = buildSlots();
  // Placeholder points — overwritten every frame from the glow's live X
  // before they're ever sampled, so the initial values here don't matter.
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(baseX, 0, Z_FAR),
      new THREE.Vector3(baseX, 0, Z_FAR),
      new THREE.Vector3(baseX, 0, Z_NEAR),
      new THREE.Vector3(baseX, 0, Z_NEAR),
    ],
    false,
    "catmullrom",
    0.5
  );
  return { baseX, loopLength, slots, curve };
}

function initLaneGroup(index: number): Trail[] {
  const laneX = (index - (LANES - 1) / 2) * LANE_WIDTH + randRange(-10, 10);
  const trails: Trail[] = [initTrail(laneX)];

  const subCount = Math.floor(randRange(SUB_TRAILS_MIN, SUB_TRAILS_MAX + 1));
  for (let i = 0; i < subCount; i++) {
    const sign = Math.random() < 0.5 ? -1 : 1;
    // Close enough to read as the same stream, far enough to distinguish.
    const subTargetX = laneX + sign * randRange(18, 42);
    trails.push(initTrail(subTargetX));
  }
  return trails;
}

function makeGlyphAtlas(): HTMLCanvasElement {
  const cellSize = 64;
  const canvas = document.createElement("canvas");
  canvas.width = cellSize * GLYPHS.length;
  canvas.height = cellSize;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Offscreen, never-attached canvas — CSS custom properties (var(...))
  // can't resolve here, so use a system stack instead of the site font.
  ctx.font = "700 46px system-ui, -apple-system, Arial, sans-serif";
  ctx.shadowColor = "rgba(255,255,255,1)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#ffffff";
  GLYPHS.forEach((g, i) => {
    ctx.fillText(g, i * cellSize + cellSize / 2, cellSize / 2 + (g === "." ? -6 : 0));
  });
  return canvas;
}

function makeGlowTexture(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.4)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

// Each IP character is a real upright quad (mesh), not a screen-space point
// sprite — so ordinary perspective projection (projectionMatrix) already
// handles near/far scaling correctly. We only add a proximity varying for
// the brightness ramp; distance-based sizing is computed on the CPU per
// instance so it can include the extra "grows dramatically near camera"
// boost the point-sprite build used to fake with size/dist.
const VERTEX_SHADER = `
  attribute float aGlyph;
  varying float vGlyph;
  varying vec2 vUv;
  varying float vProximity;
  uniform float uNear;
  uniform float uFar;

  void main() {
    vGlyph = aGlyph;
    vUv = uv;

    #ifdef USE_INSTANCING
      vec4 worldPos = instanceMatrix * vec4(position, 1.0);
    #else
      vec4 worldPos = vec4(position, 1.0);
    #endif

    vec4 mvPosition = modelViewMatrix * worldPos;
    float dist = max(-mvPosition.z, 0.001);
    vProximity = clamp(1.0 - (dist - uNear) / (uFar - uNear), 0.0, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying float vGlyph;
  varying vec2 vUv;
  varying float vProximity;
  uniform sampler2D uMap;
  uniform float uGlyphCount;

  void main() {
    vec2 uv = vec2((vGlyph + vUv.x) / uGlyphCount, vUv.y);
    vec4 tex = texture2D(uMap, uv);
    vec3 dim = vec3(0.5, 0.22, 0.05);
    vec3 hot = vec3(1.0, 0.56, 0.16);
    vec3 color = mix(dim, hot, pow(vProximity, 2.2));
    float alpha = tex.a * mix(0.1, 1.0, pow(vProximity, 1.5));
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function HeroBinaryRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 1, 1600);

    const allTrails: Trail[] = Array.from({ length: LANES }, (_, i) => i).flatMap(
      (i) => initLaneGroup(i)
    );
    const totalInstances = allTrails.length * IPS_PER_LANE * MAX_CHARS;

    // Upright quad, pivoted at its bottom edge so an instance's position is
    // exactly where it touches the Y=0 road plane.
    const charGeometry = new THREE.PlaneGeometry(1, 1);
    charGeometry.translate(0, 0.5, 0);

    const glyphTexture = new THREE.CanvasTexture(makeGlyphAtlas());
    // Mipmapping this sparse glyph strip averages the alpha toward zero at
    // the small sizes most (far) characters render at.
    glyphTexture.generateMipmaps = false;
    glyphTexture.minFilter = THREE.LinearFilter;
    glyphTexture.magFilter = THREE.LinearFilter;
    glyphTexture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: glyphTexture },
        uNear: { value: Math.abs(Z_NEAR) },
        uFar: { value: Math.abs(Z_FAR) },
        uGlyphCount: { value: GLYPHS.length },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const glyphAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(totalInstances),
      1
    );
    charGeometry.setAttribute("aGlyph", glyphAttr);

    const chars = new THREE.InstancedMesh(charGeometry, material, totalInstances);
    chars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Instances stream far outside the base geometry's own bounding sphere —
    // never cull the whole mesh based on that.
    chars.frustumCulled = false;
    scene.add(chars);

    allTrails.forEach((trail, ti) => {
      trail.slots.forEach((slot, si) => {
        const base = (ti * IPS_PER_LANE + si) * MAX_CHARS;
        slot.chars.forEach((g, ci) => {
          glyphAttr.setX(base + ci, g);
        });
      });
    });
    glyphAttr.needsUpdate = true;

    // Volumetric teal glow — the road's vanishing point. Strictly locked to
    // Y=0 (the road plane); only X ever moves, biased into the right ~70% of
    // frame so the left stays clear for UI content.
    const glowTexture = new THREE.CanvasTexture(makeGlowTexture());
    glowTexture.needsUpdate = true;
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color("#346585"),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.set(0, 0, Z_FAR - 80);
    glow.scale.set(820, 820, 1);
    scene.add(glow);

    const noise2D = createNoise2D();

    const ELEVATION = 95; // camera sits above the flat road, looking down/ahead
    // Simplex noise's natural wavelength is ~1 input-unit, so this input
    // rate is what makes the sway read as continuous motion rather than a
    // slow drift. 0.35 already includes the "30% faster" bump requested
    // across several rounds of this spec (0.27 baseline * 1.3).
    const NOISE_SPEED = 0.35;
    const CAMERA_WEAVE_AMP_X = 110;
    const CAMERA_BANK_MAX = THREE.MathUtils.degToRad(20);
    const GLOW_RIGHT_BIAS = 340; // pushes the glow into the right 70% of frame
    const GLOW_SWING_AMP = 260;

    const dummy = new THREE.Object3D();
    const pointA = new THREE.Vector3();
    const pointB = new THREE.Vector3();
    const TANGENT_EPS = 0.01;

    let raf = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function frame(time: number) {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      elapsed += dt;

      const noiseT = elapsed * NOISE_SPEED;
      const masterWave = noise2D(noiseT, 0);

      // The glow drives everything else: its own independent lateral sway
      // defines the road's moving vanishing point. Y is never touched after
      // the initial set(…, 0, …) above — it is mathematically impossible for
      // the glow to drift off the horizon.
      const glowX = GLOW_RIGHT_BIAS + masterWave * GLOW_SWING_AMP;
      glow.position.x = glowX;
      glow.scale.setScalar(820 + noise2D(noiseT * 0.6, 5) * 40);

      camera.position.x = masterWave * CAMERA_WEAVE_AMP_X;
      camera.position.y = ELEVATION;
      camera.lookAt(glowX, 0, Z_FAR);
      camera.rotateZ(-masterWave * CAMERA_BANK_MAX);

      let glyphsDirty = false;

      allTrails.forEach((trail, ti) => {
        // Rebuild this trail's spline in place (no allocation): far anchor
        // tracks the glow's current X, near anchor sits at the trail's own
        // lane position — every trail bends to originate from the moving
        // vanishing point.
        const pts = trail.curve.points;
        pts[0].set(glowX, 0, Z_FAR);
        pts[1].set(
          THREE.MathUtils.lerp(glowX, trail.baseX, 0.33),
          0,
          THREE.MathUtils.lerp(Z_FAR, Z_NEAR, 0.33)
        );
        pts[2].set(
          THREE.MathUtils.lerp(glowX, trail.baseX, 0.7),
          0,
          THREE.MathUtils.lerp(Z_FAR, Z_NEAR, 0.7)
        );
        pts[3].set(trail.baseX, 0, Z_NEAR);

        trail.slots.forEach((slot, si) => {
          slot.headDist += GLOBAL_SPEED * dt;
          if (slot.headDist > PATH_LENGTH) {
            slot.headDist -= trail.loopLength;
            slot.chars = randomIpChars();
            glyphsDirty = true;
          }

          const base = (ti * IPS_PER_LANE + si) * MAX_CHARS;
          for (let ci = 0; ci < MAX_CHARS; ci++) {
            const instanceIndex = base + ci;
            if (ci >= slot.chars.length) {
              dummy.scale.set(0, 0, 0);
              dummy.updateMatrix();
              chars.setMatrixAt(instanceIndex, dummy.matrix);
              continue;
            }

            const charDist = slot.headDist - ci * CHAR_SPACING;
            const t = THREE.MathUtils.clamp(charDist / PATH_LENGTH, 0, 1);

            trail.curve.getPoint(t, pointA);
            trail.curve.getPoint(Math.min(t + TANGENT_EPS, 1), pointB);
            const yaw = Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);
            // A fraction of the yaw, capped at the camera's own bank limit —
            // digits twist into the curve like signage but never approach
            // horizontal, so they always stay upright.
            const bank = THREE.MathUtils.clamp(
              yaw * 0.4,
              -CAMERA_BANK_MAX,
              CAMERA_BANK_MAX
            );

            const scaleMult = THREE.MathUtils.lerp(
              1,
              NEAR_SCALE_BOOST,
              Math.pow(t, 1.6)
            );

            dummy.position.set(pointA.x, 0, pointA.z);
            dummy.rotation.set(0, yaw, bank);
            dummy.scale.set(
              BASE_CHAR_WIDTH * scaleMult,
              BASE_CHAR_HEIGHT * scaleMult,
              1
            );
            dummy.updateMatrix();
            chars.setMatrixAt(instanceIndex, dummy.matrix);

            if (glyphsDirty) glyphAttr.setX(instanceIndex, slot.chars[ci]);
          }
        });
      });

      chars.instanceMatrix.needsUpdate = true;
      if (glyphsDirty) glyphAttr.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
      charGeometry.dispose();
      material.dispose();
      glyphTexture.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
    />
  );
}
