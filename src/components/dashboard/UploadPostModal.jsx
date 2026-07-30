import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPhotograph,
  HiX,
  HiPlus,
  HiLink,
  HiHashtag,
  HiArrowRight,
  HiAnnotation,
} from "react-icons/hi";

import { useToast } from "../ui/Toast";
import { postService } from "../../services/postService";
import { useUploadModal } from "../../context/UploadModalContext";

const MAX_IMAGES = 10;
const MAX_CAPTION = 2200;

export default function UploadPostModal({ open, onClose, onPostCreated }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { postType } = useUploadModal();
  const [type, setType] = useState("images"); // 'images' | 'text'
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync composer type when modal opens
  useEffect(() => {
    if (open) {
      setType(postType || "images");
    }
  }, [open, postType]);

  // Reset form when modal closes/opens
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setType("images");
        // Revoke previews to avoid memory leak
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
        setCaption("");
        setLink("");
        setHashtags("");
        setSubmitting(false);
      }, 300);
    }
  }, [open]);

  const handleFiles = (files) => {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const newOnes = Array.from(files)
      .slice(0, remaining)
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...newOnes]);
  };

  const removeImage = (i) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[i].preview);
      copy.splice(i, 1);
      return copy;
    });
  };

  const canSubmit =
    (type === "images" ? images.length > 0 : caption.trim().length > 0) &&
    !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const files = type === "images" ? images.map((img) => img.file) : [];
      await postService.create(files, {
        caption,
        link,
        hashtags,
        type,
      });
      setSubmitting(false);
      toast.success("Post published 🎉");
      window.dispatchEvent(new Event("post-created"));
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      setSubmitting(false);
      toast.error(err.response?.data?.message || "Post failed. Try again.");
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal panel */}
          <motion.div
            className="relative z-10 w-full sm:max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1.5 rounded-full bg-[#0A1F14]/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#1B5E3F]/10">
              <div>
                <h2 className="text-xl font-black text-[#0A1F14]">Create a post</h2>
                <p className="text-xs text-[#0A1F14]/55 mt-0.5">Share what you're building</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#FAFAF7] hover:bg-[#F0F0EC] flex items-center justify-center transition-colors text-[#0A1F14]/60 hover:text-[#0A1F14]"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
                {/* Left — composer */}
                <div className="space-y-4 text-left">
                  {/* Type toggle */}
                  <div className="inline-flex bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setType("images")}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all ${
                        type === "images"
                          ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md"
                          : "text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                      }`}
                    >
                      <HiPhotograph className="w-4 h-4" /> Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("text")}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-2 transition-all ${
                        type === "text"
                          ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md"
                          : "text-[#0A1F14]/65 hover:text-[#0F4A2E]"
                      }`}
                    >
                      <HiAnnotation className="w-4 h-4" /> Text only
                    </button>
                  </div>

                  {/* Image dropzone + grid */}
                  {type === "images" && (
                    <div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFiles(e.dataTransfer.files);
                        }}
                        className="cursor-pointer border-2 border-dashed border-[#1B5E3F]/25 hover:border-[#1B5E3F]/50 rounded-2xl p-6 text-center bg-[#FAFAF7] hover:bg-white transition-all"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFiles(e.target.files)}
                        />
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] flex items-center justify-center mx-auto mb-2 shadow-sm">
                          <HiPhotograph className="w-5 h-5 text-[#F5B942]" />
                        </div>
                        <p className="font-bold text-sm text-[#0F4A2E]">
                          Drag photos here or click to browse
                        </p>
                        <p className="text-[10px] text-[#0A1F14]/55 mt-0.5">
                          Up to {MAX_IMAGES} images · JPG, PNG, WebP
                        </p>
                      </div>

                      {images.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
                          {images.map((img, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-[#1B5E3F]/15 group"
                            >
                              <img
                                src={img.preview}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <HiX className="w-3.5 h-3.5" />
                              </button>
                              {i === 0 && (
                                <span className="absolute bottom-1 left-1 bg-[#F5B942] text-[#0F4A2E] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                                  Cover
                                </span>
                              )}
                            </motion.div>
                          ))}
                          {images.length < MAX_IMAGES && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-[#1B5E3F]/25 hover:border-[#1B5E3F]/50 hover:bg-[#FAFAF7] flex items-center justify-center transition-all"
                            >
                              <HiPlus className="w-5 h-5 text-[#1B5E3F]/50" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold mb-1 text-[#0A1F14]/85">
                      <span>Caption</span>
                      <span className="text-[10px] text-[#0A1F14]/45">
                        {caption.length} / {MAX_CAPTION}
                      </span>
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                      rows={type === "text" ? 6 : 4}
                      placeholder={
                        type === "text"
                          ? "Share an update, lesson, or thought…"
                          : "Tell your story behind these photos…"
                      }
                      className="w-full px-3 py-2 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/12 focus:outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#0A1F14]/85">
                      External link (optional)
                    </label>
                    <div className="relative">
                      <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A1F14]/40 pointer-events-none" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://yourcompany.com/announcement"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/12 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#0A1F14]/85">
                      Hashtags (comma-separated)
                    </label>
                    <div className="relative">
                      <HiHashtag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A1F14]/40 pointer-events-none" />
                      <input
                        type="text"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        placeholder="healthtech, ai, startupindia"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/12 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { y: -2 } : {}}
                    whileTap={canSubmit ? { scale: 0.99 } : {}}
                    className={`w-full py-2.5 rounded-full font-bold text-sm bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-md inline-flex items-center justify-center gap-1.5 transition-all ${
                      !canSubmit ? "opacity-50 cursor-not-allowed shadow-none" : ""
                    }`}
                  >
                    {submitting ? "Publishing…" : "Publish post"}
                    {!submitting && <HiArrowRight className="w-3.5 h-3.5" />}
                  </motion.button>
                </div>

                {/* Right — preview card */}
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0A1F14]/55 mb-2">
                    Live preview
                  </p>
                  <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl shadow-sm overflow-hidden sticky top-0">
                    <div className="p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1B5E3F]/15" />
                      <div>
                        <p className="font-bold text-xs">You</p>
                        <p className="text-[10px] text-[#0A1F14]/55">just now</p>
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      {type === "images" && images.length > 0 && (
                        <motion.img
                          key={images[0].preview}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={images[0].preview}
                          alt=""
                          className="w-full aspect-square object-cover"
                        />
                      )}
                      {type === "images" && images.length === 0 && (
                        <div className="aspect-square bg-[#FAFAF7] flex items-center justify-center text-[#0A1F14]/35 text-xs">
                          Cover image preview
                        </div>
                      )}
                    </AnimatePresence>
                    {(caption || link || hashtags) && (
                      <div className="p-3 space-y-1.5">
                        {caption && (
                          <p className="text-xs text-[#0A1F14]/85 whitespace-pre-wrap line-clamp-4">
                            {caption}
                          </p>
                        )}
                        {link && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B5E3F] truncate max-w-full">
                            <HiLink className="w-3 h-3" /> {link}
                          </span>
                        )}
                        {hashtags && (
                          <p className="text-[10px] font-semibold text-[#1B5E3F]">
                            {hashtags
                              .split(",")
                              .filter(Boolean)
                              .map((h) => `#${h.trim().replace(/^#/, "")}`)
                              .join(" ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
