import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{v as t}from"./vendor-charts-ChC9cbBZ.js";import{r as n,t as r}from"./vendor-react-CtUuC_pd.js";import{c as i,n as a}from"./chunk-OE4NN4TA-BsgKRE8y.js";import{n as o}from"./AuthContext-ti_pHE1s.js";import{i as s,r as c}from"./vendor-forms-aMRE1yEs.js";import{t as l}from"./authService-Db2iuydt.js";import{n as u}from"./authSchemas-D8P1zwLH.js";import{n as d,t as f}from"./PasswordStrengthMeter-Diy5WcKf.js";import{t as p}from"./useDebounce-BqlfPTnJ.js";var m=e(t(),1),h=r();function g({checking:e,available:t}){return e?(0,h.jsx)(`span`,{className:`w-4 h-4 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin block`}):t===!0?(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[18px] text-emerald-400`,style:{fontVariationSettings:`'FILL' 1`},children:`check_circle`}):t===!1?(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[18px] text-red-400`,style:{fontVariationSettings:`'FILL' 1`},children:`cancel`}):null}function _({error:e,available:t,takenMsg:n}){return e?(0,h.jsxs)(`p`,{className:`mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[13px]`,style:{fontVariationSettings:`'FILL' 1`},children:`error`}),e]}):t===!1?(0,h.jsxs)(`p`,{className:`mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[13px]`,style:{fontVariationSettings:`'FILL' 1`},children:`error`}),n]}):t===!0?(0,h.jsxs)(`p`,{className:`mt-1.5 text-xs text-emerald-400 font-bold flex items-center gap-1`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[13px]`,style:{fontVariationSettings:`'FILL' 1`},children:`check_circle`}),`ສາມາດໃຊ້ງານໄດ້`]}):null}var v=Array.from({length:22},(e,t)=>({id:t,num:Math.floor(Math.random()*60)+1,x:Math.random()*100,y:Math.random()*100,size:Math.random()*18+22,dur:Math.random()*14+10,delay:-(Math.random()*12),op:Math.random()*.13+.04})),y=Array.from({length:50},(e,t)=>({id:t,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2.5+.5,dur:Math.random()*3+2,delay:Math.random()*6})),b=`
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
  max-width: 480px;
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
  background: radial-gradient(circle at 40% 35%, #1e0f38, #0b0520);
  display: flex;
  align-items: center;
  justify-content: center;
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

/* ── alerts ── */
.ll-alert {
  display: flex;
  align-items: center;
  gap: .5rem;
  border-radius: 12px;
  padding: .7rem 1rem;
  margin-bottom: 1.25rem;
  font-size: .78rem;
  font-weight: 600;
}
.ll-alert-warn {
  background: rgba(255,160,0,.07);
  border: 1px solid rgba(255,160,0,.22);
  color: rgba(255,190,60,.9);
}
.ll-alert-err {
  background: rgba(220,38,38,.07);
  border: 1px solid rgba(220,38,38,.22);
  color: rgba(248,113,113,.95);
}

/* ── label ── */
.ll-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: .6rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,215,0,.42);
  margin-bottom: .45rem;
  text-align: left;
}

/* ── input ── */
.ll-field {
  position: relative;
  margin-bottom: 1.25rem;
}
.ll-input-icon {
  position: absolute;
  left: .9rem; top: 50%;
  transform: translateY(-50%);
  font-size: 17px;
  color: rgba(255,215,0,.35);
  pointer-events: none;
}
.ll-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,215,0,.04);
  border: 1px solid rgba(255,215,0,.14);
  border-radius: 14px;
  padding: .875rem 1rem .875rem 2.6rem;
  font-size: .88rem;
  font-weight: 500;
  color: rgba(255,255,255,.88);
  font-family: 'Noto Sans Lao', sans-serif;
  transition: border-color .25s, box-shadow .25s, background .25s;
  outline: none;
}
.ll-input::placeholder { color: rgba(255,215,0,.2); }
.ll-input:focus {
  border-color: rgba(255,215,0,.45);
  background: rgba(255,215,0,.07);
  box-shadow: 0 0 0 3px rgba(255,215,0,.07), 0 0 22px rgba(255,200,0,.06);
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

/* ── divider ── */
.ll-divider {
  display: flex;
  align-items: center;
  gap: .9rem;
  margin: 1.4rem 0;
}
.ll-div-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,215,0,.18), transparent);
}
.ll-div-txt {
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .14em;
  color: rgba(255,215,0,.28);
}

/* ── back link ── */
.ll-back {
  display: block;
  text-align: center;
  font-size: .68rem;
  color: rgba(255,255,255,.18);
  text-decoration: none;
  margin-top: 1rem;
  transition: color .2s;
}
.ll-back:hover { color: rgba(255,215,0,.45); }
`;function x(){let e=i(),{user:t,loading:r}=o(),[x,S]=(0,m.useState)(null),[C,w]=(0,m.useState)(null),[T,E]=(0,m.useState)(!1),[D,O]=(0,m.useState)(!1),{register:k,handleSubmit:A,watch:j,setError:M,formState:{errors:N,isSubmitting:P}}=s({resolver:c(u),mode:`onTouched`}),F=j(`username`,``),I=j(`email`,``),L=j(`password`,``),R=p(F,600),z=p(I,600);return(0,m.useEffect)(()=>{!r&&t&&e(`/`,{replace:!0})},[t,r,e]),(0,m.useEffect)(()=>{let e=R;if(!e||e.length<4||!/^[a-zA-Z0-9_]+$/.test(e)){S(null);return}E(!0),l.checkAvailability(`username`,e).then(({data:e})=>{S(e.available??null),E(!1)}).catch(()=>E(!1))},[R]),(0,m.useEffect)(()=>{let e=z;if(!e||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){w(null);return}O(!0),l.checkAvailability(`email`,e).then(({data:e})=>{w(e.available??null),w(e.available??null),O(!1)}).catch(()=>O(!1))},[z]),r?null:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`style`,{dangerouslySetInnerHTML:{__html:b}}),(0,h.jsxs)(`div`,{className:`ll-wrap`,children:[(0,h.jsx)(`div`,{className:`fixed inset-0 bg-[#060410] -z-20 pointer-events-none`}),(0,h.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#1c0e34_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,h.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1a0a08_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,h.jsx)(`div`,{className:`ll-glow-tl`}),(0,h.jsx)(`div`,{className:`ll-glow-br`}),y.map(e=>(0,h.jsx)(`div`,{className:`ll-star`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.s}px`,height:`${e.s}px`,"--d":`${e.dur}s`,"--dl":`${e.delay}s`}},e.id)),v.map(e=>(0,h.jsx)(`div`,{className:`ll-ball`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.size}px`,height:`${e.size}px`,fontSize:`${e.size*.34}px`,opacity:e.op,"--d":`${e.dur}s`,"--dl":`${e.delay}s`},children:e.num},e.id)),(0,h.jsx)(`div`,{className:`ll-card-wrap`,children:(0,h.jsx)(`div`,{className:`ll-border`,children:(0,h.jsxs)(`div`,{className:`ll-card`,children:[(0,h.jsxs)(`div`,{className:`ll-header`,children:[(0,h.jsxs)(`div`,{className:`ll-logo`,children:[(0,h.jsx)(`div`,{className:`ll-ring-outer`}),(0,h.jsx)(`div`,{className:`ll-ring-inner`,children:(0,h.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,h.jsxs)(`svg`,{viewBox:`0 0 38 38`,style:{width:`100%`,height:`100%`,display:`block`},children:[(0,h.jsxs)(`defs`,{children:[(0,h.jsx)(`clipPath`,{id:`circleClipRegister`,children:(0,h.jsx)(`circle`,{cx:`19`,cy:`19`,r:`17`})}),(0,h.jsxs)(`linearGradient`,{id:`goldStripeRegister`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,h.jsx)(`stop`,{offset:`0%`,stopColor:`#A67C1E`}),(0,h.jsx)(`stop`,{offset:`50%`,stopColor:`#F5D77F`}),(0,h.jsx)(`stop`,{offset:`100%`,stopColor:`#A67C1E`})]}),(0,h.jsxs)(`linearGradient`,{id:`darkStripeRegister`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,h.jsx)(`stop`,{offset:`0%`,stopColor:`#0F1326`}),(0,h.jsx)(`stop`,{offset:`50%`,stopColor:`#1E2548`}),(0,h.jsx)(`stop`,{offset:`100%`,stopColor:`#0F1326`})]}),(0,h.jsxs)(`radialGradient`,{id:`goldCircleRegister`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,h.jsx)(`stop`,{offset:`0%`,stopColor:`#FFFDF5`}),(0,h.jsx)(`stop`,{offset:`70%`,stopColor:`#F3D072`}),(0,h.jsx)(`stop`,{offset:`100%`,stopColor:`#C99E32`})]})]}),(0,h.jsxs)(`g`,{clipPath:`url(#circleClipRegister)`,children:[(0,h.jsx)(`rect`,{x:`0`,y:`0`,width:`38`,height:`9.5`,fill:`url(#goldStripeRegister)`}),(0,h.jsx)(`rect`,{x:`0`,y:`9.5`,width:`38`,height:`19`,fill:`url(#darkStripeRegister)`}),(0,h.jsx)(`rect`,{x:`0`,y:`28.5`,width:`38`,height:`9.5`,fill:`url(#goldStripeRegister)`}),(0,h.jsx)(`circle`,{cx:`19`,cy:`19`,r:`6.5`,fill:`url(#goldCircleRegister)`})]})]})})})]}),(0,h.jsx)(`h1`,{className:`ll-title`,children:`ສ້າງບັນຊີໃໝ່`}),(0,h.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`}),(0,h.jsx)(`div`,{className:`ll-badge`,children:`✦ \xA0FORTUNE AWAITS\xA0 ✦`})]}),(0,h.jsxs)(`div`,{className:`ll-perf`,children:[(0,h.jsx)(`div`,{className:`ll-perf-hole left`}),(0,h.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,h.jsxs)(`div`,{className:`ll-form-area`,children:[(0,h.jsxs)(`form`,{onSubmit:A(async t=>{if(x===!1){M(`username`,{message:`Username ນີ້ຖືກໃຊ້ງານແລ້ວ`});return}if(C===!1){M(`email`,{message:`Email ນີ້ຖືກໃຊ້ງານແລ້ວ`});return}let r=await l.register({username:t.username,full_name:t.full_name,email:t.email,phone_number:t.phone_number||void 0,password:t.password}).catch(()=>null);if(!r){n.error(`ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ`);return}if(r.ok)n.success(`ສ້າງບັນຊີສຳເລັດ! ກະລຸນາຢືນຢັນ OTP`),e(`/verify-otp`,{state:{userId:r.data.user_id,email:t.email,devOtp:r.data.dev_otp}});else{let e=r.data?.error||`ມີຂໍ້ຜິດພາດ`,t=r.data?.field;t===`username`?M(`username`,{message:e}):t===`email`?M(`email`,{message:e}):n.error(e)}}),noValidate:!0,className:`space-y-4`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`label`,{className:`ll-label`,children:[`Username `,(0,h.jsx)(`span`,{className:`text-red-400 normal-case font-bold text-[10px]`,children:`* a-z 0-9 _ (4-20 ຕົວ)`})]}),(0,h.jsxs)(`div`,{className:`ll-field`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined ll-input-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`person`}),(0,h.jsx)(`input`,{...k(`username`),placeholder:`ປ້ອນ username`,autoComplete:`username`,spellCheck:!1,className:`ll-input ${N.username?`!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20`:``}`}),(0,h.jsx)(`div`,{className:`absolute right-3 top-[1.05rem] -translate-y-1/2`,children:(0,h.jsx)(g,{checking:T,available:N.username?null:x})}),(0,h.jsx)(_,{error:N.username?.message,available:N.username?null:x,takenMsg:`Username ນີ້ຖືກໃຊ້ງານແລ້ວ`})]})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`label`,{className:`ll-label`,children:[`ຊື່-ນາມສະກຸນ `,(0,h.jsx)(`span`,{className:`text-red-400`,children:`*`})]}),(0,h.jsxs)(`div`,{className:`ll-field`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined ll-input-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`badge`}),(0,h.jsx)(`input`,{...k(`full_name`),placeholder:`ປ້ອນຊື່ ແລະ ນາມສະກຸນ`,autoComplete:`name`,className:`ll-input ${N.full_name?`!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20`:``}`}),N.full_name&&(0,h.jsxs)(`p`,{className:`mt-1.5 text-[11px] text-red-400 font-bold flex items-center gap-1`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[13px]`,style:{fontVariationSettings:`'FILL' 1`},children:`error`}),N.full_name.message]})]})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`label`,{className:`ll-label`,children:[`Email `,(0,h.jsx)(`span`,{className:`text-red-400`,children:`*`})]}),(0,h.jsxs)(`div`,{className:`ll-field`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined ll-input-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`mail`}),(0,h.jsx)(`input`,{...k(`email`),type:`email`,placeholder:`example@email.com`,autoComplete:`email`,className:`ll-input ${N.email?`!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20`:``}`}),(0,h.jsx)(`div`,{className:`absolute right-3 top-[1.05rem] -translate-y-1/2`,children:(0,h.jsx)(g,{checking:D,available:N.email?null:C})}),(0,h.jsx)(_,{error:N.email?.message,available:N.email?null:C,takenMsg:`Email ນີ້ຖືກໃຊ້ງານແລ້ວ`})]})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`label`,{className:`ll-label`,children:[`ເບີໂທ `,(0,h.jsx)(`span`,{className:`normal-case font-bold text-[#d4af37]/50 text-[10px]`,children:`(ບໍ່ບັງຄັບ 020XXXXXXXX)`})]}),(0,h.jsxs)(`div`,{className:`ll-field`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined ll-input-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`phone`}),(0,h.jsx)(`input`,{...k(`phone_number`),type:`tel`,placeholder:`020XXXXXXXX`,autoComplete:`tel`,className:`ll-input ${N.phone_number?`!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20`:``}`}),N.phone_number&&(0,h.jsxs)(`p`,{className:`mt-1.5 text-[11px] text-red-400 font-bold flex items-center gap-1`,children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[13px]`,style:{fontVariationSettings:`'FILL' 1`},children:`error`}),N.phone_number.message]})]})]}),(0,h.jsxs)(`div`,{className:`space-y-1`,children:[(0,h.jsx)(d,{...k(`password`),label:`ລະຫັດຜ່ານ *`,placeholder:`ຢ່າງໜ້ອຍ 8 ຕົວ + ໂຕໃຫຍ່ + ຕົວເລກ + ໂຕພິເສດ`,autoComplete:`new-password`,error:N.password?.message}),(0,h.jsx)(f,{password:L})]}),(0,h.jsx)(`div`,{children:(0,h.jsx)(d,{...k(`confirm_password`),label:`ຢືນຢັນລະຫັດຜ່ານ *`,placeholder:`ປ້ອນລະຫັດຜ່ານອີກຄັ້ງ`,autoComplete:`new-password`,error:N.confirm_password?.message})}),(0,h.jsx)(`div`,{className:`pt-2`,children:(0,h.jsx)(`button`,{type:`submit`,disabled:P,className:`ll-submit`,children:P?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`div`,{className:`ll-spinner`}),`ກຳລັງສ້າງບັນຊີ...`]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`span`,{className:`material-symbols-outlined text-[18px]`,children:`person_add`}),`ສ້າງບັນຊີ`]})})}),(0,h.jsxs)(`p`,{className:`text-center text-sm text-white/50 pt-2 font-medium`,children:[`ມີບັນຊີແລ້ວ?`,` `,(0,h.jsx)(a,{to:`/login`,className:`text-[#d4af37] font-black hover:underline ml-1`,children:`ເຂົ້າສູ່ລະບົບ`})]})]}),(0,h.jsxs)(`div`,{className:`ll-divider`,children:[(0,h.jsx)(`div`,{className:`ll-div-line`}),(0,h.jsx)(`span`,{className:`ll-div-txt`,children:`OR`}),(0,h.jsx)(`div`,{className:`ll-div-line`})]}),(0,h.jsx)(a,{to:`/`,className:`ll-back`,children:`← ກັບໄປໜ້າຫຼັກ`})]})]})})})]})]})}export{x as default};