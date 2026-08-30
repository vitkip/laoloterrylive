import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{v as t}from"./vendor-charts-iQ_2Absj.js";import{r as n,t as r}from"./vendor-react-nvcEvhRQ.js";import{c as i,l as a,n as o}from"./chunk-OE4NN4TA-BrSHlpGf.js";import{t as s}from"./logo-2gJOYgsP.js";import{i as c,r as l}from"./vendor-forms-C1NpvVYM.js";import{t as u}from"./authService-D0sRBCdG.js";import{r as d}from"./authSchemas-DUqXcyQq.js";import{n as f,t as p}from"./PasswordStrengthMeter-eUAivqBP.js";var m=e(t(),1),h=r(),g=Array.from({length:22},(e,t)=>({id:t,num:Math.floor(Math.random()*60)+1,x:Math.random()*100,y:Math.random()*100,size:Math.random()*18+22,dur:Math.random()*14+10,delay:-(Math.random()*12),op:Math.random()*.13+.04})),_=Array.from({length:50},(e,t)=>({id:t,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2.5+.5,dur:Math.random()*3+2,delay:Math.random()*6})),v=`
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
.ll-badge {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  margin-top: .75rem;
  padding: .2rem .9rem;
  background: rgba(255,215,0,.07);
  border: 1px solid rgba(255,215,0,.18);
  border-radius: 100px;
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .14em;
  color: rgba(255,215,0,.5);
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

.ll-spinner {
  width: 16px; height: 16px;
  border: 2.5px solid rgba(26,12,0,.25);
  border-top-color: rgba(26,12,0,.85);
  border-radius: 50%;
  animation: ll-spin .7s linear infinite;
  flex-shrink: 0;
}

/* ── register link ── */
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
`;function y({children:e}){return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`style`,{dangerouslySetInnerHTML:{__html:v}}),(0,h.jsxs)(`div`,{className:`ll-wrap`,children:[(0,h.jsx)(`div`,{className:`fixed inset-0 bg-[#060410] -z-20 pointer-events-none`}),(0,h.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#1c0e34_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,h.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1a0a08_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,h.jsx)(`div`,{className:`ll-glow-tl`}),(0,h.jsx)(`div`,{className:`ll-glow-br`}),_.map(e=>(0,h.jsx)(`div`,{className:`ll-star`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.s}px`,height:`${e.s}px`,"--d":`${e.dur}s`,"--dl":`${e.delay}s`}},e.id)),g.map(e=>(0,h.jsx)(`div`,{className:`ll-ball`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.size}px`,height:`${e.size}px`,fontSize:`${e.size*.34}px`,opacity:e.op,"--d":`${e.dur}s`,"--dl":`${e.delay}s`},children:e.num},e.id)),(0,h.jsx)(`div`,{className:`ll-card-wrap`,children:(0,h.jsx)(`div`,{className:`ll-border`,children:(0,h.jsx)(`div`,{className:`ll-card`,children:e})})})]})]})}function b(){let e=i(),[t]=a(),r=t.get(`token`),[g,_]=(0,m.useState)(!1),{register:v,handleSubmit:b,watch:x,formState:{errors:S,isSubmitting:C}}=c({resolver:l(d),mode:`onTouched`}),w=x(`password`,``);return r?g?(0,h.jsxs)(y,{children:[(0,h.jsxs)(`div`,{className:`ll-header`,children:[(0,h.jsxs)(`div`,{className:`ll-logo`,children:[(0,h.jsx)(`div`,{className:`ll-ring-outer`}),(0,h.jsx)(`div`,{className:`ll-ring-inner`,children:(0,h.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,h.jsx)(`img`,{src:s,alt:`LAOLOTS`,style:{width:`100%`,height:`100%`,objectFit:`contain`,display:`block`}})})})]}),(0,h.jsx)(`h1`,{className:`ll-title`,children:`ສຳເລັດ!`}),(0,h.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`})]}),(0,h.jsxs)(`div`,{className:`ll-perf`,children:[(0,h.jsx)(`div`,{className:`ll-perf-hole left`}),(0,h.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,h.jsxs)(`div`,{className:`ll-form-area text-center py-4 space-y-6`,children:[(0,h.jsx)(`div`,{className:`w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/5`,children:(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[#34d399] text-4xl`,style:{fontVariationSettings:`'FILL' 1`},children:`check_circle`})}),(0,h.jsx)(`p`,{className:`text-sm text-white/60`,children:`ລະຫັດຜ່ານໃໝ່ຖືກຕັ້ງຄ່າສຳເລັດແລ້ວ`}),(0,h.jsx)(`div`,{className:`pt-2`,children:(0,h.jsxs)(`button`,{onClick:()=>e(`/login`),className:`ll-submit cursor-pointer`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[18px]`,children:`login`}),`ເຂົ້າສູ່ລະບົບ`]})})]})]}):(0,h.jsxs)(y,{children:[(0,h.jsxs)(`div`,{className:`ll-header`,children:[(0,h.jsxs)(`div`,{className:`ll-logo`,children:[(0,h.jsx)(`div`,{className:`ll-ring-outer`}),(0,h.jsx)(`div`,{className:`ll-ring-inner`,children:(0,h.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,h.jsx)(`img`,{src:s,alt:`LAOLOTS`,style:{width:`100%`,height:`100%`,objectFit:`contain`,display:`block`}})})})]}),(0,h.jsx)(`h1`,{className:`ll-title`,children:`ຕັ້ງລະຫັດຜ່ານໃໝ່`}),(0,h.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`}),(0,h.jsx)(`div`,{className:`ll-badge`,children:`✦ \xA0SECURE ACCOUNT\xA0 ✦`})]}),(0,h.jsxs)(`div`,{className:`ll-perf`,children:[(0,h.jsx)(`div`,{className:`ll-perf-hole left`}),(0,h.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,h.jsx)(`div`,{className:`ll-form-area`,children:(0,h.jsxs)(`form`,{onSubmit:b(async e=>{let t=await u.resetPassword(r,e.password).catch(()=>null);if(!t){n.error(`ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ`);return}t.ok?(_(!0),n.success(`ລີເຊັດລະຫັດຜ່ານສຳເລັດ!`)):n.error(t.data?.error||`Token ໝົດອາຍຸ ຫຼື ໃຊ້ໄປແລ້ວ`)}),noValidate:!0,className:`space-y-5`,children:[(0,h.jsxs)(`div`,{className:`text-left`,children:[(0,h.jsx)(f,{...v(`password`),label:`ລະຫັດຜ່ານໃໝ່ *`,placeholder:`ຢ່າງໜ້ອຍ 8 ຕົວ + ໂຕໃຫຍ່ + ຕົວເລກ + ໂຕພິເສດ`,autoComplete:`new-password`,error:S.password?.message}),(0,h.jsx)(p,{password:w})]}),(0,h.jsx)(`div`,{className:`text-left`,children:(0,h.jsx)(f,{...v(`confirm_password`),label:`ຢືນຢັນລະຫັດຜ່ານ *`,placeholder:`ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ`,autoComplete:`new-password`,error:S.confirm_password?.message})}),(0,h.jsx)(`button`,{type:`submit`,disabled:C,className:`ll-submit`,children:C?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`div`,{className:`ll-spinner`}),`ກຳລັງຕັ້ງລະຫັດ...`]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[18px]`,children:`lock_reset`}),`ຕັ້ງລະຫັດຜ່ານໃໝ່`]})})]})})]}):(0,h.jsxs)(y,{children:[(0,h.jsxs)(`div`,{className:`ll-header`,children:[(0,h.jsxs)(`div`,{className:`ll-logo`,children:[(0,h.jsx)(`div`,{className:`ll-ring-outer`}),(0,h.jsx)(`div`,{className:`ll-ring-inner`,children:(0,h.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,h.jsx)(`img`,{src:s,alt:`LAOLOTS`,style:{width:`100%`,height:`100%`,objectFit:`contain`,display:`block`}})})})]}),(0,h.jsx)(`h1`,{className:`ll-title`,children:`Token ບໍ່ຖືກຕ້ອງ`}),(0,h.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`})]}),(0,h.jsxs)(`div`,{className:`ll-perf`,children:[(0,h.jsx)(`div`,{className:`ll-perf-hole left`}),(0,h.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,h.jsxs)(`div`,{className:`ll-form-area text-center py-4 space-y-6`,children:[(0,h.jsx)(`div`,{className:`w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20`,children:(0,h.jsx)(`span`,{className:`material-symbols-outlined text-red-400 text-3xl`,style:{fontVariationSettings:`'FILL' 1`},children:`link_off`})}),(0,h.jsxs)(`p`,{className:`text-sm text-white/60 leading-relaxed`,children:[`ລິ້ງນີ້ໃຊ້ງານບໍ່ໄດ້ ຫຼື ໝົດອາຍຸແລ້ວ`,(0,h.jsx)(`br`,{}),`ກະລຸນາຂໍ Reset ໃໝ່`]}),(0,h.jsx)(`div`,{className:`pt-2`,children:(0,h.jsxs)(o,{to:`/forgot-password`,className:`ll-register`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[16px]`,children:`refresh`}),`ຂໍ Reset ໃໝ່`]})})]})]})}export{b as default};