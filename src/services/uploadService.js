import api from "./api";

/**
 * Uploads a native File object directly to AWS S3 using a Presigned PUT URL.
 * Bypasses backend server temporary storage & base64 conversion.
 * 
 * @param {File|string} file - Native browser File object or existing S3 key
 * @param {string} uploadType - Allowed upload type ("kyc", "avatar", "document", "pitchDeck", etc.)
 * @returns {Promise<string>} S3 Object Key (e.g. "uploads/identity/{userId}/{uuid}-{filename}")
 */
export async function uploadFileDirectlyToS3(file, uploadType = "kyc") {
  if (!file) return "";
  if (typeof file === "string" && file.startsWith("uploads/")) {
    return file; // Already an S3 key
  }
  if (typeof file === "string" && file.startsWith("http")) {
    return file;
  }
  if (!(file instanceof File)) {
    throw new Error("Invalid file selected. Expected a File object.");
  }

  console.log("📤 Requesting S3 Presigned PUT URL...", {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    uploadType,
  });

  // Step 1: Request Presigned Upload URL from Backend API (JSON metadata only)
  const res = await api.post("/upload/presigned-url", {
    uploadType,
    fileName: file.name,
    contentType: file.type,
  });

  const payload = res?.data?.data || res?.data;
  const { uploadUrl, key, maxSizeBytes } = payload;

  if (!uploadUrl || !key) {
    throw new Error("Backend failed to return a valid S3 upload URL");
  }

  // File size validation against backend configuration
  if (maxSizeBytes && file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${maxMb}MB`);
  }

  // Step 2: Direct HTTP PUT to AWS S3 bucket using native fetch
  console.log("☁️ Uploading file directly to AWS S3...", { key });
  let s3Res;
  try {
    s3Res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch (err) {
    console.error("❌ Direct S3 Upload Fetch Error:", err);
    throw new Error(
      "S3 Direct Upload failed due to CORS or network error. Please configure AWS S3 Bucket CORS to allow PUT methods from your frontend domain."
    );
  }

  if (!s3Res.ok) {
    throw new Error(`Direct S3 upload failed with HTTP status ${s3Res.status}`);
  }

  console.log("✅ S3 Direct Upload Successful:", { key });
  return key;
}

const uploadService = {
  uploadFileDirectlyToS3,
  getPresignedUrl: (data) => api.post("/upload/presigned-url", data),
};

export default uploadService;
