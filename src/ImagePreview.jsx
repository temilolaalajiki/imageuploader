import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ImageUploader.css';

const ImagePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadedFile = location.state?.uploadedFile;

  if (!uploadedFile) {
    // If no file, redirect to upload
    navigate('/');
    return null;
  }

  // Responsive: use a CSS class for the layout
  return (
    <div className="responsive-preview-layout">
      <img
        src={uploadedFile.url}
        alt="Uploaded preview"
        className="previewImage"
        style={{marginTop: '2px', marginBottom: '1rem', width: '80%', height: 'auto', maxWidth: '400px'}}
      />
      <div className="preview-actions">
        <div className="buttonGroup" style={{marginBottom: '1.2rem'}}>
          <button onClick={() => {
            // For data URLs, we can't share a direct link, so we'll copy the data URL
            navigator.clipboard.writeText(uploadedFile.url)
              .then(() => alert('Image data URL copied to clipboard!'))
              .catch(err => console.error('Failed to copy URL: ', err));
          }}>Share</button>
          <button onClick={() => {
            const link = document.createElement('a');
            link.href = uploadedFile.url;
            link.download = uploadedFile.filename || 'uploaded-image';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>Download</button>
        </div>
        <button
          className="browse-link"
          style={{marginTop: '0', fontSize: '1.08rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'center'}}
          onClick={() => navigate('/')}
        >
          Upload new file
        </button>
      </div>
    </div>
  );
};

export default ImagePreview; 