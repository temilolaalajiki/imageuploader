import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ImageUploader.css';

const ImagePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadedFile = location.state?.uploadedFile;

  if (!uploadedFile) {
    navigate('/');
    return null;
  }

  return (
    <div className="responsive-preview-layout">
      <img
        src={uploadedFile.url}
        alt="Uploaded preview"
        className="previewImage"
        style={{ marginTop: '2px', marginBottom: '1rem', width: '80%', height: 'auto', maxWidth: '400px' }}
      />
      <div className="preview-actions">
        <div className="buttonGroup" style={{ marginBottom: '1.2rem' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(uploadedFile.url)
                .then(() => alert('Image data URL copied to clipboard!'))
                .catch(err => console.error('Failed to copy URL: ', err));
            }}
          >
            Share
          </button>
          <button
            onClick={() => {
              const publicId = uploadedFile.public_id || 'uploaded-image';
              const link = document.createElement('a');
              link.href = `/api/download/${encodeURIComponent(publicId)}`;
              link.download = uploadedFile.filename || 'downloaded-image';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download
          </button>
        </div>
        <button
          className="browse-link"
          style={{ marginTop: '0', fontSize: '1.08rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'center' }}
          onClick={() => navigate('/')}
        >
          Upload new file
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
