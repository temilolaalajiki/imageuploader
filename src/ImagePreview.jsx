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
        src={`http://localhost:3001${uploadedFile.url}`}
        alt="Uploaded preview"
        className="previewImage"
        style={{marginTop: '2px', marginBottom: '1rem', width: '80%', height: 'auto', maxWidth: '400px'}}
      />
      <div className="preview-actions">
        <div className="buttonGroup" style={{marginBottom: '1.2rem'}}>
          <button onClick={() => {
            const url = `http://localhost:3001${uploadedFile.url}`;
            navigator.clipboard.writeText(url)
              .then(() => alert('URL copied to clipboard!'))
              .catch(err => console.error('Failed to copy URL: ', err));
          }}>Share</button>
          <button onClick={() => {
            const link = document.createElement('a');
            link.href = `http://localhost:3001${uploadedFile.url}`;
            link.download = uploadedFile.url.split('/').pop();
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