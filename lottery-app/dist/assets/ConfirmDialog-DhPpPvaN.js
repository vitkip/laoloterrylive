import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{v as t}from"./vendor-charts-ChC9cbBZ.js";import{t as n}from"./vendor-react-CtUuC_pd.js";var r=e(t(),1),i=n(),a=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@400;500;600;700;900&display=swap');

  .cd-root { font-family: 'Noto Sans Lao Looped', sans-serif; }

  /* ── Backdrop ── */
  .cd-backdrop {
    position: fixed; inset: 0; z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    background: rgba(2, 4, 14, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: cd-bg-in 0.18s ease;
  }
  @keyframes cd-bg-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Dialog card ── */
  .cd-card {
    position: relative;
    width: 100%; max-width: 360px;
    background: linear-gradient(160deg, #111526 0%, #0C1020 55%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.16);
    border-radius: 22px;
    padding: 28px 24px 24px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.05);
    animation: cd-card-in 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes cd-card-in {
    from { opacity: 0; transform: scale(0.88) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  /* Top shimmer line */
  .cd-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.5) 50%, transparent 95%);
  }
  /* Glow orb behind icon */
  .cd-card-glow {
    position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
    width: 200px; height: 160px; border-radius: 50%;
    filter: blur(40px); pointer-events: none;
    transition: background 0.2s;
  }
  .cd-card-glow.danger  { background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%); }
  .cd-card-glow.default { background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%); }

  /* ── Icon zone ── */
  .cd-icon-wrap {
    width: 56px; height: 56px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 18px; position: relative; z-index: 1;
    flex-shrink: 0;
  }
  .cd-icon-wrap.danger {
    background: linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(220,38,38,0.08) 100%);
    border: 1px solid rgba(239,68,68,0.28);
    box-shadow: 0 0 20px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .cd-icon-wrap.default {
    background: linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(184,134,11,0.08) 100%);
    border: 1px solid rgba(212,175,55,0.28);
    box-shadow: 0 0 20px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .cd-icon-wrap .mat-icon {
    font-size: 26px !important;
  }
  .cd-icon-wrap.danger  .mat-icon { color: #f87171; text-shadow: 0 0 14px rgba(248,113,113,0.6); }
  .cd-icon-wrap.default .mat-icon { color: #FFD54F; text-shadow: 0 0 14px rgba(212,175,55,0.7); }

  /* Pulse ring on icon */
  .cd-icon-pulse {
    position: absolute; inset: -6px; border-radius: 22px;
    animation: cd-pulse 2.2s ease-out infinite;
  }
  .cd-icon-pulse.danger  { border: 1px solid rgba(239,68,68,0.22); }
  .cd-icon-pulse.default { border: 1px solid rgba(212,175,55,0.2); }
  @keyframes cd-pulse {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.45); }
  }

  /* ── Text ── */
  .cd-title {
    font-size: 17px; font-weight: 900;
    color: #EEECf8; text-align: center;
    line-height: 1.3; margin-bottom: 8px;
    position: relative; z-index: 1;
  }
  .cd-message {
    font-size: 13px; font-weight: 500;
    color: rgba(232,230,240,0.45); text-align: center;
    line-height: 1.7; margin-bottom: 24px;
    position: relative; z-index: 1;
  }

  /* ── Buttons ── */
  .cd-actions {
    display: flex; gap: 10px;
    position: relative; z-index: 1;
  }
  .cd-btn-cancel {
    flex: 1; padding: 11px;
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    font-size: 13.5px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: rgba(232,230,240,0.5);
    cursor: pointer; transition: all 0.18s;
  }
  .cd-btn-cancel:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(232,230,240,0.8);
    border-color: rgba(255,255,255,0.14);
  }

  /* Confirm — danger */
  .cd-btn-danger {
    flex: 1; padding: 11px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 60%, #f87171 100%);
    font-size: 13.5px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: #fff; cursor: pointer;
    box-shadow: 0 3px 16px rgba(239,68,68,0.35);
    transition: all 0.2s;
    position: relative; overflow: hidden;
  }
  .cd-btn-danger::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    border-radius: inherit;
  }
  .cd-btn-danger:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(239,68,68,0.5);
  }
  .cd-btn-danger:active { transform: translateY(0); }

  /* Confirm — default (gold) */
  .cd-btn-default {
    flex: 1; padding: 11px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 60%, #8B6914 100%);
    font-size: 13.5px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: #0C1020; cursor: pointer;
    box-shadow: 0 3px 16px rgba(212,175,55,0.35);
    transition: all 0.2s;
    position: relative; overflow: hidden;
  }
  .cd-btn-default::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    border-radius: inherit;
  }
  .cd-btn-default:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(212,175,55,0.5);
    background: linear-gradient(135deg, #FFD54F 0%, #D4AF37 60%, #B8860B 100%);
  }
  .cd-btn-default:active { transform: translateY(0); }

  /* Divider above buttons */
  .cd-btn-sep {
    height: 1px; margin-bottom: 20px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent);
    position: relative; z-index: 1;
  }
`;function o({open:e,title:t,message:n,confirmLabel:o=`ຢືນຢັນ`,cancelLabel:s=`ຍົກເລີກ`,variant:c=`danger`,onConfirm:l,onCancel:u}){if((0,r.useEffect)(()=>{if(!e)return;let t=e=>{e.key===`Escape`&&u?.()};return document.addEventListener(`keydown`,t),()=>document.removeEventListener(`keydown`,t)},[e,u]),!e)return null;let d=c===`danger`;return(0,i.jsxs)(`div`,{className:`cd-root cd-backdrop`,onClick:u,children:[(0,i.jsx)(`style`,{children:a}),(0,i.jsxs)(`div`,{className:`cd-card`,onClick:e=>e.stopPropagation(),children:[(0,i.jsx)(`div`,{className:`cd-card-glow ${d?`danger`:`default`}`}),(0,i.jsxs)(`div`,{className:`cd-icon-wrap ${d?`danger`:`default`}`,children:[(0,i.jsx)(`div`,{className:`cd-icon-pulse ${d?`danger`:`default`}`}),(0,i.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,style:{fontVariationSettings:`'FILL' 1`},children:d?`warning`:`help`})]}),(0,i.jsx)(`h3`,{className:`cd-title`,children:t}),n&&(0,i.jsx)(`p`,{className:`cd-message`,children:n}),(0,i.jsx)(`div`,{className:`cd-btn-sep`}),(0,i.jsxs)(`div`,{className:`cd-actions`,children:[(0,i.jsx)(`button`,{className:`cd-btn-cancel`,onClick:u,children:s}),(0,i.jsx)(`button`,{className:d?`cd-btn-danger`:`cd-btn-default`,onClick:l,children:o})]})]})]})}export{o as t};