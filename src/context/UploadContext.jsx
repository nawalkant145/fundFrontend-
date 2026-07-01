import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { videoService } from "../services/videoService";
import { useToast } from "../components/ui/Toast";

/**
 * Global upload context — YouTube-style background uploader.
 * The upload continues even when the user navigates away from the upload page.
 * A persistent mini progress bar shows in the sidebar/bottom bar.
 */
const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  // Current upload state
  const [uploadState, setUploadState] = useState(null);
  // { status: 'uploading' | 'processing' | 'done' | 'error',
  //   progress: 0-100, title, error }
  const abortRef = useRef(null);
  const toast = useToast();

  const startUpload = useCallback(
    async (videoFile, metadata) => {
      if (uploadState?.status === "uploading") {
        toast?.error("Another upload is already in progress");
        return false;
      }

      setUploadState({
        status: "uploading",
        progress: 0,
        title: metadata.title || "Untitled pitch",
        error: null,
      });

      try {
        // Create an AbortController so user can cancel
        const controller = new AbortController();
        abortRef.current = controller;

        // Upload with progress tracking via Axios onUploadProgress
        const fd = new FormData();
        fd.append("video", videoFile);
        Object.entries(metadata).forEach(([key, val]) => {
          if (val !== undefined && val !== "") fd.append(key, val);
        });

        await videoService.uploadWithProgress(fd, {
          onProgress: (pct) => {
            setUploadState((prev) => ({ ...prev, progress: pct }));
          },
          signal: controller.signal,
        });

        // Upload complete — backend is now processing (Cloudinary transcoding)
        setUploadState((prev) => ({
          ...prev,
          status: "processing",
          progress: 100,
        }));

        // Show success after a brief delay (processing is server-side)
        setTimeout(() => {
          setUploadState((prev) => ({ ...prev, status: "done" }));
          toast?.success("Pitch uploaded successfully! 🎉");
          // Clear after 5s
          setTimeout(() => setUploadState(null), 5000);
        }, 1500);

        return true;
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          setUploadState(null);
          toast?.info("Upload cancelled");
          return false;
        }
        const msg =
          err.response?.data?.message || err.message || "Upload failed";
        setUploadState((prev) => ({
          ...prev,
          status: "error",
          error: msg,
        }));
        toast?.error(msg);
        return false;
      }
    },
    [uploadState, toast],
  );

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
    setUploadState(null);
  }, []);

  const dismissUpload = useCallback(() => {
    setUploadState(null);
  }, []);

  return (
    <UploadContext.Provider
      value={{ uploadState, startUpload, cancelUpload, dismissUpload }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be inside UploadProvider");
  return ctx;
}
