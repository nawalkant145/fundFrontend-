import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiCloudUpload, HiCheckCircle, HiTrash } from "react-icons/hi";

/**
 * Premium drag-and-drop file uploader with preview.
 */
export default function FileDropzone({
  label,
  description,
  accept = "image/*,.pdf",
  multiple = false,
  required,
  value,
  onChange,
  hint,
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = (files) => {
    if (!files || !files.length) return;
    onChange(multiple ? [...(value || []), ...Array.from(files)] : files[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (idx) => {
    if (multiple) {
      onChange(value.filter((_, i) => i !== idx));
    } else {
      onChange(null);
    }
  };

  const files = multiple ? value || [] : value ? [value] : [];

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          {label}
          {required && <span className="text-gold ml-1">*</span>}
        </label>
      )}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          drag
            ? "border-gold bg-gold/10"
            : files.length
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-gold/30 bg-dark-bg/40 hover:border-gold/60 hover:bg-dark-bg/60"
        }`}
        whileHover={{ scale: 1.005 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        {!files.length ? (
          <>
            <HiCloudUpload className="w-10 h-10 text-gold mx-auto mb-3" />
            <p className="font-semibold text-white">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {description || "JPG, PNG, or PDF · Max 10MB"}
            </p>
          </>
        ) : (
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-dark-bg/80 rounded-xl px-4 py-3 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HiCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(idx);
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            ))}
            {multiple && (
              <p className="text-xs text-gold font-semibold mt-2">
                + Add more files
              </p>
            )}
          </div>
        )}
      </motion.div>
      {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
    </div>
  );
}
