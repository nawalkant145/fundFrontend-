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

// ─── Country-aware phone rules (mirrors backend PHONE_RULES) ────────────────
// Keys are calling codes. Values: { min, max, example }
export const PHONE_COUNTRY_RULES = {
  "+91":  { min: 10, max: 10, label: "India",        example: "9876543210"    },
  "+1":   { min: 10, max: 10, label: "US/Canada",    example: "2025551234"    },
  "+44":  { min: 10, max: 10, label: "UK",           example: "7911123456"    },
  "+971": { min: 9,  max: 9,  label: "UAE",          example: "501234567"     },
  "+65":  { min: 8,  max: 8,  label: "Singapore",    example: "91234567"      },
  "+61":  { min: 9,  max: 9,  label: "Australia",    example: "412345678"     },
  "+86":  { min: 11, max: 11, label: "China",        example: "13912345678"   },
  "+49":  { min: 10, max: 11, label: "Germany",      example: "15123456789"   },
  "+33":  { min: 9,  max: 9,  label: "France",       example: "612345678"     },
  "+81":  { min: 10, max: 11, label: "Japan",        example: "9012345678"    },
  "+82":  { min: 9,  max: 10, label: "South Korea",  example: "1012345678"    },
  "+60":  { min: 9,  max: 10, label: "Malaysia",     example: "123456789"     },
  "+966": { min: 9,  max: 9,  label: "Saudi Arabia", example: "512345678"     },
  "+92":  { min: 10, max: 10, label: "Pakistan",     example: "3001234567"    },
  "+880": { min: 10, max: 10, label: "Bangladesh",   example: "1712345678"    },
  "+94":  { min: 9,  max: 9,  label: "Sri Lanka",    example: "712345678"     },
  "+55":  { min: 10, max: 11, label: "Brazil",       example: "11912345678"   },
  "+27":  { min: 9,  max: 9,  label: "South Africa", example: "821234567"     },
};

/**
 * Returns true when the full phone string (e.g. "+919876543210") passes
 * country-aware validation. Used by SignupPage to gate form submission.
 */
export function getPhoneIsValid(phone) {
  if (!phone || typeof phone !== "string") return false;
  const cleaned = phone.replace(/[\s\-()\u00A0]/g, "");
  if (!cleaned.startsWith("+")) return false;
  const digits = cleaned.slice(1);

  // Try longest code first
  const codes = Object.keys(PHONE_COUNTRY_RULES).sort(
    (a, b) => b.length - a.length,
  );
  for (const code of codes) {
    const prefix = code.slice(1); // digits of the code
    if (digits.startsWith(prefix)) {
      const subscriber = digits.slice(prefix.length);
      const { min, max } = PHONE_COUNTRY_RULES[code];
      return /^\d+$/.test(subscriber) &&
        subscriber.length >= min &&
        subscriber.length <= max;
    }
  }

  // Unknown code — permissive fallback
  return /^\d+$/.test(digits) && digits.length >= 8 && digits.length <= 15;
}

/**
 * Returns the rule for a given calling code, or a permissive fallback.
 */
function getRuleFor(code) {
  return PHONE_COUNTRY_RULES[code] || { min: 7, max: 12, label: "Other", example: "" };
}

export function PhoneInput({ value, onChange, name = "phone", required }) {
  const CODES = [
    { code: "+91",  flag: "🇮🇳", label: "India (+91)" },
    { code: "+1",   flag: "🇺🇸", label: "US/Canada (+1)" },
    { code: "+44",  flag: "🇬🇧", label: "UK (+44)" },
    { code: "+971", flag: "🇦🇪", label: "UAE (+971)" },
    { code: "+65",  flag: "🇸🇬", label: "Singapore (+65)" },
    { code: "+61",  flag: "🇦🇺", label: "Australia (+61)" },
    { code: "+49",  flag: "🇩🇪", label: "Germany (+49)" },
    { code: "+33",  flag: "🇫🇷", label: "France (+33)" },
    { code: "+81",  flag: "🇯🇵", label: "Japan (+81)" },
    { code: "+86",  flag: "🇨🇳", label: "China (+86)" },
    { code: "+92",  flag: "🇵🇰", label: "Pakistan (+92)" },
    { code: "+880", flag: "🇧🇩", label: "Bangladesh (+880)" },
    { code: "+60",  flag: "🇲🇾", label: "Malaysia (+60)" },
    { code: "+66",  flag: "🇹🇭", label: "Thailand (+66)" },
    { code: "+966", flag: "🇸🇦", label: "Saudi Arabia (+966)" },
    { code: "+82",  flag: "🇰🇷", label: "South Korea (+82)" },
    { code: "+55",  flag: "🇧🇷", label: "Brazil (+55)" },
    { code: "+27",  flag: "🇿🇦", label: "South Africa (+27)" },
    { code: "+94",  flag: "🇱🇰", label: "Sri Lanka (+94)" },
  ];

  const [code, setCode] = useState("+91");
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);

  const rule = getRuleFor(code);

  // Derive error message when field has been touched
  const digitError = (() => {
    if (!touched || !number) return null;
    if (number.length < rule.min)
      return `Too short — ${rule.label} numbers need ${rule.min} digit${rule.min !== 1 ? "s" : ""} (entered ${number.length})`;
    if (number.length > rule.max)
      return `Too long — ${rule.label} numbers need ${rule.max} digit${rule.max !== 1 ? "s" : ""} (entered ${number.length})`;
    return null;
  })();

  const handleNumberChange = (e) => {
    // Strip anything that isn't a digit
    const raw = e.target.value.replace(/\D/g, "");
    // Enforce max length for the selected country
    const capped = raw.slice(0, rule.max);
    setNumber(capped);
    onChange?.({
      target: { name, value: capped ? `${code}${capped}` : "" },
    });
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    // Clear the subscriber number — digit counts differ per country
    setNumber("");
    setTouched(false);
    onChange?.({ target: { name, value: "" } });
  };

  const hint = (() => {
    if (rule.example)
      return `${rule.label}: ${rule.min === rule.max ? rule.min : `${rule.min}–${rule.max}`} digits · e.g. ${rule.example}`;
    return `${rule.min === rule.max ? rule.min : `${rule.min}–${rule.max}`} digits required`;
  })();

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={code}
          onChange={handleCodeChange}
          aria-label="Country calling code"
          className="px-3 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none w-44 text-sm font-semibold"
        >
          {CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            name={name}
            value={number}
            onChange={handleNumberChange}
            onBlur={() => setTouched(true)}
            placeholder={rule.example || "Enter number"}
            maxLength={rule.max}
            required={required}
            aria-invalid={!!digitError}
            aria-describedby={`${name}-hint`}
            className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:ring-4 focus:outline-none transition-all text-base ${
              digitError
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : number.length === rule.max
                  ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                  : "border-[#1B5E3F]/15 focus:border-[#1B5E3F]/60 focus:ring-[#1B5E3F]/15"
            }`}
          />
          {/* Digit counter */}
          {number.length > 0 && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold pointer-events-none ${
                number.length === rule.max
                  ? "text-emerald-500"
                  : number.length > rule.max
                    ? "text-red-500"
                    : "text-[#0A1F14]/40"
              }`}
            >
              {number.length}/{rule.max}
            </span>
          )}
        </div>
      </div>
      {/* Error or hint */}
      {digitError ? (
        <p id={`${name}-hint`} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <span>✕</span> {digitError}
        </p>
      ) : (
        <p id={`${name}-hint`} className="text-xs text-[#0A1F14]/45 mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}
