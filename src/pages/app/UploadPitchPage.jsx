import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiCurrencyDollar,
  HiInformationCircle,
  HiPhotograph,
  HiCamera,
  HiX,
  HiUpload,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import FileDropzone from "../../components/auth/FileDropzone";
import { FormField } from "../../components/auth/FormField";
import Select from "../../components/auth/Select";
import { useToast } from "../../components/ui/Toast";
import { useUpload } from "../../context/UploadContext";
import { INDUSTRIES, FUNDING_STAGES } from "../../constants/options";

export default function UploadPitchPage() {
  const toast = useToast();
  const { startUpload, uploadState } = useUpload();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(""); // either user upload or auto-grabbed frame
  const [coverSource, setCoverSource] = useState(null); // 'upload' | 'frame'
  const [data, setData] = useState({
    title: "",
    description: "",
    industry: "",
    fundingStage: "",
    askAmount: "",
    equityOffered: "",
    visibility: "everyone", // "everyone" | "investors-only"
  });
  const [submitted, setSubmitted] = useState(false);

  // Build object URL for video preview + auto-grab default frame as cover
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

  // Build object URL for uploaded cover
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

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    // Hand off to global upload context — user can navigate away freely
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
    }
  };

  // Check if another upload is already running
  const isUploading = uploadState?.status === "uploading";

  if (submitted) {
    return (
      <DashboardShell title="Pitch submitted">
        <motion.div
          className="max-w-xl mx-auto text-center py-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 mb-6">
            <HiCheckCircle className="w-14 h-14 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black mb-3">Your pitch is processing</h2>
          <p className="text-gray-300 mb-6">
            We're transcoding your video. It'll be live in your feed in 1–2
            minutes.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setVideoFile(null);
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
              });
            }}
            className="px-6 py-3 border-2 border-gold/30 hover:border-gold rounded-xl font-bold"
          >
            Upload another
          </button>
        </motion.div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Upload your pitch"
      subtitle="10–120 seconds. Vertical video works best."
    >
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        {/* Tips */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5 flex gap-3">
          <HiInformationCircle className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold mb-2">Pitch like a pro</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>
                · Lead with the problem and your traction in the first 10
                seconds
              </li>
              <li>· Vertical 9:16 video looks best in the feed</li>
              <li>· Show the product in action — no slides-only pitches</li>
              <li>· End with a clear ask and your contact</li>
            </ul>
          </div>
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Pitch video <span className="text-gold">*</span>
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
            <div className="bg-dark-bg/40 border-2 border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-black flex-shrink-0">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{videoFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  {videoDuration > 0 && ` · ${Math.round(videoDuration)}s`}
                </p>
                {videoDuration > 0 &&
                  (videoDuration < 10 || videoDuration > 120) && (
                    <p className="text-xs text-red-400 mt-1">
                      ⚠ Duration must be between 10 and 120 seconds
                    </p>
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
                className="p-2 text-gray-400 hover:text-red-400"
                title="Remove video"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Cover image — Instagram-style picker */}
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
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            rows={4}
            placeholder="What you do, who you serve, what's your traction"
            className="w-full px-4 py-4 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Industry"
            name="industry"
            value={data.industry}
            onChange={handleChange}
            options={INDUSTRIES}
            placeholder="Pick a sector"
            required
          />
          <Select
            label="Funding stage"
            name="fundingStage"
            value={data.fundingStage}
            onChange={handleChange}
            options={FUNDING_STAGES}
            placeholder="Where are you?"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            label="Asking amount (INR)"
            name="askAmount"
            type="number"
            icon={HiCurrencyDollar}
            value={data.askAmount}
            onChange={handleChange}
            placeholder="e.g. 5000000"
            required
          />
          <FormField
            label="Equity offered (%)"
            name="equityOffered"
            type="number"
            value={data.equityOffered}
            onChange={handleChange}
            placeholder="e.g. 10"
          />
        </div>

        {/* Visibility toggle */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#0A1F14]/85">
            Who can see this pitch?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setData((p) => ({ ...p, visibility: "everyone" }))}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                data.visibility === "everyone"
                  ? "bg-[#1B5E3F] text-white border-[#1B5E3F] shadow-md"
                  : "bg-white text-[#0A1F14]/75 border-[#1B5E3F]/15 hover:border-[#1B5E3F]/40"
              }`}
            >
              🌐 Everyone
            </button>
            <button
              type="button"
              onClick={() =>
                setData((p) => ({ ...p, visibility: "investors-only" }))
              }
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                data.visibility === "investors-only"
                  ? "bg-[#F5B942] text-[#0F4A2E] border-[#F5B942] shadow-md"
                  : "bg-white text-[#0A1F14]/75 border-[#1B5E3F]/15 hover:border-[#F5B942]/60"
              }`}
            >
              🔒 Investors only
            </button>
          </div>
          <p className="text-xs text-[#0A1F14]/55 mt-1.5">
            {data.visibility === "investors-only"
              ? "Only investors will see this pitch. Other founders won't see it in their feed."
              : "Both investors and other founders can see this pitch."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1B5E3F]/10">
          <p className="text-xs text-[#0A1F14]/55">
            {isUploading
              ? "Your pitch is uploading in the background — you can leave this page!"
              : "Your pitch will be reviewed before going live."}
          </p>
          <motion.button
            type="submit"
            disabled={!valid || isUploading}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 flex items-center justify-center gap-2 ${
              !valid || isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileHover={valid && !isUploading ? { scale: 1.02, y: -2 } : {}}
            whileTap={valid && !isUploading ? { scale: 0.98 } : {}}
          >
            {isUploading ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-dark-navy/30 border-t-dark-navy animate-spin" />
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
    </DashboardShell>
  );
}

/**
 * Instagram-style cover picker:
 * - Auto-grabs 6 frames from the video as thumbnail options
 * - Lets the user upload a custom image instead
 */
function CoverPicker({
  videoUrl,
  coverUrl,
  coverSource,
  onPickFrame,
  onUpload,
}) {
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
        // Auto-select the middle frame as default cover if none chosen yet
        if (urls.length && !coverUrl) {
          onPickFrame(urls[Math.floor(urls.length / 2)], "frame");
        }
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line
  }, [videoUrl]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <HiPhotograph className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">Cover image</p>
          <p className="text-xs text-gray-400">
            This is the thumbnail investors see in the feed and on shares. Pick
            a frame from your video, or upload a custom cover.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-4">
        {/* Preview */}
        <div className="relative aspect-[9/16] max-h-72 rounded-xl overflow-hidden bg-black border border-gold/15">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No cover yet
            </div>
          )}
          {coverSource && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gold text-dark-navy text-[10px] font-black rounded-full uppercase">
              {coverSource === "upload" ? "Custom" : "From video"}
            </span>
          )}
        </div>

        {/* Frame strip + upload */}
        <div className="flex flex-col items-stretch gap-2 max-h-72 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-square w-16 rounded-lg border-2 border-dashed border-gold/40 hover:border-gold flex flex-col items-center justify-center text-[10px] text-gold font-bold transition-colors flex-shrink-0"
          >
            <HiCamera className="w-5 h-5 mb-0.5" />
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {loading && (
            <div className="aspect-square w-16 rounded-lg bg-dark-bg/60 animate-pulse" />
          )}

          {frames.map((src, i) => {
            const active = coverUrl === src;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPickFrame(src, "frame")}
                className={`aspect-square w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  active
                    ? "border-gold scale-95"
                    : "border-transparent hover:border-gold/40"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Extract `count` evenly-spaced frames from a video file as data URLs.
 * Runs entirely client-side using a hidden <video> + <canvas>.
 */
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
          // Cap dimension for memory safety
          const scale = Math.min(1, 480 / Math.max(w, h));
          canvas.width = w * scale;
          canvas.height = h * scale;
          canvas
            .getContext("2d")
            .drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return res();
              const url = URL.createObjectURL(blob);
              res(url);
            },
            "image/jpeg",
            0.85,
          );
          video.removeEventListener("seeked", onSeeked);
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
      });

    video.onloadedmetadata = async () => {
      try {
        const total = video.duration;
        if (!total || !isFinite(total)) {
          resolve([]);
          return;
        }
        for (i = 0; i < count; i++) {
          const t = (total / (count + 1)) * (i + 1);
          // eslint-disable-next-line no-await-in-loop
          const url = await grabAt(t);
          if (url) frames.push(url);
        }
        resolve(frames);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () =>
      reject(new Error("Failed to load video for frame extraction"));
  });
}
