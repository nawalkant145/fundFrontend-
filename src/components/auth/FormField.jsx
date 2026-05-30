import { useState } from "react";
import { HiEye, HiEyeOff, HiCheck, HiX } from "react-icons/hi";

/**
 * Premium form field with label, icon prefix, optional password toggle,
 * inline validation state, and helper / error text.
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
    ? "border-red-500/60 focus:border-red-500"
    : success
      ? "border-emerald-500/60 focus:border-emerald-500"
      : "border-gold/20 focus:border-gold";

  return (
    <div>
      {label && (
        <label className="flex items-center justify-between text-sm font-semibold mb-2 text-gray-300">
          <span>
            {label}
            {required && <span className="text-gold ml-1">*</span>}
          </span>
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}
        <input
          type={inputType}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? "pl-12" : "pl-4"} ${
            isPassword || rightSlot ? "pr-12" : "pr-4"
          } py-4 bg-dark-bg/60 border-2 ${borderClass} rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all`}
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
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
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
          <HiX className="w-3.5 h-3.5" /> {error}
        </p>
      ) : success ? (
        <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
          <HiCheck className="w-3.5 h-3.5" /> {success}
        </p>
      ) : helper ? (
        <p className="text-xs text-gray-400 mt-1.5">{helper}</p>
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
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-emerald-400",
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colors[score] : "bg-dark-bg"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs mt-1 ${
          score < 2
            ? "text-red-400"
            : score < 3
              ? "text-yellow-400"
              : "text-emerald-400"
        }`}
      >
        {labels[score]}
      </p>
    </div>
  );
}

export function Checkbox({ name, checked, onChange, children, required }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
        className="w-5 h-5 mt-0.5 rounded border-gold/30 bg-dark-bg text-gold focus:ring-gold focus:ring-offset-0"
      />
      <span className="text-sm text-gray-300 leading-relaxed">{children}</span>
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
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
              active
                ? "bg-gold text-dark-navy border-gold shadow-md shadow-gold/30"
                : "bg-dark-bg/60 text-gray-300 border-gold/20 hover:border-gold/60"
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
  // Static for now — country list short, can expand later
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
        className="px-3 py-4 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none w-28"
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
        className="flex-1 px-4 py-4 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
      />
    </div>
  );
}
