import { google } from "googleapis";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const SPREADSHEET_ID = "1bw2KP0Cbh7QrttCp7J9NaPOCy9SjUtyx-mLDFBM6EO8";

type ServiceAccountCreds = {
  client_email: string;
  private_key: string;
};

function getCredentials(): ServiceAccountCreds {
  let jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64;
  if (b64) {
    try {
      jsonStr = Buffer.from(b64, "base64").toString("utf-8");
    } catch {
      throw new Error("Invalid base64 in GOOGLE_SERVICE_ACCOUNT_JSON_B64");
    }
  }
  if (!jsonStr) {
    const jsonPath =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      join(process.cwd(), "ipv4xchange-08a7a3d9491c.json");
    if (!existsSync(jsonPath)) {
      throw new Error(`Service account credentials not found at ${jsonPath}`);
    }
    jsonStr = readFileSync(jsonPath, "utf-8");
  }
  let creds: ServiceAccountCreds & { type?: string };
  try {
    creds = JSON.parse(jsonStr) as ServiceAccountCreds & { type?: string };
  } catch {
    throw new Error("Invalid JSON in service account credentials");
  }
  if (!creds.client_email || !creds.private_key) {
    throw new Error("Invalid service account credentials: missing client_email or private_key");
  }
  return { client_email: creds.client_email, private_key: creds.private_key };
}

export async function getSheetsClient() {
  const creds = getCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, spreadsheetId: SPREADSHEET_ID };
}

export async function getSheetValues(range: string): Promise<string[][]> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const rows = res.data.values as string[][] | undefined;
  return rows ?? [];
}
