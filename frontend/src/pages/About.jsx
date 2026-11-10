import React from 'react';
import { 
  BrainCircuit, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Presentation, 
  FileText, 
  Image as ImageIcon, 
  Headphones,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Overview Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-violet))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <BrainCircuit size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              EduMind AI Lite
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Multimodal AI Study Assistant • Academic Mini-Project
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
          <strong>EduMind AI Lite</strong> is an intelligent educational assistant built from the ground up to empower students to learn directly from their study materials across three distinct media modalities: <strong>PDF documents</strong>, <strong>visual diagrams/handwritten notes</strong>, and <strong>recorded audio lectures</strong>.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
            <Sparkles size={13} /> Google Gemini AI
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--accent-violet-light)', color: 'var(--accent-violet)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
            <Cpu size={13} /> FastAPI Python Backend
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
            <Layers size={13} /> React + Vite Frontend
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--success-light)', color: '#065f46', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
            <ShieldCheck size={13} /> Zero Hardcoded Responses
          </span>
        </div>
      </div>

      {/* Multimodal Architecture Breakdown */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="var(--primary)" /> Multimodal Input Processing
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              <FileText size={18} /> PDF Documents
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Leverages native document understanding to process multi-page lecture notes, slides, and textbook chapters while preserving mathematical notations, headings, and formatting.
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: 700, marginBottom: '0.5rem' }}>
              <ImageIcon size={18} /> Visual Notes & Photos
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Gemini Vision understands handwritten student notes, whiteboards, architectural diagrams, charts, and equations directly from PNG, JPG, or WEBP images.
            </p>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Headphones size={18} /> Audio Lectures
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Gemini Audio ingests recorded voice memos and classroom audio (MP3/WAV/M4A), extracting topics, key explanations, and student takeaways directly.
            </p>
          </div>
        </div>
      </div>

      {/* College Project Presentation Guide */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Presentation size={20} color="var(--primary)" /> College Presentation & Faculty Demo Sequence
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Use this recommended 4-step sequence during your project demonstration:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
              1
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Show the Modern Dashboard & Health Check:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Highlight the clean SaaS interface, the live Gemini API connection badge, and explain that the system accepts multi-format inputs (PDF, images, audio).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
              2
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Demonstrate Multimodal File Upload:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Upload a sample document (or diagram image / audio note). Point out the file validation, size enforcement, and the interactive preview/playback.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
              3
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Run the AI Study Assistant Features:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Demonstrate the <strong>Interactive Chat</strong> with context-grounded answers, then click <strong>Generate Summary</strong> to reveal key concepts and definitions, and show <strong>Explain Like I'm a Beginner</strong> with intuitive analogies.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
              4
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Solve an Interactive 5-Question Quiz:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Generate 5 MCQs, answer them one by one, submit the quiz, and show the final score calculation and educational explanation review mode.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack details */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Technical Architecture Specifications
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '4px' }}>Frontend</strong>
            <ul style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
              <li>React 18 with Vite build tool</li>
              <li>React Router v6 for SPA routing</li>
              <li>Lucide React iconography</li>
              <li>Axios HTTP client with error handling</li>
            </ul>
          </div>

          <div style={{ border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '4px' }}>Backend</strong>
            <ul style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
              <li>FastAPI asynchronous framework</li>
              <li>Pydantic schemas & JSON validation</li>
              <li>Google GenAI SDK (<code>google-genai</code>)</li>
              <li>In-memory session storage with cleanup</li>
            </ul>
          </div>

          <div style={{ border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '4px' }}>Security & Guardrails</strong>
            <ul style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
              <li>API keys kept exclusively on backend <code>.env</code></li>
              <li>UUID safe server-side file naming</li>
              <li>20MB file size limit enforcement</li>
              <li>CORS protection for frontend domain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

