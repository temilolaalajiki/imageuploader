import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './ImageUploader.css';
import uploadIcon from './assets/images/upload.png';

const ImageUploader = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

      axios.post('http://localhost:3001/upload', formData)
        .then(response => {
          setUploadedFile(response.data);
          setLoading(false);
          navigate('/preview', { state: { uploadedFile: response.data } });
        })
        .catch(err => {
          setError('An error occurred during the upload.');
          setLoading(false);
        });
    }
  }, [navigate]);

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
      const url = `http://localhost:3001${uploadedFile.url}`;
      navigator.clipboard.writeText(url)
        .then(() => alert('URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy URL: ', err));
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      const link = document.createElement('a');
      link.href = `http://localhost:3001${uploadedFile.url}`;
      link.download = uploadedFile.url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="uploaderContainer">
      <div {...getRootProps({ className: `dropFileArea ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        {loading ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%'}}>
            <span style={{fontWeight: 500, fontSize: '1.1em'}}>Uploading</span><span>, please wait</span>
            <div className="loadingBarContainer">
              <div className="loading-bar"></div>
            </div>
          </div>
        ) : (
          <div className="dropFileAreaContent">
            <img src={uploadIcon} alt="Upload" className=" uploadIcon
" />
            <p><span style={{fontWeight: 500}} >Drag & drop a file or </span> <span className="browseLink">browse files</span> JPG, PNG or GIF - Max file size 2MB.</p>
          </div>
        )}
      </div>
      {error && <p className="errorMessage 
">{error}</p>}
      {uploadedFile && (
        <div className="previewContainer">
          <img src={`http://localhost:3001${uploadedFile.url}`} alt="Uploaded preview" className="previewImage" />
          <div className="buttonGroup">
            <button onClick={handleShare} >Share</button>
            <button onClick={handleDownload} style={{background: green}}>Downloads</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;