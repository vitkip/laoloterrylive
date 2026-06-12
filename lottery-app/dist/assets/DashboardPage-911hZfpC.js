import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{v as t}from"./vendor-charts-iQ_2Absj.js";import{t as n}from"./vendor-react-nvcEvhRQ.js";import{n as r}from"./DataContext-CEgVbb6W.js";import{t as i}from"./SEO-B_A7xFuH.js";import{a,n as o,t as s}from"./schemas-DP1duLNF.js";import{t as c}from"./useStatistics-BgWdJ9FZ.js";import{t as l}from"./vendor-image-BYDYKov0.js";var u=e(t(),1),d=n(),f=[{card:`linear-gradient(148deg, #1c0d04 0%, #2e1208 100%)`,cardBorder:`rgba(255,107,53,0.24)`,cardShadow:`0 0 36px rgba(255,69,0,0.13)`,ball:`radial-gradient(circle at 35% 30%, #ff9a6c 0%, #ff4500 38%, #c2410c 70%, #7a1d04 100%)`,ballShadow:`0 8px 32px rgba(255,69,0,0.58), inset 0 -5px 10px rgba(0,0,0,0.32)`,ballSize:74,ballFont:26,badgeBg:`rgba(255,69,0,0.85)`,bar:`linear-gradient(90deg, #b91c1c, #ef4444, #ff9a6c)`,barGlow:`rgba(255,69,0,0.50)`,countColor:`#fb923c`,pulse:!0},{card:`linear-gradient(148deg, #180c04 0%, #271007 100%)`,cardBorder:`rgba(234,88,12,0.18)`,cardShadow:`0 0 24px rgba(234,88,12,0.09)`,ball:`radial-gradient(circle at 35% 30%, #fb923c 0%, #ea580c 40%, #9a3412 76%, #5a1804 100%)`,ballShadow:`0 6px 22px rgba(234,88,12,0.48), inset 0 -4px 8px rgba(0,0,0,0.30)`,ballSize:62,ballFont:22,badgeBg:`rgba(234,88,12,0.80)`,bar:`linear-gradient(90deg, #9a3412, #ea580c, #fb923c)`,barGlow:`rgba(234,88,12,0.40)`,countColor:`rgba(251,146,60,0.88)`,pulse:!1},{card:`linear-gradient(148deg, #140b03 0%, #200e06 100%)`,cardBorder:`rgba(217,119,6,0.14)`,cardShadow:`0 0 18px rgba(217,119,6,0.07)`,ball:`radial-gradient(circle at 35% 30%, #fcd34d 0%, #d97706 42%, #92400e 76%, #4c2200 100%)`,ballShadow:`0 5px 18px rgba(217,119,6,0.42), inset 0 -4px 8px rgba(0,0,0,0.28)`,ballSize:54,ballFont:19,badgeBg:`rgba(217,119,6,0.78)`,bar:`linear-gradient(90deg, #78350f, #d97706, #fcd34d)`,barGlow:`rgba(217,119,6,0.35)`,countColor:`rgba(251,146,60,0.70)`,pulse:!1},{card:`linear-gradient(148deg, #110804 0%, #1c0c05 100%)`,cardBorder:`rgba(180,83,9,0.12)`,cardShadow:`none`,ball:`radial-gradient(circle at 35% 30%, #fb923c 0%, #c2410c 42%, #7c2d12 76%, #401204 100%)`,ballShadow:`0 4px 14px rgba(194,65,12,0.36), inset 0 -3px 6px rgba(0,0,0,0.26)`,ballSize:46,ballFont:16,badgeBg:`rgba(180,83,9,0.75)`,bar:`linear-gradient(90deg, #7c2d12, #c2410c, #f97316)`,barGlow:`rgba(194,65,12,0.28)`,countColor:`rgba(251,146,60,0.52)`,pulse:!1}],p=`
  /* ── Root card ── */
  .hn-root {
    position: relative;
    background: linear-gradient(155deg, #100806 0%, #1a0e06 45%, #0d0604 100%);
    border: 1px solid rgba(251,146,60,0.16);
    border-radius: 22px;
    overflow: hidden;
  }
  /* Fire edge accent */
  .hn-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(255,69,0,0.65) 22%, rgba(251,191,36,0.90) 50%,
      rgba(255,69,0,0.65) 78%, transparent 95%
    );
  }

  /* ── Ambient glow orbs ── */
  .hn-glow-tr {
    position: absolute; width: 320px; height: 220px;
    top: -80px; right: -70px;
    background: radial-gradient(ellipse, rgba(255,107,53,0.11) 0%, transparent 70%);
    filter: blur(44px); pointer-events: none;
  }
  .hn-glow-bl {
    position: absolute; width: 220px; height: 220px;
    bottom: -70px; left: -50px;
    background: radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%);
    filter: blur(38px); pointer-events: none;
  }

  /* ── Floating ember particles ── */
  .hn-ember {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: hn-ember-rise ease-out infinite;
  }
  .hn-e1 { width:3px;height:3px; left:12%; bottom:15%; background:rgba(255,107,53,0.65); animation-duration:4.2s; animation-delay:0s;   }
  .hn-e2 { width:2px;height:2px; left:28%; bottom:8%;  background:rgba(251,146,60,0.55); animation-duration:3.6s; animation-delay:0.7s; }
  .hn-e3 { width:3px;height:3px; left:46%; bottom:12%; background:rgba(255,69,0,0.60);   animation-duration:4.8s; animation-delay:1.4s; }
  .hn-e4 { width:2px;height:2px; left:63%; bottom:6%;  background:rgba(251,191,36,0.50); animation-duration:3.9s; animation-delay:2.1s; }
  .hn-e5 { width:3px;height:3px; left:78%; bottom:10%; background:rgba(255,107,53,0.58); animation-duration:4.5s; animation-delay:0.3s; }
  .hn-e6 { width:2px;height:2px; left:91%; bottom:4%;  background:rgba(251,146,60,0.48); animation-duration:3.3s; animation-delay:1.9s; }
  @keyframes hn-ember-rise {
    0%   { transform: translateY(0) translateX(0)   scale(1);    opacity: 0.7; }
    50%  { transform: translateY(-55px) translateX(8px) scale(1.3); opacity: 0.9; }
    100% { transform: translateY(-110px) translateX(-4px) scale(0.3); opacity: 0; }
  }

  /* ── Header ── */
  .hn-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; z-index: 10;
  }
  .hn-hdr-l { display: flex; align-items: center; gap: 12px; }
  .hn-icon-box {
    width: 42px; height: 42px; border-radius: 14px;
    background: linear-gradient(135deg, #b45309 0%, #f97316 52%, #fb923c 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(249,115,22,0.52), inset 0 1px 0 rgba(255,255,255,0.18);
    flex-shrink: 0;
  }
  .hn-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #fed7aa 0%, #fb923c 50%, #f97316 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hn-subtitle {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(251,146,60,0.48); margin-top: 1px;
  }
  .hn-top-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.06em;
    background: rgba(249,115,22,0.11);
    border: 1px solid rgba(249,115,22,0.24);
    border-radius: 20px; padding: 5px 13px;
    color: rgba(251,146,60,0.75);
  }

  /* ── Grid ── */
  .hn-grid {
    display: grid; grid-template-columns: repeat(2,1fr); gap: 10px;
    position: relative; z-index: 10; align-items: end;
  }
  @media (min-width: 640px) { .hn-grid { grid-template-columns: repeat(4,1fr); } }

  /* ── Card ── */
  .hn-card {
    position: relative; border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 10px 14px; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .hn-card:hover { transform: translateY(-4px); }

  /* Rank badge top-right corner */
  .hn-rank-badge {
    position: absolute; top: 0; right: 0;
    width: 26px; height: 26px;
    border-radius: 0 18px 0 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: #fff;
  }

  /* Crown rocking on #1 */
  .hn-crown {
    font-size: 20px; line-height: 1;
    filter: drop-shadow(0 0 10px rgba(251,191,36,0.75));
    animation: hn-crown-rock 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes hn-crown-rock {
    0%, 100% { transform: rotate(-6deg) scale(1);   }
    50%       { transform: rotate(6deg) scale(1.05); }
  }

  /* ── Lottery ball ── */
  .hn-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  /* Specular highlight */
  .hn-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  /* Pulse glow on #1 */
  .hn-ball-pulse { animation: hn-pulse-glow 2s ease-in-out infinite; }
  @keyframes hn-pulse-glow {
    0%, 100% { filter: none; }
    50%       { filter: drop-shadow(0 0 14px rgba(255,69,0,0.65)); }
  }

  /* ── Count ── */
  .hn-count-num  { font-size: 15px; font-weight: 900; }
  .hn-count-unit { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; color: rgba(251,146,60,0.32); }

  /* ── Progress bar ── */
  .hn-bar-track {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.05); border-radius: 9999px; overflow: hidden;
  }
  .hn-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ── Footer ── */
  .hn-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 18px; padding-top: 14px;
    border-top: 1px solid rgba(251,146,60,0.09);
    position: relative; z-index: 10;
  }
  .hn-footer-l { font-size: 11px; color: rgba(251,146,60,0.38); font-weight: 600; }
  .hn-footer-r { display: flex; align-items: center; gap: 5px; font-size: 10px; color: rgba(251,146,60,0.30); }
`;function m({timeframe:e}){let{stats:t,loading:n}=c(e);if(n||!t)return null;let{hotNumbers:r}=t,i=r[0]?.count||1;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:p}),(0,d.jsxs)(`div`,{className:`hn-root md:col-span-8 p-6 sm:p-8`,children:[(0,d.jsx)(`div`,{className:`hn-glow-tr`}),(0,d.jsx)(`div`,{className:`hn-glow-bl`}),[1,2,3,4,5,6].map(e=>(0,d.jsx)(`div`,{className:`hn-ember hn-e${e}`},e)),(0,d.jsxs)(`div`,{className:`hn-hdr`,children:[(0,d.jsxs)(`div`,{className:`hn-hdr-l`,children:[(0,d.jsx)(`div`,{className:`hn-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:21,fontVariationSettings:`'FILL' 1`},children:`local_fire_department`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`hn-title`,children:`ເລກເດັ່ນ`}),(0,d.jsx)(`p`,{className:`hn-subtitle`,children:`Hot Numbers`})]})]}),(0,d.jsx)(`span`,{className:`hn-top-badge`,children:`ອອກຫຼາຍທີ່ສຸດ`})]}),(0,d.jsx)(`div`,{className:`hn-grid`,children:r.map(({number:e,count:t},n)=>{let r=f[n]??f[3],a=Math.round(t/i*100),o=n===0;return(0,d.jsxs)(`div`,{className:`hn-card`,style:{background:r.card,border:`1px solid ${r.cardBorder}`,boxShadow:r.cardShadow},children:[(0,d.jsx)(`div`,{className:`hn-rank-badge`,style:{background:r.badgeBg},children:n+1}),o&&(0,d.jsx)(`div`,{className:`hn-crown`,children:`👑`}),(0,d.jsx)(`div`,{className:`hn-ball${r.pulse?` hn-ball-pulse`:``}`,style:{width:r.ballSize,height:r.ballSize,fontSize:r.ballFont,background:r.ball,boxShadow:r.ballShadow},children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:e})}),(0,d.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,d.jsx)(`span`,{className:`hn-count-num`,style:{color:r.countColor},children:t}),(0,d.jsx)(`p`,{className:`hn-count-unit`,children:`ຄັ້ງ`})]}),(0,d.jsx)(`div`,{className:`hn-bar-track`,children:(0,d.jsx)(`div`,{className:`hn-bar-fill`,style:{width:`${a}%`,background:r.bar,boxShadow:`0 0 6px ${r.barGlow}`}})})]},e)})}),(0,d.jsxs)(`div`,{className:`hn-footer`,children:[(0,d.jsxs)(`p`,{className:`hn-footer-l`,children:[`ສູງສຸດ:`,` `,(0,d.jsxs)(`span`,{style:{fontWeight:900,color:`rgba(251,146,60,0.80)`},children:[r[0]?.count,` ຄັ້ງ`]})]}),(0,d.jsxs)(`div`,{className:`hn-footer-r`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:12},children:`info`}),`ຄວາມຖີ່ຈາກ 2 ຕົວສຸດທ້າຍ`]})]})]})]})}var h=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .cn-root {
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* ── Outer card ── */
  .cn-card {
    position: relative;
    background: linear-gradient(160deg, #0A0F20 0%, #080C1A 55%, #050810 100%);
    border: 1px solid rgba(147,197,253,0.12);
    border-radius: 20px;
    padding: 24px 20px 20px;
    overflow: hidden;
  }
  .cn-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(147,197,253,0.5) 50%, transparent 95%);
  }

  /* Frost glow decorations */
  .cn-glow-1 {
    position: absolute;
    width: 220px; height: 220px;
    border-radius: 50%;
    bottom: -70px; left: -70px;
    background: radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%);
    filter: blur(30px);
    pointer-events: none;
  }
  .cn-glow-2 {
    position: absolute;
    width: 160px; height: 160px;
    border-radius: 50%;
    top: -40px; right: -40px;
    background: radial-gradient(circle, rgba(147,197,253,0.06) 0%, transparent 70%);
    filter: blur(24px);
    pointer-events: none;
  }
  /* Frost crystal deco — top right */
  .cn-crystal {
    position: absolute;
    top: 16px; right: 16px;
    opacity: 0.06;
    pointer-events: none;
  }

  /* ── Header ── */
  .cn-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; position: relative; z-index: 1;
  }
  .cn-icon-box {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(96,165,250,0.2) 0%, rgba(59,130,246,0.08) 100%);
    border: 1px solid rgba(147,197,253,0.22);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(96,165,250,0.12);
  }
  .cn-icon-box .mat-icon {
    font-size: 20px !important;
    color: #93c5fd;
    text-shadow: 0 0 10px rgba(147,197,253,0.6);
  }
  .cn-title {
    font-size: 15px; font-weight: 800; color: #E8E6F0; line-height: 1.2;
  }
  .cn-subtitle {
    font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(147,197,253,0.55);
    margin-top: 2px;
  }

  /* ── Divider ── */
  .cn-divider {
    height: 1px; margin-bottom: 16px;
    background: linear-gradient(90deg, transparent, rgba(147,197,253,0.1), transparent);
    position: relative; z-index: 1;
  }

  /* ── Row item ── */
  .cn-item {
    position: relative;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(147,197,253,0.08);
    border-radius: 14px;
    padding: 12px 14px 10px;
    margin-bottom: 8px;
    transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
    overflow: hidden;
  }
  .cn-item:last-child { margin-bottom: 0; }
  .cn-item:hover {
    transform: translateY(-2px);
    border-color: rgba(147,197,253,0.2);
    box-shadow: 0 6px 20px rgba(0,0,0,0.35), 0 0 16px rgba(96,165,250,0.06);
  }
  /* left accent based on intensity */
  .cn-item::before {
    content: '';
    position: absolute; left: 0; top: 15%; bottom: 15%;
    width: 3px; border-radius: 0 3px 3px 0;
  }
  .cn-item-hot::before  { background: linear-gradient(180deg, #60a5fa, #3b82f6); box-shadow: 0 0 8px rgba(96,165,250,0.6); }
  .cn-item-mid::before  { background: linear-gradient(180deg, #7dd3fc, #0ea5e9); box-shadow: 0 0 8px rgba(125,211,252,0.5); }
  .cn-item-mild::before { background: linear-gradient(180deg, #a5f3fc, #22d3ee); box-shadow: 0 0 8px rgba(165,243,252,0.4); }

  /* ── Row content ── */
  .cn-row-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 9px;
  }
  .cn-row-left { display: flex; align-items: center; gap: 10px; }

  /* Number tile */
  .cn-num-tile {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 900; color: #E8F4FF;
    position: relative; overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.12);
  }
  .cn-num-tile::after {
    content: '';
    position: absolute; top: 3px; left: 6px;
    width: 10px; height: 6px;
    background: rgba(255,255,255,0.18);
    border-radius: 50%; transform: rotate(-20deg);
  }
  .cn-num-hot  { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%); border: 1px solid rgba(96,165,250,0.35); }
  .cn-num-mid  { background: linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%); border: 1px solid rgba(125,211,252,0.3); }
  .cn-num-mild { background: linear-gradient(135deg, #164e63 0%, #0891b2 50%, #22d3ee 100%); border: 1px solid rgba(165,243,252,0.25); }

  /* Rank + label */
  .cn-rank {
    font-size: 10px; font-weight: 700;
    color: rgba(212,175,55,0.65);
    letter-spacing: 0.05em;
  }
  .cn-label {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.28);
    margin-top: 1px;
  }

  /* Miss count */
  .cn-missed-val {
    font-size: 22px; font-weight: 900; line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .cn-missed-hot  { color: #93c5fd; text-shadow: 0 0 12px rgba(147,197,253,0.5); }
  .cn-missed-mid  { color: #7dd3fc; text-shadow: 0 0 10px rgba(125,211,252,0.45); }
  .cn-missed-mild { color: #a5f3fc; text-shadow: 0 0 10px rgba(165,243,252,0.4); }
  .cn-missed-unit {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.28); margin-top: 2px;
  }

  /* ── Progress bar ── */
  .cn-bar-track {
    height: 4px; border-radius: 4px; overflow: hidden;
    background: rgba(147,197,253,0.07);
  }
  .cn-bar-fill {
    height: 100%; border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .cn-bar-fill::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0;
    width: 4px; background: rgba(255,255,255,0.6);
    border-radius: 50%; box-shadow: 0 0 6px rgba(147,197,253,0.9);
  }
  .cn-bar-hot  { background: linear-gradient(90deg, #1d4ed8, #60a5fa); }
  .cn-bar-mid  { background: linear-gradient(90deg, #0369a1, #7dd3fc); }
  .cn-bar-mild { background: linear-gradient(90deg, #164e63, #a5f3fc); }

  /* ── Skeleton ── */
  .cn-skeleton-item {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(147,197,253,0.06);
    border-radius: 14px; padding: 12px 14px;
    margin-bottom: 8px;
  }
  .cn-skel {
    border-radius: 5px;
    background: linear-gradient(90deg,
      rgba(147,197,253,0.04) 0%,
      rgba(147,197,253,0.09) 50%,
      rgba(147,197,253,0.04) 100%);
    background-size: 200% 100%;
    animation: cn-shimmer 1.7s ease-in-out infinite;
  }
  @keyframes cn-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Footer note ── */
  .cn-footer {
    display: flex; align-items: flex-start; gap: 6px;
    margin-top: 14px; position: relative; z-index: 1;
    font-size: 10px; font-weight: 500; line-height: 1.6;
    color: rgba(147,197,253,0.4);
  }
  .cn-footer .mat-icon { font-size: 12px !important; margin-top: 1px; flex-shrink: 0; }
`;function g(e){return e>.85?`hot`:e>.5?`mid`:`mild`}function _(){return(0,d.jsxs)(`div`,{className:`cn-skeleton-item`,children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:9},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:[(0,d.jsx)(`div`,{className:`cn-skel`,style:{width:40,height:40,borderRadius:12}}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`cn-skel`,style:{width:48,height:9,marginBottom:5}}),(0,d.jsx)(`div`,{className:`cn-skel`,style:{width:32,height:8}})]})]}),(0,d.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,d.jsx)(`div`,{className:`cn-skel`,style:{width:36,height:20,marginBottom:4}}),(0,d.jsx)(`div`,{className:`cn-skel`,style:{width:20,height:8}})]})]}),(0,d.jsx)(`div`,{className:`cn-skel`,style:{height:4,borderRadius:4}})]})}function v({timeframe:e}){let{stats:t,loading:n}=c(e),r=t?.coldNumbers??[],i=r[0]?.missedRounds||1;return(0,d.jsxs)(`div`,{className:`cn-root cn-card md:col-span-4`,children:[(0,d.jsx)(`style`,{children:h}),(0,d.jsx)(`div`,{className:`cn-glow-1`}),(0,d.jsx)(`div`,{className:`cn-glow-2`}),(0,d.jsxs)(`svg`,{className:`cn-crystal`,width:`96`,height:`96`,viewBox:`0 0 96 96`,fill:`none`,children:[(0,d.jsx)(`line`,{x1:`48`,y1:`4`,x2:`48`,y2:`92`,stroke:`#93c5fd`,strokeWidth:`2`}),(0,d.jsx)(`line`,{x1:`4`,y1:`48`,x2:`92`,y2:`48`,stroke:`#93c5fd`,strokeWidth:`2`}),(0,d.jsx)(`line`,{x1:`16`,y1:`16`,x2:`80`,y2:`80`,stroke:`#93c5fd`,strokeWidth:`1.5`}),(0,d.jsx)(`line`,{x1:`80`,y1:`16`,x2:`16`,y2:`80`,stroke:`#93c5fd`,strokeWidth:`1.5`}),(0,d.jsx)(`circle`,{cx:`48`,cy:`48`,r:`8`,stroke:`#93c5fd`,strokeWidth:`1.5`}),[0,60,120,180,240,300].map((e,t)=>(0,d.jsx)(`circle`,{cx:48+26*Math.cos((e-90)*Math.PI/180),cy:48+26*Math.sin((e-90)*Math.PI/180),r:`3`,stroke:`#93c5fd`,strokeWidth:`1`},t))]}),(0,d.jsxs)(`div`,{className:`cn-header`,children:[(0,d.jsx)(`div`,{className:`cn-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`ac_unit`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`cn-title`,children:`ເລກດັບ`}),(0,d.jsx)(`div`,{className:`cn-subtitle`,children:`Cold Numbers`})]})]}),(0,d.jsx)(`div`,{className:`cn-divider`}),(0,d.jsx)(`div`,{style:{position:`relative`,zIndex:1},children:n||!t?Array.from({length:5}).map((e,t)=>(0,d.jsx)(_,{},t)):r.map(({number:e,missedRounds:t},n)=>{let r=t/i,a=g(r),o=Math.round(r*100);return(0,d.jsxs)(`div`,{className:`cn-item cn-item-${a}`,children:[(0,d.jsxs)(`div`,{className:`cn-row-top`,children:[(0,d.jsxs)(`div`,{className:`cn-row-left`,children:[(0,d.jsx)(`div`,{className:`cn-num-tile cn-num-${a}`,children:e}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`cn-rank`,children:[`ອັນດັບ `,n+1]}),(0,d.jsx)(`div`,{className:`cn-label`,children:`ບໍ່ອອກ`})]})]}),(0,d.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,d.jsx)(`div`,{className:`cn-missed-val cn-missed-${a}`,children:t}),(0,d.jsx)(`div`,{className:`cn-missed-unit`,children:`ງວດ`})]})]}),(0,d.jsx)(`div`,{className:`cn-bar-track`,children:(0,d.jsx)(`div`,{className:`cn-bar-fill cn-bar-${a}`,style:{width:`${o}%`}})})]},e)})}),(0,d.jsxs)(`p`,{className:`cn-footer`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,children:`info`}),`ຕົວເລກທີ່ຍາວນານທີ່ສຸດທີ່ຍັງບໍ່ໄດ້ອອກໃນ 2 ຕົວສຸດທ້າຍ`]})]})}var y=[{neon:`#a78bfa`,deep:`#3b0764`,glow:`rgba(167,139,250,0.50)`},{neon:`#60a5fa`,deep:`#1e3a8a`,glow:`rgba(96,165,250,0.50)`},{neon:`#22d3ee`,deep:`#164e63`,glow:`rgba(34,211,238,0.50)`},{neon:`#2dd4bf`,deep:`#134e4a`,glow:`rgba(45,212,191,0.50)`},{neon:`#4ade80`,deep:`#14532d`,glow:`rgba(74,222,128,0.50)`},{neon:`#a3e635`,deep:`#365314`,glow:`rgba(163,230,53,0.50)`},{neon:`#facc15`,deep:`#713f12`,glow:`rgba(250,204,21,0.50)`},{neon:`#fb923c`,deep:`#7c2d12`,glow:`rgba(251,146,60,0.50)`},{neon:`#f87171`,deep:`#7f1d1d`,glow:`rgba(248,113,113,0.50)`},{neon:`#ef4444`,deep:`#450a0a`,glow:`rgba(239,68,68,0.50)`}],b=`
  .dd-root { /* no card — sits inside parent card */ }

  /* ── Header ── */
  .dd-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 18px;
  }
  .dd-icon-box {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 18px rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .dd-title {
    font-size: 15px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(
      90deg,
      #a78bfa 0%, #60a5fa 18%, #22d3ee 36%,
      #4ade80 54%, #facc15 72%, #f87171 90%
    );
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .dd-sub {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(167,139,250,0.45); margin-top: 2px;
  }

  /* ── Chart container ── */
  .dd-chart-wrap {
    position: relative;
    background: #080c18;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 16px;
    overflow: hidden;
    /* top padding: room for crown + pct labels above tallest bar */
    padding: 38px 12px 0;
  }

  /* ── Bars row ── */
  .dd-bars-row {
    height: 168px;
    display: flex;
    align-items: stretch;
    gap: 4px;
    position: relative;
  }

  /* Grid lines overlay inside bars-row */
  .dd-grid-overlay {
    position: absolute; inset: 0;
    pointer-events: none; z-index: 0;
  }
  .dd-gridline {
    position: absolute; left: 0; right: 0; height: 1px;
    background: rgba(255,255,255,0.042);
  }

  /* ── Each digit column ── */
  .dd-col {
    flex: 1;
    position: relative;
    z-index: 1;
    cursor: default;
  }
  .dd-col:hover .dd-bar     { filter: brightness(1.28); }
  .dd-col:hover .dd-pct     { opacity: 1 !important; }
  .dd-col:hover .dd-bar-glow { opacity: 1 !important; }

  /* Crown ✦ on tallest */
  .dd-crown {
    position: absolute; left: 0; right: 0;
    text-align: center; font-size: 11px;
    z-index: 4; pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(250,204,21,0.75));
    animation: dd-crown-pulse 2s ease-in-out infinite;
  }
  @keyframes dd-crown-pulse {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(1.3); }
  }

  /* Percent label above bar */
  .dd-pct {
    position: absolute; left: 0; right: 0;
    text-align: center;
    font-size: 8px; font-weight: 900; line-height: 1;
    opacity: 0.72;
    transition: opacity 0.2s;
    z-index: 3; white-space: nowrap;
  }

  /* Bar */
  .dd-bar {
    position: absolute;
    bottom: 0; left: 9%; right: 9%;
    border-radius: 5px 5px 0 0;
    min-height: 3px;
    transform-origin: bottom center;
    animation: dd-grow 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    overflow: hidden;
    transition: filter 0.2s;
    z-index: 2;
  }
  @keyframes dd-grow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }

  /* Glossy vertical sheen inside bar */
  .dd-sheen {
    position: absolute; top: 0; left: 0; width: 38%; bottom: 0;
    background: linear-gradient(to right, rgba(255,255,255,0.20), transparent);
    pointer-events: none;
  }
  /* Top-cap horizontal shimmer */
  .dd-cap {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: rgba(255,255,255,0.35);
    border-radius: 5px 5px 0 0;
  }

  /* Glow halo cast below bar on floor */
  .dd-bar-glow {
    position: absolute;
    bottom: 0; left: 9%; right: 9%; height: 8px;
    border-radius: 50%;
    opacity: 0.5;
    filter: blur(6px);
    transition: opacity 0.2s;
    z-index: 1;
  }

  /* ── Bottom labels + spectrum strip ── */
  .dd-bottom {
    background: #080c18;
    padding: 0 0 0;
  }
  .dd-digits-row {
    display: flex; gap: 4px;
    padding: 7px 12px 0;
  }
  .dd-digit {
    flex: 1; text-align: center;
    font-size: 12px; font-weight: 900;
  }

  /* Spectrum gradient strip at very bottom */
  .dd-spectrum {
    height: 4px; margin-top: 8px;
    background: linear-gradient(90deg,
      #a78bfa, #60a5fa, #22d3ee, #2dd4bf,
      #4ade80, #a3e635, #facc15, #fb923c, #f87171, #ef4444
    );
  }
`,x=[20,40,60,80];function S({timeframe:e}){let{stats:t,loading:n}=c(e);if(n||!t)return null;let{digitDistributions:r}=t,i=r.reduce((e,t,n,r)=>t.barWidth>r[e].barWidth?n:e,0);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:b}),(0,d.jsxs)(`div`,{className:`dd-root`,children:[(0,d.jsxs)(`div`,{className:`dd-header`,children:[(0,d.jsx)(`div`,{className:`dd-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:18,color:`#fff`,fontVariationSettings:`'FILL' 1`},children:`bar_chart`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h3`,{className:`dd-title`,children:`ການກະຈາຍຕົວເລກ 0–9`}),(0,d.jsx)(`p`,{className:`dd-sub`,children:`Digit Frequency Spectrum`})]})]}),(0,d.jsxs)(`div`,{className:`dd-chart-wrap`,children:[(0,d.jsxs)(`div`,{className:`dd-bars-row`,children:[(0,d.jsx)(`div`,{className:`dd-grid-overlay`,children:x.map(e=>(0,d.jsx)(`div`,{className:`dd-gridline`,style:{bottom:`${e}%`}},e))}),r.map(({digit:e,percent:t,barWidth:n},r)=>{let a=y[r]??y[9];return(0,d.jsxs)(`div`,{className:`dd-col`,children:[r===i&&(0,d.jsx)(`div`,{className:`dd-crown`,style:{bottom:`calc(${n}% + 20px)`,color:`#facc15`},children:`✦`}),(0,d.jsxs)(`div`,{className:`dd-pct`,style:{bottom:`calc(${n}% + 3px)`,color:a.neon},children:[t,`%`]}),(0,d.jsx)(`div`,{className:`dd-bar-glow`,style:{background:a.glow}}),(0,d.jsxs)(`div`,{className:`dd-bar`,style:{height:`${n}%`,background:`linear-gradient(to top, ${a.deep} 0%, ${a.neon} 100%)`,boxShadow:`0 0 14px ${a.glow}, 0 -6px 20px ${a.glow}`,animationDelay:`${r*.07}s`},children:[(0,d.jsx)(`div`,{className:`dd-sheen`}),(0,d.jsx)(`div`,{className:`dd-cap`})]})]},e)})]}),(0,d.jsxs)(`div`,{className:`dd-bottom`,children:[(0,d.jsx)(`div`,{className:`dd-digits-row`,children:r.map(({digit:e},t)=>(0,d.jsx)(`div`,{className:`dd-digit`,style:{color:(y[t]??y[9]).neon},children:e},e))}),(0,d.jsx)(`div`,{className:`dd-spectrum`})]})]})]})]})}var C=[{neon:`#a78bfa`,deep:`#3b0764`,glow:`rgba(167,139,250,0.55)`},{neon:`#60a5fa`,deep:`#1e3a8a`,glow:`rgba(96,165,250,0.55)`},{neon:`#22d3ee`,deep:`#164e63`,glow:`rgba(34,211,238,0.55)`},{neon:`#2dd4bf`,deep:`#134e4a`,glow:`rgba(45,212,191,0.55)`},{neon:`#4ade80`,deep:`#14532d`,glow:`rgba(74,222,128,0.55)`},{neon:`#a3e635`,deep:`#365314`,glow:`rgba(163,230,53,0.55)`},{neon:`#facc15`,deep:`#713f12`,glow:`rgba(250,204,21,0.55)`},{neon:`#fb923c`,deep:`#7c2d12`,glow:`rgba(251,146,60,0.55)`},{neon:`#f87171`,deep:`#7f1d1d`,glow:`rgba(248,113,113,0.55)`},{neon:`#ef4444`,deep:`#450a0a`,glow:`rgba(239,68,68,0.55)`}],w=`
  /* ── Root ── */
  .hv-root {
    position: relative;
    background: linear-gradient(158deg, #070a18 0%, #090c1f 52%, #060811 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .hv-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.009) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.009) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .hv-orb {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    top: -120px; right: -80px; pointer-events: none;
    background: radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 68%);
  }

  /* ── Header ── */
  .hv-hdr {
    display: flex; align-items: center; gap: 13px;
    margin-bottom: 22px; position: relative; z-index: 10;
  }
  .hv-icon-box {
    width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg,
      #a78bfa 0%, #60a5fa 18%, #22d3ee 36%,
      #4ade80 54%, #facc15 72%, #ef4444 100%
    );
    box-shadow: 0 0 22px rgba(167,139,250,0.40), inset 0 1px 0 rgba(255,255,255,0.22);
  }
  .hv-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .hv-sub { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* ── Spectrum strip (top decoration) ── */
  .hv-strip {
    height: 3px; border-radius: 9999px; margin-bottom: 20px;
    background: linear-gradient(90deg,
      #a78bfa, #60a5fa, #22d3ee, #2dd4bf,
      #4ade80, #a3e635, #facc15, #fb923c, #f87171, #ef4444
    );
    position: relative; z-index: 10;
  }

  /* ── Row ── */
  .hv-rows { display: flex; flex-direction: column; gap: 9px; position: relative; z-index: 10; }
  .hv-row  { display: flex; align-items: center; gap: 11px; }

  /* Mini lottery ball */
  .hv-ball {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 13px; color: #fff;
    position: relative; overflow: hidden;
  }
  .hv-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 35%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* Bar track */
  .hv-track {
    flex: 1; height: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 9999px; overflow: hidden;
    position: relative;
  }
  /* Bar fill */
  .hv-fill {
    height: 100%; border-radius: 9999px;
    transform-origin: left center;
    animation: hv-grow 0.85s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative; overflow: hidden;
  }
  .hv-fill::after {
    content: '';
    position: absolute; top: 0; left: 0; width: 35%; height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0.25), transparent);
    border-radius: 9999px;
  }
  @keyframes hv-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* Top crown pulse on tallest bar */
  .hv-crown {
    position: absolute; right: 5px; top: 50%; transform: translateY(-50%);
    font-size: 10px; line-height: 1; pointer-events: none;
    filter: drop-shadow(0 0 5px rgba(250,204,21,0.85));
    animation: hv-crown-pulse 2s ease-in-out infinite;
    z-index: 2;
  }
  @keyframes hv-crown-pulse {
    0%, 100% { opacity: 1;   transform: translateY(-50%) scale(1);   }
    50%       { opacity: 0.6; transform: translateY(-50%) scale(1.30); }
  }

  /* Pct + count labels */
  .hv-pct-col { min-width: 50px; text-align: right; }
  .hv-pct     { font-size: 13px; font-weight: 900; line-height: 1; }
  .hv-cnt     { font-size: 9px; color: rgba(255,255,255,0.22); margin-top: 2px; font-weight: 600; }

  /* ── Footer ── */
  .hv-footer {
    margin-top: 18px; display: flex; align-items: center; gap: 6px;
    position: relative; z-index: 10;
    padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.055);
  }
  .hv-footer-txt { font-size: 11px; color: rgba(255,255,255,0.22); font-weight: 600; }
`;function T({timeframe:e}){let{stats:t,loading:n}=c(e);if(n||!t)return null;let r=t.digitDistributions.map(e=>({name:e.digit.toString(),percent:e.percent,count:e.count})).sort((e,t)=>parseInt(e.name)-parseInt(t.name)),i=Math.max(...r.map(e=>e.percent));return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:w}),(0,d.jsxs)(`div`,{className:`hv-root p-6 sm:p-8`,children:[(0,d.jsx)(`div`,{className:`hv-mesh`}),(0,d.jsx)(`div`,{className:`hv-orb`}),(0,d.jsxs)(`div`,{className:`hv-hdr`,children:[(0,d.jsx)(`div`,{className:`hv-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:20,fontVariationSettings:`'FILL' 1`},children:`bar_chart`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h3`,{className:`hv-title`,children:`ອັດຕາສ່ວນຕົວເລກ (Digit Chart)`}),(0,d.jsx)(`p`,{className:`hv-sub`,children:`ຄວາມຖີ່ຂອງຕົວເລກ 0–9 ທີ່ອອກໃນລາງວັນ`})]})]}),(0,d.jsx)(`div`,{className:`hv-strip`}),(0,d.jsx)(`div`,{className:`hv-rows`,children:r.map(({name:e,percent:t,count:n},r)=>{let a=C[parseInt(e)]??C[9],o=t===i,s=i>0?Math.round(t/i*100):0;return(0,d.jsxs)(`div`,{className:`hv-row`,children:[(0,d.jsx)(`div`,{className:`hv-ball`,style:{background:`radial-gradient(circle at 35% 30%, ${a.neon}ee 0%, ${a.neon}88 42%, ${a.deep} 100%)`,boxShadow:`0 3px 10px ${a.glow}, inset 0 -2px 4px rgba(0,0,0,0.25)`},children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:e})}),(0,d.jsx)(`div`,{className:`hv-track`,children:(0,d.jsx)(`div`,{className:`hv-fill`,style:{width:`${s}%`,background:`linear-gradient(to right, ${a.deep}, ${a.neon})`,boxShadow:`0 0 10px ${a.glow}`,animationDelay:`${r*.06}s`},children:o&&(0,d.jsx)(`div`,{className:`hv-crown`,children:`✦`})})}),(0,d.jsxs)(`div`,{className:`hv-pct-col`,children:[(0,d.jsxs)(`div`,{className:`hv-pct`,style:{color:a.neon},children:[t,`%`]}),(0,d.jsxs)(`div`,{className:`hv-cnt`,children:[n,` ຄັ້ງ`]})]})]},e)})}),(0,d.jsxs)(`div`,{className:`hv-footer`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:12,color:`rgba(255,255,255,0.20)`,flexShrink:0},children:`info`}),(0,d.jsx)(`span`,{className:`hv-footer-txt`,children:`ສະແດງຄວາມຖີ່ຂອງຕົວເລກ 0–9 ທີ່ອອກໃນລາງວັນ`})]})]})]})}var E=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .ac-card {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    position: relative;
    background: linear-gradient(160deg, #0F1424 0%, #0C1020 60%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.12);
    border-radius: 18px;
    padding: 22px 18px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: default;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    overflow: hidden;
  }
  .ac-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.22s;
  }
  .ac-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.2), 0 0 30px rgba(212,175,55,0.06);
    border-color: rgba(212,175,55,0.28);
  }
  .ac-card:hover::before {
    opacity: 1;
  }

  /* Corner ornament */
  .ac-card::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 60px; height: 60px;
    background: radial-gradient(circle at bottom right, rgba(212,175,55,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Image medallion */
  .ac-medallion {
    position: relative;
    width: 82px;
    height: 82px;
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .ac-medallion-ring {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #D4AF37 0deg,
      #FFD54F 60deg,
      #B8860B 120deg,
      #D4AF37 180deg,
      #FFD54F 240deg,
      #B8860B 300deg,
      #D4AF37 360deg
    );
    animation: ac-ring-spin 8s linear infinite;
    opacity: 0.7;
  }
  .ac-card:hover .ac-medallion-ring {
    opacity: 1;
    animation-duration: 4s;
  }
  @keyframes ac-ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .ac-medallion-inner {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: #0C1020;
    overflow: hidden;
    z-index: 1;
  }
  .ac-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 2;
    transition: opacity 0.2s;
  }
  .ac-icon-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    font-size: 32px !important;
    color: rgba(212,175,55,0.45);
  }

  /* Animal name */
  .ac-name {
    font-size: 14.5px;
    font-weight: 700;
    color: #E8E6F0;
    margin-bottom: 8px;
    line-height: 1.3;
    letter-spacing: 0.01em;
  }

  /* Number badge row */
  .ac-numbers-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
    margin-bottom: 14px;
  }
  .ac-num-ball {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 60%, #8B6914 100%);
    box-shadow: 0 2px 8px rgba(212,175,55,0.3), inset 0 1px 2px rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #0C1020;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .ac-num-ball::after {
    content: '';
    position: absolute;
    top: 3px; left: 5px;
    width: 7px; height: 4px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    transform: rotate(-25deg);
  }
  .ac-card:hover .ac-num-ball {
    transform: scale(1.08);
    box-shadow: 0 3px 12px rgba(212,175,55,0.45), inset 0 1px 2px rgba(255,255,255,0.3);
  }

  /* Frequency bar */
  .ac-freq-wrap {
    width: 100%;
    margin-top: auto;
  }
  .ac-freq-track {
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .ac-freq-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #B8860B 0%, #D4AF37 50%, #FFD54F 100%);
    box-shadow: 0 0 8px rgba(212,175,55,0.4);
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .ac-freq-fill::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 4px;
    background: #FFE082;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(255,224,130,0.8);
  }
  .ac-freq-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ac-freq-text {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.5);
  }
  .ac-freq-pct {
    font-size: 11px;
    font-weight: 700;
    color: #D4AF37;
    font-variant-numeric: tabular-nums;
  }
`;function ee(e){return e?String(e).split(/[,\s\/]+/).map(e=>e.trim()).filter(Boolean):[]}function te({icon:e,name:t,numbers:n,frequencyPercent:r,image_url:i}){let a=ee(n);return(0,d.jsxs)(`div`,{className:`ac-card`,children:[(0,d.jsx)(`style`,{children:E}),(0,d.jsxs)(`div`,{className:`ac-medallion`,children:[(0,d.jsx)(`div`,{className:`ac-medallion-ring`}),(0,d.jsxs)(`div`,{className:`ac-medallion-inner`,children:[(0,d.jsx)(`img`,{src:i,alt:`ນາມສັດ ${t}`,className:`ac-img`,onError:e=>{e.target.style.opacity=`0`}}),(0,d.jsx)(`span`,{className:`material-symbols-outlined ac-icon-fallback`,style:{fontVariationSettings:`'FILL' 1`},children:e||`pets`})]})]}),(0,d.jsx)(`h4`,{className:`ac-name`,children:t}),(0,d.jsx)(`div`,{className:`ac-numbers-row`,children:a.length>0?a.map(e=>(0,d.jsx)(`div`,{className:`ac-num-ball`,children:e},e)):(0,d.jsx)(`div`,{className:`ac-num-ball`,children:n})}),(0,d.jsxs)(`div`,{className:`ac-freq-wrap`,children:[(0,d.jsx)(`div`,{className:`ac-freq-track`,children:(0,d.jsx)(`div`,{className:`ac-freq-fill`,style:{width:`${r??0}%`}})}),(0,d.jsxs)(`div`,{className:`ac-freq-label`,children:[(0,d.jsx)(`span`,{className:`ac-freq-text`,children:`ຄວາມຖີ່`}),(0,d.jsxs)(`span`,{className:`ac-freq-pct`,children:[r??0,`%`]})]})]})]})}var D=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .as-root {
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* ── Section ── */
  .as-section {
    position: relative;
    background: linear-gradient(160deg, #0F1424 0%, #0C1020 55%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.13);
    border-radius: 24px;
    padding: 36px 28px 32px;
    overflow: hidden;
  }
  .as-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.6) 50%, transparent 95%);
  }

  /* Decorative background — lottery orbs */
  .as-deco {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .as-deco-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
  }
  .as-deco-orb-1 {
    width: 320px; height: 320px;
    right: -80px; top: -80px;
    background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%);
  }
  .as-deco-orb-2 {
    width: 260px; height: 260px;
    left: -60px; bottom: -60px;
    background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
  }
  /* Scattered decorative mini-balls */
  .as-deco-balls {
    position: absolute;
    inset: 0;
  }
  .as-deco-ball {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(184,134,11,0.06) 100%);
    border: 1px solid rgba(212,175,55,0.08);
  }

  /* ── Header ── */
  .as-header {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 768px) {
    .as-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  }
  .as-header-left {}
  .as-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.7);
    margin-bottom: 8px;
  }
  .as-label-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #D4AF37;
    box-shadow: 0 0 6px rgba(212,175,55,0.7);
    animation: as-dot-pulse 2.4s ease-in-out infinite;
  }
  @keyframes as-dot-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }
  .as-title {
    font-size: clamp(22px, 3.5vw, 32px);
    font-weight: 900;
    color: #E8E6F0;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .as-title span {
    background: linear-gradient(90deg, #D4AF37, #FFD54F, #B8860B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .as-header-right {
    max-width: 340px;
  }
  .as-desc {
    font-size: 13px;
    line-height: 1.75;
    color: rgba(232,230,240,0.45);
  }
  /* Count badge */
  .as-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 5px 10px;
    border-radius: 20px;
    background: rgba(212,175,55,0.07);
    border: 1px solid rgba(212,175,55,0.16);
    font-size: 11px;
    font-weight: 600;
    color: rgba(212,175,55,0.65);
  }
  .as-count-badge .mat-icon { font-size: 13px !important; }

  /* ── Divider ── */
  .as-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent);
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  /* ── Grid ── */
  .as-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 640px)  { .as-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px)  { .as-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1200px) { .as-grid { grid-template-columns: repeat(4, 1fr); } }

  /* Stagger reveal for cards */
  .as-card-wrap {
    animation: as-card-in 0.35s ease both;
  }
  @keyframes as-card-in {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Toggle button ── */
  .as-toggle-wrap {
    display: flex;
    justify-content: center;
    margin-top: 28px;
    position: relative;
    z-index: 1;
  }
  .as-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 40px;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #D4AF37;
    background: rgba(212,175,55,0.07);
    border: 1px solid rgba(212,175,55,0.22);
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.02em;
  }
  .as-toggle-btn:hover {
    background: rgba(212,175,55,0.14);
    border-color: rgba(212,175,55,0.38);
    box-shadow: 0 0 20px rgba(212,175,55,0.12);
    transform: translateY(-1px);
  }
  .as-toggle-btn .mat-icon {
    font-size: 18px !important;
    transition: transform 0.25s ease;
  }
  .as-toggle-btn.expanded .mat-icon {
    transform: rotate(180deg);
  }
  /* Separator line before toggle */
  .as-toggle-line {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 28px;
    position: relative;
    z-index: 1;
  }
  .as-toggle-line::before,
  .as-toggle-line::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.12));
  }
  .as-toggle-line::after {
    background: linear-gradient(90deg, rgba(212,175,55,0.12), transparent);
  }

  /* ── Loading skeletons ── */
  .as-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 640px)  { .as-skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px)  { .as-skeleton-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1200px) { .as-skeleton-grid { grid-template-columns: repeat(4, 1fr); } }
  .as-skeleton {
    background: linear-gradient(160deg, #141828 0%, #0E1220 100%);
    border: 1px solid rgba(212,175,55,0.08);
    border-radius: 18px;
    padding: 22px 18px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .as-skel-circle {
    width: 68px; height: 68px;
    border-radius: 50%;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: as-shimmer 1.6s ease-in-out infinite;
  }
  .as-skel-line {
    height: 10px;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: as-shimmer 1.6s ease-in-out infinite;
  }
  @keyframes as-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;function O({delay:e=0}){return(0,d.jsxs)(`div`,{className:`as-skeleton`,style:{animationDelay:`${e}ms`},children:[(0,d.jsx)(`div`,{className:`as-skel-circle`}),(0,d.jsx)(`div`,{className:`as-skel-line`,style:{width:`60%`,animationDelay:`${e+80}ms`}}),(0,d.jsx)(`div`,{className:`as-skel-line`,style:{width:`40%`,animationDelay:`${e+160}ms`}}),(0,d.jsx)(`div`,{className:`as-skel-line`,style:{width:`80%`,height:6,marginTop:4,animationDelay:`${e+240}ms`}})]})}function k({timeframe:e}){let[t,n]=(0,u.useState)(!1),{stats:r,loading:i}=c(e),a=r?.animalStats??[],o=t?a.length:Math.min(8,a.length),s=a.slice(0,o),l=a.length>8;return(0,d.jsxs)(`section`,{className:`as-root as-section`,children:[(0,d.jsx)(`style`,{children:D}),(0,d.jsxs)(`div`,{className:`as-deco`,children:[(0,d.jsx)(`div`,{className:`as-deco-orb as-deco-orb-1`}),(0,d.jsx)(`div`,{className:`as-deco-orb as-deco-orb-2`}),(0,d.jsx)(`div`,{className:`as-deco-balls`,children:[{w:48,top:`12%`,right:`8%`,opacity:.6},{w:32,top:`28%`,right:`15%`,opacity:.4},{w:56,top:`60%`,right:`4%`,opacity:.3},{w:24,bottom:`18%`,left:`6%`,opacity:.5},{w:38,top:`45%`,left:`2%`,opacity:.35}].map((e,t)=>(0,d.jsx)(`div`,{className:`as-deco-ball`,style:{width:e.w,height:e.w,top:e.top,bottom:e.bottom,left:e.left,right:e.right,opacity:e.opacity}},t))})]}),(0,d.jsxs)(`div`,{className:`as-header`,children:[(0,d.jsxs)(`div`,{className:`as-header-left`,children:[(0,d.jsxs)(`div`,{className:`as-label`,children:[(0,d.jsx)(`span`,{className:`as-label-dot`}),`Premium Analysis`]}),(0,d.jsxs)(`h2`,{className:`as-title`,children:[`ສະຖິຕິ`,(0,d.jsx)(`span`,{children:`ນາມສັດ`})]}),!i&&a.length>0&&(0,d.jsxs)(`div`,{className:`as-count-badge`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`casino`}),`ສະແດງ `,o,` / ທັງໝົດ `,a.length,` ຊະນິດ`]})]}),(0,d.jsx)(`div`,{className:`as-header-right`,children:(0,d.jsx)(`p`,{className:`as-desc`,children:`ການວິເຄາະຄວາມຖີ່ຂອງນາມສັດທີ່ປະກົດຂຶ້ນ ໃນຜົນການອອກລາງວັນ ໂດຍແບ່ງຕາມໝວດໝູ່ສັດມຸງຄຸນ`})})]}),(0,d.jsx)(`div`,{className:`as-divider`}),i?(0,d.jsx)(`div`,{className:`as-skeleton-grid`,children:Array.from({length:8}).map((e,t)=>(0,d.jsx)(O,{delay:t*60},t))}):(0,d.jsx)(`div`,{className:`as-grid`,children:s.map((e,t)=>(0,d.jsx)(`div`,{className:`as-card-wrap`,style:{animationDelay:`${t*45}ms`},children:(0,d.jsx)(te,{...e})},e.name))}),!i&&l&&(0,d.jsx)(`div`,{className:`as-toggle-line`,children:(0,d.jsxs)(`button`,{className:`as-toggle-btn${t?` expanded`:``}`,onClick:()=>n(e=>!e),children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,children:t?`expand_less`:`grid_view`}),t?`ຫຍໍ້ລາຍການ`:`ເບິ່ງທັງໝົດ ${a.length} ຊະນິດ`,(0,d.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,children:`expand_more`})]})})]})}var A=`
  /* ── Root card ── */
  .cf-root {
    position: relative;
    background: linear-gradient(165deg, #080c18 0%, #0a0f1e 40%, #0d1225 100%);
    border: 1px solid rgba(251,191,36,0.12);
    border-radius: 28px;
    overflow: hidden;
  }

  /* Mesh grid overlay */
  .cf-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(251,191,36,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(251,191,36,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* Ambient top glow */
  .cf-top-glow {
    position: absolute;
    width: 600px; height: 280px;
    top: -100px; left: 50%; transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(251,191,36,0.09) 0%, transparent 70%);
    filter: blur(48px);
    pointer-events: none;
  }
  .cf-side-glow-l {
    position: absolute; width: 200px; height: 400px;
    bottom: 0; left: -60px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%);
    filter: blur(40px); pointer-events: none;
  }
  .cf-side-glow-r {
    position: absolute; width: 200px; height: 400px;
    top: 30%; right: -60px;
    background: radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%);
    filter: blur(40px); pointer-events: none;
  }

  /* Animated ticker tape stripe */
  .cf-tape {
    height: 4px;
    background: repeating-linear-gradient(
      90deg,
      #f59e0b 0px, #f59e0b 18px, transparent 18px, transparent 24px,
      #7c3aed 24px, #7c3aed 36px, transparent 36px, transparent 42px,
      #ef4444 42px, #ef4444 54px, transparent 54px, transparent 60px,
      #10b981 60px, #10b981 72px, transparent 72px, transparent 78px
    );
    animation: cf-tape-scroll 6s linear infinite;
  }
  @keyframes cf-tape-scroll {
    from { background-position: 0 0; }
    to   { background-position: 78px 0; }
  }

  /* ── Header text ── */
  .cf-top40-text {
    font-size: clamp(52px, 9vw, 88px);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1;
    background: linear-gradient(135deg, #ffe566 0%, #f59e0b 28%, #fff7e6 50%, #f59e0b 72%, #c26b00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 40px rgba(251,191,36,0.18));
  }

  .cf-section-label {
    font-size: 10px; font-weight: 900;
    letter-spacing: 0.2em; text-transform: uppercase;
  }

  /* ── Ticket stub filter tabs ── */
  .cf-tickets-wrap {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .cf-ticket {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(251,191,36,0.14);
    border-radius: 10px;
    padding: 9px 22px;
    font-size: 12px; font-weight: 900; letter-spacing: 0.06em;
    color: rgba(251,191,36,0.45);
    cursor: pointer;
    transition: all 0.2s;
  }
  /* Punch holes on each side */
  .cf-ticket::before {
    content: '';
    position: absolute;
    top: 50%; left: -8px; transform: translateY(-50%);
    width: 16px; height: 16px; border-radius: 50%;
    background: #080c18;
    border: 1px solid rgba(251,191,36,0.12);
    z-index: 1;
  }
  .cf-ticket::after {
    content: '';
    position: absolute;
    top: 50%; right: -8px; transform: translateY(-50%);
    width: 16px; height: 16px; border-radius: 50%;
    background: #080c18;
    border: 1px solid rgba(251,191,36,0.12);
    z-index: 1;
  }
  .cf-ticket.cf-active {
    background: linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(251,191,36,0.10) 100%);
    border-color: rgba(251,191,36,0.55);
    color: #fbbf24;
    box-shadow: 0 0 24px rgba(251,191,36,0.14), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .cf-ticket:hover:not(.cf-active) {
    background: rgba(251,191,36,0.06);
    border-color: rgba(251,191,36,0.28);
    color: rgba(251,191,36,0.75);
  }

  /* ── Lottery Ball base ── */
  .cf-ball {
    position: relative;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; flex-shrink: 0;
    overflow: hidden;
    cursor: default;
  }
  /* Primary specular highlight */
  .cf-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.58) 0%, transparent 70%);
    border-radius: 50%;
  }
  /* Secondary soft reflection */
  .cf-ball::before {
    content: '';
    position: absolute;
    bottom: 8%; right: 10%; width: 28%; height: 20%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* ── XL balls (top 3) ── */
  .cf-ball-xl { width: 90px; height: 90px; font-size: 34px; }

  .cf-ball-gold {
    background: radial-gradient(circle at 38% 30%, #ffe566 0%, #f59e0b 38%, #b45309 68%, #7c3309 100%);
    color: #5c2200;
    box-shadow: 0 10px 40px rgba(251,191,36,0.45), inset 0 -6px 14px rgba(0,0,0,0.28);
  }
  .cf-ball-silver {
    background: radial-gradient(circle at 38% 30%, #f4f4f4 0%, #b0b0b0 42%, #686868 72%, #363636 100%);
    color: #1e1e1e;
    box-shadow: 0 8px 32px rgba(160,160,160,0.32), inset 0 -6px 14px rgba(0,0,0,0.28);
  }
  .cf-ball-bronze {
    background: radial-gradient(circle at 38% 30%, #f5a96e 0%, #cd7f32 42%, #8b4400 72%, #5c2a00 100%);
    color: #3c1800;
    box-shadow: 0 8px 32px rgba(205,127,50,0.38), inset 0 -6px 14px rgba(0,0,0,0.28);
  }

  /* Float animations */
  .cf-float  { animation: cf-float-anim 3.2s ease-in-out infinite; }
  .cf-float2 { animation: cf-float-anim 3.2s ease-in-out 0.55s infinite; }
  .cf-float3 { animation: cf-float-anim 3.2s ease-in-out 1.1s infinite; }
  @keyframes cf-float-anim {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-9px); }
  }

  /* Glow rings pulse */
  .cf-ring {
    position: absolute; border-radius: 50%;
    pointer-events: none;
    animation: cf-ring-pulse 2.6s ease-out infinite;
  }
  .cf-ring-2 { animation-delay: 0.9s; }
  @keyframes cf-ring-pulse {
    0%   { transform: scale(1);   opacity: 0.55; }
    100% { transform: scale(1.65); opacity: 0; }
  }

  /* Crown wobble */
  .cf-crown {
    position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
    font-size: 22px;
    filter: drop-shadow(0 2px 10px rgba(251,191,36,0.55));
    animation: cf-crown-rock 2.4s ease-in-out infinite;
  }
  @keyframes cf-crown-rock {
    0%, 100% { transform: translateX(-50%) rotate(-6deg); }
    50%       { transform: translateX(-50%) rotate(6deg); }
  }
  .cf-medal {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    font-size: 18px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
  }

  /* Podium card */
  .cf-podium-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; position: relative;
    padding: 28px 12px 14px;
    background: rgba(255,255,255,0.02);
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.04);
    transition: all 0.2s;
  }
  .cf-podium-card:hover { background: rgba(255,255,255,0.04); transform: translateY(-2px); }
  .cf-podium-card-gold   { border-color: rgba(251,191,36,0.14); }
  .cf-podium-card-silver { border-color: rgba(180,180,180,0.10); }
  .cf-podium-card-bronze { border-color: rgba(205,127,50,0.12); }

  .cf-rank-tag {
    position: absolute; top: 8px; right: 10px;
    font-size: 9px; font-weight: 900; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.22);
  }

  /* Count badge */
  .cf-count { font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 20px; }
  .cf-count-gold   { background: rgba(251,191,36,0.14); color: #fbbf24; border: 1px solid rgba(251,191,36,0.22); }
  .cf-count-silver { background: rgba(180,180,180,0.10); color: #d4d4d4; border: 1px solid rgba(180,180,180,0.18); }
  .cf-count-bronze { background: rgba(205,127,50,0.12); color: #fb923c; border: 1px solid rgba(205,127,50,0.18); }
  .cf-count-mid    { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65); border: 1px solid rgba(255,255,255,0.09); }
  .cf-count-navy   { background: rgba(59,130,246,0.09); color: #93c5fd; border: 1px solid rgba(59,130,246,0.14); }

  /* ── Rank 4-10 LG balls ── */
  .cf-ball-lg { width: 60px; height: 60px; font-size: 21px; }
  .cf-ball-r4  { background: radial-gradient(circle at 36% 30%, #ff7070 0%, #dc2626 42%, #7f1d1d 100%); color: #fff; box-shadow: 0 6px 22px rgba(220,38,38,0.42), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r5  { background: radial-gradient(circle at 36% 30%, #ff9060 0%, #ea580c 42%, #7c2d12 100%); color: #fff; box-shadow: 0 6px 22px rgba(234,88,12,0.40), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r6  { background: radial-gradient(circle at 36% 30%, #ffb065 0%, #f97316 42%, #7c2d12 100%); color: #fff; box-shadow: 0 6px 20px rgba(249,115,22,0.35), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r7  { background: radial-gradient(circle at 36% 30%, #ffd060 0%, #f59e0b 42%, #78350f 100%); color: #78350f; box-shadow: 0 6px 20px rgba(245,158,11,0.35), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r8  { background: radial-gradient(circle at 36% 30%, #ffe060 0%, #eab308 42%, #713f12 100%); color: #713f12; box-shadow: 0 6px 18px rgba(234,179,8,0.30), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r9  { background: radial-gradient(circle at 36% 30%, #c8e86a 0%, #84cc16 42%, #365314 100%); color: #1a2e05; box-shadow: 0 6px 18px rgba(132,204,22,0.28), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r10 { background: radial-gradient(circle at 36% 30%, #6ee7b7 0%, #10b981 42%, #064e3b 100%); color: #022c22; box-shadow: 0 6px 18px rgba(16,185,129,0.28), inset 0 -5px 10px rgba(0,0,0,0.28); }

  .cf-mid-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 5px; position: relative;
    padding: 14px 8px 10px;
    background: rgba(255,255,255,0.02);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.04);
    transition: all 0.18s;
  }
  .cf-mid-card:hover { background: rgba(255,255,255,0.045); transform: translateY(-2px); }
  .cf-mid-rank { position: absolute; top: 5px; right: 7px; font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.2); }

  /* ── Rank 11-40 SM balls ── */
  .cf-ball-sm { width: 46px; height: 46px; font-size: 15px; }
  .cf-ball-navy {
    background: radial-gradient(circle at 36% 30%, #4a6fa5 0%, #1e3a5f 46%, #0d1e35 100%);
    color: #93c5fd;
    box-shadow: 0 3px 12px rgba(0,0,0,0.38), inset 0 -3px 7px rgba(0,0,0,0.24);
  }
  .cf-dense-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 3px; position: relative;
    padding: 9px 5px 7px;
    border-radius: 11px;
    background: rgba(255,255,255,0.012);
    border: 1px solid rgba(59,130,246,0.08);
    transition: all 0.15s;
  }
  .cf-dense-card:hover { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.18); transform: translateY(-1px); }
  .cf-dense-rank { position: absolute; top: 4px; right: 4px; font-size: 7px; font-weight: 900; color: rgba(147,197,253,0.22); }

  /* Divider */
  .cf-divider-gold { height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.14), transparent); }
  .cf-divider-blue { height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.14), transparent); }

  /* Empty */
  .cf-empty { text-align: center; padding: 64px 0; color: rgba(251,191,36,0.3); font-size: 14px; }
`,j=[`cf-ball-r4`,`cf-ball-r5`,`cf-ball-r6`,`cf-ball-r7`,`cf-ball-r8`,`cf-ball-r9`,`cf-ball-r10`],ne=[{value:1,label:`1 ປີ`},{value:3,label:`3 ປີ`},{value:5,label:`5 ປີ`},{value:`all`,label:`ທັງໝົດ`}];function re(e){return e===`all`?`ທຸກຍຸກ`:`${e} ປີຫຼ້ານີ້`}function ie({timeframe:e}){let{draws:t}=r(),[n,i]=(0,u.useState)(5),a=(0,u.useMemo)(()=>{if(!t||t.length===0)return[];let e=t;if(n!==`all`){let r=new Date;r.setFullYear(r.getFullYear()-n),e=t.filter(e=>new Date(e.draw_date)>=r)}let r={};return e.forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`);if(t){let e=t.result_value;r[e]||(r[e]=0),r[e]+=1}}),Object.entries(r).map(([e,t])=>({number:e,count:t})).sort((e,t)=>t.count-e.count).slice(0,40)},[t,n]),o=a.slice(0,3),s=a.slice(3,10),c=a.slice(10);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:A}),(0,d.jsxs)(`section`,{className:`cf-root p-6 sm:p-8 lg:p-10 mb-16`,children:[(0,d.jsx)(`div`,{className:`cf-mesh`}),(0,d.jsx)(`div`,{className:`cf-top-glow`}),(0,d.jsx)(`div`,{className:`cf-side-glow-l`}),(0,d.jsx)(`div`,{className:`cf-side-glow-r`}),(0,d.jsx)(`div`,{className:`cf-tape mb-7`}),(0,d.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 relative z-10`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2 mb-1`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:15,color:`rgba(251,191,36,0.55)`,fontVariationSettings:`'FILL' 1`},children:`casino`}),(0,d.jsxs)(`span`,{className:`cf-section-label`,style:{color:`rgba(251,191,36,0.5)`},children:[`Custom Analysis · `,re(n)]})]}),(0,d.jsx)(`div`,{className:`cf-top40-text`,children:`TOP 40`}),(0,d.jsx)(`p`,{style:{fontSize:13,color:`rgba(251,191,36,0.38)`,marginTop:4,fontWeight:600,letterSpacing:`0.02em`},children:`ເລກ 2 ຕົວທີ່ອອກຫຼາຍທີ່ສຸດ`})]}),(0,d.jsx)(`div`,{className:`cf-tickets-wrap`,style:{paddingLeft:16},children:ne.map(({value:e,label:t})=>(0,d.jsx)(`button`,{onClick:()=>i(e),className:`cf-ticket${n===e?` cf-active`:``}`,children:t},e))})]}),a.length===0?(0,d.jsxs)(`div`,{className:`cf-empty`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:48,display:`block`,marginBottom:10},children:`search_off`}),`ບໍ່ມີຂໍ້ມູນສຳລັບຊ່ວງເວລານີ້`]}):(0,d.jsxs)(`div`,{className:`space-y-7 relative z-10`,children:[o.length>0&&(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`p`,{className:`cf-section-label mb-5`,style:{color:`rgba(251,191,36,0.5)`},children:`✦ ແຊ້ມ — Grand Prize Numbers`}),(0,d.jsx)(`div`,{className:`grid grid-cols-3 gap-3 sm:gap-5 max-w-sm mx-auto`,children:o.map((e,t)=>{let n=t===0,r=t===1,i=t===0?`cf-float`:t===1?`cf-float2`:`cf-float3`,a=n?`cf-ball-gold`:r?`cf-ball-silver`:`cf-ball-bronze`,o=n?`cf-podium-card-gold`:r?`cf-podium-card-silver`:`cf-podium-card-bronze`,s=n?`rgba(251,191,36,0.38)`:r?`rgba(180,180,180,0.25)`:`rgba(205,127,50,0.30)`,c=n?`cf-count-gold`:r?`cf-count-silver`:`cf-count-bronze`;return(0,d.jsxs)(`div`,{className:`cf-podium-card ${o}`,children:[n&&(0,d.jsx)(`div`,{className:`cf-crown`,children:`👑`}),r&&(0,d.jsx)(`div`,{className:`cf-medal`,children:`🥈`}),!n&&!r&&(0,d.jsx)(`div`,{className:`cf-medal`,children:`🥉`}),(0,d.jsxs)(`div`,{className:`cf-rank-tag`,children:[`#`,t+1]}),(0,d.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:[(0,d.jsx)(`div`,{className:`cf-ring`,style:{width:90,height:90,border:`2px solid ${s}`}}),(0,d.jsx)(`div`,{className:`cf-ring cf-ring-2`,style:{width:90,height:90,border:`1.5px solid ${s}`}}),(0,d.jsx)(`div`,{className:`cf-ball cf-ball-xl ${a} ${i}`,children:e.number})]}),(0,d.jsxs)(`span`,{className:`cf-count ${c}`,children:[e.count,` ຄັ້ງ`]})]},e.number)})})]}),s.length>0&&(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`cf-divider-gold mb-5`}),(0,d.jsx)(`p`,{className:`cf-section-label mb-4`,style:{color:`rgba(249,115,22,0.55)`},children:`✦ ອັນດັບ 4 – 10`}),(0,d.jsx)(`div`,{className:`grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3`,children:s.map((e,t)=>(0,d.jsxs)(`div`,{className:`cf-mid-card`,children:[(0,d.jsxs)(`div`,{className:`cf-mid-rank`,children:[`#`,t+4]}),(0,d.jsx)(`div`,{className:`cf-ball cf-ball-lg ${j[t]??j[6]}`,children:e.number}),(0,d.jsx)(`span`,{className:`cf-count cf-count-mid`,children:e.count})]},e.number))})]}),c.length>0&&(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`cf-divider-blue mb-5`}),(0,d.jsx)(`p`,{className:`cf-section-label mb-4`,style:{color:`rgba(147,197,253,0.38)`},children:`✦ ອັນດັບ 11 – 40`}),(0,d.jsx)(`div`,{className:`grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2`,children:c.map((e,t)=>(0,d.jsxs)(`div`,{className:`cf-dense-card`,children:[(0,d.jsxs)(`div`,{className:`cf-dense-rank`,children:[`#`,t+11]}),(0,d.jsx)(`div`,{className:`cf-ball cf-ball-sm cf-ball-navy`,children:e.number}),(0,d.jsx)(`span`,{className:`cf-count cf-count-navy`,style:{fontSize:9},children:e.count})]},e.number))})]})]})]})]})}var ae={0:{label:`ວັນອາທິດ`,short:`ອາ`,accent:`#dc2626`},1:{label:`ວັນຈັນ`,short:`ຈັນ`,accent:`#003fb1`},2:{label:`ວັນອັງຄານ`,short:`ອັງ`,accent:`#0d7377`},3:{label:`ວັນພຸດ`,short:`ພຸດ`,accent:`#6750a4`},4:{label:`ວັນພະຫັດ`,short:`ພ`,accent:`#b45309`},5:{label:`ວັນສຸກ`,short:`ສຸກ`,accent:`#ba1a1a`},6:{label:`ວັນເສົາ`,short:`ສ`,accent:`#64748b`}};function oe(e,t){if(t===`all`||!e.length)return e;let n=[...e].sort((e,t)=>new Date(t.draw_date)-new Date(e.draw_date)),r=new Date(n[0].draw_date),i=new Date(r);if(t===`1_month`)i.setMonth(i.getMonth()-1);else if(t===`3_months`)i.setMonth(i.getMonth()-3);else if(t===`1_year`)i.setFullYear(i.getFullYear()-1);else return e;return e.filter(e=>new Date(e.draw_date)>=i)}var M={"1_month":`1 ເດືອນ`,"3_months":`3 ເດືອນ`,"1_year":`1 ປີ`,all:`ທັງໝົດ`},se={1:`grid-cols-1`,2:`grid-cols-1 sm:grid-cols-2`,3:`grid-cols-1 sm:grid-cols-3`,4:`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`,5:`grid-cols-1 sm:grid-cols-3 lg:grid-cols-5`,6:`grid-cols-1 sm:grid-cols-3 lg:grid-cols-6`,7:`grid-cols-1 sm:grid-cols-4 lg:grid-cols-7`},N=`
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
`,P=(0,u.forwardRef)(function({spotlight:e,spotlightConf:t,typeName:n,timeframe:r},i){if(!e||!t)return null;let a=M[r]||r,o=new Date,s=`${String(o.getDate()).padStart(2,`0`)}/${String(o.getMonth()+1).padStart(2,`0`)}/${o.getFullYear()}`,c=t.accent;return(0,d.jsxs)(`div`,{ref:i,style:{width:`1200px`,backgroundColor:`#060410`,backgroundImage:`radial-gradient(circle at 15% 15%, #1c0e34 0%, transparent 55%), radial-gradient(circle at 85% 85%, #1a0a08 0%, transparent 55%)`,fontFamily:`'Noto Sans Lao Looped','Phetsarath',sans-serif`,display:`flex`,flexDirection:`column`,boxSizing:`border-box`,overflow:`hidden`,position:`relative`},children:[(0,d.jsx)(`div`,{style:{height:`6px`,background:`linear-gradient(90deg, #d4af37, #FFF5C0, #B8860B, #8B6914, #d4af37)`}}),(0,d.jsxs)(`div`,{style:{background:`#0d0e1c`,borderBottom:`1px solid rgba(212,175,55,0.2)`,padding:`43px 64px`,textAlign:`center`,color:`#fff`,position:`relative`},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`18px`,marginBottom:`18px`},children:[(0,d.jsx)(`div`,{style:{width:`66px`,height:`66px`,borderRadius:`50%`,background:`linear-gradient(90deg, #d4af37, #FFF5C0, #B8860B)`,padding:`2px`,display:`flex`,alignItems:`center`,justifyContent:`center`,boxShadow:`0 4px 14px rgba(0,0,0,0.4)`},children:(0,d.jsxs)(`div`,{style:{width:`100%`,height:`100%`,borderRadius:`50%`,background:`#0d0e1c`,overflow:`hidden`,display:`flex`,alignItems:`center`,justifyContent:`center`,position:`relative`},children:[(0,d.jsx)(`div`,{style:{position:`absolute`,top:2,left:4,width:6,height:4,background:`rgba(255,255,255,0.4)`,borderRadius:`50%`,transform:`rotate(-28deg)`}}),(0,d.jsxs)(`svg`,{viewBox:`0 0 38 38`,style:{width:`100%`,height:`100%`,display:`block`},children:[(0,d.jsxs)(`defs`,{children:[(0,d.jsx)(`clipPath`,{id:`circleClipWeekdayShare`,children:(0,d.jsx)(`circle`,{cx:`19`,cy:`19`,r:`17`})}),(0,d.jsxs)(`linearGradient`,{id:`goldStripeWeekdayShare`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,d.jsx)(`stop`,{offset:`0%`,stopColor:`#A67C1E`}),(0,d.jsx)(`stop`,{offset:`50%`,stopColor:`#F5D77F`}),(0,d.jsx)(`stop`,{offset:`100%`,stopColor:`#A67C1E`})]}),(0,d.jsxs)(`linearGradient`,{id:`darkStripeWeekdayShare`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,d.jsx)(`stop`,{offset:`0%`,stopColor:`#0F1326`}),(0,d.jsx)(`stop`,{offset:`50%`,stopColor:`#1E2548`}),(0,d.jsx)(`stop`,{offset:`100%`,stopColor:`#0F1326`})]}),(0,d.jsxs)(`radialGradient`,{id:`goldCircleWeekdayShare`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,d.jsx)(`stop`,{offset:`0%`,stopColor:`#FFFDF5`}),(0,d.jsx)(`stop`,{offset:`70%`,stopColor:`#F3D072`}),(0,d.jsx)(`stop`,{offset:`100%`,stopColor:`#C99E32`})]})]}),(0,d.jsxs)(`g`,{clipPath:`url(#circleClipWeekdayShare)`,children:[(0,d.jsx)(`rect`,{x:`0`,y:`0`,width:`38`,height:`9.5`,fill:`url(#goldStripeWeekdayShare)`}),(0,d.jsx)(`rect`,{x:`0`,y:`9.5`,width:`38`,height:`19`,fill:`url(#darkStripeWeekdayShare)`}),(0,d.jsx)(`rect`,{x:`0`,y:`28.5`,width:`38`,height:`9.5`,fill:`url(#goldStripeWeekdayShare)`}),(0,d.jsx)(`circle`,{cx:`19`,cy:`19`,r:`6.5`,fill:`url(#goldCircleWeekdayShare)`})]})]})]})}),(0,d.jsx)(`span`,{style:{fontSize:`54px`,fontWeight:900,fontFamily:`'Inter',sans-serif`,letterSpacing:`-0.02em`,background:`linear-gradient(90deg, #D4AF37, #FFD54F)`,WebkitBackgroundClip:`text`,WebkitTextFillColor:`transparent`,backgroundClip:`text`},children:`LAOLOTS.COM`})]}),(0,d.jsxs)(`div`,{style:{display:`inline-block`,background:`rgba(212,175,55,0.15)`,padding:`13px 37px`,borderRadius:`999px`,fontSize:`29px`,fontWeight:900,border:`1px solid rgba(212,175,55,0.35)`,color:`#ffd700`},children:[`ສະຖິຕິຕາມມື້ອອກຫວຍ · `,n]})]}),(0,d.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,padding:`32px 64px`,background:`#0d0e1c`,borderBottom:`1px solid rgba(212,175,55,0.15)`},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{style:{fontSize:`20px`,color:`rgba(255,255,255,0.45)`,fontWeight:800,textTransform:`uppercase`,letterSpacing:`0.05em`,marginBottom:`7px`},children:`ຊ່ວງເວລາວິເຄາະ`}),(0,d.jsx)(`div`,{style:{fontSize:`35px`,fontWeight:900,color:`#ffd700`},children:a})]}),(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`14px`,background:`${c}20`,padding:`12px 28px`,borderRadius:`20px`,border:`1px solid ${c}40`},children:[(0,d.jsx)(`span`,{style:{width:`16px`,height:`16px`,borderRadius:`50%`,backgroundColor:c,display:`inline-block`,boxShadow:`0 0 12px ${c}`}}),(0,d.jsx)(`span`,{style:{fontSize:`29px`,fontWeight:900,color:c},children:t.label})]}),(0,d.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,d.jsx)(`div`,{style:{fontSize:`20px`,color:`rgba(255,255,255,0.45)`,fontWeight:800,marginBottom:`7px`},children:`ວັນທີແຊຣ໌`}),(0,d.jsx)(`div`,{style:{fontSize:`35px`,fontWeight:900,color:`white`},children:s})]})]}),(0,d.jsxs)(`div`,{style:{padding:`48px 64px`,display:`flex`,flexDirection:`column`,gap:`37px`,flex:1},children:[(0,d.jsxs)(`div`,{style:{background:`rgba(13,14,28,0.8)`,borderRadius:`24px`,padding:`29px 43px`,border:`1px solid rgba(212,175,55,0.2)`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,boxShadow:`0 8px 32px rgba(0,0,0,0.3)`},children:[(0,d.jsxs)(`span`,{style:{fontSize:`29px`,fontWeight:800,color:`white`},children:[`ຈຳນວນງວດທີ່ອອກຫວຍໃນ `,t.label]}),(0,d.jsxs)(`span`,{style:{fontSize:`35px`,fontWeight:950,color:c,background:`${c}20`,border:`1px solid ${c}30`,padding:`11px 29px`,borderRadius:`16px`},children:[e.totalDraws,` ງວດ`]})]}),(0,d.jsxs)(`div`,{style:{background:`rgba(13,14,28,0.8)`,borderRadius:`28px`,padding:`37px`,border:`1px solid rgba(212,175,55,0.2)`,boxShadow:`0 8px 32px rgba(0,0,0,0.3)`},children:[(0,d.jsxs)(`div`,{style:{fontSize:`29px`,fontWeight:900,color:`white`,marginBottom:`29px`,display:`flex`,alignItems:`center`,gap:`16px`,borderBottom:`1px solid rgba(212,175,55,0.1)`,paddingBottom:`19px`},children:[(0,d.jsx)(`span`,{style:{fontSize:`35px`},children:`🎯`}),`ເລກ 2 ຕົວທ້າຍ ທີ່ມັກອອກຫຼາຍທີ່ສຸດ`]}),(0,d.jsx)(`div`,{style:{display:`flex`,gap:`19px`,marginBottom:`37px`,justifyContent:`space-between`},children:e.topNums.length>0?e.topNums.map(([e,t],n)=>(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,borderRadius:`22px`,padding:`24px 19px`,width:`18%`,border:`1px solid ${n===0?c:`rgba(212,175,55,0.15)`}`,background:n===0?`linear-gradient(135deg,${c}25 0%,${c}05 100%)`:`rgba(255,255,255,0.02)`,boxShadow:n===0?`0 8px 24px ${c}20`:`none`},children:[(0,d.jsx)(`span`,{style:{fontSize:`64px`,fontWeight:950,fontFamily:`'Inter',monospace`,color:n===0?c:`#ffd700`,lineHeight:1.1},children:e}),(0,d.jsxs)(`span`,{style:{fontSize:`21px`,color:n===0?c:`rgba(255,255,255,0.65)`,fontWeight:800,marginTop:`13px`,background:n===0?`${c}30`:`rgba(255,255,255,0.08)`,padding:`5px 16px`,borderRadius:`10px`,border:n===0?`none`:`1px solid rgba(255,255,255,0.05)`},children:[t,` ຄັ້ງ`]})]},e)):(0,d.jsx)(`span`,{style:{fontSize:`24px`,color:`rgba(255,255,255,0.3)`,width:`100%`,textAlign:`center`,padding:`16px 0`},children:`ບໍ່ມີຂໍ້ມູນ`})}),e.topNums.length>0&&(0,d.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`21px`},children:e.topNums.map(([t,n],r)=>{let i=Math.round(n/e.maxCount*100);return(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`22px`},children:[(0,d.jsx)(`span`,{style:{fontSize:`27px`,fontWeight:900,color:r===0?c:`rgba(255,255,255,0.6)`,width:`45px`,fontFamily:`'Inter',monospace`,textAlign:`right`},children:t}),(0,d.jsx)(`div`,{style:{flex:1,height:`19px`,background:`rgba(255,255,255,0.05)`,borderRadius:`10px`,overflow:`hidden`},children:(0,d.jsx)(`div`,{style:{height:`100%`,borderRadius:`10px`,width:`${i}%`,backgroundColor:r===0?c:`${c}bb`}})}),(0,d.jsxs)(`span`,{style:{fontSize:`24px`,fontWeight:800,color:r===0?c:`rgba(255,255,255,0.7)`,width:`93px`,textAlign:`right`},children:[n,` ຄັ້ງ`]})]},t)})})]}),e.topAnimals.length>0&&(0,d.jsxs)(`div`,{style:{background:`rgba(13,14,28,0.8)`,borderRadius:`28px`,padding:`37px`,border:`1px solid rgba(212,175,55,0.2)`,boxShadow:`0 8px 32px rgba(0,0,0,0.3)`},children:[(0,d.jsxs)(`div`,{style:{fontSize:`29px`,fontWeight:900,color:`white`,marginBottom:`29px`,display:`flex`,alignItems:`center`,gap:`16px`,borderBottom:`1px solid rgba(212,175,55,0.1)`,paddingBottom:`19px`},children:[(0,d.jsx)(`span`,{style:{fontSize:`35px`},children:`🐾`}),`ນາມສັດຍອດນິຍົມ`]}),(0,d.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`19px`},children:e.topAnimals.map((e,t)=>(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`21px 29px`,borderRadius:`22px`,border:`1px solid ${t===0?`${c}40`:`rgba(212,175,55,0.1)`}`,background:t===0?`${c}15`:`rgba(255,255,255,0.02)`},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`21px`},children:[(0,d.jsx)(`span`,{style:{fontSize:`48px`,lineHeight:1},children:e.animal?.icon}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{style:{fontSize:`27px`,fontWeight:900,color:`white`},children:e.animal?.animal_name_lao}),(0,d.jsx)(`div`,{style:{fontSize:`21px`,color:`rgba(255,255,255,0.5)`,fontFamily:`'Inter',monospace`,fontWeight:700,marginTop:`4px`},children:e.animal?.numbers?.join(`, `)})]})]}),(0,d.jsxs)(`span`,{style:{fontSize:`23px`,fontWeight:900,color:t===0?c:`#ffd700`,background:t===0?`${c}25`:`rgba(212,175,55,0.15)`,padding:`9px 21px`,borderRadius:`14px`,border:t===0?`none`:`1px solid rgba(212,175,55,0.1)`},children:[e.count,` ຄັ້ງ`]})]},e.animal?.animal_id??t))})]})]}),(0,d.jsx)(`div`,{style:{background:`#0a0b14`,textAlign:`center`,padding:`29px`,color:`rgba(212,175,55,0.7)`,fontSize:`24px`,fontWeight:800,letterSpacing:`0.05em`,borderTop:`1px solid rgba(212,175,55,0.35)`},children:`laolots.com — ສູນລວມຜົນຫວຍ ແລະ ສະຖິຕິຫວຍລາວອອນລາຍ`})]})});function F({timeframe:e,typeId:t}){let{draws:n,animals:i,types:a}=r(),o=(0,u.useRef)(null),[s,c]=(0,u.useState)(!1),[f,p]=(0,u.useState)(null),m=a?.find(e=>String(e.type_id)===String(t))?.type_name??`ລາວ`,h=new Date().getDay(),{allStats:g,drawDays:_,spotlightDay:v}=(0,u.useMemo)(()=>{let r=oe((!t||t===`all`?n:n.filter(e=>String(e.type_id)===String(t))).filter(e=>e.status===`published`),e);if(!r.length)return{allStats:[],drawDays:[],spotlightDay:1};let a=new Set;r.forEach(e=>a.add(new Date(e.draw_date).getDay()));let o=[...a].sort((e,t)=>(e===0?7:e)-(t===0?7:t)),s=o.map(e=>({day:e,...ae[e]||{label:`ວັນ ${e}`,short:`${e}`,accent:`#64748b`}})),c=s.map(({day:e})=>{let t=r.filter(t=>new Date(t.draw_date).getDay()===e),n={},a={};t.forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`);if(!t)return;let r=t.result_value;r!=null&&(n[r]=(n[r]||0)+1),t.animal_id&&(a[t.animal_id]=(a[t.animal_id]||0)+1)});let o=Object.entries(n).sort((e,t)=>t[1]-e[1]).slice(0,5),s=Object.entries(a).sort((e,t)=>t[1]-e[1]).slice(0,3).map(([e,t])=>({animal:i.find(t=>String(t.animal_id)===String(e)),count:t}));return{day:e,totalDraws:t.length,topNums:o,topAnimals:s,maxCount:o[0]?.[1]||1}}),l=o.includes(h),u;if(l)u=h;else{let e=[...o].sort((e,t)=>e-t);u=e.find(e=>e>h)??e[0]??1}return{allStats:c,drawDays:s,spotlightDay:u}},[n,i,e,t,h]),y=(0,u.useMemo)(()=>_.some(e=>e.day===f)?f:v,[f,_,v]),b=_.some(e=>e.day===h)&&y===h,x=g.find(e=>e.day===y)||g[0],S=_.find(e=>e.day===y)||_[0],C=se[_.length]||`grid-cols-1 sm:grid-cols-3 lg:grid-cols-5`,w=(0,u.useCallback)(async()=>{if(o.current)try{c(!0);let t=await l(o.current,{cacheBust:!0,quality:1,pixelRatio:2,skipFonts:!0,backgroundColor:`#ffffff`}),n=S?.label||`day`,r=`weekday-stats-${m}-${n}-${M[e]||e}.png`;if(navigator.share&&navigator.canShare)try{let i=await(await fetch(t)).blob(),a=new File([i],r,{type:`image/png`});if(navigator.canShare({files:[a]})){await navigator.share({title:`ສະຖິຕິ ${n} · ${m}`,text:`ສະຖິຕິຫວຍອອກ ${n} ${m} (${M[e]||e}) — laolots.com`,files:[a]});return}}catch(e){if(e.name===`AbortError`)return}let i=document.createElement(`a`);i.download=r,i.href=t,i.click()}catch{alert(`ການສ້າງຮູບພາບມີບັນຫາ, ກະລຸນາລອງໃໝ່.`)}finally{c(!1)}},[m,e,S]);if(!x||!S||g.length===0)return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:N}),(0,d.jsxs)(`div`,{className:`ws-empty`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined ws-empty-icon`,children:`calendar_month`}),(0,d.jsx)(`p`,{className:`ws-empty-txt`,children:`ບໍ່ມີຂໍ້ມູນສະຖິຕິຕາມມື້ ສຳລັບຕົວກອງນີ້`})]})]});let T=S.accent;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:N}),(0,d.jsxs)(`div`,{className:`ws-root p-6 sm:p-8 space-y-0`,children:[(0,d.jsx)(`div`,{className:`ws-mesh`}),(0,d.jsx)(`div`,{style:{position:`fixed`,left:`-9999px`,top:`-9999px`,zIndex:-1},children:(0,d.jsx)(P,{ref:o,spotlight:x,spotlightConf:S,typeName:m,timeframe:e})}),(0,d.jsxs)(`div`,{className:`ws-hdr`,children:[(0,d.jsxs)(`div`,{className:`ws-hdr-left`,children:[(0,d.jsx)(`div`,{className:`ws-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:20,fontVariationSettings:`'FILL' 1`},children:`calendar_month`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`ws-title`,children:`ສະຖິຕິຕາມມື້ອອກຫວຍ`}),(0,d.jsx)(`p`,{className:`ws-subtitle`,children:`ຄລິກເລືອກມື້ເພື່ອເບິ່ງສະຖິຕິ ແລະ ແຊຣ໌ຮູບ`})]})]}),(0,d.jsxs)(`button`,{onClick:w,disabled:s,className:`ws-share-btn`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:17,animation:s?`spin 1s linear infinite`:`none`},children:s?`progress_activity`:`share`}),s?`ກຳລັງສ້າງ...`:`ແຊຣ໌ເປັນຮູບ`]})]}),(0,d.jsx)(`div`,{className:`ws-tabs`,children:_.map(e=>(0,d.jsx)(`button`,{onClick:()=>p(e.day),className:`ws-tab`,style:e.day===y?{background:`${e.accent}18`,borderColor:`${e.accent}45`,color:e.accent,boxShadow:`0 0 14px ${e.accent}18`}:void 0,children:e.label},e.day))}),(0,d.jsxs)(`div`,{className:`ws-spot`,style:{background:`linear-gradient(140deg, ${T}d8 0%, ${T}95 55%, ${T}70 100%)`},children:[(0,d.jsx)(`div`,{className:`ws-spot-overlay`}),(0,d.jsx)(`div`,{className:`ws-spot-stars`}),(0,d.jsxs)(`div`,{className:`ws-spot-hdr`,children:[(0,d.jsxs)(`div`,{className:`ws-spot-day-row`,children:[(0,d.jsx)(`div`,{className:`ws-spot-live-dot`}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`ws-spot-day-name`,children:S.label}),(0,d.jsxs)(`div`,{className:`ws-spot-day-count`,children:[`ທັງໝົດ `,x.totalDraws,` ງວດ`]})]})]}),(b||y===v)&&(0,d.jsx)(`span`,{className:b?`ws-badge-today`:`ws-badge-next`,children:b?`● ມື້ນີ້`:`ງວດຕໍ່ໄປ`})]}),(0,d.jsx)(`div`,{className:`ws-balls`,children:x.topNums.length>0?x.topNums.map(([e,t],n)=>{let r=n===0;return(0,d.jsxs)(`div`,{className:`ws-ball-wrap`,children:[(0,d.jsx)(`div`,{className:`ws-ball ${r?`ws-ball-top`:`ws-ball-rest`}`,style:{background:r?`radial-gradient(circle at 35% 30%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 45%, rgba(200,200,200,0.70) 100%)`:`radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 45%, rgba(0,0,0,0.15) 100%)`,boxShadow:r?`0 6px 20px rgba(0,0,0,0.30), inset 0 -4px 8px rgba(0,0,0,0.14)`:`0 4px 12px rgba(0,0,0,0.22), inset 0 -3px 6px rgba(0,0,0,0.10)`,color:r?T:`#fff`},children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1,fontWeight:900},children:e})}),(0,d.jsxs)(`div`,{className:`ws-ball-lbl`,children:[t,` ຄັ້ງ`]})]},e)}):(0,d.jsx)(`p`,{style:{color:`rgba(255,255,255,0.38)`,fontSize:13,position:`relative`,zIndex:2},children:`ບໍ່ມີຂໍ້ມູນ`})}),x.topAnimals.length>0&&(0,d.jsxs)(`div`,{className:`ws-animals`,children:[(0,d.jsx)(`span`,{className:`ws-animals-lbl`,children:`ນາມສັດ:`}),x.topAnimals.map((e,t)=>(0,d.jsxs)(`div`,{className:`ws-animal-pill ${t===0?`ws-animal-pill-top`:``}`,children:[(0,d.jsx)(`span`,{style:{fontSize:16,lineHeight:1},children:e.animal?.icon}),(0,d.jsx)(`span`,{children:e.animal?.animal_name_lao}),(0,d.jsxs)(`span`,{className:`ws-animal-cnt`,children:[e.count,`x`]})]},e.animal?.animal_id??t))]})]}),(0,d.jsx)(`div`,{className:`grid ${C} gap-3`,style:{position:`relative`,zIndex:10},children:_.map(e=>{let t=g.find(t=>t.day===e.day),n=e.day===y;return t?(0,d.jsxs)(`div`,{onClick:()=>p(e.day),className:`ws-day-card`,style:n?{borderColor:`${e.accent}38`,background:`${e.accent}0e`,boxShadow:`0 0 22px ${e.accent}14`,transform:`translateY(-1px)`}:void 0,children:[(0,d.jsxs)(`div`,{className:`ws-card-hdr`,children:[(0,d.jsxs)(`div`,{className:`ws-card-hdr-l`,children:[(0,d.jsx)(`div`,{className:`ws-day-dot`,style:{background:e.accent},children:e.short.charAt(0)}),(0,d.jsx)(`span`,{className:`ws-day-lbl`,children:e.label}),b&&n&&(0,d.jsx)(`span`,{style:{fontSize:8,fontWeight:900,background:e.accent,color:`#fff`,padding:`2px 6px`,borderRadius:4,lineHeight:1.5},children:`TODAY`})]}),(0,d.jsxs)(`span`,{className:`ws-draw-cnt`,children:[t.totalDraws,` ງວດ`]})]}),(0,d.jsx)(`div`,{className:`ws-chips`,children:t.topNums.length>0?t.topNums.map(([t,n],r)=>(0,d.jsxs)(`div`,{className:`ws-chip`,style:r===0?{background:e.accent,color:`#fff`}:{background:`rgba(255,255,255,0.055)`,border:`1px solid rgba(255,255,255,0.08)`,color:`rgba(255,255,255,0.60)`},children:[(0,d.jsx)(`span`,{children:t}),(0,d.jsxs)(`span`,{className:`ws-chip-cnt`,style:{color:r===0?`rgba(255,255,255,0.62)`:`rgba(255,255,255,0.28)`},children:[n,`x`]})]},t)):(0,d.jsx)(`span`,{style:{fontSize:11,color:`rgba(255,255,255,0.22)`},children:`ບໍ່ມີຂໍ້ມູນ`})}),t.topNums.length>0&&(0,d.jsx)(`div`,{className:`ws-mini-bars`,children:t.topNums.map(([n,r],i)=>{let a=Math.round(r/t.maxCount*100);return(0,d.jsxs)(`div`,{className:`ws-mini-row`,children:[(0,d.jsx)(`span`,{className:`ws-mini-lbl`,children:n}),(0,d.jsx)(`div`,{className:`ws-mini-trk`,children:(0,d.jsx)(`div`,{className:`ws-mini-fill`,style:{width:`${a}%`,background:i===0?e.accent:`${e.accent}55`}})}),(0,d.jsx)(`span`,{className:`ws-mini-cnt`,children:r})]},n)})}),t.topAnimals[0]&&(0,d.jsxs)(`div`,{className:`ws-card-animal`,children:[(0,d.jsx)(`span`,{style:{fontSize:17},children:t.topAnimals[0].animal?.icon}),(0,d.jsx)(`span`,{className:`ws-card-animal-name`,children:t.topAnimals[0].animal?.animal_name_lao}),(0,d.jsxs)(`span`,{className:`ws-card-animal-count`,children:[t.topAnimals[0].count,`x`]})]})]},e.day):null})})]})]})}var I=[{bar:`#f59e0b`,border:`rgba(245,158,11,0.28)`,bg:`rgba(245,158,11,0.07)`,glow:`0 0 20px rgba(245,158,11,0.16)`,lbl:`rgba(251,191,36,0.90)`},{bar:`#60a5fa`,border:`rgba(96,165,250,0.22)`,bg:`rgba(96,165,250,0.06)`,glow:`0 0 16px rgba(96,165,250,0.10)`,lbl:`rgba(147,197,253,0.88)`},{bar:`#fb923c`,border:`rgba(251,146,60,0.20)`,bg:`rgba(251,146,60,0.05)`,glow:`0 0 14px rgba(251,146,60,0.09)`,lbl:`rgba(253,186,116,0.85)`},{bar:`#2dd4bf`,border:`rgba(45,212,191,0.18)`,bg:`rgba(45,212,191,0.04)`,glow:`0 0 12px rgba(45,212,191,0.08)`,lbl:`rgba(94,234,212,0.82)`}],L=`
  /* ── Root ── */
  .ps-root {
    position: relative;
    background: linear-gradient(158deg, #07041a 0%, #0d0624 52%, #060310 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .ps-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.009) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.009) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .ps-stars {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle 1px at  8% 15%, rgba(255,255,255,0.30) 0%, transparent 1px),
      radial-gradient(circle 1px at 22% 68%, rgba(255,255,255,0.18) 0%, transparent 1px),
      radial-gradient(circle 1px at 48% 26%, rgba(255,255,255,0.22) 0%, transparent 1px),
      radial-gradient(circle 1px at 70% 75%, rgba(255,255,255,0.16) 0%, transparent 1px),
      radial-gradient(circle 1px at 88% 18%, rgba(255,255,255,0.25) 0%, transparent 1px),
      radial-gradient(circle 1px at 94% 88%, rgba(255,255,255,0.20) 0%, transparent 1px),
      radial-gradient(circle 1px at 34% 92%, rgba(255,255,255,0.15) 0%, transparent 1px),
      radial-gradient(circle 1px at 60% 50%, rgba(255,255,255,0.12) 0%, transparent 1px);
  }
  .ps-orb {
    position: absolute; width: 380px; height: 380px; border-radius: 50%;
    top: -140px; right: -100px; pointer-events: none;
    background: radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 68%);
  }
  .ps-orb2 {
    position: absolute; width: 260px; height: 260px; border-radius: 50%;
    bottom: -80px; left: -60px; pointer-events: none;
    background: radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 68%);
  }

  /* ── Header ── */
  .ps-hdr {
    display: flex; align-items: flex-start; gap: 14px;
    margin-bottom: 24px; position: relative; z-index: 10;
  }
  .ps-icon-box {
    width: 46px; height: 46px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #818cf8 100%);
    box-shadow: 0 0 26px rgba(79,70,229,0.55), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .ps-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.90);
  }
  .ps-desc { font-size: 12px; color: rgba(255,255,255,0.30); margin-top: 5px; line-height: 1.5; }

  /* ── Picker panel ── */
  .ps-picker-lbl {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(129,140,248,0.52);
    margin-bottom: 10px;
  }
  .ps-picker-box {
    height: 320px; overflow-y: auto; padding: 6px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.018);
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.12) transparent;
  }
  .ps-picker-box::-webkit-scrollbar { width: 4px; }
  .ps-picker-box::-webkit-scrollbar-track { background: transparent; }
  .ps-picker-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 9999px; }

  .ps-animal-btn {
    display: flex; flex-direction: column; align-items: center;
    padding: 10px 6px; border-radius: 11px; width: 100%;
    border: 1px solid transparent;
    background: transparent;
    font-weight: 800; color: rgba(255,255,255,0.42);
    cursor: pointer; transition: all 0.16s; text-align: center;
  }
  .ps-animal-btn:hover:not(:disabled) {
    background: rgba(79,70,229,0.12);
    border-color: rgba(99,102,241,0.28);
    color: rgba(255,255,255,0.78);
    transform: translateY(-1px);
  }
  .ps-animal-btn.ps-active {
    background: rgba(79,70,229,0.22);
    border-color: rgba(129,140,248,0.45);
    color: rgba(255,255,255,0.92);
    box-shadow: 0 0 16px rgba(79,70,229,0.28);
  }
  .ps-animal-btn:disabled { opacity: 0.18; cursor: not-allowed; }
  .ps-animal-icon { font-size: 26px; line-height: 1; margin-bottom: 5px; }
  .ps-animal-name { font-size: 10px; line-height: 1.2; }

  /* ── Oracle (right panel) ── */
  .ps-oracle-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }

  /* Gem + orbiting rings wrapper */
  .ps-gem-wrap { position: relative; width: 66px; height: 66px; flex-shrink: 0; }
  .ps-gem {
    width: 66px; height: 66px; border-radius: 20px;
    background: linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 38px; line-height: 1;
    box-shadow: 0 0 32px rgba(79,70,229,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
    position: relative; z-index: 2;
  }
  .ps-orbit {
    position: absolute; border-radius: 50%;
    pointer-events: none; z-index: 1;
  }
  .ps-orbit-1 {
    width: 86px; height: 86px; top: -10px; left: -10px;
    border: 1px solid rgba(129,140,248,0.22);
    animation: ps-spin 7s linear infinite;
  }
  .ps-orbit-2 {
    width: 106px; height: 106px; top: -20px; left: -20px;
    border: 1px dashed rgba(129,140,248,0.10);
    animation: ps-spin 13s linear infinite reverse;
  }
  @keyframes ps-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .ps-oracle-day { font-size: 18px; font-weight: 900; color: rgba(255,255,255,0.90); }
  .ps-oracle-sub { font-size: 12px; color: rgba(255,255,255,0.30); margin-top: 4px; }

  /* ── Prediction grid ── */
  .ps-pred-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }

  .ps-pred-card {
    border-radius: 15px; padding: 13px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.022);
    position: relative; overflow: hidden;
    transition: all 0.18s;
  }
  .ps-pred-card:hover { transform: translateY(-1px); filter: brightness(1.08); }

  /* Shimmer on rank-1 */
  .ps-pred-card.ps-pred-top::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.10), transparent);
    animation: ps-shimmer 3s ease-in-out infinite;
  }
  @keyframes ps-shimmer {
    0%   { left: -120%; }
    100% { left: 200%; }
  }

  .ps-rank-badge {
    position: absolute; top: 8px; right: 9px;
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 900;
  }
  .ps-card-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .ps-card-icon { font-size: 34px; line-height: 1; flex-shrink: 0; }
  .ps-card-name { font-size: 14px; font-weight: 900; color: rgba(255,255,255,0.88); }
  .ps-card-cnt  { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  .ps-bar-row { display: flex; align-items: center; gap: 8px; }
  .ps-bar-trk { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; }
  .ps-bar-fill { height: 100%; border-radius: 9999px; transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1); }
  .ps-bar-pct  { font-size: 13px; font-weight: 900; min-width: 34px; text-align: right; }

  /* ── No data / idle states ── */
  .ps-no-data {
    grid-column: 1 / -1;
    border: 1px dashed rgba(255,255,255,0.08); border-radius: 14px;
    padding: 28px; text-align: center;
    font-size: 13px; color: rgba(255,255,255,0.24); font-weight: 700;
  }
  .ps-idle {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%;
    min-height: 200px; text-align: center;
  }
  .ps-idle-icon { font-size: 56px; color: rgba(129,140,248,0.20); display: block; margin-bottom: 12px; }
  .ps-idle-txt  { font-size: 14px; color: rgba(255,255,255,0.26); font-weight: 700; }
`;function R({timeframe:e}){let{draws:t,animals:n}=r(),[i,a]=(0,u.useState)(null),o=(0,u.useMemo)(()=>{let n=new Date,r=t.filter(e=>e.status===`published`);if(e===`1_month`){let e=new Date;e.setMonth(n.getMonth()-1),r=r.filter(t=>new Date(t.draw_date)>=e)}else if(e===`3_months`){let e=new Date;e.setMonth(n.getMonth()-3),r=r.filter(t=>new Date(t.draw_date)>=e)}else if(e===`1_year`){let e=new Date;e.setFullYear(n.getFullYear()-1),r=r.filter(t=>new Date(t.draw_date)>=e)}let i=[...r].sort((e,t)=>new Date(e.draw_date)-new Date(t.draw_date)),a={};for(let e=0;e<i.length-1;e++){let t=i[e],n=i[e+1],r=t.results_detail?.find(e=>e.prize_type===`2_digits`),o=n.results_detail?.find(e=>e.prize_type===`2_digits`);if(r?.animal_id&&o?.animal_id){let e=r.animal_id,t=o.animal_id;a[e]||(a[e]={total:0,follows:{}}),a[e].total+=1,a[e].follows[t]=(a[e].follows[t]||0)+1}}return a},[t,e]),s=i||(Object.keys(o).length>0?Object.keys(o)[0]:null),c=n.find(e=>e.animal_id==s),l=(0,u.useMemo)(()=>{if(!s||!o[s])return[];let e=o[s].follows;return Object.entries(e).sort((e,t)=>t[1]-e[1]).slice(0,4).map(([e,t])=>({animal:n.find(t=>t.animal_id==e),count:t,percentage:Math.round(t/o[s].total*100)}))},[s,o,n]);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:L}),(0,d.jsxs)(`div`,{className:`ps-root p-6 sm:p-8`,children:[(0,d.jsx)(`div`,{className:`ps-mesh`}),(0,d.jsx)(`div`,{className:`ps-stars`}),(0,d.jsx)(`div`,{className:`ps-orb`}),(0,d.jsx)(`div`,{className:`ps-orb2`}),(0,d.jsxs)(`div`,{className:`ps-hdr`,children:[(0,d.jsx)(`div`,{className:`ps-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:22,fontVariationSettings:`'FILL' 1`},children:`magic_button`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`ps-title`,children:`ຈັບຄູ່ນາມສັດ (Sequence)`}),(0,d.jsx)(`p`,{className:`ps-desc`,children:`ຖ້າງວດນີ້ອອກນາມສັດ X, ງວດຕໍ່ໄປມັກຈະອອກນາມສັດໂຕໃດຫຼາຍທີ່ສຸດ?`})]})]}),(0,d.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-12 gap-6`,style:{position:`relative`,zIndex:10},children:[(0,d.jsxs)(`div`,{className:`md:col-span-5`,children:[(0,d.jsx)(`p`,{className:`ps-picker-lbl`,children:`ຖ້າງວດທີ່ຜ່ານມາອອກ:`}),(0,d.jsx)(`div`,{className:`ps-picker-box`,children:(0,d.jsx)(`div`,{className:`grid grid-cols-2 gap-1.5`,children:n.map(e=>{let t=o[e.animal_id]?.total>0,n=s==e.animal_id;return(0,d.jsxs)(`button`,{onClick:()=>a(e.animal_id),disabled:!t,className:`ps-animal-btn ${n?`ps-active`:``}`,children:[(0,d.jsx)(`span`,{className:`ps-animal-icon`,children:e.icon}),(0,d.jsx)(`span`,{className:`ps-animal-name`,children:e.animal_name_lao})]},e.animal_id)})})})]}),(0,d.jsx)(`div`,{className:`md:col-span-7 flex flex-col justify-center`,children:c?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(`div`,{className:`ps-oracle-hdr`,children:[(0,d.jsxs)(`div`,{className:`ps-gem-wrap`,children:[(0,d.jsx)(`div`,{className:`ps-orbit ps-orbit-1`}),(0,d.jsx)(`div`,{className:`ps-orbit ps-orbit-2`}),(0,d.jsx)(`div`,{className:`ps-gem`,children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:2},children:c.icon})})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`ps-oracle-day`,children:`ງວດຖັດໄປ ມັກຈະອອກ:`}),(0,d.jsxs)(`div`,{className:`ps-oracle-sub`,children:[`ຈາກ `,o[s]?.total||0,` ຄັ້ງ ຫຼັງຈາກ `,c.animal_name_lao]})]})]}),l.length>0?(0,d.jsx)(`div`,{className:`ps-pred-grid`,children:l.map((e,t)=>{let n=I[t]||I[3];return(0,d.jsxs)(`div`,{className:`ps-pred-card ${t===0?`ps-pred-top`:``}`,style:{borderColor:n.border,background:n.bg,boxShadow:n.glow},children:[(0,d.jsx)(`div`,{className:`ps-rank-badge`,style:{background:`${n.bar}20`,border:`1px solid ${n.bar}40`,color:n.lbl},children:t+1}),(0,d.jsxs)(`div`,{className:`ps-card-row`,children:[(0,d.jsx)(`span`,{className:`ps-card-icon`,children:e.animal?.icon}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`ps-card-name`,children:e.animal?.animal_name_lao}),(0,d.jsxs)(`div`,{className:`ps-card-cnt`,children:[e.count,` ຄັ້ງ`]})]})]}),(0,d.jsxs)(`div`,{className:`ps-bar-row`,children:[(0,d.jsx)(`div`,{className:`ps-bar-trk`,children:(0,d.jsx)(`div`,{className:`ps-bar-fill`,style:{width:`${e.percentage}%`,background:n.bar,boxShadow:`0 0 6px ${n.bar}55`}})}),(0,d.jsxs)(`span`,{className:`ps-bar-pct`,style:{color:n.lbl},children:[e.percentage,`%`]})]})]},e.animal?.animal_id)})}):(0,d.jsx)(`div`,{className:`ps-pred-grid`,children:(0,d.jsx)(`div`,{className:`ps-no-data`,children:`ບໍ່ມີສະຖິຕິການອອກຊ້ຳກັນພຽງພໍ`})})]}):(0,d.jsxs)(`div`,{className:`ps-idle`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined ps-idle-icon`,children:`query_stats`}),(0,d.jsx)(`p`,{className:`ps-idle-txt`,children:`ເລືອກນາມສັດເພື່ອເບິ່ງສະຖິຕິ`})]})})]})]})]})}var z=`
  /* ── Root card ── */
  .cp-root {
    position: relative;
    background: linear-gradient(160deg, #0f0a1e 0%, #130d24 50%, #0a0715 100%);
    border: 1px solid rgba(167,139,250,0.15);
    border-radius: 24px;
    overflow: hidden;
  }

  /* Ticket perforated top edge */
  .cp-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg,
      transparent 3%, #7c3aed 3%, #7c3aed 7%, transparent 7%,
      transparent 10%, #a78bfa 10%, #a78bfa 14%, transparent 14%,
      transparent 17%, #7c3aed 17%, #7c3aed 21%, transparent 21%,
      transparent 24%, #a78bfa 24%, #a78bfa 28%, transparent 28%,
      transparent 31%, #7c3aed 31%, #7c3aed 35%, transparent 35%,
      transparent 38%, #f59e0b 38%, #f59e0b 42%, transparent 42%,
      transparent 45%, #fbbf24 45%, #fbbf24 49%, transparent 49%,
      transparent 52%, #f59e0b 52%, #f59e0b 56%, transparent 56%,
      transparent 59%, #fbbf24 59%, #fbbf24 63%, transparent 63%,
      transparent 66%, #f59e0b 66%, #f59e0b 70%, transparent 70%,
      transparent 73%, #7c3aed 73%, #7c3aed 77%, transparent 77%,
      transparent 80%, #a78bfa 80%, #a78bfa 84%, transparent 84%,
      transparent 87%, #7c3aed 87%, #7c3aed 91%, transparent 91%,
      transparent 94%, #a78bfa 94%, #a78bfa 98%, transparent 98%
    );
  }

  /* Background glows */
  .cp-glow-purple {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    top: -80px; left: -80px;
    background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }
  .cp-glow-gold {
    position: absolute;
    width: 260px; height: 260px;
    border-radius: 50%;
    bottom: -60px; right: -60px;
    background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%);
    filter: blur(36px);
    pointer-events: none;
  }
  .cp-glow-mid {
    position: absolute;
    width: 180px; height: 180px;
    border-radius: 50%;
    top: 40%; left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
    filter: blur(32px);
    pointer-events: none;
  }

  /* Sparkle deco star */
  .cp-star {
    position: absolute;
    pointer-events: none;
    opacity: 0.18;
    animation: cp-twinkle 3s ease-in-out infinite;
  }
  .cp-star::before {
    content: '✦';
    font-size: 12px;
    color: #fbbf24;
  }
  .cp-star:nth-child(2) { animation-delay: 1.1s; }
  .cp-star:nth-child(3) { animation-delay: 2.2s; }
  @keyframes cp-twinkle {
    0%, 100% { opacity: 0.12; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(1.4); }
  }

  /* ── Header icon box ── */
  .cp-icon-box {
    width: 40px; height: 40px; border-radius: 14px;
    background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
    flex-shrink: 0;
  }

  /* ── Section labels ── */
  .cp-section-label {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(167,139,250,0.7);
  }
  .cp-section-label-gold {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(251,191,36,0.75);
  }

  /* ── Search zone ── */
  .cp-search-zone {
    background: rgba(124,58,237,0.07);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 18px;
    padding: 18px;
  }

  .cp-input-wrap {
    position: relative;
    flex: 1; max-width: 200px;
  }
  .cp-input {
    width: 100%;
    background: rgba(10,7,21,0.8);
    border: 1.5px solid rgba(124,58,237,0.3);
    border-radius: 14px;
    padding: 12px 16px 12px 44px;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.3em;
    color: #e9d5ff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cp-input::placeholder {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.04em;
    color: rgba(167,139,250,0.4);
  }
  .cp-input:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.12);
  }
  .cp-input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: rgba(139,92,246,0.55);
    font-size: 20px;
    pointer-events: none;
  }

  /* Query badge */
  .cp-query-badge {
    background: rgba(124,58,237,0.12);
    border: 1.5px solid rgba(124,58,237,0.25);
    border-radius: 14px;
    padding: 8px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .cp-query-num {
    font-size: 28px; font-weight: 900;
    background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; letter-spacing: 0.12em;
  }

  /* Clear button */
  .cp-clear-btn {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.15);
    border-radius: 10px;
    padding: 6px 12px;
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
    color: rgba(252,165,165,0.7);
    cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .cp-clear-btn:hover {
    background: rgba(239,68,68,0.16);
    border-color: rgba(239,68,68,0.3);
    color: #fca5a5;
  }

  /* ── Lottery ball ── */
  .cp-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; flex-shrink: 0;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25);
  }
  .cp-ball::after {
    content: '';
    position: absolute;
    top: 10%; left: 15%; width: 40%; height: 30%;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    filter: blur(4px);
  }

  /* Ball sizes */
  .cp-ball-lg {
    width: 52px; height: 52px; font-size: 20px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.28);
  }
  .cp-ball-md {
    width: 44px; height: 44px; font-size: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25);
  }
  .cp-ball-sm {
    width: 38px; height: 38px; font-size: 14px;
    box-shadow: 0 3px 9px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.22);
  }

  /* Ball colors - purple tones for search results */
  .cp-ball-p1 { background: linear-gradient(145deg, #6d28d9 0%, #4c1d95 100%); color: #fff; }
  .cp-ball-p2 { background: linear-gradient(145deg, #7c3aed 0%, #5b21b6 100%); color: #fff; }
  .cp-ball-p3 { background: linear-gradient(145deg, #8b5cf6 0%, #6d28d9 100%); color: #fff; }
  .cp-ball-p4 { background: linear-gradient(145deg, #a78bfa 0%, #7c3aed 100%); color: #fff; }
  .cp-ball-p5 { background: linear-gradient(145deg, #c4b5fd 0%, #8b5cf6 100%); color: #4c1d95; }
  .cp-ball-def { background: linear-gradient(145deg, #2d2060 0%, #1e1445 100%); color: rgba(167,139,250,0.7); }

  /* Ball colors - gold tones for hot pairs */
  .cp-ball-g1 { background: linear-gradient(145deg, #d97706 0%, #92400e 100%); color: #fff; }
  .cp-ball-g2 { background: linear-gradient(145deg, #f59e0b 0%, #b45309 100%); color: #fff; }
  .cp-ball-g3 { background: linear-gradient(145deg, #fbbf24 0%, #d97706 100%); color: #78350f; }
  .cp-ball-g4 { background: linear-gradient(145deg, #fcd34d 0%, #f59e0b 100%); color: #78350f; }
  .cp-ball-g5 { background: linear-gradient(145deg, #fde68a 0%, #fbbf24 100%); color: #92400e; }
  .cp-ball-gneutral { background: linear-gradient(145deg, #44350d 0%, #2a1f07 100%); color: rgba(251,191,36,0.6); }

  /* ── Search result row ── */
  .cp-result-row {
    background: rgba(124,58,237,0.05);
    border: 1px solid rgba(124,58,237,0.10);
    border-radius: 14px;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 12px;
    transition: background 0.15s, border-color 0.15s;
  }
  .cp-result-row:hover {
    background: rgba(124,58,237,0.09);
    border-color: rgba(124,58,237,0.2);
  }

  /* Result progress bar */
  .cp-bar-track {
    flex: 1; height: 5px;
    background: rgba(124,58,237,0.1);
    border-radius: 9999px;
    overflow: hidden;
    min-width: 0;
  }
  .cp-bar-fill-p {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(90deg, #7c3aed, #a78bfa);
    transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── Hot pairs section ── */
  .cp-gold-section {
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 18px;
    padding: 18px;
  }

  /* Hot pair card */
  .cp-pair-card {
    background: rgba(10,7,21,0.65);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 14px;
    padding: 10px 12px;
    display: flex; align-items: center; gap: 8px;
    cursor: pointer;
    transition: all 0.18s;
    position: relative; overflow: hidden;
  }
  .cp-pair-card:hover {
    border-color: rgba(245,158,11,0.35);
    background: rgba(245,158,11,0.06);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(245,158,11,0.10);
  }

  /* Shimmer on top 3 gold cards */
  .cp-pair-card-shimmer::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(105deg, transparent 40%, rgba(251,191,36,0.08) 50%, transparent 60%);
    animation: cp-shimmer 3s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes cp-shimmer {
    0%   { left: -100%; }
    100% { left: 150%; }
  }

  /* Arrow connector between pair numbers */
  .cp-arrow {
    flex-shrink: 0;
    display: flex; align-items: center;
    color: rgba(251,191,36,0.35);
    font-size: 18px;
    transition: color 0.18s;
  }
  .cp-pair-card:hover .cp-arrow { color: rgba(251,191,36,0.7); }

  /* Gold progress bar */
  .cp-bar-track-g {
    flex: 1; height: 4px;
    background: rgba(245,158,11,0.08);
    border-radius: 9999px;
    overflow: hidden;
    min-width: 0;
  }
  .cp-bar-fill-g {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(90deg, #d97706, #fbbf24);
    transition: width 0.5s ease;
  }

  /* Rank numeral */
  .cp-rank {
    font-size: 10px; font-weight: 900;
    color: rgba(251,191,36,0.4);
    width: 14px; text-align: center; flex-shrink: 0;
  }

  /* ── Empty state ── */
  .cp-empty {
    padding: 36px 0;
    text-align: center;
    color: rgba(167,139,250,0.4);
    font-size: 13px;
  }

  /* ── Loading pulse ── */
  .cp-loading {
    background: linear-gradient(160deg, #0f0a1e 0%, #130d24 100%);
    border: 1px solid rgba(167,139,250,0.1);
    border-radius: 24px;
    padding: 32px 24px;
  }
  .cp-pulse {
    display: flex; gap: 8px; align-items: center;
  }
  .cp-pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #7c3aed;
    animation: cp-bounce 1.2s ease-in-out infinite;
  }
  .cp-pulse-dot:nth-child(2) { animation-delay: 0.2s; background: #a78bfa; }
  .cp-pulse-dot:nth-child(3) { animation-delay: 0.4s; background: #f59e0b; }
  @keyframes cp-bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40%           { transform: scale(1.2); opacity: 1; }
  }

  /* Divider */
  .cp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(167,139,250,0.12), rgba(245,158,11,0.12), transparent);
  }
`,B=[`cp-ball-p1`,`cp-ball-p2`,`cp-ball-p3`,`cp-ball-p4`,`cp-ball-p5`],V=[`cp-ball-g1`,`cp-ball-g2`,`cp-ball-g3`,`cp-ball-g4`,`cp-ball-g5`];function H(e){return B[e]??`cp-ball-def`}function U(e){return V[e]??`cp-ball-gneutral`}function W({timeframe:e}){let{stats:t,loading:n}=c(e),[r,i]=(0,u.useState)(``),a=r.replace(/\D/g,``).slice(0,2),o=(0,u.useMemo)(()=>{if(!t?.pairsTracker||a.length<2)return null;let e=t.pairsTracker[a]??{},n=Object.values(e).reduce((e,t)=>e+t,0);return n===0?[]:Object.entries(e).map(([e,t])=>({nextNum:e,count:t,pct:Math.round(t/n*100)})).sort((e,t)=>t.count-e.count)},[t,a]),{hotPairs:s=[]}=t??{},l=s[0]?.count||1,f=e=>{i(e.target.value.replace(/\D/g,``).slice(0,2))};if(n||!t)return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:z}),(0,d.jsx)(`div`,{className:`cp-loading`,children:(0,d.jsxs)(`div`,{className:`cp-pulse`,children:[(0,d.jsx)(`div`,{className:`cp-pulse-dot`}),(0,d.jsx)(`div`,{className:`cp-pulse-dot`}),(0,d.jsx)(`div`,{className:`cp-pulse-dot`}),(0,d.jsx)(`span`,{style:{color:`rgba(167,139,250,0.5)`,fontSize:13,marginLeft:8},children:`ກຳລັງໂຫຼດ...`})]})})]});let p=o?o.reduce((e,t)=>e+t.count,0):0;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:z}),(0,d.jsxs)(`div`,{className:`cp-root p-6 sm:p-8 space-y-6`,children:[(0,d.jsx)(`div`,{className:`cp-glow-purple`}),(0,d.jsx)(`div`,{className:`cp-glow-gold`}),(0,d.jsx)(`div`,{className:`cp-glow-mid`}),(0,d.jsx)(`div`,{className:`cp-star`,style:{top:`18%`,right:`12%`}}),(0,d.jsx)(`div`,{className:`cp-star`,style:{top:`55%`,right:`6%`,animationDelay:`1.1s`}}),(0,d.jsx)(`div`,{className:`cp-star`,style:{top:`75%`,left:`8%`,animationDelay:`2.2s`}}),(0,d.jsxs)(`div`,{className:`flex items-center gap-3 relative z-10`,children:[(0,d.jsx)(`div`,{className:`cp-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:20,fontVariationSettings:`'FILL' 1`},children:`swap_horiz`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{style:{fontSize:17,fontWeight:900,letterSpacing:`-0.01em`,background:`linear-gradient(90deg, #c4b5fd 0%, #e9d5ff 50%, #fde68a 100%)`,WebkitBackgroundClip:`text`,WebkitTextFillColor:`transparent`,backgroundClip:`text`},children:`ສະຖິຕິຈັບຄູ່ຕົວເລກ`}),(0,d.jsx)(`p`,{style:{fontSize:11,color:`rgba(167,139,250,0.55)`,marginTop:1},children:`Consecutive Pairs · ວິເຄາະລໍາດັບ`})]}),(0,d.jsx)(`div`,{style:{marginLeft:`auto`,background:`linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.08) 100%)`,border:`1px solid rgba(251,191,36,0.25)`,borderRadius:20,padding:`4px 12px`,fontSize:10,fontWeight:900,letterSpacing:`0.12em`,color:`#fbbf24`},children:`✦ LIVE`})]}),(0,d.jsxs)(`div`,{className:`cp-search-zone relative z-10`,children:[(0,d.jsx)(`p`,{className:`cp-section-label mb-3`,children:`✦ ຄົ້ນຫາ — ເລກໃດອອກຕາມ?`}),(0,d.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,d.jsxs)(`div`,{className:`cp-input-wrap`,children:[(0,d.jsx)(`span`,{className:`cp-input-icon material-symbols-outlined`,children:`search`}),(0,d.jsx)(`input`,{type:`text`,inputMode:`numeric`,maxLength:2,value:r,onChange:f,placeholder:`ພິມ 2 ຕົວ (07)`,className:`cp-input`})]}),a.length===2&&(0,d.jsxs)(`div`,{className:`cp-query-badge`,children:[(0,d.jsx)(`span`,{style:{fontSize:11,color:`rgba(167,139,250,0.55)`},children:`ຫຼັງ`}),(0,d.jsx)(`div`,{className:`cp-ball cp-ball-md cp-ball-p1`,style:{width:44,height:44,fontSize:18},children:a}),(0,d.jsx)(`span`,{style:{fontSize:11,color:`rgba(167,139,250,0.55)`},children:`ອອກ…`})]}),a.length===2&&(0,d.jsxs)(`button`,{onClick:()=>i(``),className:`cp-clear-btn`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:14},children:`close`}),`ລ້າງ`]})]}),o!==null&&(0,d.jsx)(`div`,{className:`mt-4`,children:o.length===0?(0,d.jsxs)(`div`,{className:`cp-empty`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:36,display:`block`,marginBottom:6},children:`search_off`}),`ເລກ `,(0,d.jsx)(`strong`,{style:{color:`#c4b5fd`},children:a}),` ຍັງບໍ່ເຄີຍເຫັນໃນຂໍ້ມູນ`]}):(0,d.jsxs)(`div`,{className:`space-y-2`,children:[(0,d.jsxs)(`p`,{className:`cp-section-label mb-3`,children:[`ລໍາດັບເລກທີ່ຕາມຫຼັງ`,` `,(0,d.jsx)(`span`,{style:{color:`#c4b5fd`},children:a}),` `,`— `,p,` ຄັ້ງ`]}),o.map((e,t)=>{let n=H(t),r=o[0].count,i=Math.round(e.count/r*100);return(0,d.jsxs)(`div`,{className:`cp-result-row`,children:[(0,d.jsx)(`span`,{style:{width:20,textAlign:`center`,fontSize:10,fontWeight:900,color:t<3?`rgba(167,139,250,0.8)`:`rgba(167,139,250,0.3)`,flexShrink:0},children:t+1}),(0,d.jsx)(`div`,{className:`cp-ball cp-ball-sm ${n}`,children:e.nextNum}),(0,d.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,marginBottom:4},children:[(0,d.jsxs)(`span`,{style:{fontSize:11,color:`rgba(167,139,250,0.55)`},children:[e.pct,`%`]}),(0,d.jsxs)(`span`,{style:{fontSize:12,fontWeight:900,color:`#e9d5ff`},children:[e.count,` ຄັ້ງ`]})]}),(0,d.jsx)(`div`,{className:`cp-bar-track`,children:(0,d.jsx)(`div`,{className:`cp-bar-fill-p`,style:{width:`${i}%`}})})]})]},e.nextNum)})]})})]}),o&&o.length>0&&(0,d.jsx)(`div`,{className:`cp-divider`}),(0,d.jsxs)(`div`,{className:`cp-gold-section relative z-10`,children:[(0,d.jsxs)(`div`,{className:`flex items-center justify-between mb-4`,children:[(0,d.jsx)(`p`,{className:`cp-section-label-gold`,children:`✦ Top 10 — ຄູ່ທີ່ຮ້ອນທີ່ສຸດ`}),(0,d.jsx)(`span`,{style:{fontSize:10,fontWeight:800,letterSpacing:`0.06em`,color:`rgba(251,191,36,0.5)`,background:`rgba(245,158,11,0.08)`,border:`1px solid rgba(245,158,11,0.15)`,borderRadius:8,padding:`3px 8px`},children:`ALL TIME`})]}),s.length===0?(0,d.jsx)(`div`,{className:`cp-empty`,style:{color:`rgba(251,191,36,0.35)`},children:`ຍັງບໍ່ມີຂໍ້ມູນພຽງພໍ`}):(0,d.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-2`,children:s.map((e,t)=>{let n=U(t),r=Math.round(e.count/l*100);return(0,d.jsxs)(`div`,{className:`cp-pair-card${t<3?` cp-pair-card-shimmer`:``}`,onClick:()=>i(e.currentNum),title:`ກົດເພື່ອຄົ້ນຫາ ${e.currentNum}`,children:[(0,d.jsx)(`span`,{className:`cp-rank`,children:t+1}),(0,d.jsx)(`div`,{className:`cp-ball cp-ball-sm cp-ball-gneutral`,children:e.currentNum}),(0,d.jsx)(`span`,{className:`cp-arrow material-symbols-outlined`,children:`arrow_right_alt`}),(0,d.jsx)(`div`,{className:`cp-ball cp-ball-sm ${n}`,children:e.nextNum}),(0,d.jsx)(`div`,{className:`cp-bar-track-g`,children:(0,d.jsx)(`div`,{className:`cp-bar-fill-g`,style:{width:`${r}%`}})}),(0,d.jsx)(`span`,{style:{fontSize:13,fontWeight:900,color:t<3?`#fbbf24`:`rgba(251,191,36,0.6)`,flexShrink:0,minWidth:24,textAlign:`right`},children:e.count})]},`${e.currentNum}-${e.nextNum}`)})})]})]})]})}var G=`
  /* ── Root ── */
  .tm-root {
    position: relative;
    background: linear-gradient(158deg, #060911 0%, #080c17 52%, #050810 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .tm-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.009) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.009) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .tm-orb-green {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    top: -110px; left: -70px; pointer-events: none;
    background: radial-gradient(circle, rgba(22,163,74,0.11) 0%, transparent 68%);
  }
  .tm-orb-red {
    position: absolute; width: 280px; height: 280px; border-radius: 50%;
    bottom: -80px; right: -60px; pointer-events: none;
    background: radial-gradient(circle, rgba(220,38,38,0.09) 0%, transparent 68%);
  }

  /* ── Header ── */
  .tm-hdr {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 22px; position: relative; z-index: 10;
  }
  .tm-icon-box {
    width: 44px; height: 44px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #14532d 0%, #15803d 50%, #4ade80 100%);
    box-shadow: 0 0 24px rgba(22,163,74,0.50), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .tm-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .tm-sub { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* ── Section headers ── */
  .tm-sec-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .tm-sec-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .tm-sec-lbl  { font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
  .tm-sec-cnt  {
    font-size: 11px; font-weight: 900; margin-left: auto;
    padding: 2px 9px; border-radius: 20px;
  }

  /* ── Items list ── */
  .tm-list { display: flex; flex-direction: column; gap: 6px; }

  /* ── Single item row ── */
  .tm-item {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; padding: 10px 12px; border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.020);
    transition: all 0.18s; position: relative; overflow: hidden;
  }
  .tm-item.tm-up {
    border-color: rgba(22,163,74,0.18);
    background: rgba(22,163,74,0.05);
  }
  .tm-item.tm-up:hover {
    background: rgba(22,163,74,0.09);
    border-color: rgba(74,222,128,0.28);
    transform: translateY(-1px);
  }
  .tm-item.tm-dn {
    border-color: rgba(220,38,38,0.18);
    background: rgba(220,38,38,0.05);
  }
  .tm-item.tm-dn:hover {
    background: rgba(220,38,38,0.09);
    border-color: rgba(248,113,113,0.28);
    transform: translateY(-1px);
  }
  /* top-1 shimmer */
  .tm-item.tm-top-item::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    animation: tm-shimmer 2.8s ease-in-out infinite;
  }
  @keyframes tm-shimmer {
    0%   { left: -120%; }
    100% { left: 200%; }
  }

  /* ── Lottery balls ── */
  .tm-ball {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .tm-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }
  .tm-ball-green {
    background: radial-gradient(circle at 35% 30%, #86efac 0%, #16a34a 42%, #14532d 78%, #052e16 100%);
    box-shadow: 0 4px 14px rgba(22,163,74,0.48), inset 0 -3px 6px rgba(0,0,0,0.22);
  }
  .tm-ball-red {
    background: radial-gradient(circle at 35% 30%, #fca5a5 0%, #dc2626 42%, #7f1d1d 78%, #450a0a 100%);
    box-shadow: 0 4px 14px rgba(220,38,38,0.48), inset 0 -3px 6px rgba(0,0,0,0.22);
  }

  /* ── Arrow animation ── */
  .tm-arrow-up {
    font-size: 16px; color: rgba(74,222,128,0.78); flex-shrink: 0;
    animation: tm-bounce-up 1.7s ease-in-out infinite;
  }
  .tm-arrow-dn {
    font-size: 16px; color: rgba(248,113,113,0.78); flex-shrink: 0;
    animation: tm-bounce-dn 1.7s ease-in-out infinite;
  }
  @keyframes tm-bounce-up {
    0%, 100% { transform: translateY(0);   opacity: 0.65; }
    50%       { transform: translateY(-4px); opacity: 1.00; }
  }
  @keyframes tm-bounce-dn {
    0%, 100% { transform: translateY(0);   opacity: 0.65; }
    50%       { transform: translateY(4px);  opacity: 1.00; }
  }

  /* ── Info text ── */
  .tm-info { flex: 1; min-width: 0; }
  .tm-dir-up  { font-size: 11px; font-weight: 900; color: rgba(74,222,128,0.88); }
  .tm-dir-dn  { font-size: 11px; font-weight: 900; color: rgba(248,113,113,0.88); }
  .tm-compare { font-size: 10px; color: rgba(255,255,255,0.28); font-weight: 600; margin-top: 2px; }

  /* ── Momentum % badge ── */
  .tm-badge {
    font-size: 13px; font-weight: 900;
    padding: 5px 10px; border-radius: 10px; white-space: nowrap; flex-shrink: 0;
  }
  .tm-badge-green {
    background: rgba(22,163,74,0.14);
    color: rgba(74,222,128,0.92);
    border: 1px solid rgba(74,222,128,0.18);
  }
  .tm-badge-red {
    background: rgba(220,38,38,0.14);
    color: rgba(248,113,113,0.92);
    border: 1px solid rgba(248,113,113,0.18);
  }

  /* ── Empty ── */
  .tm-empty {
    font-size: 12px; color: rgba(255,255,255,0.22);
    text-align: center; padding: 18px 0; font-weight: 700;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 12px;
  }

  /* ── Footer ── */
  .tm-footer {
    display: flex; align-items: center; gap: 6px;
    margin-top: 20px; position: relative; z-index: 10;
  }
  .tm-footer-txt { font-size: 10px; color: rgba(255,255,255,0.20); font-weight: 600; }
`;function K({item:e,type:t,isFirst:n}){let r=t===`rising`,i=(Math.abs(e.momentum)*100).toFixed(0);return(0,d.jsxs)(`div`,{className:`tm-item ${r?`tm-up`:`tm-dn`} ${n?`tm-top-item`:``}`,children:[(0,d.jsx)(`div`,{className:`tm-ball ${r?`tm-ball-green`:`tm-ball-red`}`,children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:e.number})}),(0,d.jsx)(`span`,{className:`material-symbols-outlined ${r?`tm-arrow-up`:`tm-arrow-dn`}`,children:r?`trending_up`:`trending_down`}),(0,d.jsxs)(`div`,{className:`tm-info`,children:[(0,d.jsx)(`div`,{className:r?`tm-dir-up`:`tm-dir-dn`,children:r?`▲ ກຳລັງຂຶ້ນ`:`▼ ກຳລັງລົງ`}),(0,d.jsxs)(`div`,{className:`tm-compare`,children:[e.recentCount,`/5 vs `,e.baselineCount,`/20`]})]}),(0,d.jsxs)(`span`,{className:`tm-badge ${r?`tm-badge-green`:`tm-badge-red`}`,children:[r?`+`:``,i,`%`]})]})}function ce({timeframe:e}){let{stats:t,loading:n}=c(e);if(n||!t)return null;let{rising:r,falling:i}=t.trendMomentum;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:G}),(0,d.jsxs)(`div`,{className:`tm-root p-6 sm:p-8`,children:[(0,d.jsx)(`div`,{className:`tm-mesh`}),(0,d.jsx)(`div`,{className:`tm-orb-green`}),(0,d.jsx)(`div`,{className:`tm-orb-red`}),(0,d.jsxs)(`div`,{className:`tm-hdr`,children:[(0,d.jsx)(`div`,{className:`tm-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:20,fontVariationSettings:`'FILL' 1`},children:`trending_up`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`tm-title`,children:`ແນວໂນ້ມ Momentum`}),(0,d.jsx)(`p`,{className:`tm-sub`,children:`5 ງວດຫຼ້າສຸດ vs 20 ງວດ`})]})]}),(0,d.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-6`,style:{position:`relative`,zIndex:10},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`tm-sec-hdr`,children:[(0,d.jsx)(`span`,{className:`tm-sec-dot`,style:{background:`#4ade80`,boxShadow:`0 0 8px rgba(74,222,128,0.65)`}}),(0,d.jsx)(`span`,{className:`tm-sec-lbl`,style:{color:`rgba(74,222,128,0.60)`},children:`ເລກຂຶ້ນ`}),(0,d.jsx)(`span`,{className:`tm-sec-cnt`,style:{background:`rgba(22,163,74,0.14)`,color:`rgba(74,222,128,0.85)`,border:`1px solid rgba(74,222,128,0.18)`},children:r.length})]}),r.length===0?(0,d.jsx)(`div`,{className:`tm-empty`,children:`ບໍ່ມີ momentum ໃໝ່`}):(0,d.jsx)(`div`,{className:`tm-list`,children:r.map((e,t)=>(0,d.jsx)(K,{item:e,type:`rising`,isFirst:t===0},e.number))})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`tm-sec-hdr`,children:[(0,d.jsx)(`span`,{className:`tm-sec-dot`,style:{background:`#f87171`,boxShadow:`0 0 8px rgba(248,113,113,0.65)`}}),(0,d.jsx)(`span`,{className:`tm-sec-lbl`,style:{color:`rgba(248,113,113,0.60)`},children:`ເລກລົງ`}),(0,d.jsx)(`span`,{className:`tm-sec-cnt`,style:{background:`rgba(220,38,38,0.14)`,color:`rgba(248,113,113,0.85)`,border:`1px solid rgba(248,113,113,0.18)`},children:i.length})]}),i.length===0?(0,d.jsx)(`div`,{className:`tm-empty`,children:`ບໍ່ມີ momentum ທີ່ຫຼຸດລົງ`}):(0,d.jsx)(`div`,{className:`tm-list`,children:i.map((e,t)=>(0,d.jsx)(K,{item:e,type:`falling`,isFirst:t===0},e.number))})]})]}),(0,d.jsxs)(`div`,{className:`tm-footer`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:12,color:`rgba(255,255,255,0.20)`,flexShrink:0},children:`info`}),(0,d.jsx)(`span`,{className:`tm-footer-txt`,children:`ເທียบ rate ການອອກ 5 ງວດຫຼ້າສຸດ vs 20 ງວດ — ຄ່າ +/– ຄື % ຄວາມຕ່າງ`})]})]})]})}var le=e=>e>=2?{tier:`critical`,ball:`radial-gradient(circle at 35% 30%, #ff6b6b 0%, #dc2626 42%, #7f1d1d 100%)`,glow:`rgba(220,38,38,0.50)`,neon:`#ef4444`,bar:`linear-gradient(90deg, #dc2626, #ef4444, #ff6b6b)`,badge:{bg:`rgba(220,38,38,0.14)`,border:`rgba(220,38,38,0.35)`,text:`#f87171`},row:`rgba(220,38,38,0.06)`,rowBorder:`rgba(220,38,38,0.18)`,label:`rgba(248,113,113,0.85)`}:e>=1.5?{tier:`high`,ball:`radial-gradient(circle at 35% 30%, #ffd060 0%, #f59e0b 42%, #b45309 100%)`,glow:`rgba(245,158,11,0.45)`,neon:`#f59e0b`,bar:`linear-gradient(90deg, #d97706, #f59e0b, #fcd34d)`,badge:{bg:`rgba(245,158,11,0.13)`,border:`rgba(245,158,11,0.32)`,text:`#fbbf24`},row:`rgba(245,158,11,0.05)`,rowBorder:`rgba(245,158,11,0.15)`,label:`rgba(251,191,36,0.85)`}:e>=1?{tier:`moderate`,ball:`radial-gradient(circle at 35% 30%, #60a5fa 0%, #2563eb 42%, #1e3a8a 100%)`,glow:`rgba(37,99,235,0.40)`,neon:`#3b82f6`,bar:`linear-gradient(90deg, #1d4ed8, #3b82f6, #93c5fd)`,badge:{bg:`rgba(59,130,246,0.12)`,border:`rgba(59,130,246,0.28)`,text:`#60a5fa`},row:`rgba(59,130,246,0.04)`,rowBorder:`rgba(59,130,246,0.12)`,label:`rgba(96,165,250,0.85)`}:{tier:`normal`,ball:`radial-gradient(circle at 35% 30%, #9ca3af 0%, #4b5563 42%, #1f2937 100%)`,glow:`rgba(75,85,99,0.30)`,neon:`#6b7280`,bar:`linear-gradient(90deg, #374151, #6b7280)`,badge:{bg:`rgba(107,114,128,0.10)`,border:`rgba(107,114,128,0.22)`,text:`#9ca3af`},row:`rgba(107,114,128,0.03)`,rowBorder:`rgba(107,114,128,0.10)`,label:`rgba(156,163,175,0.75)`},ue=`
  /* ── Root card ── */
  .ga-root {
    position: relative;
    background: linear-gradient(155deg, #0a0c18 0%, #0e1120 50%, #080a15 100%);
    border: 1px solid rgba(245,158,11,0.14);
    border-radius: 22px;
    overflow: hidden;
  }
  .ga-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(220,38,38,0.6) 20%, rgba(245,158,11,0.8) 40%,
      rgba(245,158,11,0.8) 60%, rgba(220,38,38,0.6) 80%,
      transparent 95%
    );
  }

  /* Ambient glows */
  .ga-glow-r {
    position: absolute; width: 250px; height: 250px;
    bottom: -80px; left: -60px;
    background: radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%);
    filter: blur(40px); pointer-events: none;
  }
  .ga-glow-a {
    position: absolute; width: 220px; height: 220px;
    top: -60px; right: -60px;
    background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
    filter: blur(36px); pointer-events: none;
  }

  /* ── Header ── */
  .ga-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .ga-hdr-left { display: flex; align-items: center; gap: 12px; }

  .ga-icon-box {
    width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
    background: linear-gradient(135deg, #b45309 0%, #f59e0b 55%, #fcd34d 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .ga-title {
    font-size: 15px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #fde68a 0%, #f59e0b 50%, #fbbf24 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ga-subtitle { font-size: 10px; font-weight: 700; color: rgba(245,158,11,0.45); letter-spacing: 0.1em; margin-top: 1px; }

  /* Legend */
  .ga-legend {
    display: none; align-items: center; gap: 12px;
    font-size: 9px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
  }
  @media (min-width: 640px) { .ga-legend { display: flex; } }
  .ga-legend-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    display: inline-block; margin-right: 4px;
  }
  .ga-legend-item { display: flex; align-items: center; color: rgba(255,255,255,0.28); white-space: nowrap; }

  /* ── Row ── */
  .ga-row {
    border-radius: 14px;
    border: 1px solid transparent;
    padding: 12px 14px;
    display: flex; align-items: center; gap: 12px;
    transition: transform 0.18s, box-shadow 0.18s;
    position: relative;
    overflow: hidden;
  }
  .ga-row:hover { transform: translateY(-1px); }

  /* Shimmer on critical rows */
  .ga-row-critical::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(105deg, transparent 40%, rgba(220,38,38,0.06) 50%, transparent 60%);
    animation: ga-row-shimmer 3.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes ga-row-shimmer {
    0%   { left: -100%; }
    100% { left: 150%; }
  }

  /* Rank numeral */
  .ga-rank {
    font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.20);
    width: 16px; text-align: center; flex-shrink: 0;
  }

  /* ── Lottery ball ── */
  .ga-ball {
    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 900;
    position: relative; overflow: hidden;
  }
  /* Specular highlight */
  .ga-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 42%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.50) 0%, transparent 70%);
    border-radius: 50%;
  }
  /* Pulse ring for critical */
  .ga-ball-pulse {
    position: absolute; inset: -6px; border-radius: 50%;
    border: 1.5px solid currentColor;
    animation: ga-pulse-ring 2s ease-out infinite;
    pointer-events: none;
  }
  @keyframes ga-pulse-ring {
    0%   { opacity: 0.6; transform: scale(1);    }
    100% { opacity: 0;   transform: scale(1.45); }
  }

  /* OVERDUE badge on critical */
  .ga-overdue-badge {
    position: absolute; top: -4px; right: -4px;
    font-size: 7px; font-weight: 900; letter-spacing: 0.06em;
    background: #dc2626; color: #fff;
    border-radius: 4px; padding: 1px 4px;
    z-index: 2; line-height: 1.4;
    animation: ga-badge-pop 1.5s ease-in-out infinite;
  }
  @keyframes ga-badge-pop {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.08); }
  }

  /* ── Bar ── */
  .ga-bar-track {
    flex: 1; min-width: 0;
  }
  .ga-bar-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .ga-missed-label { font-size: 11px; font-weight: 800; }
  .ga-avg-label    { font-size: 10px; color: rgba(255,255,255,0.25); font-weight: 600; }

  .ga-bar-bg {
    height: 5px; width: 100%;
    background: rgba(255,255,255,0.05);
    border-radius: 9999px; overflow: hidden;
  }
  .ga-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── Ratio badge ── */
  .ga-ratio {
    font-size: 13px; font-weight: 900; letter-spacing: -0.02em;
    padding: 5px 10px; border-radius: 9px;
    flex-shrink: 0; text-align: center;
  }
  .ga-count {
    font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.22);
    text-align: center; margin-top: 2px;
  }

  /* ── Footer note ── */
  .ga-note {
    display: flex; align-items: flex-start; gap: 6px;
    font-size: 10px; color: rgba(255,255,255,0.22);
    margin-top: 18px; line-height: 1.55;
  }

  /* Divider */
  .ga-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.10), transparent);
    margin: 3px 0;
  }
`;function de({timeframe:e}){let{stats:t,loading:n}=c(e);if(n||!t)return null;let{gapAnalysis:r}=t,i=r[0]?.missedRounds||1;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:ue}),(0,d.jsxs)(`div`,{className:`ga-root p-6 sm:p-7`,children:[(0,d.jsx)(`div`,{className:`ga-glow-r`}),(0,d.jsx)(`div`,{className:`ga-glow-a`}),(0,d.jsxs)(`div`,{className:`ga-hdr relative z-10`,children:[(0,d.jsxs)(`div`,{className:`ga-hdr-left`,children:[(0,d.jsx)(`div`,{className:`ga-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:20,fontVariationSettings:`'FILL' 1`},children:`hourglass_top`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`ga-title`,children:`Gap Analysis`}),(0,d.jsx)(`p`,{className:`ga-subtitle`,children:`OVERDUE NUMBERS · TOP 10`})]})]}),(0,d.jsx)(`div`,{className:`ga-legend`,children:[{color:`#ef4444`,label:`≥ 2×`},{color:`#f59e0b`,label:`≥ 1.5×`},{color:`#3b82f6`,label:`≥ 1×`}].map(e=>(0,d.jsxs)(`span`,{className:`ga-legend-item`,children:[(0,d.jsx)(`span`,{className:`ga-legend-dot`,style:{background:e.color}}),e.label]},e.label))})]}),(0,d.jsx)(`div`,{className:`space-y-2 relative z-10`,children:r.map(({number:e,count:t,missedRounds:n,expectedGap:r,overdueRatio:a},o)=>{let s=le(a),c=Math.round(n/i*100),l=s.tier===`critical`,u=s.tier===`high`;return(0,d.jsxs)(`div`,{children:[o>0&&(0,d.jsx)(`div`,{className:`ga-divider`}),(0,d.jsxs)(`div`,{className:`ga-row${l?` ga-row-critical`:``}`,style:{background:s.row,borderColor:s.rowBorder,boxShadow:l||u?`0 0 20px ${s.glow}18`:`none`},children:[(0,d.jsx)(`span`,{className:`ga-rank`,children:o+1}),(0,d.jsxs)(`div`,{style:{position:`relative`,flexShrink:0},children:[l&&(0,d.jsx)(`div`,{className:`ga-ball-pulse`,style:{color:s.neon}}),l&&(0,d.jsx)(`div`,{className:`ga-overdue-badge`,children:`HOT`}),(0,d.jsx)(`div`,{className:`ga-ball`,style:{background:s.ball,boxShadow:`0 4px 16px ${s.glow}, inset 0 -3px 6px rgba(0,0,0,0.30)`,color:l?`#fff`:u?`#78350f`:`#fff`},children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1,fontSize:14,fontWeight:900},children:e})})]}),(0,d.jsxs)(`div`,{className:`ga-bar-track`,children:[(0,d.jsxs)(`div`,{className:`ga-bar-top`,children:[(0,d.jsxs)(`span`,{className:`ga-missed-label`,style:{color:s.label},children:[`ບໍ່ອອກ `,n,` ງວດ`]}),(0,d.jsxs)(`span`,{className:`ga-avg-label`,children:[`ສະເລ່ຍ `,r,` ງວດ`]})]}),(0,d.jsx)(`div`,{className:`ga-bar-bg`,children:(0,d.jsx)(`div`,{className:`ga-bar-fill`,style:{width:`${c}%`,background:s.bar,boxShadow:`0 0 8px ${s.glow}`}})})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`ga-ratio`,style:{background:s.badge.bg,border:`1px solid ${s.badge.border}`,color:s.badge.text},children:[a.toFixed(1),`×`]}),(0,d.jsxs)(`div`,{className:`ga-count`,children:[`ອອກ `,t,`×`]})]})]})]},e)})}),(0,d.jsxs)(`p`,{className:`ga-note relative z-10`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:13,flexShrink:0,marginTop:1},children:`info`}),`ຄ່າ ×N = ເກີນຄ່າສະເລ່ຍ N ເທື່ອ — ຍິ່ງສູງ ຍິ່ງ "ເກີນ" ຄ່າໂດຍທຳມະດາ`]})]})]})}var fe=`
  /* ── Root ── */
  .rp-root {
    position: relative;
    background: linear-gradient(158deg, #070a16 0%, #090d1e 52%, #060812 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .rp-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.010) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.010) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .rp-orb-a {
    position: absolute; width: 280px; height: 280px; border-radius: 50%;
    top: -100px; right: -70px; pointer-events: none;
    background: radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 68%);
  }
  .rp-orb-b {
    position: absolute; width: 220px; height: 220px; border-radius: 50%;
    bottom: -70px; left: -50px; pointer-events: none;
    background: radial-gradient(circle, rgba(13,148,136,0.11) 0%, transparent 68%);
  }

  /* ── Header ── */
  .rp-hdr {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 22px; position: relative; z-index: 10;
  }
  .rp-icon-box {
    width: 44px; height: 44px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a78bfa 100%);
    box-shadow: 0 0 24px rgba(124,58,237,0.52), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .rp-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .rp-sub { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* ── Section header ── */
  .rp-sec-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; }
  .rp-sec-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .rp-sec-lbl  { font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }

  /* ══════════════ DOUBLES ══════════════ */
  .rp-doubles-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px;
  }
  .rp-dbl-card {
    border-radius: 13px; padding: 11px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.022);
    transition: all 0.18s; position: relative; overflow: hidden;
  }
  .rp-dbl-card.rp-dbl-hot {
    border-color: rgba(124,58,237,0.22);
    background: rgba(124,58,237,0.055);
  }
  .rp-dbl-card.rp-dbl-top {
    border-color: rgba(245,158,11,0.30);
    background: rgba(245,158,11,0.07);
  }
  .rp-dbl-card.rp-dbl-cold { opacity: 0.32; }
  .rp-dbl-card:hover:not(.rp-dbl-cold) {
    transform: translateY(-1px);
    background: rgba(124,58,237,0.09);
    border-color: rgba(124,58,237,0.28);
  }
  /* Shimmer on top card */
  .rp-dbl-card.rp-dbl-top::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(250,204,21,0.09), transparent);
    animation: rp-shimmer 2.6s ease-in-out infinite;
  }
  @keyframes rp-shimmer {
    0%   { left: -120%; }
    100% { left: 200%; }
  }

  .rp-dbl-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }

  /* Lottery ball */
  .rp-ball {
    width: 46px; height: 46px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .rp-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }
  .rp-ball-purple {
    background: radial-gradient(circle at 35% 30%, #c4b5fd 0%, #7c3aed 42%, #4c1d95 78%, #2e1065 100%);
    box-shadow: 0 4px 16px rgba(124,58,237,0.45), inset 0 -3px 6px rgba(0,0,0,0.25);
    color: #fff;
  }
  .rp-ball-gold {
    background: radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 42%, #b45309 78%, #78350f 100%);
    box-shadow: 0 4px 16px rgba(245,158,11,0.52), inset 0 -3px 6px rgba(0,0,0,0.22);
    color: #78350f;
  }
  .rp-ball-gray {
    background: radial-gradient(circle at 35% 30%, #475569 0%, #1e293b 42%, #0f172a 78%, #020617 100%);
    box-shadow: 0 2px 8px rgba(0,0,0,0.40), inset 0 -2px 4px rgba(0,0,0,0.30);
    color: rgba(255,255,255,0.35);
  }

  /* Crown above ball */
  .rp-crown-wrap { position: relative; }
  .rp-crown {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    font-size: 12px; line-height: 1; pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(250,204,21,0.80));
    animation: rp-crown-rock 2.2s ease-in-out infinite;
    z-index: 3;
  }
  @keyframes rp-crown-rock {
    0%, 100% { transform: translateX(-50%) rotate(-5deg); }
    50%       { transform: translateX(-50%) rotate(5deg); }
  }

  .rp-dbl-count { font-size: 21px; font-weight: 900; line-height: 1; color: rgba(255,255,255,0.88); }
  .rp-dbl-unit  { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.28); }
  .rp-dbl-pct   { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 2px; font-weight: 600; }

  /* Purple bar */
  .rp-bar-trk-pu { height: 4px; background: rgba(124,58,237,0.12); border-radius: 9999px; overflow: hidden; }
  .rp-bar-pu {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(to right, #7c3aed, #a78bfa);
    box-shadow: 0 0 7px rgba(167,139,250,0.55);
    transition: width 0.75s cubic-bezier(0.34,1.56,0.64,1);
  }
  .rp-bar-top {
    background: linear-gradient(to right, #d97706, #fcd34d);
    box-shadow: 0 0 7px rgba(250,204,21,0.55);
  }

  /* ══════════════ MIRRORS ══════════════ */
  .rp-mirrors-list { display: flex; flex-direction: column; gap: 6px; }
  .rp-mir-card {
    border-radius: 14px; padding: 12px 14px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.020);
    transition: all 0.18s;
    display: flex; align-items: center; gap: 12px;
    position: relative; overflow: hidden;
  }
  .rp-mir-card.rp-mir-top {
    border-color: rgba(45,212,191,0.18);
    background: rgba(13,148,136,0.055);
  }
  .rp-mir-card.rp-mir-top::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(45,212,191,0.06), transparent);
    animation: rp-shimmer 3s ease-in-out infinite;
  }
  .rp-mir-card:hover {
    background: rgba(13,148,136,0.08);
    border-color: rgba(45,212,191,0.22);
    transform: translateY(-1px);
  }

  /* Mirror pair balls */
  .rp-mir-pair { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
  .rp-mir-ball-a {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    background: radial-gradient(circle at 35% 30%, #67e8f9 0%, #0891b2 42%, #075985 80%, #0c4a6e 100%);
    box-shadow: 0 3px 12px rgba(8,145,178,0.42), inset 0 -2px 5px rgba(0,0,0,0.22);
  }
  .rp-mir-ball-b {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    background: radial-gradient(circle at 35% 30%, #5eead4 0%, #14b8a6 42%, #0f766e 80%, #134e4a 100%);
    box-shadow: 0 3px 12px rgba(20,184,166,0.42), inset 0 -2px 5px rgba(0,0,0,0.22);
  }
  .rp-mir-ball-a::after,
  .rp-mir-ball-b::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  .rp-mir-icon {
    font-size: 15px; color: rgba(45,212,191,0.55);
    animation: rp-mir-pulse 2s ease-in-out infinite;
  }
  @keyframes rp-mir-pulse {
    0%, 100% { opacity: 0.50; transform: scaleX(1);    }
    50%       { opacity: 0.95; transform: scaleX(1.18); }
  }

  /* Mirror stats */
  .rp-mir-stats { flex: 1; min-width: 0; }
  .rp-mir-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 5px;
  }
  .rp-mir-detail { font-size: 11px; font-weight: 700; color: rgba(45,212,191,0.60); }
  .rp-mir-pct    { font-size: 10px; font-weight: 900; color: rgba(45,212,191,0.82); }

  /* Teal bar */
  .rp-bar-trk-tl { height: 4px; background: rgba(13,148,136,0.12); border-radius: 9999px; overflow: hidden; }
  .rp-bar-tl {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(to right, #0d9488, #2dd4bf);
    box-shadow: 0 0 7px rgba(45,212,191,0.48);
    transition: width 0.75s cubic-bezier(0.34,1.56,0.64,1);
  }

  .rp-mir-total { font-size: 15px; font-weight: 900; color: rgba(45,212,191,0.78); flex-shrink: 0; }

  /* ── Footer ── */
  .rp-footer {
    display: flex; align-items: center; gap: 6px;
    margin-top: 20px; position: relative; z-index: 10;
  }
  .rp-footer-txt { font-size: 10px; color: rgba(255,255,255,0.20); font-weight: 600; }
`;function pe({timeframe:e}){let{stats:t,loading:n}=c(e);if(n||!t)return null;let{doubles:r,mirrors:i,totalTwoDigitCount:a}=t.repeatPatterns,o=r[0]?.count||1,s=i[0]?.total||1;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:fe}),(0,d.jsxs)(`div`,{className:`rp-root p-6 sm:p-8`,children:[(0,d.jsx)(`div`,{className:`rp-mesh`}),(0,d.jsx)(`div`,{className:`rp-orb-a`}),(0,d.jsx)(`div`,{className:`rp-orb-b`}),(0,d.jsxs)(`div`,{className:`rp-hdr`,children:[(0,d.jsx)(`div`,{className:`rp-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:20,fontVariationSettings:`'FILL' 1`},children:`pattern`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`rp-title`,children:`ຮູບແບບເລກຊ້ຳ & ສະລັບ`}),(0,d.jsx)(`p`,{className:`rp-sub`,children:`Repeat Pattern Detection`})]})]}),(0,d.jsxs)(`div`,{className:`grid grid-cols-1 xl:grid-cols-2 gap-6`,style:{position:`relative`,zIndex:10},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`rp-sec-hdr`,children:[(0,d.jsx)(`span`,{className:`rp-sec-dot`,style:{background:`#a78bfa`,boxShadow:`0 0 8px rgba(167,139,250,0.65)`}}),(0,d.jsx)(`span`,{className:`rp-sec-lbl`,style:{color:`rgba(167,139,250,0.58)`},children:`ເລກຄູ່ (11, 22, 33…)`})]}),(0,d.jsx)(`div`,{className:`rp-doubles-grid`,children:r.map(({number:e,count:t,pct:n},r)=>{let i=Math.round(t/o*100),a=r===0&&t>0,s=t>0&&!a,c=t===0;return(0,d.jsxs)(`div`,{className:`rp-dbl-card ${a?`rp-dbl-top`:``} ${s?`rp-dbl-hot`:``} ${c?`rp-dbl-cold`:``}`,children:[(0,d.jsxs)(`div`,{className:`rp-dbl-row`,children:[(0,d.jsxs)(`div`,{className:`rp-crown-wrap`,children:[a&&(0,d.jsx)(`div`,{className:`rp-crown`,children:`✦`}),(0,d.jsx)(`div`,{className:`rp-ball ${a?`rp-ball-gold`:c?`rp-ball-gray`:`rp-ball-purple`}`,children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:e})})]}),(0,d.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`span`,{className:`rp-dbl-count`,children:t}),(0,d.jsx)(`span`,{className:`rp-dbl-unit`,children:` ຄັ້ງ`})]}),(0,d.jsxs)(`div`,{className:`rp-dbl-pct`,children:[n,`%`]})]})]}),(0,d.jsx)(`div`,{className:`rp-bar-trk-pu`,children:(0,d.jsx)(`div`,{className:`rp-bar-pu ${a?`rp-bar-top`:``}`,style:{width:`${i}%`}})})]},e)})})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`rp-sec-hdr`,children:[(0,d.jsx)(`span`,{className:`rp-sec-dot`,style:{background:`#2dd4bf`,boxShadow:`0 0 8px rgba(45,212,191,0.65)`}}),(0,d.jsx)(`span`,{className:`rp-sec-lbl`,style:{color:`rgba(45,212,191,0.58)`},children:`ເລກສະລັບ (12 ↔ 21)`})]}),(0,d.jsx)(`div`,{className:`rp-mirrors-list`,children:i.map(({pair:e,counts:t,total:n},r)=>{let i=Math.round(n/s*100),[o,c]=e,[l,u]=t,f=a>0?(n/a*100).toFixed(1):`0.0`;return(0,d.jsxs)(`div`,{className:`rp-mir-card ${r===0?`rp-mir-top`:``}`,children:[(0,d.jsxs)(`div`,{className:`rp-mir-pair`,children:[(0,d.jsx)(`div`,{className:`rp-mir-ball-a`,children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:o})}),(0,d.jsx)(`span`,{className:`material-symbols-outlined rp-mir-icon`,children:`sync_alt`}),(0,d.jsx)(`div`,{className:`rp-mir-ball-b`,children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:c})})]}),(0,d.jsxs)(`div`,{className:`rp-mir-stats`,children:[(0,d.jsxs)(`div`,{className:`rp-mir-meta`,children:[(0,d.jsxs)(`span`,{className:`rp-mir-detail`,children:[o,`:`,l,`ຄັ້ງ \xA0·\xA0 `,c,`:`,u,`ຄັ້ງ`]}),(0,d.jsxs)(`span`,{className:`rp-mir-pct`,children:[f,`%`]})]}),(0,d.jsx)(`div`,{className:`rp-bar-trk-tl`,children:(0,d.jsx)(`div`,{className:`rp-bar-tl`,style:{width:`${i}%`}})})]}),(0,d.jsx)(`span`,{className:`rp-mir-total`,children:n})]},`${o}-${c}`)})})]})]}),(0,d.jsxs)(`div`,{className:`rp-footer`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:12,color:`rgba(255,255,255,0.20)`,flexShrink:0},children:`info`}),(0,d.jsxs)(`span`,{className:`rp-footer-txt`,children:[`ອ້າງອີງຈາກ `,a,` ງວດທີ່ມີຜົນ 2 ຕົວ — % ຄຳນວນຈາກທັງໝົດ`]})]})]})]})}var q=[{card:`linear-gradient(148deg, #0a0d1f 0%, #141a35 100%)`,cardBorder:`rgba(99,102,241,0.30)`,cardShadow:`0 0 36px rgba(99,102,241,0.18)`,ball:`radial-gradient(circle at 35% 30%, #a5b4fc 0%, #6366f1 38%, #3730a3 70%, #1e1b4b 100%)`,ballShadow:`0 8px 32px rgba(99,102,241,0.60), inset 0 -5px 10px rgba(0,0,0,0.32)`,ballSize:80,ballFont:22,badgeBg:`rgba(99,102,241,0.85)`,bar:`linear-gradient(90deg, #3730a3, #6366f1, #a5b4fc)`,barGlow:`rgba(99,102,241,0.55)`,countColor:`#a5b4fc`,pulse:!0},{card:`linear-gradient(148deg, #08091a 0%, #10122e 100%)`,cardBorder:`rgba(139,92,246,0.22)`,cardShadow:`0 0 24px rgba(139,92,246,0.12)`,ball:`radial-gradient(circle at 35% 30%, #c4b5fd 0%, #8b5cf6 40%, #5b21b6 76%, #2e1065 100%)`,ballShadow:`0 6px 22px rgba(139,92,246,0.50), inset 0 -4px 8px rgba(0,0,0,0.30)`,ballSize:68,ballFont:18,badgeBg:`rgba(139,92,246,0.80)`,bar:`linear-gradient(90deg, #5b21b6, #8b5cf6, #c4b5fd)`,barGlow:`rgba(139,92,246,0.42)`,countColor:`rgba(196,181,253,0.88)`,pulse:!1},{card:`linear-gradient(148deg, #060814 0%, #0c0e25 100%)`,cardBorder:`rgba(59,130,246,0.18)`,cardShadow:`0 0 18px rgba(59,130,246,0.09)`,ball:`radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 42%, #1d4ed8 76%, #1e3a8a 100%)`,ballShadow:`0 5px 18px rgba(59,130,246,0.44), inset 0 -4px 8px rgba(0,0,0,0.28)`,ballSize:58,ballFont:16,badgeBg:`rgba(59,130,246,0.78)`,bar:`linear-gradient(90deg, #1d4ed8, #3b82f6, #93c5fd)`,barGlow:`rgba(59,130,246,0.38)`,countColor:`rgba(147,197,253,0.78)`,pulse:!1},{card:`linear-gradient(148deg, #050710 0%, #090c1e 100%)`,cardBorder:`rgba(34,211,238,0.14)`,cardShadow:`none`,ball:`radial-gradient(circle at 35% 30%, #67e8f9 0%, #22d3ee 42%, #0891b2 76%, #164e63 100%)`,ballShadow:`0 4px 14px rgba(34,211,238,0.38), inset 0 -3px 6px rgba(0,0,0,0.26)`,ballSize:50,ballFont:14,badgeBg:`rgba(34,211,238,0.75)`,bar:`linear-gradient(90deg, #0891b2, #22d3ee, #67e8f9)`,barGlow:`rgba(34,211,238,0.30)`,countColor:`rgba(103,232,249,0.65)`,pulse:!1},{card:`linear-gradient(148deg, #04060e 0%, #07091a 100%)`,cardBorder:`rgba(20,184,166,0.12)`,cardShadow:`none`,ball:`radial-gradient(circle at 35% 30%, #5eead4 0%, #14b8a6 42%, #0f766e 76%, #134e4a 100%)`,ballShadow:`0 3px 12px rgba(20,184,166,0.32), inset 0 -3px 6px rgba(0,0,0,0.24)`,ballSize:44,ballFont:12,badgeBg:`rgba(20,184,166,0.72)`,bar:`linear-gradient(90deg, #0f766e, #14b8a6, #5eead4)`,barGlow:`rgba(20,184,166,0.25)`,countColor:`rgba(94,234,212,0.55)`,pulse:!1}],me=`
  .htd-root {
    position: relative;
    background: linear-gradient(155deg, #06091a 0%, #0d1230 45%, #050817 100%);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 22px;
    overflow: hidden;
  }
  .htd-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(99,102,241,0.55) 22%, rgba(167,139,250,0.85) 50%,
      rgba(99,102,241,0.55) 78%, transparent 95%
    );
  }
  .htd-glow-tr {
    position: absolute; width: 320px; height: 220px;
    top: -80px; right: -70px;
    background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
    filter: blur(44px); pointer-events: none;
  }
  .htd-glow-bl {
    position: absolute; width: 220px; height: 220px;
    bottom: -70px; left: -50px;
    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
    filter: blur(38px); pointer-events: none;
  }
  .htd-star {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: htd-twinkle ease-in-out infinite;
    background: rgba(167,139,250,0.6);
  }
  .htd-s1 { width:2px;height:2px; left:8%;  top:18%; animation-duration:3.1s; animation-delay:0s;   }
  .htd-s2 { width:3px;height:3px; left:22%; top:60%; animation-duration:4.2s; animation-delay:0.9s; }
  .htd-s3 { width:2px;height:2px; left:55%; top:12%; animation-duration:2.8s; animation-delay:1.5s; }
  .htd-s4 { width:2px;height:2px; left:70%; top:70%; animation-duration:3.6s; animation-delay:2.2s; }
  .htd-s5 { width:3px;height:3px; left:88%; top:30%; animation-duration:4.0s; animation-delay:0.4s; }
  @keyframes htd-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1.0; transform: scale(1.5); }
  }
  .htd-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; z-index: 10;
  }
  .htd-hdr-l { display: flex; align-items: center; gap: 12px; }
  .htd-icon-box {
    width: 42px; height: 42px; border-radius: 14px;
    background: linear-gradient(135deg, #3730a3 0%, #6366f1 52%, #a5b4fc 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
    flex-shrink: 0;
  }
  .htd-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #c7d2fe 0%, #a5b4fc 50%, #818cf8 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .htd-subtitle {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(165,180,252,0.48); margin-top: 1px;
  }
  .htd-top-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.06em;
    background: rgba(99,102,241,0.11);
    border: 1px solid rgba(99,102,241,0.28);
    border-radius: 20px; padding: 5px 13px;
    color: rgba(165,180,252,0.75);
  }
  .htd-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    position: relative; z-index: 10; align-items: end;
  }
  @media (min-width: 640px) { .htd-grid { grid-template-columns: repeat(5, 1fr); } }
  .htd-card {
    position: relative; border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 8px 14px; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .htd-card:hover { transform: translateY(-4px); }
  .htd-rank-badge {
    position: absolute; top: 0; right: 0;
    width: 26px; height: 26px;
    border-radius: 0 18px 0 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: #fff;
  }
  .htd-crown {
    font-size: 18px; line-height: 1;
    filter: drop-shadow(0 0 10px rgba(167,139,250,0.80));
    animation: htd-crown-rock 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes htd-crown-rock {
    0%, 100% { transform: rotate(-6deg) scale(1);   }
    50%       { transform: rotate(6deg) scale(1.05); }
  }
  .htd-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    letter-spacing: -0.03em;
  }
  .htd-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  .htd-ball-pulse { animation: htd-pulse-glow 2s ease-in-out infinite; }
  @keyframes htd-pulse-glow {
    0%, 100% { filter: none; }
    50%       { filter: drop-shadow(0 0 14px rgba(99,102,241,0.70)); }
  }
  .htd-count-num  { font-size: 15px; font-weight: 900; }
  .htd-count-unit { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; color: rgba(165,180,252,0.32); }
  .htd-bar-track {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.05); border-radius: 9999px; overflow: hidden;
  }
  .htd-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .htd-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 18px; padding-top: 14px;
    border-top: 1px solid rgba(99,102,241,0.10);
    position: relative; z-index: 10;
  }
  .htd-footer-l { font-size: 11px; color: rgba(165,180,252,0.38); font-weight: 600; }
  .htd-footer-r { display: flex; align-items: center; gap: 5px; font-size: 10px; color: rgba(165,180,252,0.30); }
`;function he({timeframe:e,typeId:t}){let{stats:n,loading:r}=c(e,t);if(r||!n?.hotThreeDigits?.length)return null;let{hotThreeDigits:i}=n,a=i[0]?.count||1;return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:me}),(0,d.jsxs)(`div`,{className:`htd-root p-6 sm:p-8`,children:[(0,d.jsx)(`div`,{className:`htd-glow-tr`}),(0,d.jsx)(`div`,{className:`htd-glow-bl`}),[1,2,3,4,5].map(e=>(0,d.jsx)(`div`,{className:`htd-star htd-s${e}`},e)),(0,d.jsxs)(`div`,{className:`htd-hdr`,children:[(0,d.jsxs)(`div`,{className:`htd-hdr-l`,children:[(0,d.jsx)(`div`,{className:`htd-icon-box`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-white`,style:{fontSize:21,fontVariationSettings:`'FILL' 1`},children:`filter_3`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`htd-title`,children:`3 ຕົວທ້າຍ ເດັ່ນ`}),(0,d.jsx)(`p`,{className:`htd-subtitle`,children:`Hot 3-Digit Endings`})]})]}),(0,d.jsx)(`span`,{className:`htd-top-badge`,children:`ອອກຫຼາຍທີ່ສຸດ`})]}),(0,d.jsx)(`div`,{className:`htd-grid`,children:i.map(({number:e,count:t},n)=>{let r=q[n]??q[4],i=Math.round(t/a*100),o=n===0;return(0,d.jsxs)(`div`,{className:`htd-card`,style:{background:r.card,border:`1px solid ${r.cardBorder}`,boxShadow:r.cardShadow},children:[(0,d.jsx)(`div`,{className:`htd-rank-badge`,style:{background:r.badgeBg},children:n+1}),o&&(0,d.jsx)(`div`,{className:`htd-crown`,children:`👑`}),(0,d.jsx)(`div`,{className:`htd-ball${r.pulse?` htd-ball-pulse`:``}`,style:{width:r.ballSize,height:r.ballSize,fontSize:r.ballFont,background:r.ball,boxShadow:r.ballShadow},children:(0,d.jsx)(`span`,{style:{position:`relative`,zIndex:1},children:e})}),(0,d.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,d.jsx)(`span`,{className:`htd-count-num`,style:{color:r.countColor},children:t}),(0,d.jsx)(`p`,{className:`htd-count-unit`,children:`ຄັ້ງ`})]}),(0,d.jsx)(`div`,{className:`htd-bar-track`,children:(0,d.jsx)(`div`,{className:`htd-bar-fill`,style:{width:`${i}%`,background:r.bar,boxShadow:`0 0 6px ${r.barGlow}`}})})]},e)})}),(0,d.jsxs)(`div`,{className:`htd-footer`,children:[(0,d.jsxs)(`p`,{className:`htd-footer-l`,children:[`ສູງສຸດ:`,` `,(0,d.jsxs)(`span`,{style:{fontWeight:900,color:`rgba(165,180,252,0.80)`},children:[i[0]?.count,` ຄັ້ງ`]})]}),(0,d.jsxs)(`div`,{className:`htd-footer-r`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:12},children:`info`}),`3 ຕົວທ້າຍຈາກ 6 ຕົວເລກ`]})]})]})]})}var ge=[{value:`1_month`,label:`1 ເດືອນ`,icon:`calendar_view_month`},{value:`3_months`,label:`3 ເດືອນ`,icon:`date_range`},{value:`1_year`,label:`1 ປີ`,icon:`calendar_today`},{value:`all`,label:`ທັງໝົດ`,icon:`all_inclusive`}],_e=[{n:`07`,top:`12%`,left:`6%`,size:58,color:`#f59e0b`,anim:`db-float-a`,delay:`0s`},{n:`42`,top:`62%`,left:`14%`,size:44,color:`#60a5fa`,anim:`db-float-b`,delay:`1.2s`},{n:`88`,top:`20%`,right:`8%`,size:66,color:`#c084fc`,anim:`db-float-c`,delay:`0.6s`},{n:`23`,top:`68%`,right:`12%`,size:50,color:`#4ade80`,anim:`db-float-a`,delay:`2s`},{n:`55`,top:`40%`,left:`28%`,size:38,color:`#f472b6`,anim:`db-float-b`,delay:`1.8s`},{n:`16`,top:`8%`,left:`52%`,size:54,color:`#fb923c`,anim:`db-float-c`,delay:`0.4s`}],J=[{num:`01`,icon:`local_fire_department`,title:`ເລກຮ້ອນ & ເລກດັບ`,subtitle:`Hot / Cold Numbers`,accent:`#f97316`},{num:`02`,icon:`filter_3`,title:`3 ຕົວທ້າຍ ເດັ່ນ`,subtitle:`Hot 3-Digit Endings`,accent:`#6366f1`},{num:`03`,icon:`bar_chart`,title:`ການກະຈາຍຕົວເລກ`,subtitle:`Digit Distribution`,accent:`#818cf8`},{num:`04`,icon:`pets`,title:`ສະຖິຕິນາມສັດ`,subtitle:`Animal Frequency Stats`,accent:`#4ade80`},{num:`05`,icon:`insights`,title:`ການວິເຄາະຂັ້ນສູງ`,subtitle:`Weekday + Consecutive Patterns`,accent:`#c084fc`},{num:`06`,icon:`magic_button`,title:`ຈັບຄູ່ເລກ & ນາມສັດ`,subtitle:`Pairing Intelligence`,accent:`#2dd4bf`},{num:`07`,icon:`trending_up`,title:`Trend Intelligence`,subtitle:`Momentum + Gap + Repeat`,accent:`#fbbf24`},{num:`08`,icon:`format_list_numbered`,title:`ຄວາມຖີ່ທຸກຕົວເລກ`,subtitle:`Full Frequency Matrix 00–99`,accent:`#38bdf8`}];function Y({children:e,minHeight:t=`200px`}){let n=(0,u.useRef)(null),[r,i]=(0,u.useState)(!1);return(0,u.useEffect)(()=>{if(!n.current)return;let e=new IntersectionObserver(([e])=>{e.isIntersecting&&i(!0)},{rootMargin:`300px`});return e.observe(n.current),()=>e.disconnect()},[]),(0,d.jsx)(`div`,{ref:n,children:r?e:(0,d.jsx)(`div`,{style:{minHeight:t},className:`rounded-3xl bg-card/40 border border-border/40 animate-pulse`})})}function ve(){return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:`
        @keyframes db-float-a{0%,100%{transform:translateY(0px) rotate(0deg)}40%{transform:translateY(-18px) rotate(7deg)}70%{transform:translateY(8px) rotate(-4deg)}}
        @keyframes db-float-b{0%,100%{transform:translateY(0px) rotate(0deg)}30%{transform:translateY(14px) rotate(-6deg)}65%{transform:translateY(-10px) rotate(5deg)}}
        @keyframes db-float-c{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-22px) rotate(9deg)}}
        .db-float-a{animation:db-float-a 9s ease-in-out infinite}
        .db-float-b{animation:db-float-b 11s ease-in-out infinite}
        .db-float-c{animation:db-float-c 8s ease-in-out infinite}
      `}),_e.map((e,t)=>(0,d.jsx)(`div`,{className:`absolute pointer-events-none select-none ${e.anim}`,style:{top:e.top,left:e.left,right:e.right,animationDelay:e.delay,opacity:.1},children:(0,d.jsx)(`div`,{className:`rounded-full flex items-center justify-center font-black text-white`,style:{width:e.size,height:e.size,background:`radial-gradient(circle at 35% 30%, white 0%, ${e.color} 40%, ${e.color}88 100%)`,boxShadow:`0 4px 20px ${e.color}44, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)`,fontSize:e.size*.27,fontFamily:`'Space Grotesk', sans-serif`,letterSpacing:`-0.03em`},children:e.n})},t))]})}function X({label:e,value:t,sub:n,color:r}){return(0,d.jsxs)(`div`,{className:`relative bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl px-5 py-4 text-center min-w-[88px] overflow-hidden group`,children:[(0,d.jsx)(`div`,{className:`absolute inset-x-0 bottom-0 h-0.5 rounded-full`,style:{background:`linear-gradient(to right, transparent, ${r}, transparent)`}}),(0,d.jsx)(`p`,{className:`text-[9px] font-extrabold uppercase tracking-widest mb-1.5`,style:{color:`${r}bb`},children:e}),(0,d.jsx)(`p`,{className:`text-2xl font-black text-white leading-none font-['Space_Grotesk'] tracking-tight`,children:t}),n&&(0,d.jsx)(`p`,{className:`text-[10px] mt-1.5 font-semibold`,style:{color:`${r}88`},children:n})]})}function Z({cfg:e}){let{num:t,icon:n,title:r,subtitle:i,accent:a}=e;return(0,d.jsxs)(`div`,{className:`flex items-center gap-3.5 mb-7 group`,children:[(0,d.jsx)(`div`,{className:`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black font-['Space_Grotesk'] shadow-sm transition-transform duration-200 group-hover:scale-110`,style:{background:`${a}18`,border:`1.5px solid ${a}40`,color:a},children:t}),(0,d.jsx)(`div`,{className:`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm`,style:{background:`${a}10`,border:`1px solid ${a}22`},children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-[20px]`,style:{color:a,fontVariationSettings:`'FILL' 1`},children:n})}),(0,d.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,d.jsx)(`h2`,{className:`font-extrabold text-foreground text-[12px] uppercase tracking-widest leading-tight`,children:r}),(0,d.jsx)(`p`,{className:`text-[10px] text-muted-foreground mt-0.5 font-semibold tracking-wide`,children:i})]}),(0,d.jsx)(`div`,{className:`hidden sm:block flex-1 max-w-32 h-px`,style:{background:`linear-gradient(to right, ${a}30, transparent)`}})]})}function Q({cfg:e,children:t}){let{accent:n}=e;return(0,d.jsxs)(`div`,{className:`relative rounded-3xl p-6 sm:p-8 border overflow-hidden`,style:{background:`radial-gradient(ellipse at top left, ${n}06, transparent 60%), var(--color-card)`,borderColor:`${n}18`},children:[(0,d.jsx)(`div`,{className:`absolute top-0 left-0 w-1 h-full rounded-l-3xl`,style:{background:`linear-gradient(to bottom, ${n}70, transparent)`}}),(0,d.jsx)(Z,{cfg:e}),t]})}function $({active:e,color:t,onClick:n,children:r}){return(0,d.jsx)(`button`,{onClick:n,className:`px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200`,style:e?{background:t,color:`#fff`,borderColor:t,boxShadow:`0 2px 10px ${t}45`}:{background:`transparent`,color:t,borderColor:`${t}45`},children:r})}function ye(){let[e,t]=(0,u.useState)(`all`),[n,l]=(0,u.useState)(`all`),{draws:f,types:p}=r(),{stats:h}=c(e,n),g=(n===`all`?f:f?.filter(e=>String(e.type_id)===String(n)))?.length??0,_=h?.hotNumbers?.[0],y=h?.coldNumbers?.[0],b=p?.find(e=>String(e.type_id)===String(n)),x=b?.color||`#5daf82`,C=b?.type_name??`ລາວ`,w=(0,u.useMemo)(()=>h?.hotNumbers?h.hotNumbers.slice(0,6).map(e=>e.number):[`07`,`42`,`88`,`23`,`55`,`16`],[h]),E=[{q:`ເລກໃດອອກຫຼາຍທີ່ສຸດ?`,a:_?`ເລກ ${_.number} ອອກ ${_.count} ຄັ້ງ`:`ກຳລັງໂຫຼດ...`},{q:`เลขไหนออกบ่อยที่สุด?`,a:_?`เลข ${_.number} ออก ${_.count} ครั้ง`:`กำลังโหลด...`},{q:`ສາມາດດຶງສະຖິຕິຫວຍຈາກກີ່ງວດ?`,a:`ສາມາດວິເຄາະຈາກ ${g} ງວດທັງໝົດ`},{q:`มีข้อมูลหวยลาวย้อนหลังกี่งวด?`,a:`มีข้อมูล ${g} งวด`}];return(0,d.jsxs)(`div`,{className:`space-y-10`,children:[(0,d.jsx)(i,{title:`ສະຖິຕິຫວຍ${C} ${g} ງວດ | สถิติหวยลาว วิเคราะห์เลขเด็ด`,description:`ວິເຄາະສະຖິຕິຫວຍ${C} ຈາກ ${g} ງວດ. ເລກ Hot/Cold, ການແຈກຢາຍຕົວເລກ, ແນວໂນ້ມ ແລະ Pattern ຫວຍ | วิเคราะห์สถิติหวยลาว ${g} งวด`,keywords:[`ສະຖິຕິຫວຍ`,`ເລກ Hot`,`ເລກ Cold`,`ການແຈກຢາຍ`,`ວິເຄາະຫວຍ`,`สถิติหวยลาว`,`เลขร้อน`,`เลขเย็น`,`วิเคราะห์เลขเด็ด`,_?`เลข ${_.number}`:``].filter(Boolean),url:`/statistics`,jsonLd:[a(`ສະຖິຕິຫວຍ | สถิติหวยลาว`,`https://laolots.com/statistics`,`ວິເຄາະສະຖິຕິຫວຍ${C} ຈາກ ${g} ງວດ`),s([{name:`ໜ້າຫຼັກ`,url:`https://laolots.com/`},{name:`ສະຖິຕິ`,url:`https://laolots.com/statistics`}]),o(E)]}),(0,d.jsxs)(`div`,{className:`relative rounded-[2rem] overflow-hidden border border-white/[0.07] shadow-[0_32px_60px_-16px_rgba(0,0,0,0.7)]`,style:{background:`linear-gradient(145deg, #080f0a 0%, #0c1a12 40%, #071410 100%)`},children:[(0,d.jsx)(`div`,{className:`absolute inset-0 bg-grid-glow opacity-20`}),(0,d.jsx)(`div`,{className:`absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-3xl pointer-events-none`,style:{background:`radial-gradient(circle, rgba(94,234,212,0.08) 0%, transparent 70%)`}}),(0,d.jsx)(`div`,{className:`absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 rounded-full blur-3xl pointer-events-none`,style:{background:`radial-gradient(circle, ${x}10 0%, transparent 70%)`}}),(0,d.jsx)(`div`,{className:`absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full blur-3xl pointer-events-none`,style:{background:`radial-gradient(circle, rgba(192,132,252,0.07) 0%, transparent 70%)`}}),(0,d.jsx)(ve,{numbers:w}),(0,d.jsx)(`div`,{className:`absolute right-4 bottom-0 text-[8rem] sm:text-[12rem] font-black leading-none select-none pointer-events-none pr-2`,style:{color:`rgba(255,255,255,0.025)`,fontFamily:`'Space Grotesk', sans-serif`,letterSpacing:`-0.04em`},children:`STATS`}),(0,d.jsxs)(`div`,{className:`relative z-10 px-8 sm:px-14 pt-12 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`,children:[(0,d.jsxs)(`div`,{className:`lg:col-span-7 space-y-6`,children:[(0,d.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,d.jsxs)(`div`,{className:`inline-flex items-center gap-2 bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-1.5`,children:[(0,d.jsx)(`span`,{className:`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`}),(0,d.jsx)(`span`,{className:`text-white/90 text-[10px] font-extrabold uppercase tracking-widest font-['Plus_Jakarta_Sans']`,children:`Analytics Dashboard`})]}),b&&(0,d.jsx)(`div`,{className:`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border`,style:{background:`${x}15`,borderColor:`${x}35`},children:(0,d.jsxs)(`span`,{className:`text-[9px] font-black`,style:{color:x},children:[`● `,b.type_name]})})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`h1`,{className:`text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight font-['Space_Grotesk']`,children:[`ວິເຄາະ`,(0,d.jsx)(`span`,{className:`block sm:inline sm:ml-3 bg-clip-text text-transparent`,style:{backgroundImage:`linear-gradient(135deg, #4ade80 0%, #38bdf8 50%, #c084fc 100%)`},children:`ສະຖິຕິ`})]}),(0,d.jsxs)(`p`,{className:`mt-3 text-white/55 text-sm max-w-lg leading-relaxed font-medium`,children:[`ບົດວິເຄາະຄວາມຖີ່ ແລະ ແນວໂນ້ມຕົວເລກຫວຍລາວ ຈາກຖານຂໍ້ມູນ`,` `,(0,d.jsxs)(`span`,{className:`text-white/90 font-bold`,children:[g,` ງວດ`]}),b&&(0,d.jsxs)(`span`,{className:`text-white/75 font-semibold`,children:[` — `,b.type_name]})]})]})]}),(0,d.jsxs)(`div`,{className:`lg:col-span-5 flex flex-wrap gap-3 lg:justify-end items-start`,children:[(0,d.jsx)(X,{label:`ງວດທັງໝົດ`,value:g,sub:`draws analyzed`,color:`#4ade80`}),(0,d.jsx)(X,{label:`ເລກ Hot`,value:_?.number??`—`,sub:_?`${_.count} ຄັ້ງ`:`no data`,color:`#f97316`}),(0,d.jsx)(X,{label:`ເລກ Cold`,value:y?.number??`—`,sub:y?`${y.missedRounds} ງວດ`:`no data`,color:`#38bdf8`})]})]}),(0,d.jsx)(`div`,{className:`h-8 bg-gradient-to-b from-transparent to-background/40 relative z-10`})]}),(0,d.jsxs)(`div`,{className:`bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl px-5 py-4 shadow-sm space-y-4`,children:[p&&p.length>1&&(0,d.jsxs)(`div`,{className:`flex items-center gap-3 flex-wrap`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2 shrink-0`,children:[(0,d.jsx)(`span`,{className:`w-0.5 h-5 rounded-full bg-primary/60`}),(0,d.jsx)(`p`,{className:`text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest`,children:`ປະເພດ`})]}),(0,d.jsxs)($,{active:n===`all`,color:`#5daf82`,onClick:()=>l(`all`),children:[`ທັງໝົດ (`,f?.length??0,`)`]}),p.filter(e=>e.is_active!=0).map(e=>(0,d.jsxs)($,{active:String(n)===String(e.type_id),color:e.color||`#5daf82`,onClick:()=>l(String(e.type_id)),children:[e.type_name,` (`,f?.filter(t=>String(t.type_id)===String(e.type_id)).length??0,`)`]},e.type_id))]}),(0,d.jsxs)(`div`,{className:`flex items-center justify-between gap-4 flex-wrap`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,d.jsx)(`span`,{className:`w-0.5 h-5 rounded-full bg-primary/60`}),(0,d.jsx)(`p`,{className:`text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest`,children:`ຊ່ວງເວລາ`})]}),(0,d.jsx)(`div`,{className:`flex items-center gap-1 bg-background/60 p-1 rounded-xl border border-border/40`,children:ge.map(({value:n,label:r,icon:i})=>(0,d.jsxs)(`button`,{onClick:()=>t(n),className:`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${e===n?`bg-primary text-primary-foreground shadow-sm`:`text-muted-foreground hover:text-foreground`}`,children:[(0,d.jsx)(`span`,{className:`material-symbols-outlined text-[13px]`,children:i}),r]},n))})]})]}),!h&&(0,d.jsxs)(`div`,{className:`flex flex-col items-center justify-center py-28 gap-5 rounded-3xl border border-border/40 bg-card/40 shadow-sm`,children:[(0,d.jsx)(`div`,{className:`w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center`,children:(0,d.jsx)(`span`,{className:`material-symbols-outlined text-4xl text-muted-foreground/40`,children:`bar_chart`})}),(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`p`,{className:`text-base font-bold text-foreground`,children:`ບໍ່ມີຂໍ້ມູນ`}),(0,d.jsx)(`p`,{className:`text-sm text-muted-foreground mt-1`,children:`ຍັງບໍ່ມີຂໍ້ມູນສຳລັບປະເພດ / ຊ່ວງເວລານີ້`})]}),(0,d.jsx)(`button`,{onClick:()=>{l(`all`),t(`all`)},className:`px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/25 hover:bg-primary/[0.18] transition-colors`,children:`ເບິ່ງທັງໝົດ`})]}),h&&(0,d.jsxs)(`div`,{className:`space-y-8`,children:[(0,d.jsx)(Q,{cfg:J[0],children:(0,d.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-12 gap-5`,children:[(0,d.jsx)(m,{timeframe:e,typeId:n}),(0,d.jsx)(v,{timeframe:e,typeId:n})]})}),(0,d.jsx)(Y,{minHeight:`220px`,children:(0,d.jsx)(Q,{cfg:J[1],children:(0,d.jsx)(he,{timeframe:e,typeId:n})})}),(0,d.jsx)(Y,{minHeight:`340px`,children:(0,d.jsx)(Q,{cfg:J[2],children:(0,d.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-2 gap-6`,children:[(0,d.jsx)(`div`,{className:`bg-background/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-border/40`,children:(0,d.jsx)(S,{timeframe:e})}),(0,d.jsx)(`div`,{className:`bg-background/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-border/40`,children:(0,d.jsx)(T,{timeframe:e})})]})})}),(0,d.jsx)(Y,{minHeight:`260px`,children:(0,d.jsx)(Q,{cfg:J[3],children:(0,d.jsx)(k,{timeframe:e,typeId:n})})}),(0,d.jsx)(Y,{minHeight:`340px`,children:(0,d.jsx)(Q,{cfg:J[4],children:(0,d.jsxs)(`div`,{className:`space-y-6`,children:[(0,d.jsx)(F,{timeframe:e,typeId:n}),(0,d.jsx)(W,{timeframe:e,typeId:n})]})})}),(0,d.jsx)(Y,{minHeight:`340px`,children:(0,d.jsx)(Q,{cfg:J[5],children:(0,d.jsx)(R,{timeframe:e,typeId:n})})}),(0,d.jsx)(Y,{minHeight:`340px`,children:(0,d.jsxs)(Q,{cfg:J[6],children:[(0,d.jsxs)(`div`,{className:`grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5`,children:[(0,d.jsx)(ce,{timeframe:e,typeId:n}),(0,d.jsx)(de,{timeframe:e,typeId:n})]}),(0,d.jsx)(pe,{timeframe:e,typeId:n})]})}),(0,d.jsx)(Y,{minHeight:`220px`,children:(0,d.jsx)(Q,{cfg:J[7],children:(0,d.jsx)(ie,{timeframe:e,typeId:n})})})]})]})}export{ye as default};