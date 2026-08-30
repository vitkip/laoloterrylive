import{t as e}from"./vendor-react-nvcEvhRQ.js";import{i as t,r as n,s as r}from"./chunk-OE4NN4TA-BrSHlpGf.js";import{n as i}from"./AuthContext-BIoUmasw.js";var a=e(),o=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@400;600;700;900&display=swap');

  .ar-screen {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: radial-gradient(ellipse at 50% 0%,   rgba(212,175,55,0.07) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 100%,  rgba(212,175,55,0.05) 0%, transparent 50%),
                #060812;
    z-index: 50;
    gap: 28px;
  }

  /* Decorative corner orbs */
  .ar-orb {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .ar-orb-1 { width: 400px; height: 400px; top: -120px; left: -120px;
    background: radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%); }
  .ar-orb-2 { width: 360px; height: 360px; bottom: -100px; right: -100px;
    background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%); }

  /* ── Lottery ball spinner ── */
  .ar-ball-wrap {
    position: relative; width: 72px; height: 72px;
  }

  /* Outer spinning ring */
  .ar-ring {
    position: absolute; inset: 0; border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(212,175,55,0.0)  0deg,
      rgba(212,175,55,0.0)  200deg,
      #D4AF37               270deg,
      #FFD54F               310deg,
      rgba(212,175,55,0.0)  360deg
    );
    animation: ar-spin 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes ar-spin {
    to { transform: rotate(360deg); }
  }

  /* Inner gold ball */
  .ar-ball {
    position: absolute; inset: 6px; border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 55%, #8B6914 100%);
    box-shadow: 0 4px 20px rgba(212,175,55,0.4), inset 0 2px 4px rgba(255,255,255,0.35);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  /* Shine highlight on ball */
  .ar-ball::after {
    content: '';
    position: absolute; top: 6px; left: 10px;
    width: 14px; height: 9px;
    background: rgba(255,255,255,0.42);
    border-radius: 50%; transform: rotate(-28deg);
  }
  .ar-ball-text {
    font-size: 15px; font-weight: 900;
    color: #0C1020; position: relative; z-index: 1;
    letter-spacing: -0.04em;
  }

  /* Pulse ring behind ball */
  .ar-pulse {
    position: absolute; inset: -8px; border-radius: 50%;
    border: 1px solid rgba(212,175,55,0.18);
    animation: ar-pulse-ring 2s ease-out infinite;
  }
  .ar-pulse-2 {
    position: absolute; inset: -18px; border-radius: 50%;
    border: 1px solid rgba(212,175,55,0.09);
    animation: ar-pulse-ring 2s ease-out 0.5s infinite;
  }
  @keyframes ar-pulse-ring {
    0%   { opacity: 1;   transform: scale(1); }
    100% { opacity: 0;   transform: scale(1.55); }
  }

  /* ── Brand text ── */
  .ar-brand {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .ar-brand-name {
    font-size: 22px; font-weight: 900;
    color: #fff; letter-spacing: 0.01em;
  }
  .ar-brand-name span {
    background: linear-gradient(90deg, #D4AF37, #FFD54F, #B8860B);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ar-brand-sub {
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(212,175,55,0.45);
  }

  /* ── Loading dots ── */
  .ar-dots {
    display: flex; align-items: center; gap: 6px;
  }
  .ar-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(212,175,55,0.35);
    animation: ar-dot-bounce 1.3s ease-in-out infinite;
  }
  .ar-dot:nth-child(2) { animation-delay: 0.18s; }
  .ar-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes ar-dot-bounce {
    0%, 80%, 100% { transform: scale(0.7); background: rgba(212,175,55,0.25); }
    40%            { transform: scale(1.15); background: #D4AF37;
                     box-shadow: 0 0 8px rgba(212,175,55,0.6); }
  }

  /* Bottom tagline */
  .ar-tagline {
    font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.05em;
    animation: ar-fade-in 0.6s ease both;
    animation-delay: 0.3s;
  }
  @keyframes ar-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Top gold line */
  .ar-top-line {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 10%, rgba(212,175,55,0.5) 50%, transparent 90%);
  }
`;function s(){return(0,a.jsxs)(`div`,{className:`ar-screen`,children:[(0,a.jsx)(`style`,{children:o}),(0,a.jsx)(`div`,{className:`ar-top-line`}),(0,a.jsx)(`div`,{className:`ar-orb ar-orb-1`}),(0,a.jsx)(`div`,{className:`ar-orb ar-orb-2`}),(0,a.jsxs)(`div`,{className:`ar-ball-wrap`,children:[(0,a.jsx)(`div`,{className:`ar-pulse`}),(0,a.jsx)(`div`,{className:`ar-pulse-2`}),(0,a.jsx)(`div`,{className:`ar-ring`}),(0,a.jsx)(`div`,{className:`ar-ball`,children:(0,a.jsx)(`span`,{className:`ar-ball-text`,children:`LL`})})]}),(0,a.jsxs)(`div`,{className:`ar-brand`,children:[(0,a.jsxs)(`div`,{className:`ar-brand-name`,children:[`laolots`,(0,a.jsx)(`span`,{children:`.com`})]}),(0,a.jsx)(`div`,{className:`ar-brand-sub`,children:`ຫວຍພັດທະນາລາວ`})]}),(0,a.jsxs)(`div`,{className:`ar-dots`,children:[(0,a.jsx)(`div`,{className:`ar-dot`}),(0,a.jsx)(`div`,{className:`ar-dot`}),(0,a.jsx)(`div`,{className:`ar-dot`})]}),(0,a.jsx)(`p`,{className:`ar-tagline`,children:`ກຳລັງກວດສອບສິດການເຂົ້າໃຊ້...`})]})}function c(){let{user:e,loading:o}=i(),c=r();return o?(0,a.jsx)(s,{}):e?(0,a.jsx)(t,{}):(0,a.jsx)(n,{to:`/login?from=${encodeURIComponent(c.pathname)}`,replace:!0})}export{c as default};