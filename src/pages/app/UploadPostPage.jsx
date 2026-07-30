import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import { postService } from "../../services/postService";

const MAX_IMAGES = 10;
const MAX_CAPTION = 2200;

export default function UploadPostPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") === "text" ? "text" : "images";
  const [type, setType] = useState(initialType); // 'images' | 'text'
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      navigate("/app/studio?tab=posts");
    } catch (err) {
      setSubmitting(false);
      toast.error(err.response?.data?.message || "Post failed. Try again.");
    }
  };

  return (
    <DashboardShell title="Create a post" subtitle="Share what you're building">
      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-[1fr_360px] gap-6"
      >
        {/* Left — composer */}
        <div className="space-y-5">
          {/* Type toggle */}
          <div className="inline-flex bg-[#FAFAF7] border border-[#1B5E3F]/12 rounded-full p-1">
            <button
              type="button"
              onClick={() => setType("images")}
              className={`px-5 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-all ${
                type === "images"
                  ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md shadow-[#1B5E3F]/25"
                  : "text-[#0A1F14]/65 hover:text-[#0F4A2E]"
              }`}
            >
              <HiPhotograph className="w-4 h-4" /> Photos
            </button>
            <button
              type="button"
              onClick={() => setType("text")}
              className={`px-5 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-all ${
                type === "text"
                  ? "bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md shadow-[#1B5E3F]/25"
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
                className="cursor-pointer border-2 border-dashed border-[#1B5E3F]/25 hover:border-[#1B5E3F]/50 rounded-2xl p-8 text-center bg-[#FAFAF7] hover:bg-white transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#1B5E3F]/25">
                  <HiPhotograph className="w-6 h-6 text-[#F5B942]" />
                </div>
                <p className="font-bold text-[#0F4A2E]">
                  Drag photos here or click to browse
                </p>
                <p className="text-xs text-[#0A1F14]/55 mt-1">
                  Up to {MAX_IMAGES} images · JPG, PNG, WebP
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
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
                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-[#F5B942] text-[#0F4A2E] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
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
                      <HiPlus className="w-6 h-6 text-[#1B5E3F]/50" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
              <span>Caption</span>
              <span className="text-xs text-[#0A1F14]/45">
                {caption.length} / {MAX_CAPTION}
              </span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
              rows={type === "text" ? 7 : 5}
              placeholder={
                type === "text"
                  ? "Share an update, lesson, or thought…"
                  : "Tell your story behind these photos…"
              }
              className="w-full px-4 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none transition-all resize-none text-base"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
              External link (optional)
            </label>
            <div className="relative">
              <HiLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A1F14]/40 pointer-events-none" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://yourcompany.com/announcement"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none transition-all text-base"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0A1F14]/85">
              Hashtags (comma-separated)
            </label>
            <div className="relative">
              <HiHashtag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A1F14]/40 pointer-events-none" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="healthtech, ai, startupindia"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/15 focus:outline-none transition-all text-base"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileHover={canSubmit ? { y: -2 } : {}}
            whileTap={canSubmit ? { scale: 0.99 } : {}}
            className={`w-full py-3.5 rounded-full font-bold text-base bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] hover:from-[#2D7A4F] hover:to-[#1B5E3F] text-white shadow-xl shadow-[#1B5E3F]/30 inline-flex items-center justify-center gap-2 transition-all ${
              !canSubmit ? "opacity-50 cursor-not-allowed shadow-none" : ""
            }`}
          >
            {submitting ? "Publishing…" : "Publish post"}
            {!submitting && <HiArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Right — preview card */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A1F14]/55 mb-3">
            Live preview
          </p>
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1B5E3F]/15" />
              <div>
                <p className="font-bold text-sm">You</p>
                <p className="text-xs text-[#0A1F14]/55">just now</p>
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
                <div className="aspect-square bg-[#FAFAF7] flex items-center justify-center text-[#0A1F14]/35 text-sm">
                  Cover image preview
                </div>
              )}
            </AnimatePresence>
            {(caption || link || hashtags) && (
              <div className="p-4 space-y-2">
                {caption && (
                  <p className="text-sm text-[#0A1F14]/85 whitespace-pre-wrap">
                    {caption}
                  </p>
                )}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1B5E3F] truncate max-w-full"
                  >
                    <HiLink className="w-3.5 h-3.5" /> {link}
                  </a>
                )}
                {hashtags && (
                  <p className="text-xs font-semibold text-[#1B5E3F]">
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
    </DashboardShell>
  );
}
