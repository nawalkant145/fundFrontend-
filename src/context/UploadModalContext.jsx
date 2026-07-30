import { createContext, useContext, useState } from "react";

/**
 * UploadModalContext — global state to open Upload Pitch or Upload Post modals
 * from anywhere in the app (Sidebar, FounderDashboard, MyStudioPage, etc.)
 */
const UploadModalContext = createContext(null);

export function UploadModalProvider({ children }) {
  const [pitchOpen, setPitchOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [postType, setPostType] = useState("images");

  const openPitchModal = () => setPitchOpen(true);
  const closePitchModal = () => setPitchOpen(false);

  const openPostModal = (type = "images") => {
    setPostType(type);
    setPostOpen(true);
  };
  const closePostModal = () => setPostOpen(false);

  return (
    <UploadModalContext.Provider
      value={{
        pitchOpen,
        openPitchModal,
        closePitchModal,
        postOpen,
        postType,
        openPostModal,
        closePostModal,
      }}
    >
      {children}
    </UploadModalContext.Provider>
  );
}

export function useUploadModal() {
  const ctx = useContext(UploadModalContext);
  if (!ctx) throw new Error("useUploadModal must be used within UploadModalProvider");
  return ctx;
}
