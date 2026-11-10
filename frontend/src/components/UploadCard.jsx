import React from 'react';
import { FileText, Image as ImageIcon, Headphones, ArrowRight } from 'lucide-react';

const MODALITY_CONFIG = {
  pdf: {
    title: 'PDF Documents',
    desc: 'Lecture notes, textbook chapters, and research slides',
    exts: '.PDF (Max 20MB)',
    icon: FileText,
    color: '#4f46e5',
    bg: '#e0e7ff',
  },
  image: {
    title: 'Visual Notes & Diagrams',
    desc: 'Handwritten notes, textbook pages, whiteboard photos, diagrams',
    exts: '.PNG, .JPG, .WEBP',
    icon: ImageIcon,
    color: '#8b5cf6',
    bg: '#ede9fe',
  },
  audio: {
    title: 'Audio Lectures',
    desc: 'Recorded classroom lectures, study voice notes, seminars',
    exts: '.MP3, .WAV, .M4A, .OGG',
    icon: Headphones,
    color: '#0284c7',
    bg: '#e0f2fe',
  },
};

export default function UploadCard({ type, onClick }) {
  const config = MODALITY_CONFIG[type] || MODALITY_CONFIG.pdf;
  const Icon = config.icon;

  return (
    <div className="upload-card" onClick={onClick}>
      <div className="upload-card-icon" style={{ backgroundColor: config.bg, color: config.color }}>
        <Icon size={28} />
      </div>
      <h3 className="upload-card-title">{config.title}</h3>
      <p className="upload-card-desc">{config.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 'auto' }}>
        <span className="upload-card-exts">{config.exts}</span>
        <span style={{ fontSize: '0.8rem', color: config.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
          Select <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}

