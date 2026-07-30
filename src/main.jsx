import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { UploadProvider } from "./context/UploadContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { CallProvider } from "./context/CallContext.jsx";
import { UploadModalProvider } from "./context/UploadModalContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <NotificationProvider>
              <UploadProvider>
                <CallProvider>
                  <UploadModalProvider>
                    <App />
                  </UploadModalProvider>
                </CallProvider>
              </UploadProvider>
            </NotificationProvider>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
