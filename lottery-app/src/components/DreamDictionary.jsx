import { useState, useMemo } from 'react';
import { animals } from '../data/animals';
import { dreamDictionary } from '../data/dreams';
import { API } from '../utils/api';

const QUICK_HINTS = ['ງູ', 'ປາ', 'ຊ້າງ', 'ແມວ', 'ໝາ', 'ນ້ຳ', 'ໄຟ', 'ເງິນ'];

const CATEGORY_STYLE = {
  'ສັດ':        { neon: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.24)'  },
  'ທຳມະຊາດ':  { neon: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  border: 'rgba(56,189,248,0.24)'  },
  'ສັດນ້ຳ':    { neon: '#22d3ee', bg: 'rgba(34,211,238,0.10)',  border: 'rgba(34,211,238,0.24)'  },
  'ສັດທົ່ວໄປ': { neon: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.24)' },
};
const DEFAULT_CAT = { neon: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.18)' };

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  /* ── Left panel oracle console ── */
  .dd-left-card {
    position: relative;
    background: linear-gradient(148deg, #0d0a1e 0%, #160d2e 55%, #0f0818 100%);
    border: 1px solid rgba(167,139,250,0.20);
    border-radius: 20px;
    padding: 24px 20px 22px;
    overflow: hidden;
  }
  .dd-left-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(167,139,250,0.6) 40%, rgba(251,191,36,0.5) 60%, transparent 95%);
  }

  /* Starfield */
  .dd-stars {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle 1.1px at  7% 14%, rgba(255,255,255,0.55) 0%, transparent 1.1px),
      radial-gradient(circle  1px at 17% 62%, rgba(255,255,255,0.35) 0%, transparent 1px),
      radial-gradient(circle 1.3px at 28% 32%, rgba(167,139,250,0.40) 0%, transparent 1.3px),
      radial-gradient(circle  1px at 44% 78%, rgba(255,255,255,0.28) 0%, transparent 1px),
      radial-gradient(circle  1px at 54% 18%, rgba(255,255,255,0.38) 0%, transparent 1px),
      radial-gradient(circle 1.5px at 67% 52%, rgba(167,139,250,0.32) 0%, transparent 1.5px),
      radial-gradient(circle  1px at 77% 88%, rgba(255,255,255,0.28) 0%, transparent 1px),
      radial-gradient(circle  1px at 87% 28%, rgba(255,255,255,0.38) 0%, transparent 1px),
      radial-gradient(circle  1px at 94% 68%, rgba(255,255,255,0.32) 0%, transparent 1px),
      radial-gradient(circle  1px at 23%  8%, rgba(255,255,255,0.42) 0%, transparent 1px),
      radial-gradient(circle  1px at 71% 12%, rgba(251,191,36,0.22) 0%, transparent 1px),
      radial-gradient(circle  1px at 38% 95%, rgba(167,139,250,0.28) 0%, transparent 1px),
      radial-gradient(circle  1px at 60% 40%, rgba(255,255,255,0.20) 0%, transparent 1px);
  }

  /* Rotating mandala rings (decorative) */
  .dd-ring-a {
    position: absolute;
    width: 160px; height: 160px; border-radius: 50%;
    top: -45px; left: -45px;
    border: 1px solid rgba(167,139,250,0.10);
    animation: dd-spin-cw 28s linear infinite;
    pointer-events: none;
  }
  .dd-ring-a::before {
    content: '';
    position: absolute; inset: 16px; border-radius: 50%;
    border: 1px dashed rgba(167,139,250,0.07);
  }
  .dd-ring-b {
    position: absolute;
    width: 110px; height: 110px; border-radius: 50%;
    bottom: -28px; right: -28px;
    border: 1px dashed rgba(251,191,36,0.10);
    animation: dd-spin-ccw 18s linear infinite;
    pointer-events: none;
  }
  @keyframes dd-spin-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
  @keyframes dd-spin-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }

  /* Icon wrapper */
  .dd-hdr-icon {
    position: relative; z-index: 1;
    width: 50px; height: 50px; border-radius: 16px;
    background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a78bfa 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 26px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
    margin-bottom: 14px;
  }
  .dd-hdr-icon-glyph {
    font-size: 24px; color: #fff;
    animation: dd-icon-glow 3s ease-in-out infinite;
  }
  @keyframes dd-icon-glow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.35)); }
    50%       { filter: drop-shadow(0 0 14px rgba(255,255,255,0.80)); }
  }

  /* Header text */
  .dd-hdr-title {
    position: relative; z-index: 1;
    font-size: 18px; font-weight: 900; letter-spacing: -0.015em; margin: 0 0 4px;
    background: linear-gradient(120deg, #c4b5fd 0%, #e9d5ff 45%, #fde68a 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .dd-hdr-sub {
    position: relative; z-index: 1;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(167,139,250,0.48);
  }

  /* ── Search input ── */
  .dd-search-wrap { position: relative; }
  .dd-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: rgba(139,92,246,0.58); font-size: 20px; pointer-events: none;
  }
  .dd-search-input {
    width: 100%;
    background: rgba(13,10,30,0.90);
    border: 1.5px solid rgba(124,58,237,0.24);
    border-radius: 14px;
    padding: 13px 44px 13px 48px;
    font-size: 14px; font-weight: 500; color: #e9d5ff;
    outline: none; backdrop-filter: blur(12px);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dd-search-input::placeholder { color: rgba(139,92,246,0.40); font-size: 13px; }
  .dd-search-input:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 22px rgba(124,58,237,0.10);
  }
  .dd-clear-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(139,92,246,0.50); background: none; border: none;
    cursor: pointer; display: flex; align-items: center; padding: 2px;
    transition: color 0.15s;
  }
  .dd-clear-btn:hover { color: #a78bfa; }

  /* ── Quick hint rune chips ── */
  .dd-hints-label {
    font-size: 10px; font-weight: 900; letter-spacing: 0.20em;
    text-transform: uppercase; color: rgba(167,139,250,0.42); margin-bottom: 9px;
  }
  .dd-rune {
    position: relative; overflow: hidden;
    padding: 7px 16px; border-radius: 22px;
    background: rgba(124,58,237,0.07);
    border: 1px solid rgba(124,58,237,0.22);
    font-size: 13px; font-weight: 800; color: rgba(196,181,253,0.78);
    cursor: pointer; transition: all 0.18s;
  }
  .dd-rune::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
    background: linear-gradient(105deg, transparent 35%, rgba(167,139,250,0.12) 50%, transparent 65%);
    transition: left 0.45s;
  }
  .dd-rune:hover {
    background: rgba(124,58,237,0.16); border-color: rgba(124,58,237,0.44);
    color: #c4b5fd; box-shadow: 0 0 16px rgba(124,58,237,0.16);
    transform: translateY(-1px);
  }
  .dd-rune:hover::before { left: 150%; }

  /* ── Result count badges ── */
  .dd-badge-found {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(16,185,129,0.09); border: 1px solid rgba(16,185,129,0.25);
    border-radius: 20px; padding: 5px 14px;
    font-size: 11px; font-weight: 900; letter-spacing: 0.06em; color: #34d399;
  }
  .dd-badge-empty {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22);
    border-radius: 20px; padding: 5px 14px;
    font-size: 11px; font-weight: 900; letter-spacing: 0.06em; color: #f87171;
  }
  .dd-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: currentColor;
    animation: dd-dot-blink 1.5s ease-in-out infinite;
  }
  @keyframes dd-dot-blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }

  /* ── Idle / empty states ── */
  .dd-idle-wrap {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; gap: 14px; text-align: center;
  }
  .dd-orb {
    position: relative;
    width: 76px; height: 76px; border-radius: 50%;
    background: linear-gradient(135deg, #1e0d3d 0%, #2d1260 100%);
    border: 1px solid rgba(124,58,237,0.25);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 32px rgba(124,58,237,0.22);
  }
  .dd-orb-red {
    background: linear-gradient(135deg, #1e0808 0%, #3a0f0f 100%);
    border-color: rgba(239,68,68,0.22); box-shadow: 0 0 28px rgba(239,68,68,0.14);
  }
  .dd-orb-icon { font-size: 30px; color: #a78bfa; }
  .dd-orb-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(124,58,237,0.18);
    animation: dd-orb-pulse 2.6s ease-out infinite;
  }
  .dd-orb-ring-1 { inset: -12px; }
  .dd-orb-ring-2 { inset: -24px; animation-delay: 1.3s; }
  @keyframes dd-orb-pulse {
    0%   { opacity: 0.65; transform: scale(1);    }
    100% { opacity: 0;    transform: scale(1.35); }
  }
  .dd-idle-title { font-size: 15px; font-weight: 900; color: rgba(196,181,253,0.65); }
  .dd-idle-sub   { font-size: 12px; color: rgba(124,58,237,0.42); max-width: 220px; line-height: 1.5; }

  /* ── Result cards ── */
  .dd-card {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, rgba(13,10,30,0.96) 0%, rgba(22,13,46,0.90) 100%);
    border: 1px solid rgba(124,58,237,0.13);
    border-radius: 16px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    animation: dd-card-rise 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes dd-card-rise {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dd-card:hover {
    border-color: rgba(124,58,237,0.28); transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(13,10,30,0.55);
  }
  .dd-card-bar { height: 2.5px; width: 100%; flex-shrink: 0; }

  /* Icon box inside card */
  .dd-card-icon-box {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    background: rgba(124,58,237,0.09);
    border: 1px solid rgba(124,58,237,0.16);
    display: flex; align-items: center; justify-content: center;
  }

  /* Card title */
  .dd-card-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #e9d5ff 0%, #c4b5fd 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* Category badge */
  .dd-cat-pill {
    font-size: 9px; font-weight: 900; letter-spacing: 0.10em;
    text-transform: uppercase; padding: 3px 9px; border-radius: 20px;
  }

  /* Keywords */
  .dd-kw { font-size: 11px; color: rgba(167,139,250,0.42); margin: 2px 0 0; font-weight: 500; }

  /* ── Lottery balls ── */
  .dd-ball {
    position: relative;
    width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    background: radial-gradient(circle at 35% 30%, #ffd060 0%, #f59e0b 42%, #b45309 78%, #78350f 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(251,191,36,0.42), inset 0 -3px 6px rgba(0,0,0,0.28);
  }
  /* Specular highlight */
  .dd-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 42%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.56) 0%, transparent 70%);
    border-radius: 50%;
  }
  .dd-ball-n {
    position: relative; z-index: 1;
    font-size: 14px; font-weight: 900; color: #78350f; letter-spacing: -0.02em;
  }

  /* ── Meaning box (mystic parchment) ── */
  .dd-meaning {
    display: flex; align-items: flex-start; gap: 8px;
    background: rgba(124,58,237,0.06);
    border: 1px solid rgba(124,58,237,0.13);
    border-radius: 12px; padding: 10px 12px;
    margin-top: 4px;
  }
  .dd-meaning-txt {
    font-size: 11px; line-height: 1.75; color: rgba(196,181,253,0.65); margin: 0;
  }

  /* ── Mode toggle ── */
  .dd-mode-wrap {
    display: flex; gap: 6px; padding: 4px;
    background: rgba(13,10,30,0.70);
    border: 1px solid rgba(124,58,237,0.16);
    border-radius: 14px;
  }
  .dd-mode-btn {
    flex: 1; padding: 9px 8px; border-radius: 10px; border: none; cursor: pointer;
    font-size: 12px; font-weight: 900; letter-spacing: 0.03em;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .dd-mode-btn.active {
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
    color: #fff;
    box-shadow: 0 0 18px rgba(124,58,237,0.38);
  }
  .dd-mode-btn.inactive {
    background: transparent; color: rgba(167,139,250,0.50);
  }
  .dd-mode-btn.inactive:hover {
    background: rgba(124,58,237,0.10); color: rgba(196,181,253,0.80);
  }

  /* ── AI textarea ── */
  .dd-ai-textarea {
    width: 100%;
    background: rgba(13,10,30,0.90);
    border: 1.5px solid rgba(124,58,237,0.24);
    border-radius: 14px;
    padding: 13px 16px;
    font-size: 14px; font-weight: 500; color: #e9d5ff;
    outline: none; resize: none; backdrop-filter: blur(12px);
    line-height: 1.7;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .dd-ai-textarea::placeholder { color: rgba(139,92,246,0.40); font-size: 13px; }
  .dd-ai-textarea:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
  }

  /* ── AI submit button ── */
  .dd-ai-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
    border: none; border-radius: 14px; cursor: pointer;
    font-size: 14px; font-weight: 900; color: #fff; letter-spacing: 0.03em;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 18px rgba(124,58,237,0.35);
  }
  .dd-ai-btn:hover:not(:disabled) {
    transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,58,237,0.50);
  }
  .dd-ai-btn:disabled {
    opacity: 0.60; cursor: not-allowed; transform: none;
  }

  /* ── AI result card ── */
  .dd-ai-result {
    background: linear-gradient(148deg, #0d0a1e 0%, #160d2e 100%);
    border: 1px solid rgba(124,58,237,0.25);
    border-radius: 18px; overflow: hidden;
    animation: dd-card-rise 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .dd-ai-result-header {
    padding: 14px 18px 10px;
    border-bottom: 1px solid rgba(124,58,237,0.12);
    display: flex; align-items: center; gap: 10px;
  }
  .dd-ai-badge {
    font-size: 9px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
    padding: 3px 10px; border-radius: 20px;
    background: rgba(124,58,237,0.16); border: 1px solid rgba(124,58,237,0.30);
    color: #c4b5fd;
  }
  .dd-ai-meaning-box {
    padding: 14px 18px 0;
    font-size: 13px; line-height: 1.75; color: rgba(196,181,253,0.80);
  }
  .dd-ai-expl-box {
    padding: 10px 18px 16px;
    font-size: 12px; line-height: 1.70; color: rgba(167,139,250,0.55);
  }
  .dd-ai-balls-wrap {
    padding: 14px 18px;
    border-top: 1px solid rgba(124,58,237,0.10);
  }
  .dd-ai-balls-label {
    font-size: 10px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(251,191,36,0.60); margin-bottom: 10px;
  }
  .dd-ai-ball {
    position: relative;
    width: 50px; height: 50px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    background: radial-gradient(circle at 35% 30%, #ffd060 0%, #f59e0b 42%, #b45309 78%, #78350f 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 18px rgba(251,191,36,0.50), inset 0 -3px 6px rgba(0,0,0,0.28);
    animation: dd-ball-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .dd-ai-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 42%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.56) 0%, transparent 70%);
    border-radius: 50%;
  }
  .dd-ai-ball-n {
    position: relative; z-index: 1;
    font-size: 16px; font-weight: 900; color: #78350f; letter-spacing: -0.02em;
  }
  @keyframes dd-ball-pop {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* ── AI loading spinner ── */
  .dd-ai-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 50px 20px; gap: 16px;
  }
  .dd-ai-spinner {
    width: 52px; height: 52px; border-radius: 50%;
    border: 3px solid rgba(124,58,237,0.15);
    border-top-color: #8b5cf6;
    animation: dd-spin-cw 0.9s linear infinite;
  }
  .dd-ai-loading-txt {
    font-size: 13px; font-weight: 700; color: rgba(167,139,250,0.60);
  }

  /* ── AI error ── */
  .dd-ai-error {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.22);
    border-radius: 14px; padding: 14px 16px;
    font-size: 12px; color: #f87171; line-height: 1.65;
  }
`;

/* ─────────────────────────────────────────────────────────────── */
export default function DreamDictionary() {
  const [mode, setMode] = useState('dict'); // 'dict' | 'ai'
  const [searchTerm, setSearchTerm] = useState('');

  // AI mode state
  const [aiInput, setAiInput]   = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]   = useState('');

  const handleAiSubmit = async () => {
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    try {
      const res = await fetch(`${API}/dream-interpretation.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream: aiInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ຜິດພາດ');
      setAiResult(data);
    } catch (err) {
      setAiError(err.message || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ AI ໄດ້');
    } finally {
      setAiLoading(false);
    }
  };

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const matches = dreamDictionary.filter(d =>
      d.keywords.some(k => k.includes(searchTerm.trim()) || searchTerm.trim().includes(k))
    );
    const animalMatches = animals.filter(a => a.animal_name_lao.includes(searchTerm.trim()));
    const combined = [];
    matches.forEach(m => {
      if (m.animalId) {
        const a = animals.find(an => an.animal_id === m.animalId);
        if (a) combined.push({ type: 'animal', data: a, keywords: m.keywords.join(', '), meaning: m.meaning, category: m.category });
      } else if (m.numbers) {
        combined.push({ type: 'number', numbers: m.numbers, keywords: m.keywords.join(', '), meaning: m.meaning, category: m.category });
      }
    });
    animalMatches.forEach(a => {
      if (!combined.find(c => c.data?.animal_id === a.animal_id)) {
        combined.push({ type: 'animal', data: a, keywords: a.animal_name_lao, meaning: 'ຈະມີສິ່ງທີ່ກ່ຽວຂ້ອງກັບນາມສັດນີ້ເຂົ້າມາໃນຊີວິດ ອາດນຳໂຊກມາໃຫ້', category: 'ສັດທົ່ວໄປ' });
      }
    });
    return combined;
  }, [searchTerm]);

  const catStyle = (cat) => CATEGORY_STYLE[cat] || DEFAULT_CAT;

  return (
    <>
      <style>{STYLE}</style>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">

        {/* ═══ LEFT PANEL — Oracle Console ═══ */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Header oracle card */}
          <div className="dd-left-card">
            <div className="dd-stars" />
            <div className="dd-ring-a" />
            <div className="dd-ring-b" />

            <div className="dd-hdr-icon">
              <span
                className="material-symbols-outlined dd-hdr-icon-glyph"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h2 className="dd-hdr-title">ຕຳລາແປຄວາມຝັນ</h2>
            <p className="dd-hdr-sub">Dream Oracle · ຄົ້ນຫາໂຊກດີຈາກຄວາມຝັນ</p>
          </div>

          {/* Mode toggle */}
          <div className="dd-mode-wrap">
            <button
              className={`dd-mode-btn ${mode === 'dict' ? 'active' : 'inactive'}`}
              onClick={() => setMode('dict')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                menu_book
              </span>
              ຕຳລາ
            </button>
            <button
              className={`dd-mode-btn ${mode === 'ai' ? 'active' : 'inactive'}`}
              onClick={() => setMode('ai')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
              AI ຕີຄວາມ
            </button>
          </div>

          {/* ── Dict mode ── */}
          {mode === 'dict' && (<>
            {/* Search input */}
            <div className="dd-search-wrap">
              <span className="material-symbols-outlined dd-search-icon">search</span>
              <input
                type="text"
                placeholder="ຝັນເຫັນຫຍັງ? ເຊັ່ນ: ງູ, ນ້ຳ, ໄຟ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="dd-search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="dd-clear-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              )}
            </div>

            {/* Quick hint rune chips */}
            {!searchTerm && (
              <div>
                <p className="dd-hints-label">✦ ຄຳຄົ້ນຫາທີ່ນິຍົມ</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_HINTS.map(hint => (
                    <button key={hint} onClick={() => setSearchTerm(hint)} className="dd-rune">
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result count */}
            {searchTerm && (
              <div>
                {results.length > 0 ? (
                  <span className="dd-badge-found">
                    <span className="dd-badge-dot" />
                    ພົບ {results.length} ຄຳທຳນາຍ
                  </span>
                ) : (
                  <span className="dd-badge-empty">
                    <span className="dd-badge-dot" />
                    ບໍ່ພົບໃນຕຳລາ
                  </span>
                )}
              </div>
            )}
          </>)}

          {/* ── AI mode ── */}
          {mode === 'ai' && (
            <div className="flex flex-col gap-3">
              <p className="dd-hints-label">✦ ເລົ່າຄວາມຝັນຂອງທ່ານ ແລ້ວ AI ຈະຕີຄວາມ</p>
              <textarea
                className="dd-ai-textarea"
                rows={4}
                placeholder="ເຊັ່ນ: ຂ້ອຍຝັນເຫັນງູໃຫຍ່ສີຂາວ ລອຍຢູ່ໃນອາກາດ ຈາກນັ້ນກໍມີຝົນຕົກ..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                maxLength={1000}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(139,92,246,0.40)' }}>
                {aiInput.length}/1000
              </div>
              <button
                className="dd-ai-btn"
                onClick={handleAiSubmit}
                disabled={!aiInput.trim() || aiLoading}
              >
                {aiLoading ? (
                  <>
                    <div className="dd-ai-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    AI ກຳລັງວິເຄາະ...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    ຕີຄວາມຄວາມຝັນ
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ═══ RIGHT PANEL — Oracle Scroll ═══ */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[65vh] lg:max-h-none">

            {/* ── AI mode results ── */}
            {mode === 'ai' && (<>
              {aiLoading && (
                <div className="dd-ai-loading">
                  <div className="dd-ai-spinner" />
                  <p className="dd-ai-loading-txt">AI ກຳລັງວິເຄາະຄວາມຝັນ...</p>
                </div>
              )}

              {aiError && !aiLoading && (
                <div className="dd-ai-error">
                  <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0, color: '#f87171' }}>
                    error
                  </span>
                  {aiError}
                </div>
              )}

              {aiResult && !aiLoading && (
                <div className="dd-ai-result">
                  <div className="dd-ai-result-header">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 22, color: '#a78bfa', fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#c4b5fd' }}>
                        ຜົນການວິເຄາະ
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.45)', marginTop: 1 }}>
                        Claude AI · ຕໍາລາຄວາມຝັນ
                      </div>
                    </div>
                    <span className="dd-ai-badge" style={{ marginLeft: 'auto' }}>AI</span>
                  </div>

                  {aiResult.meaning && (
                    <div className="dd-ai-meaning-box">{aiResult.meaning}</div>
                  )}
                  {aiResult.explanation && (
                    <div className="dd-ai-expl-box">{aiResult.explanation}</div>
                  )}

                  {aiResult.numbers && aiResult.numbers.length > 0 && (
                    <div className="dd-ai-balls-wrap">
                      <p className="dd-ai-balls-label">✦ ເລກໂຊກດີຈາກ AI</p>
                      <div className="flex flex-wrap gap-3">
                        {aiResult.numbers.map((n, i) => (
                          <div
                            key={i}
                            className="dd-ai-ball"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <span className="dd-ai-ball-n">{String(n).padStart(2, '0')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!aiLoading && !aiResult && !aiError && (
                <div className="dd-idle-wrap">
                  <div className="dd-orb">
                    <span
                      className="material-symbols-outlined dd-orb-icon"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                    <div className="dd-orb-ring dd-orb-ring-1" />
                    <div className="dd-orb-ring dd-orb-ring-2" />
                  </div>
                  <p className="dd-idle-title">AI ພ້ອມແລ້ວ</p>
                  <p className="dd-idle-sub">ເລົ່າຄວາມຝັນຂອງທ່ານ ແລ້ວ AI ຈະຕີຄວາມ ແລະ ແນະນຳເລກ</p>
                </div>
              )}
            </>)}

            {/* ── Dict mode results ── */}
            {/* Idle state */}
            {mode === 'dict' && !searchTerm && (
              <div className="dd-idle-wrap">
                <div className="dd-orb">
                  <span
                    className="material-symbols-outlined dd-orb-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    visibility
                  </span>
                  <div className="dd-orb-ring dd-orb-ring-1" />
                  <div className="dd-orb-ring dd-orb-ring-2" />
                </div>
                <p className="dd-idle-title">Oracle ພ້ອມແລ້ວ</p>
                <p className="dd-idle-sub">ພິມຄຳທີ່ທ່ານຝັນ ຫຼື ຄລິກຄຳຮ້ອນດ້ານຊ້າຍ</p>
              </div>
            )}

            {/* No results */}
            {mode === 'dict' && searchTerm && results.length === 0 && (
              <div className="dd-idle-wrap">
                <div className="dd-orb dd-orb-red">
                  <span
                    className="material-symbols-outlined dd-orb-icon"
                    style={{ fontVariationSettings: "'FILL' 1", color: '#f87171' }}
                  >
                    search_off
                  </span>
                </div>
                <p className="dd-idle-title" style={{ color: 'rgba(248,113,113,0.75)' }}>
                  ບໍ່ພົບໃນຕຳລາ
                </p>
                <p className="dd-idle-sub">ລອງໃຊ້ຄຳອື່ນ ເຊັ່ນ: ງູ, ໄຟ, ນ້ຳ</p>
              </div>
            )}

            {/* Result cards */}
            {mode === 'dict' && results.map((res, idx) => {
              const numbers = res.type === 'animal'
                ? res.data.animal_numbers.split(',')
                : res.numbers.split(',');
              const cs = catStyle(res.category);

              return (
                <div
                  key={idx}
                  className="dd-card"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  {/* Category-colored top bar */}
                  <div className="dd-card-bar" style={{ background: cs.neon }} />

                  <div className="flex items-start gap-4 p-4">
                    {/* Icon box */}
                    <div
                      className="dd-card-icon-box"
                      style={{ boxShadow: `0 0 18px ${cs.neon}30` }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 22, color: cs.neon,
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        {res.type === 'animal' ? res.data.icon : 'format_list_numbered'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + category */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="dd-card-title">
                          {res.type === 'animal' ? res.data.animal_name_lao : 'ເລກເດັດ'}
                        </h3>
                        <span
                          className="dd-cat-pill"
                          style={{
                            background: cs.bg,
                            color: cs.neon,
                            border: `1px solid ${cs.border}`,
                          }}
                        >
                          {res.category}
                        </span>
                      </div>

                      {/* Keywords source */}
                      <p className="dd-kw">
                        ຈາກ:{' '}
                        <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
                          {res.keywords}
                        </span>
                      </p>

                      {/* Lottery balls */}
                      <div className="flex flex-wrap gap-2 my-3">
                        {numbers.map(n => (
                          <div key={n} className="dd-ball">
                            <span className="dd-ball-n">{n.trim()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Meaning (mystic parchment) */}
                      {res.meaning && (
                        <div className="dd-meaning">
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 14, color: '#a78bfa',
                              flexShrink: 0, marginTop: 1,
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            lightbulb
                          </span>
                          <p className="dd-meaning-txt">{res.meaning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </>
  );
}
