import { useState, useEffect } from "react";
import { HiEye, HiEyeOff, HiCheck, HiX } from "react-icons/hi";
import {
  parsePhoneNumber,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js/max";

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

// ─── International Country Helpers & libphonenumber-js Validation ─────────

const getCountryFlag = (iso) => {
  if (!iso || iso.length !== 2) return "🌐";
  const codePoints = iso
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const getCountryName = (iso) => {
  try {
    return regionNames ? regionNames.of(iso) || iso : iso;
  } catch {
    return iso;
  }
};

export const ALL_COUNTRIES = getCountries()
  .map((iso) => {
    const callingCode = getCountryCallingCode(iso);
    const name = getCountryName(iso);
    const flag = getCountryFlag(iso);
    return {
      iso,
      callingCode: `+${callingCode}`,
      name,
      flag,
      label: `${flag} ${name} (+${callingCode})`,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Returns true when the phone number string is valid for the given country.
 * Uses libphonenumber-js/max as the single source of truth.
 */
export function getPhoneIsValid(phone, defaultCountry = "IN") {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;

  try {
    const iso =
      defaultCountry && typeof defaultCountry === "string"
        ? defaultCountry.toUpperCase().trim()
        : "IN";
    const phoneNumber = trimmed.startsWith("+")
      ? parsePhoneNumber(trimmed)
      : parsePhoneNumber(trimmed, iso);

    if (!phoneNumber || !phoneNumber.isValid()) return false;

    if (phoneNumber.country === "IN") {
      const type = phoneNumber.getType();
      if (type && type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") {
        return false;
      }
      if (/^[0-5]/.test(phoneNumber.nationalNumber)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function PhoneInput({
  value,
  onChange,
  name = "phone",
  required,
  defaultCountry = "IN",
  error: externalError,
}) {
  const [selectedIso, setSelectedIso] = useState(defaultCountry.toUpperCase());
  const [rawInput, setRawInput] = useState("");
  const [touched, setTouched] = useState(false);

  // Synchronize country if defaultCountry prop changes
  useEffect(() => {
    if (defaultCountry && typeof defaultCountry === "string") {
      const iso = defaultCountry.toUpperCase().trim();
      if (ALL_COUNTRIES.some((c) => c.iso === iso)) {
        setSelectedIso(iso);
      }
    }
  }, [defaultCountry]);

  // Synchronize input if value prop changes externally (e.g. international format)
  useEffect(() => {
    if (value && typeof value === "string") {
      if (value.startsWith("+")) {
        try {
          const parsed = parsePhoneNumber(value);
          if (parsed?.country) {
            setSelectedIso(parsed.country);
            setRawInput(parsed.nationalNumber || value);
            return;
          }
        } catch {}
      }
      // If value is national or E.164 formatted for selected country
      const selectedObj = ALL_COUNTRIES.find((c) => c.iso === selectedIso);
      if (selectedObj && value.startsWith(selectedObj.callingCode)) {
        setRawInput(value.slice(selectedObj.callingCode.length));
      }
    }
  }, [value, selectedIso]);

  const selectedCountryObj = ALL_COUNTRIES.find((c) => c.iso === selectedIso) || {
    iso: "IN",
    callingCode: "+91",
    name: "India",
    flag: "🇮🇳",
  };

  // Current phone string for validation
  const currentFullStr = rawInput.startsWith("+")
    ? rawInput
    : rawInput
      ? `${selectedCountryObj.callingCode}${rawInput}`
      : "";

  const isValid = rawInput ? getPhoneIsValid(currentFullStr, selectedIso) : false;

  // Determine error visibility:
  // 1. External error prop passed from parent form
  // 2. Field touched (onBlur) and rawInput is invalid
  // 3. User entered enough digits (>= 6 digits or '+' format) and number is invalid
  const shouldShowError = (() => {
    if (externalError) return true;
    if (!rawInput) return false;
    if (isValid) return false;

    const cleanDigits = rawInput.replace(/\D/g, "");
    if (touched || cleanDigits.length >= 6 || rawInput.startsWith("+")) {
      return true;
    }
    return false;
  })();

  const errorMessage =
    externalError ||
    (shouldShowError
      ? "Please enter a valid phone number for the selected country."
      : null);

  const handleInputChange = (e) => {
    const val = e.target.value;

    // International format (starts with '+')
    if (val.startsWith("+")) {
      setRawInput(val);
      let activeIso = selectedIso;
      try {
        const parsed = parsePhoneNumber(val);
        if (parsed?.country) {
          activeIso = parsed.country;
          setSelectedIso(parsed.country);
        }
      } catch {}

      const valid = getPhoneIsValid(val, activeIso);
      let e164 = "";
      try {
        const p = parsePhoneNumber(val);
        if (valid && p) e164 = p.format("E.164");
      } catch {}

      onChange?.({
        target: { name, value: e164 || val },
      });
      return;
    }

    // National format (strip non-digits)
    const cleanedDigits = val.replace(/\D/g, "");
    setRawInput(cleanedDigits);

    const fullStr = `${selectedCountryObj.callingCode}${cleanedDigits}`;
    const valid = getPhoneIsValid(fullStr, selectedIso);

    let e164 = "";
    if (cleanedDigits && valid) {
      try {
        const parsed = parsePhoneNumber(cleanedDigits, selectedIso);
        if (parsed && parsed.isValid()) {
          e164 = parsed.format("E.164");
        }
      } catch {}
    }

    onChange?.({
      target: {
        name,
        value:
          e164 ||
          (cleanedDigits ? `${selectedCountryObj.callingCode}${cleanedDigits}` : ""),
      },
    });
  };

  const handleCountryChange = (e) => {
    const newIso = e.target.value;
    setSelectedIso(newIso);
    setTouched(true);

    const newCountryObj =
      ALL_COUNTRIES.find((c) => c.iso === newIso) || selectedCountryObj;
    const fullStr = rawInput.startsWith("+")
      ? rawInput
      : rawInput
        ? `${newCountryObj.callingCode}${rawInput}`
        : "";
    const valid = getPhoneIsValid(fullStr, newIso);

    let e164 = "";
    if (rawInput && valid) {
      try {
        const parsed = rawInput.startsWith("+")
          ? parsePhoneNumber(rawInput)
          : parsePhoneNumber(rawInput, newIso);
        if (parsed && parsed.isValid()) e164 = parsed.format("E.164");
      } catch {}
    }

    onChange?.({
      target: {
        name,
        value:
          e164 ||
          (rawInput ? `${newCountryObj.callingCode}${rawInput}` : ""),
      },
    });
  };

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={selectedIso}
          onChange={handleCountryChange}
          aria-label="Country calling code"
          className="px-3 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none w-48 text-sm font-semibold truncate"
        >
          {ALL_COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.name} ({c.callingCode})
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="tel"
            name={name}
            value={rawInput}
            onChange={handleInputChange}
            onBlur={() => setTouched(true)}
            placeholder={`e.g. ${selectedCountryObj.callingCode} 9876543210`}
            required={required}
            aria-invalid={!!errorMessage}
            aria-describedby={`${name}-hint`}
            className={`w-full px-4 py-3.5 bg-white border rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:ring-4 focus:outline-none transition-all text-base ${
              errorMessage
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : isValid
                  ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                  : "border-[#1B5E3F]/15 focus:border-[#1B5E3F]/60 focus:ring-[#1B5E3F]/15"
            }`}
          />
        </div>
      </div>
      {errorMessage ? (
        <p id={`${name}-hint`} className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
          <span>✕</span> {errorMessage}
        </p>
      ) : (
        <p id={`${name}-hint`} className="text-xs text-[#0A1F14]/45 mt-1.5">
          {selectedCountryObj.name} ({selectedCountryObj.callingCode}) · International format E.164 supported
        </p>
      )}
    </div>
  );
}
