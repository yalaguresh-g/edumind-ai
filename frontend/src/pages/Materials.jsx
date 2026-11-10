import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  FileText, 
  Image as ImageIcon, 
  Headphones, 
  Trash2, 
  BrainCircuit, 
  BookOpen, 
  HelpCircle,
  Eye,
  X,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { getMaterials, deleteMaterial } from '../services/api';
import { useToast } from '../components/Toast';

export default function Materials({ activeMaterial, setActiveMaterial }) {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewModalMat, setPreviewModalMat] = useState(null);
  const { addToast } = useToast();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load materials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (matId, matName) => {
    const confirmDel = window.confirm(`Are you sure you want to delete "${matName}"?`);
    if (!confirmDel) return;

    try {
      await deleteMaterial(matId);
      setMaterials((prev) => prev.filter((m) => m.material_id !== matId));
      if (activeMaterial?.material_id === matId) {
        setActiveMaterial(null);
      }
      addToast(`Deleted ${matName}`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete material.', 'error');
    }
  };

  const handleStudyAction = (mat, tab) => {
    setActiveMaterial(mat);
    navigate(`/assistant?tab=${tab}`);
  };

  const filteredMaterials = materials.filter((m) => {
    if (filter === 'all') return true;
    return m.file_type === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            My Study Materials
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage and inspect uploaded documents, images, and audio lectures in this session
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          {['all', 'pdf', 'image', 'audio'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-secondary)',
              }}
            >
              {f === 'all' ? `All (${materials.length})` : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          Loading your study materials...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FolderOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No materials found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {filter !== 'all' ? `No ${filter.toUpperCase()} files found.` : 'Upload lecture notes, images, or audio files on the dashboard.'}
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ margin: '0 auto' }}>
            <UploadCloud size={16} /> Upload Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredMaterials.map((mat) => {
            const isActive = activeMaterial?.material_id === mat.material_id;
            return (
              <div
                key={mat.material_id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border-light)',
                  boxShadow: isActive ? '0 0 0 1px var(--primary), var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                {/* Header item */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: mat.file_type === 'pdf' ? '#e0e7ff' : mat.file_type === 'image' ? '#ede9fe' : '#e0f2fe',
                      color: mat.file_type === 'pdf' ? '#4f46e5' : mat.file_type === 'image' ? '#8b5cf6' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {mat.file_type === 'pdf' && <FileText size={20} />}
                      {mat.file_type === 'image' && <ImageIcon size={20} />}
                      {mat.file_type === 'audio' && <Headphones size={20} />}
                    </div>

                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={mat.original_name}>
                        {mat.original_name}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {mat.size_formatted} • {mat.created_at}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(mat.material_id, mat.original_name)}
                    style={{ color: '#94a3b8', padding: '4px' }}
                    title="Delete material"
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Inline Preview / Thumbnail */}
                {mat.file_type === 'image' && (
                  <div style={{ marginBottom: '0.75rem', cursor: 'pointer' }} onClick={() => setPreviewModalMat(mat)}>
                    <img
                      src={mat.file_url}
                      alt={mat.original_name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                )}

                {mat.file_type === 'audio' && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <audio controls style={{ width: '100%', height: '36px' }} src={mat.file_url} />
                  </div>
                )}

                {mat.file_type === 'pdf' && mat.extracted_text_preview && (
                  <div style={{
                    marginBottom: '0.75rem',
                    background: 'var(--bg-subtle)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}>
                    {mat.extracted_text_preview}
                  </div>
                )}

                {/* Bottom Study Shortcuts */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStudyAction(mat, 'chat')}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Ask AI questions"
                    >
                      <BrainCircuit size={13} /> Chat
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStudyAction(mat, 'summary')}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Generate Summary"
                    >
                      <BookOpen size={13} /> Summary
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStudyAction(mat, 'quiz')}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Quiz"
                    >
                      <HelpCircle size={13} /> Quiz
                    </button>
                  </div>

                  {isActive ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveMaterial(mat);
                        addToast(`Activated ${mat.original_name}`, 'info');
                      }}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal for images */}
      {previewModalMat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setPreviewModalMat(null)}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{previewModalMat.original_name}</h3>
              <button onClick={() => setPreviewModalMat(null)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            <img
              src={previewModalMat.file_url}
              alt={previewModalMat.original_name}
              style={{ maxHeight: '70vh', objectFit: 'contain', width: '100%', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

