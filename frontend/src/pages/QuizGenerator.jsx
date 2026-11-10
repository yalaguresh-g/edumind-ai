import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Sparkles, 
  FileText, 
  Layers, 
  RotateCcw,
  UploadCloud,
  ArrowRight
} from 'lucide-react';
import QuizCard from '../components/QuizCard';
import LoadingState from '../components/LoadingState';
import { getMaterials, generateQuiz, getApiErrorMessage } from '../services/api';
import { useToast } from '../components/Toast';

export default function QuizGenerator({ activeMaterial, setActiveMaterial, onQuizCompleted }) {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchMats = async () => {
      try {
        const data = await getMaterials();
        setMaterials(data);
        if (activeMaterial) {
          setSelectedMaterialId(activeMaterial.material_id);
        } else if (data.length > 0) {
          setSelectedMaterialId(data[0].material_id);
          setActiveMaterial(data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMats();
  }, [activeMaterial]);

  const handleGenerate = async () => {
    if (!selectedMaterialId) {
      addToast('Please select a study material to generate questions from.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await generateQuiz(selectedMaterialId, difficulty);
      setQuizData(res);
      addToast('5 Multiple-Choice Questions generated!', 'success');
      if (onQuizCompleted) onQuizCompleted();
    } catch (err) {
      console.error(err);
      const detail = getApiErrorMessage(err, 'Failed to generate quiz.');
      addToast(detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (materials.length === 0 && !loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <UploadCloud size={32} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No study materials uploaded
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Upload your notes, textbook images, or recorded lectures first to generate an exam-grade practice quiz.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ margin: '0 auto' }}>
          Go to Dashboard & Upload <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Quiz Generator
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Generate 5 interactive multiple-choice questions grounded in your uploaded study material
        </p>
      </div>

      {/* Quiz Controls Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Select Study Material
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.65rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none'
              }}
              value={selectedMaterialId}
              onChange={(e) => {
                setSelectedMaterialId(e.target.value);
                const mat = materials.find((m) => m.material_id === e.target.value);
                if (mat) setActiveMaterial(mat);
                setQuizData(null);
              }}
            >
              {materials.map((m) => (
                <option key={m.material_id} value={m.material_id}>
                  {m.original_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Difficulty
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.65rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none'
              }}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedMaterialId}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.725rem 1rem' }}
            >
              <Sparkles size={16} /> {quizData ? 'Regenerate Quiz' : 'Generate 5 Questions'}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Display Area */}
      {loading ? (
        <LoadingState
          message="Generating 5 MCQs with Gemini AI..."
          subtext="Creating conceptual questions, plausible distractors, and educational answer explanations."
        />
      ) : quizData ? (
        <QuizCard
          quiz={quizData}
          onRetry={() => {
            if (onQuizCompleted) onQuizCompleted();
          }}
        />
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '650px', margin: '0 auto' }}>
          <HelpCircle size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Ready to test your knowledge?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Choose a study document above and click <strong>Generate 5 Questions</strong>. You will be able to answer one question at a time and review complete explanations.
          </p>
        </div>
      )}
    </div>
  );
}

