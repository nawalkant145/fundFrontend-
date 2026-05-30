import { HiChevronDown } from "react-icons/hi";

/**
 * Premium select dropdown matching the auth field style.
 * options: array of strings OR array of { value, label }.
 */
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
    ? "border-red-500/60 focus:border-red-500"
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
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          className={`w-full appearance-none pl-4 pr-12 py-4 bg-dark-bg/60 border-2 ${borderClass} rounded-xl text-white focus:outline-none transition-all`}
        >
          <option value="" disabled className="bg-dark-bg">
            {placeholder}
          </option>
          {normalized.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dark-bg">
              {opt.label}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error ? (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      ) : helper ? (
        <p className="text-xs text-gray-400 mt-1.5">{helper}</p>
      ) : null}
    </div>
  );
}
