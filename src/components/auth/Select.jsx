import { HiChevronDown } from "react-icons/hi";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  required,
  helper,
  error,
  hint,
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  const borderClass = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-[#1B5E3F]/15 focus:border-[#1B5E3F]/60 focus:ring-[#1B5E3F]/15";

  return (
    <div>
      {label && (
        <label className="flex items-center justify-between text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
          <span>
            {label}
            {required && <span className="text-[#1B5E3F] ml-1">*</span>}
          </span>
          {hint && <span className="text-xs text-[#0A1F14]/45">{hint}</span>}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          className={`w-full appearance-none pl-4 pr-12 py-3.5 bg-white border ${borderClass} rounded-xl text-[#0A1F14] focus:outline-none focus:ring-4 transition-all text-base`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {normalized.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A1F14]/40 pointer-events-none" />
      </div>
      {error ? (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      ) : helper ? (
        <p className="text-xs text-[#0A1F14]/55 mt-1.5">{helper}</p>
      ) : null}
    </div>
  );
}
