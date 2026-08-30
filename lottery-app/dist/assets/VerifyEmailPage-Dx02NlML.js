import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{v as t}from"./vendor-charts-iQ_2Absj.js";import{t as n}from"./vendor-react-nvcEvhRQ.js";import{l as r,n as i}from"./chunk-OE4NN4TA-BrSHlpGf.js";import{t as a}from"./logo-2gJOYgsP.js";import{t as o}from"./authService-D0sRBCdG.js";var s=e(t(),1),c=n(),l={LOADING:`loading`,SUCCESS:`success`,ERROR:`error`,EXPIRED:`expired`},u=Array.from({length:22},(e,t)=>({id:t,num:Math.floor(Math.random()*60)+1,x:Math.random()*100,y:Math.random()*100,size:Math.random()*18+22,dur:Math.random()*14+10,delay:-(Math.random()*12),op:Math.random()*.13+.04})),d=Array.from({length:50},(e,t)=>({id:t,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2.5+.5,dur:Math.random()*3+2,delay:Math.random()*6})),f=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Noto+Sans+Lao:wght@300;400;500;600;700;800&display=swap');

.ll-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  background: transparent;
  font-family: 'Noto Sans Lao', sans-serif;
}

/* ── star field ── */
.ll-star {
  position: fixed;
  border-radius: 50%;
  background: #fff;
  animation: ll-twinkle var(--d) ease-in-out infinite var(--dl);
  pointer-events: none;
  z-index: 0;
}
@keyframes ll-twinkle {
  0%,100% { opacity: 0.08; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.6); }
}

/* ── floating balls ── */
.ll-ball {
  position: fixed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  background: radial-gradient(circle at 35% 30%, rgba(255,210,0,.28), rgba(160,90,0,.08));
  border: 1px solid rgba(255,210,0,.18);
  color: rgba(255,210,0,.55);
  animation: ll-float var(--d) ease-in-out infinite var(--dl);
  pointer-events: none;
  z-index: 0;
}
@keyframes ll-float {
  0%,100% { transform: translateY(0)   rotate(0deg); }
  33%      { transform: translateY(-28px) rotate(8deg); }
  66%      { transform: translateY(18px)  rotate(-6deg); }
}

/* ── ambient corners ── */
.ll-glow-tl {
  position: fixed; top:-20%; left:-10%;
  width:560px; height:560px; border-radius:50%;
  background: radial-gradient(circle, rgba(255,180,0,.07) 0%, transparent 70%);
  pointer-events:none; z-index:0;
}
.ll-glow-br {
  position: fixed; bottom:-25%; right:-10%;
  width:640px; height:640px; border-radius:50%;
  background: radial-gradient(circle, rgba(180,0,255,.04) 0%, transparent 70%);
  pointer-events:none; z-index:0;
}

/* ── card reveal ── */
.ll-card-wrap {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  animation: ll-reveal .9s cubic-bezier(.16,1,.3,1) both;
}
@keyframes ll-reveal {
  from { opacity:0; transform: translateY(32px) scale(.95); }
  to   { opacity:1; transform: translateY(0)    scale(1);   }
}

/* ── golden border wrapper ── */
.ll-border {
  padding: 1.5px;
  border-radius: 26px;
  background: linear-gradient(135deg, #FFD700, #7c4d00, #FFD700, #5c3700, #FFD700);
  background-size: 300% 300%;
  animation: ll-border-flow 5s ease infinite;
  box-shadow:
    0 0 40px rgba(255,180,0,.14),
    0 40px 80px rgba(0,0,0,.65);
}
@keyframes ll-border-flow {
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}

/* ── card body ── */
.ll-card {
  background: linear-gradient(155deg, rgba(20,10,40,.97), rgba(8,4,18,.99));
  border-radius: 25px;
  overflow: hidden;
}

/* ── header section ── */
.ll-header {
  position: relative;
  padding: 2.25rem 2rem 2rem;
  text-align: center;
  overflow: hidden;
}
.ll-header::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255,200,0,.16) 0%, transparent 65%),
    radial-gradient(ellipse at 80% 80%, rgba(255,80,0,.06) 0%, transparent 55%);
}

/* ── spinning ring logo ── */
.ll-logo {
  position: relative;
  width: 82px; height: 82px;
  margin: 0 auto 1.2rem;
}
.ll-ring-outer {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FFD700, #7c4d00, #FFE082, #5c3700, #FFD700);
  animation: ll-spin 7s linear infinite;
  padding: 2.5px;
}
@keyframes ll-spin { to { transform: rotate(360deg); } }
.ll-ring-inner {
  position: absolute;
  inset: 2.5px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px;
}
.ll-logo-icon {
  font-size: 2.1rem;
  animation: ll-pulse 2.2s ease-in-out infinite;
}
@keyframes ll-pulse {
  0%,100% { filter: drop-shadow(0 0 6px rgba(255,215,0,.6)); }
  50%      { filter: drop-shadow(0 0 18px rgba(255,215,0,1)) drop-shadow(0 0 36px rgba(255,140,0,.5)); }
}

/* ── header text ── */
.ll-title {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, #FFE082 0%, #FFD700 30%, #FFA000 60%, #FFD700 80%, #FFF8E1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: .2rem;
  position: relative;
}
.ll-subtitle {
  font-family: 'Cinzel', serif;
  font-size: .62rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(255,215,0,.38);
  position: relative;
}

/* ── ticket perforation ── */
.ll-perf {
  position: relative;
  height: 0;
  margin: 0 -.06rem;
}
.ll-perf::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  border-top: 1.5px dashed rgba(255,215,0,.18);
}
.ll-perf-hole {
  position: absolute;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #060410;
  top: -9px;
  border: 1px solid rgba(255,215,0,.15);
}
.ll-perf-hole.left  { left: -9px; }
.ll-perf-hole.right { right: -9px; }

/* ── form area ── */
.ll-form-area {
  padding: 1.75rem 2rem 2rem;
}

/* ── submit ── */
.ll-submit {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: none;
  border-radius: 14px;
  padding: 1rem 1.5rem;
  font-size: .95rem;
  font-weight: 800;
  cursor: pointer;
  font-family: 'Noto Sans Lao', sans-serif;
  letter-spacing: .02em;
  color: #1a0c00;
  background: linear-gradient(110deg, #7c4d00, #FFD700, #FFA000, #FFE082, #7c4d00);
  background-size: 250% 250%;
  animation: ll-btn-shift 3.5s ease infinite;
  box-shadow:
    0 4px 22px rgba(255,180,0,.32),
    inset 0 1px 0 rgba(255,255,255,.28),
    inset 0 -1px 0 rgba(0,0,0,.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: transform .2s, box-shadow .2s;
  margin-top: .25rem;
}
@keyframes ll-btn-shift {
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}
.ll-submit::after {
  content: '';
  position: absolute;
  top: 0; left: -120%;
  width: 55%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent);
  transform: skewX(-20deg);
  animation: ll-shimmer 2.8s ease-in-out infinite;
}
@keyframes ll-shimmer {
  0%   { left: -120%; }
  100% { left: 220%;  }
}
.ll-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(255,180,0,.42), inset 0 1px 0 rgba(255,255,255,.28);
}
.ll-submit:disabled {
  opacity: .65; cursor: not-allowed;
  animation: none;
}
.ll-submit:disabled::after { display: none; }

/* ── register btn ── */
.ll-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .9rem;
  border-radius: 14px;
  border: 1px solid rgba(255,215,0,.18);
  background: rgba(255,215,0,.04);
  color: rgba(255,215,0,.65);
  font-size: .875rem;
  font-weight: 700;
  text-decoration: none;
  font-family: 'Noto Sans Lao', sans-serif;
  transition: all .3s ease;
}
.ll-register:hover {
  background: rgba(255,215,0,.1);
  border-color: rgba(255,215,0,.38);
  color: #FFD700;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255,180,0,.12);
}
`;function p({children:e}){return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`style`,{dangerouslySetInnerHTML:{__html:f}}),(0,c.jsxs)(`div`,{className:`ll-wrap`,children:[(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[#060410] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#1c0e34_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1a0a08_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`ll-glow-tl`}),(0,c.jsx)(`div`,{className:`ll-glow-br`}),d.map(e=>(0,c.jsx)(`div`,{className:`ll-star`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.s}px`,height:`${e.s}px`,"--d":`${e.dur}s`,"--dl":`${e.delay}s`}},e.id)),u.map(e=>(0,c.jsx)(`div`,{className:`ll-ball`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.size}px`,height:`${e.size}px`,fontSize:`${e.size*.34}px`,opacity:e.op,"--d":`${e.dur}s`,"--dl":`${e.delay}s`},children:e.num},e.id)),(0,c.jsx)(`div`,{className:`ll-card-wrap`,children:(0,c.jsx)(`div`,{className:`ll-border`,children:(0,c.jsx)(`div`,{className:`ll-card`,children:e})})})]})]})}function m(){let[e]=r(),t=e.get(`token`),[n,u]=(0,s.useState)(l.LOADING),[d,f]=(0,s.useState)(``);(0,s.useEffect)(()=>{if(!t){u(l.ERROR),f(`Token ຫວ່າງ`);return}o.verifyEmail(t).then(e=>{if(e.ok)u(l.SUCCESS);else{let t=e.data?.error||`ການຢືນຢັນລົ້ມເຫລວ`;t.includes(`ໝົດອາຍຸ`)?u(l.EXPIRED):u(l.ERROR),f(t)}}).catch(()=>{u(l.ERROR),f(`ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ`)})},[t]);let m={[l.LOADING]:{icon:null,iconBg:``,iconColor:``,title:`ກຳລັງຢືນຢັນ Email...`,desc:`ກະລຸນາລໍຖ້າ`,actions:null},[l.SUCCESS]:{icon:`mark_email_read`,iconBg:`bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5`,iconColor:`text-[#34d399]`,title:`ຢືນຢັນ Email ສຳເລັດ!`,desc:`ບັນຊີຂອງທ່ານພ້ອມໃຊ້ງານແລ້ວ`,actions:(0,c.jsxs)(i,{to:`/login`,className:`ll-submit cursor-pointer`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[18px]`,children:`login`}),`ເຂົ້າສູ່ລະບົບ`]})},[l.EXPIRED]:{icon:`schedule`,iconBg:`bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5`,iconColor:`text-amber-400`,title:`Token ໝົດອາຍຸ`,desc:d||`ລິ້ງຢືນຢັນ Email ໝົດອາຍຸແລ້ວ`,actions:(0,c.jsxs)(i,{to:`/login`,className:`ll-register animate-pulse`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[16px]`,children:`arrow_back`}),`ກັບໄປ Login`]})},[l.ERROR]:{icon:`link_off`,iconBg:`bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/5`,iconColor:`text-red-400`,title:`Token ບໍ່ຖືກຕ້ອງ`,desc:d||`ລິ້ງນີ້ໃຊ້ງານບໍ່ໄດ້`,actions:(0,c.jsxs)(i,{to:`/home`,className:`ll-register`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[16px]`,children:`home`}),`ກັບໄປໜ້າຫຼັກ`]})}}[n];return(0,c.jsxs)(p,{children:[(0,c.jsxs)(`div`,{className:`ll-header`,children:[(0,c.jsxs)(`div`,{className:`ll-logo`,children:[(0,c.jsx)(`div`,{className:`ll-ring-outer`}),(0,c.jsx)(`div`,{className:`ll-ring-inner`,children:(0,c.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,c.jsx)(`img`,{src:a,alt:`LAOLOTS`,style:{width:`100%`,height:`100%`,objectFit:`contain`,display:`block`}})})})]}),(0,c.jsx)(`h1`,{className:`ll-title`,children:`ຢືນຢັນບັນຊີ`}),(0,c.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`})]}),(0,c.jsxs)(`div`,{className:`ll-perf`,children:[(0,c.jsx)(`div`,{className:`ll-perf-hole left`}),(0,c.jsx)(`div`,{className:`ll-perf-hole right`})]}),n===l.LOADING?(0,c.jsxs)(`div`,{className:`ll-form-area text-center py-4 space-y-6`,children:[(0,c.jsx)(`div`,{className:`w-16 h-16 rounded-full border-4 border-[#d4af37]/20 border-t-[#d4af37] animate-spin mx-auto shadow-md`}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{className:`font-black text-lg text-white`,children:m.title}),(0,c.jsx)(`p`,{className:`text-sm text-white/50 mt-1.5`,children:m.desc})]})]}):(0,c.jsxs)(`div`,{className:`ll-form-area text-center py-4 space-y-6`,children:[(0,c.jsx)(`div`,{className:`w-20 h-20 rounded-full ${m.iconBg} flex items-center justify-center mx-auto`,children:(0,c.jsx)(`span`,{className:`material-symbols-outlined ${m.iconColor} text-4xl`,style:{fontVariationSettings:`'FILL' 1`},children:m.icon})}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`h2`,{className:`text-xl font-black text-white`,children:m.title}),(0,c.jsx)(`p`,{className:`text-sm text-white/60 mt-2 leading-relaxed`,children:m.desc})]}),(0,c.jsx)(`div`,{className:`pt-2`,children:m.actions})]})]})}export{m as default};