import { useState } from "react";
import { HiEye, HiEyeOff, HiCheck, HiX } from "react-icons/hi";

/**
 * Premium form field — light theme: white background, soft borders,
 * deep-green accents, gold selection ring on focus.
 */
export function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  required,
  helper,
  error,
  success,
  hint,
  autoComplete,
  rightSlot,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const borderClass = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : success
      ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
      : "border-[#1B5E3F]/15 focus:border-[#1B5E3F]/60 focus:ring-[#1B5E3F]/15";

  const fieldId = name ? `field-${name}` : undefined;

  return (
    <div>
      {label && (
        <label
          htmlFor={fieldId}
          className="flex items-center justify-between text-sm font-semibold mb-1.5 text-[#0A1F14]/85"
        >
          <span>
            {label}
            {required && <span className="text-[#1B5E3F] ml-1">*</span>}
          </span>
          {hint && <span className="text-xs text-[#0A1F14]/45">{hint}</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A1F14]/40 pointer-events-none" />
        )}
        <input
          id={fieldId}
          type={inputType}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete || "off"}
          className={`w-full ${Icon ? "pl-12" : "pl-4"} ${
            isPassword || rightSlot ? "pr-12" : "pr-4"
          } py-3.5 bg-white border ${borderClass} rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:outline-none focus:ring-4 transition-all text-base`}
          {...rest}
        />
        {success && !isPassword && !rightSlot && (
          <HiCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
        )}
        {error && !isPassword && !rightSlot && (
          <HiX className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1F14]/40 hover:text-[#1B5E3F] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <HiEyeOff className="w-5 h-5" />
            ) : (
              <HiEye className="w-5 h-5" />
            )}
          </button>
        )}
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <HiX className="w-3.5 h-3.5" /> {error}
        </p>
      ) : success ? (
        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
          <HiCheck className="w-3.5 h-3.5" /> {success}
        </p>
      ) : helper ? (
        <p className="text-xs text-[#0A1F14]/55 mt-1.5">{helper}</p>
      ) : null}
    </div>
  );
}

export function PasswordStrength({ password = "" }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-500",
    "bg-emerald-500",
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? colors[score] : "bg-[#1B5E3F]/10"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs mt-1.5 font-semibold ${
          score < 2
            ? "text-red-500"
            : score < 3
              ? "text-yellow-600"
              : "text-emerald-600"
        }`}
      >
        {labels[score]}
      </p>
    </div>
  );
}

export function Checkbox({ name, checked, onChange, children, required }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
        className="w-5 h-5 mt-0.5 rounded border-[#1B5E3F]/25 bg-white text-[#1B5E3F] focus:ring-[#1B5E3F]/30 focus:ring-2 focus:ring-offset-0 cursor-pointer accent-[#1B5E3F]"
      />
      <span className="text-sm text-[#0A1F14]/75 leading-relaxed group-hover:text-[#0A1F14] transition-colors">
        {children}
      </span>
    </label>
  );
}

export function MultiSelectChips({ options, value = [], onChange, max }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!max || value.length < max) {
      onChange([...value, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              active
                ? "bg-[#1B5E3F] text-white border-[#1B5E3F] shadow-md shadow-[#1B5E3F]/25"
                : "bg-white text-[#0A1F14]/75 border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40 hover:text-[#0F4A2E]"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function PhoneInput({ value, onChange, name = "phone", required }) {
  const codes = [
    { code: "+91", flag: "🇮🇳" },
    { code: "+1", flag: "🇺🇸" },
    { code: "+44", flag: "🇬🇧" },
    { code: "+971", flag: "🇦🇪" },
    { code: "+65", flag: "🇸🇬" },
    { code: "+61", flag: "🇦🇺" },
  ];
  const [code, setCode] = useState("+91");
  const [number, setNumber] = useState(value || "");

  const handleNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setNumber(v);
    onChange?.({
      target: { name, value: v ? `${code}${v}` : "" },
    });
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    onChange?.({
      target: { name, value: number ? `${e.target.value}${number}` : "" },
    });
  };

  return (
    <div className="flex gap-2">
      <select
        value={code}
        onChange={handleCodeChange}
        className="px-3 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none w-28 text-base font-semibold"
      >
        {codes.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        name={name}
        value={number}
        onChange={handleNumberChange}
        placeholder="98765 43210"
        required={required}
        className="flex-1 px-4 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none text-base"
      />
    </div>
  );
}
