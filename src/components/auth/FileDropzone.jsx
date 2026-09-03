import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiCloudUpload, HiCheckCircle, HiTrash } from "react-icons/hi";

                                                               
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
        <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
          {label}
          {required && <span className="text-[#1B5E3F] ml-1">*</span>}
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
            ? "border-[#1B5E3F] bg-[#1B5E3F]/5"
            : files.length
              ? "border-emerald-300 bg-emerald-50"
              : "border-[#1B5E3F]/25 bg-[#FAFAF7] hover:border-[#1B5E3F]/50 hover:bg-white"
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#1B5E3F]/20">
              <HiCloudUpload className="w-6 h-6 text-[#F5B942]" />
            </div>
            <p className="font-bold text-[#0F4A2E]">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-[#0A1F14]/55 mt-1">
              {description || "JPG, PNG, or PDF · Max 10MB"}
            </p>
          </>
        ) : (
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 text-left border border-[#1B5E3F]/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HiCheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0A1F14] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#0A1F14]/55">
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
                  className="p-2 text-[#0A1F14]/40 hover:text-red-500 transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            ))}
            {multiple && (
              <p className="text-xs text-[#1B5E3F] font-bold mt-2">
                + Add more files
              </p>
            )}
          </div>
        )}
      </motion.div>
      {hint && <p className="text-xs text-[#0A1F14]/55 mt-2">{hint}</p>}
    </div>
  );
}
