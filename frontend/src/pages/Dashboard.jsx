import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  BrainCircuit, 
  HelpCircle, 
  FileText, 
  ArrowRight, 
  FolderOpen,
  Headphones,
  Image as ImageIcon,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import UploadCard from '../components/UploadCard';
import FileUploader from '../components/FileUploader';
import { getMaterials, deleteMaterial } from '../services/api';
import { useToast } from '../components/Toast';

export default function Dashboard({ activeMaterial, setActiveMaterial, quizCount = 0 }) {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const uploaderRef = useRef(null);
  const { addToast } = useToast();

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const data = await getMaterials();
      setMaterials(data);
      if (data.length > 0 && !activeMaterial) {
        setActiveMaterial(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUploadSuccess = (newMat) => {
    setMaterials((prev) => [newMat, ...prev.filter((m) => m.material_id !== newMat.material_id)]);
    setActiveMaterial(newMat);
    addToast(`${newMat.original_name} selected as active study material.`, 'info');
  };

  const handleRemoveCurrent = () => {
    setActiveMaterial(null);
  };

  const scrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} /> Next-Gen Multimodal Learning
          </div>
          <h1 className="hero-title">Learn smarter with EduMind AI</h1>
          <p className="hero-subtitle">
            Upload your lecture notes, textbook diagrams, or recorded audio lectures.
            EduMind AI analyzes the multi-format content to generate exam summaries, simplified breakdowns, and interactive quizzes.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/assistant')}
              className="btn btn-secondary"
              style={{ fontWeight: 700, border: 'none', background: 'var(--bg-card)', color: 'var(--primary)' }}
            >
              Open AI Assistant <ArrowRight size={15} />
            </button>
            <button
              onClick={scrollToUploader}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              Upload Material
            </button>
          </div>
        </div>
      </section>

      {/* Session Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FolderOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{materials.length}</div>
            <div className="stat-label">Study Materials Uploaded</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-violet-light)', color: 'var(--accent-violet)' }}>
            <HelpCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{quizCount}</div>
            <div className="stat-label">Quizzes Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div className="stat-value">Multimodal</div>
            <div className="stat-label">PDF, Images & Audio</div>
          </div>
        </div>
      </section>

      {/* Multimodal Upload Formats */}
      <section style={{ marginBottom: '2.5rem' }} ref={uploaderRef}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              1. Upload Study Material
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select a format to upload into this learning session
            </p>
          </div>
        </div>

        <div className="upload-cards-grid">
          <UploadCard type="pdf" onClick={scrollToUploader} />
          <UploadCard type="image" onClick={scrollToUploader} />
          <UploadCard type="audio" onClick={scrollToUploader} />
        </div>

        <FileUploader
          onUploadSuccess={handleUploadSuccess}
          currentMaterial={activeMaterial}
          onRemoveCurrent={handleRemoveCurrent}
        />
      </section>

      {/* Quick Actions */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          2. Quick Learning Actions
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Interact with your uploaded study materials in multiple ways
        </p>

        <div className="quick-actions-grid">
          <div className="action-card" onClick={() => navigate('/assistant?tab=chat')}>
            <div className="action-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Ask AI Tutor
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Ask conceptual questions grounded in your document.
              </p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate('/assistant?tab=summary')}>
            <div className="action-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Generate Summary
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                High-yield key points, concepts, and revision notes.
              </p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate('/assistant?tab=explain')}>
            <div className="action-card-icon" style={{ background: 'var(--accent-violet-light)', color: 'var(--accent-violet)' }}>
              <Lightbulb size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Beginner Breakdown
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Explain difficult topics with simple analogies.
              </p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate('/quiz')}>
            <div className="action-card-icon" style={{ background: 'var(--success-light)', color: '#059669' }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Generate 5 MCQs
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Test your knowledge with self-paced interactive quiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Materials */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Recent Uploaded Materials
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Materials available in this active server session
            </p>
          </div>
          {materials.length > 0 && (
            <button
              onClick={() => navigate('/materials')}
              style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All ({materials.length}) <ArrowRight size={14} />
            </button>
          )}
        </div>

        {materials.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <FolderOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No study materials uploaded yet
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Upload your first PDF, image, or audio note above to begin.
            </p>
            <button onClick={scrollToUploader} className="btn btn-primary" style={{ margin: '0 auto' }}>
              Upload Material
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {materials.slice(0, 3).map((mat) => {
              const isSelected = activeMaterial?.material_id === mat.material_id;
              return (
                <div
                  key={mat.material_id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-light)',
                    background: isSelected ? '#fafbff' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                  onClick={() => {
                    setActiveMaterial(mat);
                    addToast(`Selected ${mat.original_name}`, 'info');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--primary)' : 'var(--primary-light)',
                      color: isSelected ? 'white' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {mat.file_type === 'pdf' && <FileText size={18} />}
                      {mat.file_type === 'image' && <ImageIcon size={18} />}
                      {mat.file_type === 'audio' && <Headphones size={18} />}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {mat.original_name}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {mat.size_formatted} • {mat.created_at.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)'
                    }}>
                      {mat.file_type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMaterial(mat);
                        navigate('/assistant');
                      }}
                      style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      Study <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

