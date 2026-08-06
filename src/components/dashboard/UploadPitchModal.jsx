import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiCheckCircle,
  HiCurrencyDollar,
  HiInformationCircle,
  HiPhotograph,
  HiCamera,
  HiX,
  HiUpload,
} from "react-icons/hi";

import FileDropzone from "../auth/FileDropzone";
import { FormField } from "../auth/FormField";
import Select from "../auth/Select";
import { useToast } from "../ui/Toast";
import { useUpload } from "../../context/UploadContext";
import { INDUSTRIES, FUNDING_STAGES } from "../../constants/options";

/**
 * UploadPitchModal — slide-up sheet for uploading a pitch video.
 * Same form as UploadPitchPage but rendered inside a modal overlay.
 */
export default function UploadPitchModal({ open, onClose }) {
  const toast = useToast();
  const { startUpload, uploadState } = useUpload();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverSource, setCoverSource] = useState(null);
  const [data, setData] = useState({
    title: "",
    description: "",
    industry: "",
    fundingStage: "",
    askAmount: "",
    equityOffered: "",
    visibility: "everyone",
  });
  const [submitted, setSubmitted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setVideoFile(null);
        setVideoUrl("");
        setVideoDuration(0);
        setCoverFile(null);
        setCoverUrl("");
        setCoverSource(null);
        setData({
          title: "",
          description: "",
          industry: "",
          fundingStage: "",
          askAmount: "",
          equityOffered: "",
          visibility: "everyone",
        });
        setSubmitted(false);
      }, 300); // wait for exit animation
    }
  }, [open]);

  useEffect(() => {
    if (!videoFile) {
      setVideoUrl("");
      setVideoDuration(0);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setCoverUrl(url);
    setCoverSource("upload");
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const handleChange = (e) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const valid =
    videoFile &&
    data.title.trim().length >= 3 &&
    data.industry &&
    data.fundingStage &&
    Number(data.askAmount) > 0;

  const isUploading = uploadState?.status === "uploading";

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    const success = await startUpload(videoFile, {
      title: data.title,
      description: data.description,
      industry: data.industry,
      fundingStage: data.fundingStage,
      askAmount: data.askAmount,
      equityOffered: data.equityOffered,
      visibility: data.visibility,
    });

    if (success) {
      setSubmitted(true);
      window.dispatchEvent(new Event("pitch-uploaded"));
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
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
            className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col"
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-[#0A1F14]/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#1B5E3F]/10 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-[#0A1F14]">Upload your pitch</h2>
                <p className="text-xs text-[#0A1F14]/55 mt-0.5">10–120 seconds · Vertical video works best</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#FAFAF7] hover:bg-[#F0F0EC] flex items-center justify-center transition-colors text-[#0A1F14]/60 hover:text-[#0A1F14]"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {submitted ? (
                <motion.div
                  className="text-center py-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 mb-5">
                    <HiCheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-[#0A1F14]">Your pitch is processing</h3>
                  <p className="text-[#0A1F14]/65 mb-6 text-sm">
                    We're transcoding your video. It'll be live in your feed in 1–2 minutes.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-5 py-2.5 border-2 border-[#1B5E3F]/20 hover:border-[#1B5E3F]/50 rounded-xl font-bold text-sm text-[#0F4A2E] transition-all"
                    >
                      Upload another
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white-force rounded-xl font-bold text-sm shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  {/* Tips */}
                  <div className="bg-[#FAFAF7] border border-[#1B5E3F]/15 rounded-2xl p-4 flex gap-3">
                    <HiInformationCircle className="w-5 h-5 text-[#F5B942] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1 text-[#0A1F14]">Pitch like a pro</p>
                      <ul className="text-xs text-[#0A1F14]/60 space-y-0.5">
                        <li>· Lead with the problem & traction in first 10 seconds</li>
                        <li>· Vertical 9:16 video looks best in the feed</li>
                        <li>· Show the product in action — no slides-only pitches</li>
                        <li>· End with a clear ask and your contact</li>
                      </ul>
                    </div>
                  </div>

                  {/* Video */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0A1F14]/80">
                      Pitch video <span className="text-[#F5B942]">*</span>
                    </label>
                    {!videoFile ? (
                      <FileDropzone
                        description="MP4, MOV or WEBM · 10-120 seconds · max 200MB"
                        accept="video/*"
                        value={videoFile}
                        onChange={setVideoFile}
                        required
                      />
                    ) : (
                      <div className="bg-[#FAFAF7] border-2 border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
                        <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0">
                          <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-[#0A1F14]">{videoFile.name}</p>
                          <p className="text-xs text-[#0A1F14]/55">
                            {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                            {videoDuration > 0 && ` · ${Math.round(videoDuration)}s`}
                          </p>
                          {videoDuration > 0 && (videoDuration < 10 || videoDuration > 120) && (
                            <p className="text-xs text-red-500 mt-1">⚠ Duration must be 10–120 seconds</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoFile(null);
                            setCoverFile(null);
                            setCoverUrl("");
                            setCoverSource(null);
                          }}
                          className="p-2 text-[#0A1F14]/40 hover:text-red-500 transition-colors"
                        >
                          <HiX className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cover picker */}
                  {videoFile && (
                    <CoverPicker
                      videoUrl={videoUrl}
                      coverUrl={coverUrl}
                      coverSource={coverSource}
                      onPickFrame={(blobUrl, source) => {
                        setCoverFile(null);
                        setCoverUrl(blobUrl);
                        setCoverSource(source);
                      }}
                      onUpload={(file) => setCoverFile(file)}
                    />
                  )}

                  <FormField
                    label="Title"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    placeholder="One-line headline that hooks investors"
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0A1F14]/80">Description</label>
                    <textarea
                      name="description"
                      value={data.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="What you do, who you serve, what's your traction"
                      className="w-full px-4 py-3 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] placeholder-[#0A1F14]/35 focus:border-[#1B5E3F]/60 focus:ring-4 focus:ring-[#1B5E3F]/12 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select label="Industry" name="industry" value={data.industry} onChange={handleChange} options={INDUSTRIES} placeholder="Pick a sector" required />
                    <Select label="Funding stage" name="fundingStage" value={data.fundingStage} onChange={handleChange} options={FUNDING_STAGES} placeholder="Where are you?" required />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Asking amount (INR)" name="askAmount" type="number" icon={HiCurrencyDollar} value={data.askAmount} onChange={handleChange} placeholder="e.g. 5000000" required />
                    <FormField label="Equity offered (%)" name="equityOffered" type="number" value={data.equityOffered} onChange={handleChange} placeholder="e.g. 10" />
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0A1F14]/80">Who can see this pitch?</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setData((p) => ({ ...p, visibility: "everyone" }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          data.visibility === "everyone"
                            ? "bg-[#1B5E3F] text-white-force border-[#1B5E3F] shadow-md"
                            : "bg-white text-[#0A1F14]/75 border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40"
                        }`}
                      >
                        🌐 Everyone
                      </button>
                      <button
                        type="button"
                        onClick={() => setData((p) => ({ ...p, visibility: "investors-only" }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          data.visibility === "investors-only"
                            ? "bg-[#F5B942] text-[#0F4A2E] border-[#F5B942] shadow-md"
                            : "bg-white text-[#0A1F14]/75 border-[#1B5E3F]/15 hover:border-[#F5B942]/60"
                        }`}
                      >
                        🔒 Investors only
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1B5E3F]/10">
                    <p className="text-xs text-[#0A1F14]/50">
                      {isUploading
                        ? "Your pitch is uploading in the background — you can close this!"
                        : "Your pitch will be reviewed before going live."}
                    </p>
                    <motion.button
                      type="submit"
                      disabled={!valid || isUploading}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#F5B942] to-[#FFD166] text-[#0F4A2E] shadow-lg flex items-center justify-center gap-2 ${
                        !valid || isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      whileHover={valid && !isUploading ? { scale: 1.02, y: -2 } : {}}
                      whileTap={valid && !isUploading ? { scale: 0.98 } : {}}
                    >
                      {isUploading ? (
                        <>
                          <span className="w-5 h-5 rounded-full border-2 border-[#0F4A2E]/30 border-t-[#0F4A2E] animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <HiUpload className="w-5 h-5" />
                          Submit pitch
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Instagram-style cover picker (frames + custom upload) */
function CoverPicker({ videoUrl, coverUrl, coverSource, onPickFrame, onUpload }) {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!videoUrl) return;
    setLoading(true);
    extractFrames(videoUrl, 6)
      .then((urls) => {
        setFrames(urls);
        setLoading(false);
        if (urls.length && !coverUrl) {
          onPickFrame(urls[Math.floor(urls.length / 2)], "frame");
        }
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line
  }, [videoUrl]);

  return (
    <div className="bg-[#FAFAF7] border border-[#1B5E3F]/15 rounded-2xl p-4">
      <div className="flex items-start gap-2 mb-3">
        <HiPhotograph className="w-5 h-5 text-[#F5B942] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-[#0A1F14]">Cover image</p>
          <p className="text-xs text-[#0A1F14]/55">Pick a frame or upload a custom cover</p>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="relative aspect-[9/16] max-h-52 rounded-xl overflow-hidden bg-black border border-[#1B5E3F]/15">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#0A1F14]/35 text-sm">No cover yet</div>
          )}
          {coverSource && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#F5B942] text-[#0F4A2E] text-[10px] font-black rounded-full uppercase">
              {coverSource === "upload" ? "Custom" : "From video"}
            </span>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 max-h-52 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-square w-14 rounded-lg border-2 border-dashed border-[#1B5E3F]/30 hover:border-[#1B5E3F]/60 flex flex-col items-center justify-center text-[10px] text-[#1B5E3F] font-bold transition-colors flex-shrink-0"
          >
            <HiCamera className="w-4 h-4 mb-0.5" /> Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
          {loading && <div className="aspect-square w-14 rounded-lg bg-[#0A1F14]/10 animate-pulse" />}
          {frames.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPickFrame(src, "frame")}
              className={`aspect-square w-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                coverUrl === src ? "border-[#F5B942] scale-95" : "border-transparent hover:border-[#F5B942]/50"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function extractFrames(videoUrl, count = 6) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    const frames = [];
    let i = 0;
    const grabAt = (time) =>
      new Promise((res) => {
        const onSeeked = () => {
          const canvas = document.createElement("canvas");
          const w = video.videoWidth || 360;
          const h = video.videoHeight || 640;
          const scale = Math.min(1, 480 / Math.max(w, h));
          canvas.width = w * scale;
          canvas.height = h * scale;
          canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => { if (!blob) return res(); res(URL.createObjectURL(blob)); }, "image/jpeg", 0.85);
          video.removeEventListener("seeked", onSeeked);
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
      });
    video.onloadedmetadata = async () => {
      try {
        const total = video.duration;
        if (!total || !isFinite(total)) { resolve([]); return; }
        for (i = 0; i < count; i++) {
          const t = (total / (count + 1)) * (i + 1);
          // eslint-disable-next-line no-await-in-loop
          const url = await grabAt(t);
          if (url) frames.push(url);
        }
        resolve(frames);
      } catch (err) { reject(err); }
    };
    video.onerror = () => reject(new Error("Failed to load video"));
  });
}
