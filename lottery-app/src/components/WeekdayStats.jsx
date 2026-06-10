import { useMemo, useRef, useState, useCallback, forwardRef } from 'react';
import { toPng } from 'html-to-image';
import { useData } from '../context/DataContext';

/* ── Day palette ─────────────────────────────────────────────────── */
const DAY_CONFIG = {
  0: { label: 'ວັນອາທິດ',  short: 'ອາ',  accent: '#dc2626' },
  1: { label: 'ວັນຈັນ',    short: 'ຈັນ', accent: '#003fb1' },
  2: { label: 'ວັນອັງຄານ', short: 'ອັງ', accent: '#0d7377' },
  3: { label: 'ວັນພຸດ',    short: 'ພຸດ', accent: '#6750a4' },
  4: { label: 'ວັນພະຫັດ',  short: 'ພ',   accent: '#b45309' },
  5: { label: 'ວັນສຸກ',    short: 'ສຸກ', accent: '#ba1a1a' },
  6: { label: 'ວັນເສົາ',   short: 'ສ',   accent: '#64748b' },
};

/* ── Timeframe filter ─────────────────────────────────────────────── */
function applyTimeframe(draws, timeframe) {
  if (timeframe === 'all' || !draws.length) return draws;
  const sorted = [...draws].sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
  const latestDate = new Date(sorted[0].draw_date);
  const cutoff = new Date(latestDate);
  if (timeframe === '1_month')       cutoff.setMonth(cutoff.getMonth() - 1);
  else if (timeframe === '3_months') cutoff.setMonth(cutoff.getMonth() - 3);
  else if (timeframe === '1_year')   cutoff.setFullYear(cutoff.getFullYear() - 1);
  else return draws;
  return draws.filter(d => new Date(d.draw_date) >= cutoff);
}

const TIMEFRAME_LABELS = {
  '1_month':  '1 ເດືອນ',
  '3_months': '3 ເດືອນ',
  '1_year':   '1 ປີ',
  'all':      'ທັງໝົດ',
};

const GRID_CLASS_MAP = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
  7: 'grid-cols-1 sm:grid-cols-4 lg:grid-cols-7',
};

/* ─── Inline styles ─────────────────────────────────────────────── */
const STYLE = `
  /* ── Root ── */
  .ws-root {
    position: relative;
    background: linear-gradient(158deg, #08091a 0%, #0b0e20 50%, #07080f 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .ws-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.010) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.010) 1px, transparent 1px);
    background-size: 42px 42px;
  }

  /* ── Header ── */
  .ws-hdr {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
    margin-bottom: 20px; position: relative; z-index: 10;
  }
  .ws-hdr-left { display: flex; align-items: center; gap: 12px; }
  .ws-icon-box {
    width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(37,99,235,0.48), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .ws-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .ws-subtitle { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* Share button */
  .ws-share-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.65);
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
  }
  .ws-share-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.22);
    color: rgba(255,255,255,0.90); transform: translateY(-1px);
  }
  .ws-share-btn:disabled { opacity: 0.38; cursor: default; }

  /* ── Day selector ticket stubs ── */
  .ws-tabs {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 18px; position: relative; z-index: 10;
  }
  .ws-tab {
    position: relative; overflow: visible;
    padding: 8px 20px; border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.10);
    font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.40);
    cursor: pointer; transition: all 0.18s; white-space: nowrap;
  }
  .ws-tab::before {
    content: ''; position: absolute; top: 50%; left: -8px; transform: translateY(-50%);
    width: 16px; height: 16px; border-radius: 50%;
    background: #08091a; border: 1px solid rgba(255,255,255,0.08); z-index: 1;
  }
  .ws-tab::after {
    content: ''; position: absolute; top: 50%; right: -8px; transform: translateY(-50%);
    width: 16px; height: 16px; border-radius: 50%;
    background: #08091a; border: 1px solid rgba(255,255,255,0.08); z-index: 1;
  }
  .ws-tab:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.65); }

  /* ── Spotlight panel ── */
  .ws-spot {
    position: relative; border-radius: 20px; overflow: hidden;
    padding: 20px 22px; margin-bottom: 18px; z-index: 10;
  }
  .ws-spot-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.22); pointer-events: none; z-index: 0;
  }
  .ws-spot-stars {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      radial-gradient(circle 1px at 10% 18%, rgba(255,255,255,0.35) 0%, transparent 1px),
      radial-gradient(circle 1px at 28% 72%, rgba(255,255,255,0.22) 0%, transparent 1px),
      radial-gradient(circle 1px at 55% 28%, rgba(255,255,255,0.28) 0%, transparent 1px),
      radial-gradient(circle 1px at 75% 65%, rgba(255,255,255,0.20) 0%, transparent 1px),
      radial-gradient(circle 1px at 92% 12%, rgba(255,255,255,0.32) 0%, transparent 1px),
      radial-gradient(circle 1px at 85% 85%, rgba(255,255,255,0.18) 0%, transparent 1px);
  }

  /* Spotlight header */
  .ws-spot-hdr {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 16px; position: relative; z-index: 2;
  }
  .ws-spot-day-row { display: flex; align-items: center; gap: 10px; }
  .ws-spot-live-dot {
    width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.90);
    animation: ws-dot-pulse 1.6s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes ws-dot-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
    50%       { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
  }
  .ws-spot-day-name { font-size: 19px; font-weight: 900; color: #fff; }
  .ws-spot-day-count { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 1px; }
  .ws-badge-today {
    font-size: 10px; font-weight: 900; letter-spacing: 0.08em;
    background: rgba(255,255,255,0.24); border: 1px solid rgba(255,255,255,0.38);
    border-radius: 20px; padding: 4px 12px; color: #fff; white-space: nowrap;
  }
  .ws-badge-next {
    font-size: 10px; font-weight: 800;
    background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 20px; padding: 4px 12px; color: rgba(255,255,255,0.60);
  }

  /* Number balls in spotlight */
  .ws-balls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; position: relative; z-index: 2; }
  .ws-ball-wrap { display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .ws-ball {
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: 900; position: relative; overflow: hidden; flex-shrink: 0;
  }
  .ws-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 35%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }
  .ws-ball-top  { width: 54px; height: 54px; font-size: 20px; }
  .ws-ball-rest { width: 44px; height: 44px; font-size: 16px; }
  .ws-ball-lbl  { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.48); }

  /* Animals in spotlight */
  .ws-animals {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.14);
    position: relative; z-index: 2;
  }
  .ws-animals-lbl { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 700; }
  .ws-animal-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20);
    border-radius: 12px; padding: 5px 10px;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .ws-animal-pill-top { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.36); }
  .ws-animal-cnt { font-size: 10px; color: rgba(255,255,255,0.50); font-weight: 600; }

  /* ── Day cards grid ── */
  .ws-day-card {
    border-radius: 16px; padding: 13px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.025);
    cursor: pointer; transition: all 0.18s;
    position: relative; z-index: 10;
  }
  .ws-day-card:hover {
    background: rgba(255,255,255,0.048);
    border-color: rgba(255,255,255,0.13); transform: translateY(-1px);
  }
  .ws-card-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 9px;
  }
  .ws-card-hdr-l { display: flex; align-items: center; gap: 7px; }
  .ws-day-dot {
    width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: #fff;
  }
  .ws-day-lbl  { font-size: 12px; font-weight: 900; color: rgba(255,255,255,0.80); }
  .ws-draw-cnt { font-size: 10px; color: rgba(255,255,255,0.25); font-weight: 600; }

  /* Number chips in day card */
  .ws-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 7px; }
  .ws-chip {
    display: flex; align-items: center; gap: 3px;
    border-radius: 7px; padding: 3px 7px;
    font-size: 12px; font-weight: 900;
  }
  .ws-chip-cnt { font-size: 8px; font-weight: 600; }

  /* Mini bar rows */
  .ws-mini-bars { display: flex; flex-direction: column; gap: 4px; margin-bottom: 7px; }
  .ws-mini-row  { display: flex; align-items: center; gap: 5px; }
  .ws-mini-lbl  { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.30); width: 18px; text-align: right; }
  .ws-mini-trk  { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; }
  .ws-mini-fill { height: 100%; border-radius: 9999px; transition: width 0.65s ease; }
  .ws-mini-cnt  { font-size: 9px; color: rgba(255,255,255,0.20); width: 12px; text-align: right; }

  /* Animal footer in card */
  .ws-card-animal {
    margin-top: 7px; padding-top: 7px;
    border-top: 1px solid rgba(255,255,255,0.055);
    display: flex; align-items: center; gap: 5px;
  }
  .ws-card-animal-name  { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.48); }
  .ws-card-animal-count { font-size: 10px; color: rgba(255,255,255,0.22); margin-left: auto; }

  /* ── Empty state ── */
  .ws-empty {
    background: linear-gradient(155deg, #08091a 0%, #0b0e20 100%);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 24px;
    padding: 64px 20px; text-align: center;
  }
  .ws-empty-icon { font-size: 40px; color: rgba(255,255,255,0.18); display: block; margin-bottom: 10px; }
  .ws-empty-txt  { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.28); }
`;

const ShareCaptureCard = forwardRef(function ShareCaptureCard(
  { spotlight, spotlightConf, typeName, timeframe }, ref,
) {
  if (!spotlight || !spotlightConf) return null;
  const tfLabel = TIMEFRAME_LABELS[timeframe] || timeframe;
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
  const accent = spotlightConf.accent;

  return (
    <div ref={ref} style={{ width:'800px', backgroundColor:'#060410', backgroundImage:'radial-gradient(circle at 15% 15%, #1c0e34 0%, transparent 55%), radial-gradient(circle at 85% 85%, #1a0a08 0%, transparent 55%)', fontFamily:"'Noto Sans Lao','Phetsarath OT',sans-serif", display:'flex', flexDirection:'column', boxSizing:'border-box', overflow:'hidden', position:'relative' }}>
      {/* Top golden stripe */}
      <div style={{ height:'4px', background:'linear-gradient(90deg, #d4af37, #FFF5C0, #B8860B, #8B6914, #d4af37)' }} />

      {/* Header Area */}
      <div style={{ background:'#0d0e1c', borderBottom:'1px solid rgba(212,175,55,0.2)', padding:'28px 40px', textAlign:'center', color:'#fff', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'12px' }}>
          {/* Logo SVG matching Navbar/Footer flag */}
          <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:'linear-gradient(90deg, #d4af37, #FFF5C0, #B8860B)', padding:'2px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(0,0,0,0.4)' }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'#0d0e1c', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {/* Glass shine */}
              <div style={{ position:'absolute', top:2, left:4, width:6, height:4, background:'rgba(255,255,255,0.4)', borderRadius:'50%', transform:'rotate(-28deg)' }} />
              <svg viewBox="0 0 38 38" style={{ width:'100%', height:'100%', display:'block' }}>
                <defs>
                  <clipPath id="circleClipWeekdayShare">
                    <circle cx="19" cy="19" r="17" />
                  </clipPath>
                  <linearGradient id="goldStripeWeekdayShare" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A67C1E" />
                    <stop offset="50%" stopColor="#F5D77F" />
                    <stop offset="100%" stopColor="#A67C1E" />
                  </linearGradient>
                  <linearGradient id="darkStripeWeekdayShare" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F1326" />
                    <stop offset="50%" stopColor="#1E2548" />
                    <stop offset="100%" stopColor="#0F1326" />
                  </linearGradient>
                  <radialGradient id="goldCircleWeekdayShare" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFDF5" />
                    <stop offset="70%" stopColor="#F3D072" />
                    <stop offset="100%" stopColor="#C99E32" />
                  </radialGradient>
                </defs>
                <g clipPath="url(#circleClipWeekdayShare)">
                  <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeWeekdayShare)" />
                  <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeWeekdayShare)" />
                  <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeWeekdayShare)" />
                  <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleWeekdayShare)" />
                </g>
              </svg>
            </div>
          </div>
          <span style={{ fontSize:'32px', fontWeight:900, fontFamily:"'Inter',sans-serif", letterSpacing:'-0.02em', background:'linear-gradient(90deg, #D4AF37, #FFD54F)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>LAOLOTS.COM</span>
        </div>
        <div style={{ display:'inline-block', background:'rgba(212,175,55,0.15)', padding:'8px 24px', borderRadius:'999px', fontSize:'18px', fontWeight:900, border:'1px solid rgba(212,175,55,0.35)', color:'#ffd700' }}>
          ສະຖິຕິຕາມມື້ອອກຫວຍ · {typeName}
        </div>
      </div>

      {/* Info Bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', background:'#0d0e1c', borderBottom:'1px solid rgba(212,175,55,0.15)' }}>
        <div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px' }}>ຊ່ວງເວລາວິເຄາະ</div>
          <div style={{ fontSize:'20px', fontWeight:900, color:'#ffd700' }}>{tfLabel}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', background:`${accent}20`, padding:'8px 18px', borderRadius:'14px', border:`1px solid ${accent}40` }}>
          <span style={{ width:'10px', height:'10px', borderRadius:'50%', backgroundColor:accent, display:'inline-block', boxShadow:`0 0 8px ${accent}` }} />
          <span style={{ fontSize:'18px', fontWeight:900, color:accent }}>{spotlightConf.label}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', fontWeight:800, marginBottom:'4px' }}>ວັນທີແຊຣ໌</div>
          <div style={{ fontSize:'20px', fontWeight:900, color:'white' }}>{dateStr}</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding:'32px 40px', display:'flex', flexDirection:'column', gap:'24px', flex:1 }}>
        <div style={{ background:'rgba(13,14,28,0.8)', borderRadius:'20px', padding:'20px 28px', border:'1px solid rgba(212,175,55,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
          <span style={{ fontSize:'18px', fontWeight:800, color:'white' }}>ຈຳນວນງວດທີ່ອອກຫວຍໃນ {spotlightConf.label}</span>
          <span style={{ fontSize:'22px', fontWeight:950, color:accent, background:`${accent}20`, border:`1px solid ${accent}30`, padding:'6px 18px', borderRadius:'12px' }}>{spotlight.totalDraws} ງວດ</span>
        </div>

        {/* Top Numbers Card */}
        <div style={{ background:'rgba(13,14,28,0.8)', borderRadius:'24px', padding:'24px', border:'1px solid rgba(212,175,55,0.2)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize:'18px', fontWeight:900, color:'white', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(212,175,55,0.1)', paddingBottom:'12px' }}>
            <span style={{ fontSize:'22px' }}>🎯</span>ເລກ 2 ຕົວທ້າຍ ທີ່ມັກອອກຫຼາຍທີ່ສຸດ
          </div>
          <div style={{ display:'flex', gap:'12px', marginBottom:'24px', justifyContent:'space-between' }}>
            {spotlight.topNums.length > 0 ? spotlight.topNums.map(([num, count], i) => (
              <div key={num} style={{ display:'flex', flexDirection:'column', alignItems:'center', borderRadius:'20px', padding:'16px 12px', width:'18%', border:`1px solid ${i===0?accent:'rgba(212,175,55,0.15)'}`, background:i===0?`linear-gradient(135deg,${accent}25 0%,${accent}05 100%)`:'rgba(255,255,255,0.02)', boxShadow:i===0?`0 8px 24px ${accent}20`:'none' }}>
                <span style={{ fontSize:'38px', fontWeight:950, fontFamily:"'Inter',monospace", color:i===0?accent:'#ffd700', lineHeight:1.1 }}>{num}</span>
                <span style={{ fontSize:'13px', color:i===0?accent:'rgba(255,255,255,0.65)', fontWeight:800, marginTop:'8px', background:i===0?`${accent}30`:'rgba(255,255,255,0.08)', padding:'3px 10px', borderRadius:'8px', border:i===0?'none':'1px solid rgba(255,255,255,0.05)' }}>{count} ຄັ້ງ</span>
              </div>
            )) : <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.3)', width:'100%', textAlign:'center', padding:'16px 0' }}>ບໍ່ມີຂໍ້ມູນ</span>}
          </div>
          {spotlight.topNums.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {spotlight.topNums.map(([num, count], i) => {
                const pct = Math.round((count / spotlight.maxCount) * 100);
                return (
                  <div key={num} style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <span style={{ fontSize:'16px', fontWeight:900, color:i===0?accent:'rgba(255,255,255,0.6)', width:'28px', fontFamily:"'Inter',monospace", textAlign:'right' }}>{num}</span>
                    <div style={{ flex:1, height:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'6px', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:'6px', width:`${pct}%`, backgroundColor:i===0?accent:`${accent}bb` }} />
                    </div>
                    <span style={{ fontSize:'14px', fontWeight:800, color:i===0?accent:'rgba(255,255,255,0.7)', width:'55px', textAlign:'right' }}>{count} ຄັ້ງ</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Animals Card */}
        {spotlight.topAnimals.length > 0 && (
          <div style={{ background:'rgba(13,14,28,0.8)', borderRadius:'24px', padding:'24px', border:'1px solid rgba(212,175,55,0.2)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize:'18px', fontWeight:900, color:'white', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(212,175,55,0.1)', paddingBottom:'12px' }}>
              <span style={{ fontSize:'22px' }}>🐾</span>ນາມສັດຍອດນິຍົມ
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {spotlight.topAnimals.map((item, i) => (
                <div key={item.animal?.animal_id ?? i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderRadius:'16px', border:`1px solid ${i===0?`${accent}40`:'rgba(212,175,55,0.1)'}`, background:i===0?`${accent}15`:'rgba(255,255,255,0.02)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <span style={{ fontSize:'30px', lineHeight:1 }}>{item.animal?.icon}</span>
                    <div>
                      <div style={{ fontSize:'16px', fontWeight:900, color:'white' }}>{item.animal?.animal_name_lao}</div>
                      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', fontFamily:"'Inter',monospace", fontWeight:700, marginTop:'2px' }}>{item.animal?.numbers?.join(', ')}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:'14px', fontWeight:900, color:i===0?accent:'#ffd700', background:i===0?`${accent}25`:'rgba(212,175,55,0.15)', padding:'5px 12px', borderRadius:'10px', border:i===0?'none':'1px solid rgba(212,175,55,0.1)' }}>{item.count} ຄັ້ງ</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div style={{ background:'#0a0b14', textAlign:'center', padding:'20px', color:'rgba(212,175,55,0.7)', fontSize:'14px', fontWeight:800, letterSpacing:'0.05em', borderTop:'1px solid rgba(212,175,55,0.35)' }}>
        laolots.com — ສູນລວມຜົນຫວຍ ແລະ ສະຖິຕິຫວຍລາວອອນລາຍ
      </div>
    </div>
  );
});



/* ══════════════════════════════════════════════════════════════════
   WeekdayStats — Main Component
   ══════════════════════════════════════════════════════════════════ */
export default function WeekdayStats({ timeframe, typeId }) {
  const { draws, animals, types } = useData();
  const captureRef   = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay]   = useState(null);

  const activeType = types?.find(t => String(t.type_id) === String(typeId));
  const typeName   = activeType?.type_name ?? 'ລາວ';
  const todayJS    = new Date().getDay();

  const { allStats, drawDays, spotlightDay } = useMemo(() => {
    let targetDraws = !typeId || typeId === 'all'
      ? draws
      : draws.filter(d => String(d.type_id) === String(typeId));
    const published = targetDraws.filter(d => d.status === 'published');
    const base = applyTimeframe(published, timeframe);
    if (!base.length) return { allStats: [], drawDays: [], spotlightDay: 1 };

    const daySet = new Set();
    base.forEach(d => daySet.add(new Date(d.draw_date).getDay()));
    const detectedDays = [...daySet].sort((a, b) => {
      const aSort = a === 0 ? 7 : a;
      const bSort = b === 0 ? 7 : b;
      return aSort - bSort;
    });
    const drawDaysArr = detectedDays.map(day => ({
      day,
      ...(DAY_CONFIG[day] || { label: `ວັນ ${day}`, short: `${day}`, accent: '#64748b' }),
    }));

    const stats = drawDaysArr.map(({ day }) => {
      const dayDraws = base.filter(d => new Date(d.draw_date).getDay() === day);
      const twoDigitCount = {};
      const animalCount   = {};
      dayDraws.forEach(draw => {
        const td = draw.results_detail?.find(r => r.prize_type === '2_digits');
        if (!td) return;
        const val = td.result_value;
        if (val != null) twoDigitCount[val] = (twoDigitCount[val] || 0) + 1;
        if (td.animal_id) animalCount[td.animal_id] = (animalCount[td.animal_id] || 0) + 1;
      });
      const topNums = Object.entries(twoDigitCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const topAnimals = Object.entries(animalCount).sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([id, count]) => ({ animal: animals.find(a => String(a.animal_id) === String(id)), count }));
      return { day, totalDraws: dayDraws.length, topNums, topAnimals, maxCount: topNums[0]?.[1] || 1 };
    });

    const isDrawDay = detectedDays.includes(todayJS);
    let spotlight;
    if (isDrawDay) { spotlight = todayJS; }
    else {
      const sorted = [...detectedDays].sort((a, b) => a - b);
      spotlight = sorted.find(d => d > todayJS) ?? sorted[0] ?? 1;
    }
    return { allStats: stats, drawDays: drawDaysArr, spotlightDay: spotlight };
  }, [draws, animals, timeframe, typeId, todayJS]);

  const activeDay = useMemo(() => {
    const isDayValid = drawDays.some(d => d.day === selectedDay);
    return isDayValid ? selectedDay : spotlightDay;
  }, [selectedDay, drawDays, spotlightDay]);

  const isActualDrawDay = drawDays.some(d => d.day === todayJS) && activeDay === todayJS;
  const spotlight     = allStats.find(s => s.day === activeDay) || allStats[0];
  const spotlightConf = drawDays.find(d => d.day === activeDay) || drawDays[0];
  const gridCols      = GRID_CLASS_MAP[drawDays.length] || 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5';

  const handleShare = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(captureRef.current, { cacheBust: true, quality: 1.0, pixelRatio: 2, skipFonts: true, backgroundColor: '#ffffff' });
      const dayLabel = spotlightConf?.label || 'day';
      const fileName = `weekday-stats-${typeName}-${dayLabel}-${TIMEFRAME_LABELS[timeframe] || timeframe}.png`;
      if (navigator.share && navigator.canShare) {
        try {
          const res  = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title: `ສະຖິຕິ ${dayLabel} · ${typeName}`, text: `ສະຖິຕິຫວຍອອກ ${dayLabel} ${typeName} (${TIMEFRAME_LABELS[timeframe] || timeframe}) — laolots.com`, files: [file] });
            return;
          }
        } catch (shareErr) { if (shareErr.name === 'AbortError') return; }
      }
      const link = document.createElement('a');
      link.download = fileName; link.href = dataUrl; link.click();
    } catch { alert('ການສ້າງຮູບພາບມີບັນຫາ, ກະລຸນາລອງໃໝ່.'); }
    finally { setIsGenerating(false); }
  }, [typeName, timeframe, spotlightConf]);

  /* ── Empty state ── */
  if (!spotlight || !spotlightConf || allStats.length === 0) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="ws-empty">
          <span className="material-symbols-outlined ws-empty-icon">calendar_month</span>
          <p className="ws-empty-txt">ບໍ່ມີຂໍ້ມູນສະຖິຕິຕາມມື້ ສຳລັບຕົວກອງນີ້</p>
        </div>
      </>
    );
  }

  const accent = spotlightConf.accent;

  return (
    <>
      <style>{STYLE}</style>
      <div className="ws-root p-6 sm:p-8 space-y-0">
        <div className="ws-mesh" />

        {/* Off-screen capture */}
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }}>
          <ShareCaptureCard ref={captureRef} spotlight={spotlight} spotlightConf={spotlightConf} typeName={typeName} timeframe={timeframe} />
        </div>

        {/* ── Header ── */}
        <div className="ws-hdr">
          <div className="ws-hdr-left">
            <div className="ws-icon-box">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                calendar_month
              </span>
            </div>
            <div>
              <h2 className="ws-title">ສະຖິຕິຕາມມື້ອອກຫວຍ</h2>
              <p className="ws-subtitle">ຄລິກເລືອກມື້ເພື່ອເບິ່ງສະຖິຕິ ແລະ ແຊຣ໌ຮູບ</p>
            </div>
          </div>
          <button onClick={handleShare} disabled={isGenerating} className="ws-share-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 17, animation: isGenerating ? 'spin 1s linear infinite' : 'none' }}>
              {isGenerating ? 'progress_activity' : 'share'}
            </span>
            {isGenerating ? 'ກຳລັງສ້າງ...' : 'ແຊຣ໌ເປັນຮູບ'}
          </button>
        </div>

        {/* ── Day selector ticket stubs ── */}
        <div className="ws-tabs">
          {drawDays.map(conf => {
            const isActive = conf.day === activeDay;
            return (
              <button
                key={conf.day}
                onClick={() => setSelectedDay(conf.day)}
                className="ws-tab"
                style={isActive ? {
                  background: `${conf.accent}18`,
                  borderColor: `${conf.accent}45`,
                  color: conf.accent,
                  boxShadow: `0 0 14px ${conf.accent}18`,
                } : undefined}
              >
                {conf.label}
              </button>
            );
          })}
        </div>

        {/* ── Spotlight panel ── */}
        <div
          className="ws-spot"
          style={{ background: `linear-gradient(140deg, ${accent}d8 0%, ${accent}95 55%, ${accent}70 100%)` }}
        >
          <div className="ws-spot-overlay" />
          <div className="ws-spot-stars" />

          {/* Header row */}
          <div className="ws-spot-hdr">
            <div className="ws-spot-day-row">
              <div className="ws-spot-live-dot" />
              <div>
                <div className="ws-spot-day-name">{spotlightConf.label}</div>
                <div className="ws-spot-day-count">ທັງໝົດ {spotlight.totalDraws} ງວດ</div>
              </div>
            </div>
            {(isActualDrawDay || activeDay === spotlightDay) && (
              <span className={isActualDrawDay ? 'ws-badge-today' : 'ws-badge-next'}>
                {isActualDrawDay ? '● ມື້ນີ້' : 'ງວດຕໍ່ໄປ'}
              </span>
            )}
          </div>

          {/* Number balls */}
          <div className="ws-balls">
            {spotlight.topNums.length > 0 ? spotlight.topNums.map(([num, count], i) => {
              const isTop = i === 0;
              return (
                <div key={num} className="ws-ball-wrap">
                  <div
                    className={`ws-ball ${isTop ? 'ws-ball-top' : 'ws-ball-rest'}`}
                    style={{
                      background: isTop
                        ? `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 45%, rgba(200,200,200,0.70) 100%)`
                        : `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 45%, rgba(0,0,0,0.15) 100%)`,
                      boxShadow: isTop
                        ? `0 6px 20px rgba(0,0,0,0.30), inset 0 -4px 8px rgba(0,0,0,0.14)`
                        : `0 4px 12px rgba(0,0,0,0.22), inset 0 -3px 6px rgba(0,0,0,0.10)`,
                      color: isTop ? accent : '#fff',
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 1, fontWeight: 900 }}>{num}</span>
                  </div>
                  <div className="ws-ball-lbl">{count} ຄັ້ງ</div>
                </div>
              );
            }) : <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, position: 'relative', zIndex: 2 }}>ບໍ່ມີຂໍ້ມູນ</p>}
          </div>

          {/* Animals */}
          {spotlight.topAnimals.length > 0 && (
            <div className="ws-animals">
              <span className="ws-animals-lbl">ນາມສັດ:</span>
              {spotlight.topAnimals.map((item, i) => (
                <div key={item.animal?.animal_id ?? i} className={`ws-animal-pill ${i === 0 ? 'ws-animal-pill-top' : ''}`}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{item.animal?.icon}</span>
                  <span>{item.animal?.animal_name_lao}</span>
                  <span className="ws-animal-cnt">{item.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── All Days Grid ── */}
        <div className={`grid ${gridCols} gap-3`} style={{ position: 'relative', zIndex: 10 }}>
          {drawDays.map((conf) => {
            const stat     = allStats.find(s => s.day === conf.day);
            const isActive = conf.day === activeDay;
            if (!stat) return null;

            return (
              <div
                key={conf.day}
                onClick={() => setSelectedDay(conf.day)}
                className="ws-day-card"
                style={isActive ? {
                  borderColor:    `${conf.accent}38`,
                  background:     `${conf.accent}0e`,
                  boxShadow:      `0 0 22px ${conf.accent}14`,
                  transform:      'translateY(-1px)',
                } : undefined}
              >
                {/* Card header */}
                <div className="ws-card-hdr">
                  <div className="ws-card-hdr-l">
                    <div className="ws-day-dot" style={{ background: conf.accent }}>
                      {conf.short.charAt(0)}
                    </div>
                    <span className="ws-day-lbl">{conf.label}</span>
                    {isActualDrawDay && isActive && (
                      <span style={{ fontSize: 8, fontWeight: 900, background: conf.accent, color: '#fff', padding: '2px 6px', borderRadius: 4, lineHeight: 1.5 }}>
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="ws-draw-cnt">{stat.totalDraws} ງວດ</span>
                </div>

                {/* Number chips */}
                <div className="ws-chips">
                  {stat.topNums.length > 0 ? stat.topNums.map(([num, count], i) => (
                    <div
                      key={num}
                      className="ws-chip"
                      style={i === 0 ? {
                        background: conf.accent, color: '#fff',
                      } : {
                        background: 'rgba(255,255,255,0.055)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.60)',
                      }}
                    >
                      <span>{num}</span>
                      <span className="ws-chip-cnt" style={{ color: i === 0 ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.28)' }}>
                        {count}x
                      </span>
                    </div>
                  )) : (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>ບໍ່ມີຂໍ້ມູນ</span>
                  )}
                </div>

                {/* Mini bar chart */}
                {stat.topNums.length > 0 && (
                  <div className="ws-mini-bars">
                    {stat.topNums.map(([num, count], i) => {
                      const pct = Math.round((count / stat.maxCount) * 100);
                      return (
                        <div key={num} className="ws-mini-row">
                          <span className="ws-mini-lbl">{num}</span>
                          <div className="ws-mini-trk">
                            <div
                              className="ws-mini-fill"
                              style={{
                                width: `${pct}%`,
                                background: i === 0 ? conf.accent : `${conf.accent}55`,
                              }}
                            />
                          </div>
                          <span className="ws-mini-cnt">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Top animal footer */}
                {stat.topAnimals[0] && (
                  <div className="ws-card-animal">
                    <span style={{ fontSize: 17 }}>{stat.topAnimals[0].animal?.icon}</span>
                    <span className="ws-card-animal-name">{stat.topAnimals[0].animal?.animal_name_lao}</span>
                    <span className="ws-card-animal-count">{stat.topAnimals[0].count}x</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
