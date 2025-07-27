import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./styles/ImageUploader.css";
import uploadIcon from "./assets/images/upload.png";
import checkIcon from "./assets/images/check.png";
import Toast from "./components/Toast";
import LoadingIndicator from "./LoadingIndicator";
import "./components/UploadSuccess.css";

const ImageUploader = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = "https://imageuploader-pied.vercel.app";
  console.log("API URL:", API_BASE_URL);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError(null);

      if (rejectedFiles && rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          setError("The selected file is larger than 2MB!");
        } else if (error.code === "file-invalid-type") {
          setError("Unsupported File Format");
        } else {
          setError(`Error: ${error.message}`);
        }
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setLoading(true);

        const formData = new FormData();
        formData.append("image", file);

        axios
          .post(`${API_BASE_URL}/api/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              setLoading(true);
            },
          })
          .then((response) => {
            return new Promise((resolve) => {
              setTimeout(() => {
                setUploadedFile(response.data);
                setLoading(false);
                navigate("/preview", {
                  state: { uploadedFile: response.data },
                });
                resolve();
              }, 2000);
            });
          })
          .catch((err) => {
            console.error("Upload error:", err);
            const errorMessage =
              err.response?.data?.error ||
              err.response?.data?.details ||
              err.message ||
              "An error occurred during the upload.";
            setError(`Error: ${errorMessage}`);

            setTimeout(() => {
              setLoading(false);
            }, 300);
          });
      }
    },
    [navigate, API_BASE_URL]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 2 * 1024 * 1024,
  });

  const handleShare = async () => {
    if (uploadedFile) {
      try {
        await navigator.clipboard.writeText(uploadedFile.url);
        setToastMessage("Link Copied successfully!");
        setShowToast(true);
      } catch (err) {
        console.error("Failed to copy URL: ", err);
      }
    }
  };

  const handleDownload = async () => {
    if (!uploadedFile || !uploadedFile.public_id) {
      console.error("No file public_id available");
      return;
    }

    setIsDownloading(true);
    try {
      const downloadUrl = `${API_BASE_URL}/api/download/${uploadedFile.public_id}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const filename = uploadedFile.filename || `image-${Date.now()}.png`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="uploaderContainer">
      {loading && <LoadingIndicator />}
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <div
        {...getRootProps({
          className: `dropFileArea ${isDragActive ? "active" : ""}`,
        })}
      >
        <input {...getInputProps()} />
        {!loading && (
          <div className="dropFileAreaContent">
            <img src={uploadIcon} alt="Upload" className="uploadIcon" />
            <p>
              <span style={{ fontWeight: 500 }}>Drag & drop a file or </span>{" "}
              <span className="browseLink">browse files</span> JPG, PNG or GIF -
              Max file size 2MB.
            </p>
          </div>
        )}
      </div>
      {error && <p className="errorMessage">{error}</p>}
      {uploadedFile && (
        <div className="previewContainer">
          <div className="successMessage">
            <img src={checkIcon} alt="Success" className="successIcon" />
            <span>Upload Successful</span>
          </div>
          <img
            src={uploadedFile.url}
            alt="Uploaded preview"
            className="previewImage"
          />
          <div className="buttonGroup">
            <button onClick={handleShare} disabled={isDownloading}>
              Share
            </button>
            <button
              onClick={handleDownload}
              style={{ background: "green" }}
              disabled={isDownloading}
            >
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
