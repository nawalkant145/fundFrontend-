import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { videoService } from "../services/videoService";
import { useToast } from "../components/ui/Toast";

                                                                                                                                                                                                                            
const UploadContext = createContext(null);

export function UploadProvider({ children }) {
                         
  const [uploadState, setUploadState] = useState(null);
                                                             
                                      
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
                                                       
        const controller = new AbortController();
        abortRef.current = controller;

                                                                   
        const fd = new FormData();
        fd.append("video", videoFile);
        Object.entries(metadata).forEach(([key, val]) => {
          if (val !== undefined && val !== "") fd.append(key, val);
        });

        await videoService.uploadWithProgress(fd, {
          onProgress: (pct) => {
            setUploadState((prev) => {
              if (!prev) return prev;
              if (pct >= 100) {
                return { ...prev, status: "processing", progress: 100 };
              }
              return { ...prev, status: "uploading", progress: Math.min(pct, 99) };
            });
          },
          signal: controller.signal,
        });

                                                
        setUploadState((prev) => ({
          ...prev,
          status: "done",
          progress: 100,
        }));
        toast?.success("Pitch uploaded successfully! 🎉");

                                                               
        setTimeout(() => {
          setUploadState((prev) => (prev?.status === "done" ? null : prev));
        }, 4000);

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
