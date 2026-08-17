import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const labelClasses = "mb-1.5 block text-xs font-bold text-navy";
const controlClasses =
  "w-full rounded-[3px] border-[1.5px] border-navy/20 bg-white px-3.5 py-2.5 text-sm font-light text-navy placeholder:text-navy/35 focus:border-orange focus:outline-none";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
}

export function TextField({
  label,
  htmlFor,
  error,
  className = "",
  ...rest
}: FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      <input
        id={htmlFor}
        className={`${controlClasses} ${error ? "border-[#C0442A]" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs text-[#C0442A]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextAreaField({
  label,
  htmlFor,
  error,
  className = "",
  ...rest
}: FieldWrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      <textarea
        id={htmlFor}
        className={`${controlClasses} resize-none ${error ? "border-[#C0442A]" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs text-[#C0442A]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({
  label,
  htmlFor,
  error,
  className = "",
  children,
  ...rest
}: FieldWrapperProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      <select
        id={htmlFor}
        className={`${controlClasses} ${error ? "border-[#C0442A]" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs text-[#C0442A]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
