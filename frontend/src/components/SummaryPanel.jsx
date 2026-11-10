import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  CheckCircle, 
  Copy, 
  Check, 
  BookMarked,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { useToast } from './Toast';

export default function SummaryPanel({ summary, data, onGenerateNew, explainMode = false }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const payload = summary ?? data;

  if (!payload) return null;

  const handleCopyAll = () => {
    let fullText = `# ${payload.main_topic}\n\n`;
    if (payload.important_concepts?.length) {
      fullText += `## Important Concepts\n` + payload.important_concepts.map((c) => `- ${c}`).join('\n') + '\n\n';
    }
    if (payload.key_points?.length) {
      fullText += `## Key Points\n` + payload.key_points.map((k) => `- ${k}`).join('\n') + '\n\n';
    }
    if (payload.important_definitions?.length) {
      fullText += `## Definitions\n` + payload.important_definitions.map((d) => `- **${d.term}**: ${d.definition}`).join('\n') + '\n\n';
    }
    if (payload.examples?.length) {
      fullText += `## Examples\n` + payload.examples.map((e) => `- ${e}`).join('\n') + '\n\n';
    }
    if (payload.short_revision_notes) {
      fullText += `## Revision Notes\n${payload.short_revision_notes}\n`;
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    addToast('Summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ padding: '2rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {explainMode ? 'Beginner Explanation' : 'Structured AI Summary'}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {payload.main_topic || payload.topic || 'Study Content'}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleCopyAll} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
        </div>
      </div>

      {/* Revision Box */}
      {payload.short_revision_notes && (
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
          border: '1px solid #c7d2fe',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
            <Sparkles size={16} /> Exam Revision Quick-Take
          </div>
          <p style={{ fontSize: '0.925rem', color: '#1e1b4b', lineHeight: '1.6' }}>
            {payload.short_revision_notes}
          </p>
        </div>
      )}

      {/* Simple Explanation */}
      {payload.simple_explanation && (
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
            <Lightbulb size={18} color="#f59e0b" /> Simple Explanation
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            {payload.simple_explanation}
          </p>
        </div>
      )}

      {/* Step-by-Step Breakdown */}
      {payload.step_by_step_breakdown?.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
            <CheckCircle size={18} color="#10b981" /> Step-by-Step Breakdown
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {payload.step_by_step_breakdown.map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practical Example */}
      {payload.practical_example && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
            <BookMarked size={18} color="#8b5cf6" /> Practical Example
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            {payload.practical_example}
          </p>
        </div>
      )}

      {/* Important Concepts & Key Points */}
      {payload.important_concepts?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
              <Lightbulb size={18} color="#f59e0b" /> Important Concepts
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {payload.important_concepts.map((concept, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>•</span>
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Important Definitions */}
      {payload.important_definitions?.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Bookmark size={18} color="var(--primary)" /> Essential Definitions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {payload.important_definitions.map((def, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderLeft: '4px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  {def.term}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {def.definition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical Examples */}
      {payload.examples?.length > 0 && (
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <BookMarked size={18} color="#8b5cf6" /> Real-World Examples & Applications
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {payload.examples.map((ex, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#8b5cf6' }}>Ex {i + 1}:</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

