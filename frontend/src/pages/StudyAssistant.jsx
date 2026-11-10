import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  BookOpen, 
  Lightbulb, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import SummaryPanel from '../components/SummaryPanel';
import QuizCard from '../components/QuizCard';
import LoadingState from '../components/LoadingState';
import { generateSummary, explainTopic, generateQuiz, getMaterials, getApiErrorMessage } from '../services/api';
import { useToast } from '../components/Toast';

export default function StudyAssistant({ activeMaterial, setActiveMaterial, onQuizCompleted }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'chat';

  const [materials, setMaterials] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [explainData, setExplainData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [explainTopicInput, setExplainTopicInput] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchMats = async () => {
      try {
        const data = await getMaterials();
        setMaterials(data);
        if (data.length > 0 && !activeMaterial) {
          setActiveMaterial(data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMats();
  }, []);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleFetchSummary = async () => {
    if (!activeMaterial) return;
    try {
      setLoadingAction(true);
      const res = await generateSummary(activeMaterial.material_id);
      setSummaryData(res);
      addToast('Summary generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      const detail = getApiErrorMessage(err, 'Failed to generate summary.');
      addToast(detail, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFetchExplanation = async () => {
    if (!activeMaterial) return;
    try {
      setLoadingAction(true);
      const res = await explainTopic(activeMaterial.material_id, explainTopicInput.trim() || null);
      setExplainData(res);
      addToast('Explanation generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      const detail = getApiErrorMessage(err, 'Failed to explain concept.');
      addToast(detail, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFetchQuiz = async () => {
    if (!activeMaterial) return;
    try {
      setLoadingAction(true);
      const res = await generateQuiz(activeMaterial.material_id, 'medium');
      setQuizData(res);
      addToast('Generated 5 MCQs from material!', 'success');
    } catch (err) {
      console.error(err);
      const detail = getApiErrorMessage(err, 'Failed to generate quiz questions.');
      addToast(detail, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // If no material is uploaded at all
  if (!activeMaterial && materials.length === 0) {
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
          Upload study material to begin
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          EduMind AI needs study material context (PDF notes, diagrams/whiteboard photos, or audio lectures) to chat, summarize, and generate quizzes.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ margin: '0 auto' }}>
          Go to Dashboard & Upload <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Selector Bar */}
      <div className="card" style={{
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <FileText size={20} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              ACTIVE STUDY CONTEXT
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeMaterial?.original_name || 'Select study material'}
            </div>
          </div>
        </div>

        {materials.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Switch material:</span>
            <select
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none'
              }}
              value={activeMaterial?.material_id || ''}
              onChange={(e) => {
                const found = materials.find((m) => m.material_id === e.target.value);
                if (found) {
                  setActiveMaterial(found);
                  setSummaryData(null);
                  setExplainData(null);
                  setQuizData(null);
                }
              }}
            >
              {materials.map((m) => (
                <option key={m.material_id} value={m.material_id}>
                  {m.original_name} ({m.file_type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <button
          onClick={() => handleTabChange('chat')}
          className="btn"
          style={{
            borderBottom: currentTab === 'chat' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: '0',
            color: currentTab === 'chat' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: currentTab === 'chat' ? 700 : 500,
            padding: '0.75rem 1.25rem'
          }}
        >
          <BrainCircuit size={17} /> Ask AI Tutor
        </button>

        <button
          onClick={() => handleTabChange('summary')}
          className="btn"
          style={{
            borderBottom: currentTab === 'summary' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: '0',
            color: currentTab === 'summary' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: currentTab === 'summary' ? 700 : 500,
            padding: '0.75rem 1.25rem'
          }}
        >
          <BookOpen size={17} /> Generate Summary
        </button>

        <button
          onClick={() => handleTabChange('explain')}
          className="btn"
          style={{
            borderBottom: currentTab === 'explain' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: '0',
            color: currentTab === 'explain' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: currentTab === 'explain' ? 700 : 500,
            padding: '0.75rem 1.25rem'
          }}
        >
          <Lightbulb size={17} /> Explain Like a Beginner
        </button>

        <button
          onClick={() => handleTabChange('quiz')}
          className="btn"
          style={{
            borderBottom: currentTab === 'quiz' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: '0',
            color: currentTab === 'quiz' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: currentTab === 'quiz' ? 700 : 500,
            padding: '0.75rem 1.25rem'
          }}
        >
          <HelpCircle size={17} /> Interactive Quiz
        </button>
      </div>

      {/* Tab 1: Chat */}
      {currentTab === 'chat' && (
        <div style={{ height: '620px' }}>
          <ChatWindow material={activeMaterial} />
        </div>
      )}

      {/* Tab 2: Summary */}
      {currentTab === 'summary' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Study Summary</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Extract the key ideas and important definitions from the selected material.
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleFetchSummary} disabled={loadingAction}>
                {loadingAction ? <RefreshCw size={16} className="spin-icon" /> : <Sparkles size={16} />}
                {loadingAction ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>
          </div>
          {summaryData ? (
            <SummaryPanel summary={summaryData} />
          ) : (
            <div className="card" style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
              No summary generated yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Explain */}
      {currentTab === 'explain' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={explainTopicInput}
                onChange={(e) => setExplainTopicInput(e.target.value)}
                placeholder="Optional: focus on a specific concept or formula"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)'
                }}
              />
              <button className="btn btn-primary" onClick={handleFetchExplanation} disabled={loadingAction}>
                {loadingAction ? <RefreshCw size={16} className="spin-icon" /> : <Lightbulb size={16} />}
                {loadingAction ? 'Explaining...' : 'Explain'}
              </button>
            </div>
          </div>
          {explainData ? (
            <SummaryPanel summary={explainData} explainMode />
          ) : (
            <div className="card" style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
              No explanation generated yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Quiz */}
      {currentTab === 'quiz' && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Interactive Quiz</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Generate 5 multiple-choice questions from the active material.
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleFetchQuiz} disabled={loadingAction}>
                {loadingAction ? <RefreshCw size={16} className="spin-icon" /> : <HelpCircle size={16} />}
                {loadingAction ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
          {quizData ? (
            <QuizCard quiz={quizData} />
          ) : (
            <div className="card" style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
              No quiz generated yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

