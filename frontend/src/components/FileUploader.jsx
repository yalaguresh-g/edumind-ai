import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Headphones, 
  CheckCircle2, 
  X, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { uploadMaterial, getApiErrorMessage } from '../services/api';
import { useToast } from './Toast';

const ACCEPTED_TYPES = {
  pdf: ['.pdf', 'application/pdf'],
  image: ['.png', '.jpg', '.jpeg', '.webp', 'image/png', 'image/jpeg', 'image/webp'],
  audio: ['.mp3', '.wav', '.m4a', '.ogg', '.webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/ogg', 'audio/webm']
};

export default function FileUploader({ onUploadSuccess, currentMaterial, onRemoveCurrent }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    if (file.size === 0) return 'File is empty (0 bytes)';
    if (file.size > 20 * 1024 * 1024) return 'File exceeds maximum limit of 20MB';

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isPdf = ACCEPTED_TYPES.pdf.includes(ext) || file.type === 'application/pdf';
    const isImage = ACCEPTED_TYPES.image.includes(ext) || file.type.startsWith('image/');
    const isAudio = ACCEPTED_TYPES.audio.includes(ext) || file.type.startsWith('audio/');

    if (!isPdf && !isImage && !isAudio) {
      return 'Unsupported file format. Please upload PDF, Image (PNG/JPG/WEBP), or Audio (MP3/WAV/M4A/OGG).';
    }
    return null;
  };

  const processFile = async (file) => {
    const errorMsg = validateFile(file);
    if (errorMsg) {
      addToast(errorMsg, 'error');
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      const data = await uploadMaterial(file, (p) => setProgress(p));
      setProgress(100);
      addToast(`Uploaded ${data.original_name} successfully!`, 'success');
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      console.error(err);
      const detail = getApiErrorMessage(err, 'Failed to upload study material.');
      addToast(detail, 'error');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* If a material is currently uploaded & selected */}
      {currentMaterial ? (
        <div className="card" style={{ background: 'var(--bg-active)', borderColor: '#c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                {currentMaterial.file_type === 'pdf' && <FileText size={22} />}
                {currentMaterial.file_type === 'image' && <ImageIcon size={22} />}
                {currentMaterial.file_type === 'audio' && <Headphones size={22} />}
              </div>
              <div>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentMaterial.original_name}
                </h4>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{currentMaterial.file_type}</span>
                  <span>•</span>
                  <span>{currentMaterial.size_formatted}</span>
                  <span>•</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle2 size={12} /> Ready for AI
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onRemoveCurrent}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: '#fca5a5' }}
              title="Remove file"
            >
              <X size={14} /> Remove
            </button>
          </div>

          {/* Multimodal Previews */}
          {currentMaterial.file_type === 'image' && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <img
                src={currentMaterial.file_url}
                alt="Uploaded study preview"
                className="image-preview-thumbnail"
              />
            </div>
          )}

          {currentMaterial.file_type === 'audio' && (
            <div style={{ marginTop: '1rem' }}>
              <audio controls className="audio-player-custom" src={currentMaterial.file_url}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {currentMaterial.file_type === 'pdf' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>Preview extract:</strong> {currentMaterial.extracted_text_preview || 'Ready for Gemini native multimodal PDF reasoning.'}
            </div>
          )}
        </div>
      ) : (
        /* Dropzone view */
        <div className="card" style={{ padding: '1.5rem' }}>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center',
              background: dragActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
              transition: 'all 0.2s ease'
            }}
          >
            <UploadCloud size={36} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Upload study material</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              PDF notes, lecture slides, handwritten images, or audio recordings.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
            {uploading && (
              <div style={{ marginTop: '1rem' }}>
                <div className="progress-bar" style={{ width: '100%', height: '8px' }}>
                  <div style={{ width: `${progress}%`, background: 'var(--primary)' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

