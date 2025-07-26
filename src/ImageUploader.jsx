import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './ImageUploader.css';
import uploadIcon from './assets/images/upload.png';
import checkIcon from './assets/images/check.png';
import Toast from './components/Toast';
import Footer from './components/Footer';
import LoadingIndicator from './components/LoadingIndicator';
import './components/UploadSuccess.css';

const ImageUploader = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://imageuploader-pied.vercel.app';
  console.log('API URL:', API_BASE_URL);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles && rejectedFiles.length > 0) {
      const message = rejectedFiles[0].errors[0].message;
      setError(`Error: ${message}`);
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setLoading(true);

      const formData = new FormData();
      formData.append('image', file);

      axios.post(`${API_BASE_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(response => {
          setUploadedFile(response.data);
          setLoading(false);
          navigate('/preview', { state: { uploadedFile: response.data } });
        })
        .catch(err => {
          console.error('Upload error:', err);
          const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'An error occurred during the upload.';
          setError(`Error: ${errorMessage}`);
          setLoading(false);
        });
    }
  }, [navigate, API_BASE_URL]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const handleShare = () => {
    if (uploadedFile) {
      navigator.clipboard.writeText(uploadedFile.url)
        .then(() => alert('Image data URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy URL: ', err));
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      const link = document.createElement('a');
      link.href = uploadedFile.url;
      link.download = uploadedFile.filename || 'uploaded-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
      <div className="uploaderContainer">
        {loading && <LoadingIndicator />}
        <div {...getRootProps({ className: `dropFileArea ${isDragActive ? 'active' : ''}` })}>
          <input {...getInputProps()} />
          {!loading && (
          <div className="dropFileAreaContent">
            <img src={uploadIcon} alt="Upload" className="uploadIcon" />
            <p><span style={{fontWeight: 500}} >Drag & drop a file or </span> <span className="browseLink">browse files</span> JPG, PNG or GIF - Max file size 2MB.</p>
          </div>
        )}
      </div>
      {error && <p className="errorMessage">{error}</p>}
      {uploadedFile && (
        <div className="previewContainer">
          <img src={uploadedFile.url} alt="Uploaded preview" className="previewImage" />
          <div className="buttonGroup">
            <button onClick={handleShare} >Share</button>
            <button onClick={handleDownload} style={{background: 'green'}}>Downloads</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;