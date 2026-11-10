import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award,
  Sparkles,
  Check
} from 'lucide-react';
import { useToast } from './Toast';

export default function QuizCard({ quiz, onRetry }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOptionText }
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const currentQ = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (option) => {
    if (submitted) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      const userSelected = selectedAnswers[q.id];
      if (userSelected && userSelected.trim() === q.correct_answer.trim()) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit now?`
      );
      if (!confirmSubmit) return;
    }
    setSubmitted(true);
    addToast('Quiz submitted! Check your results below.', 'success');
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
    if (onRetry) onRetry();
  };

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="quiz-box">
      {/* Quiz Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {quiz.topic || 'Interactive Study Quiz'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        {submitted ? (
          <div style={{
            background: percentage >= 60 ? 'var(--success-light)' : 'var(--warning-light)',
            color: percentage >= 60 ? '#065f46' : '#92400e',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem'
          }}>
            Score: {score}/{totalQuestions} ({percentage}%)
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {Object.keys(selectedAnswers).length}/{totalQuestions} Answered
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', marginBottom: '1.75rem', overflow: 'hidden' }}>
        <div style={{
          width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--primary), var(--accent-violet))',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Current Question */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
          <span style={{ color: 'var(--primary)', marginRight: '6px' }}>Q{currentIndex + 1}.</span>
          {currentQ.question}
        </h4>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswers[currentQ.id] === opt;
            const isCorrect = opt.trim() === currentQ.correct_answer.trim();
            
            let btnClass = 'option-btn';
            if (submitted) {
              if (isCorrect) btnClass += ' correct';
              else if (isSelected && !isCorrect) btnClass += ' incorrect';
            } else if (isSelected) {
              btnClass += ' selected';
            }

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleSelectOption(opt)}
                disabled={submitted}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: '1.5px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {submitted && isCorrect ? (
                    <Check size={14} />
                  ) : submitted && isSelected && !isCorrect ? (
                    <XCircle size={14} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>
                <span style={{ flex: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation after submission */}
      {submitted && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          color: 'var(--text-primary)'
        }}>
          <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
            Explanation:
          </strong>
          {currentQ.explanation}
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '2rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-light)',
      }}>
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {submitted ? (
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} /> Retry Quiz
            </button>
          ) : isLastQuestion ? (
            <button className="btn btn-primary" onClick={handleSubmit}>
              <CheckCircle2 size={16} /> Submit Quiz
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          )}

          {submitted && !isLastQuestion && (
            <button className="btn btn-primary" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Final Summary Card when completed and submitted */}
      {submitted && (
        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid #c7d2fe',
          textAlign: 'center'
        }}>
          <Award size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {percentage >= 80 ? 'Outstanding Mastery!' : percentage >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            You answered {score} out of {totalQuestions} questions correctly ({percentage}%).
          </p>
          <button className="btn btn-primary" onClick={handleReset}>
            <RotateCcw size={16} /> Retake This Quiz
          </button>
        </div>
      )}
    </div>
  );
}

