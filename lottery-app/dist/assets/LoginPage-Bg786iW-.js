import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{v as t}from"./vendor-charts-ChC9cbBZ.js";import{t as n}from"./vendor-react-CtUuC_pd.js";import{c as r,l as i,n as a}from"./chunk-OE4NN4TA-BsgKRE8y.js";import{n as o}from"./AuthContext-ti_pHE1s.js";var s=e(t(),1),c=n();function l(e){return e===`admin`||e===`staff`?`/admin`:`/`}var u=Array.from({length:22},(e,t)=>({id:t,num:Math.floor(Math.random()*60)+1,x:Math.random()*100,y:Math.random()*100,size:Math.random()*18+22,dur:Math.random()*14+10,delay:-(Math.random()*12),op:Math.random()*.13+.04})),d=Array.from({length:50},(e,t)=>({id:t,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2.5+.5,dur:Math.random()*3+2,delay:Math.random()*6})),f=`
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
}

/* ── input ── */
.ll-field {
  position: relative;
  margin-bottom: 1rem;
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

/* ── eye toggle ── */
.ll-eye {
  position: absolute;
  right: .9rem; top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,215,0,.35);
  padding: 0;
  display: flex;
  transition: color .2s;
}
.ll-eye:hover { color: rgba(255,215,0,.75); }

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

/* ── forgot ── */
.ll-forgot {
  display: block;
  text-align: right;
  font-family: 'Cinzel', serif;
  font-size: .62rem;
  letter-spacing: .07em;
  color: rgba(255,215,0,.3);
  text-decoration: none;
  margin-top: .5rem;
  transition: color .2s;
}
.ll-forgot:hover { color: rgba(255,215,0,.7); }

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
`;function p(){let[e,t]=(0,s.useState)(``),[n,p]=(0,s.useState)(``),[m,h]=(0,s.useState)(!1),[g,_]=(0,s.useState)(``),[v,y]=(0,s.useState)(!1),{login:b,user:x,loading:S}=o(),C=r(),[w]=i(),T=w.get(`from`);return(0,s.useEffect)(()=>{!S&&x&&C(T||l(x.role),{replace:!0})},[x,S]),S?null:(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`style`,{dangerouslySetInnerHTML:{__html:f}}),(0,c.jsxs)(`div`,{className:`ll-wrap`,children:[(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[#060410] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#1c0e34_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1a0a08_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`ll-glow-tl`}),(0,c.jsx)(`div`,{className:`ll-glow-br`}),d.map(e=>(0,c.jsx)(`div`,{className:`ll-star`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.s}px`,height:`${e.s}px`,"--d":`${e.dur}s`,"--dl":`${e.delay}s`}},e.id)),u.map(e=>(0,c.jsx)(`div`,{className:`ll-ball`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.size}px`,height:`${e.size}px`,fontSize:`${e.size*.34}px`,opacity:e.op,"--d":`${e.dur}s`,"--dl":`${e.delay}s`},children:e.num},e.id)),(0,c.jsx)(`div`,{className:`ll-card-wrap`,children:(0,c.jsx)(`div`,{className:`ll-border`,children:(0,c.jsxs)(`div`,{className:`ll-card`,children:[(0,c.jsxs)(`div`,{className:`ll-header`,children:[(0,c.jsxs)(`div`,{className:`ll-logo`,children:[(0,c.jsx)(`div`,{className:`ll-ring-outer`}),(0,c.jsx)(`div`,{className:`ll-ring-inner`,children:(0,c.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,c.jsxs)(`svg`,{viewBox:`0 0 38 38`,style:{width:`100%`,height:`100%`,display:`block`},children:[(0,c.jsxs)(`defs`,{children:[(0,c.jsx)(`clipPath`,{id:`circleClipLogin`,children:(0,c.jsx)(`circle`,{cx:`19`,cy:`19`,r:`17`})}),(0,c.jsxs)(`linearGradient`,{id:`goldStripeLogin`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#A67C1E`}),(0,c.jsx)(`stop`,{offset:`50%`,stopColor:`#F5D77F`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#A67C1E`})]}),(0,c.jsxs)(`linearGradient`,{id:`darkStripeLogin`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#0F1326`}),(0,c.jsx)(`stop`,{offset:`50%`,stopColor:`#1E2548`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#0F1326`})]}),(0,c.jsxs)(`radialGradient`,{id:`goldCircleLogin`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#FFFDF5`}),(0,c.jsx)(`stop`,{offset:`70%`,stopColor:`#F3D072`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#C99E32`})]})]}),(0,c.jsxs)(`g`,{clipPath:`url(#circleClipLogin)`,children:[(0,c.jsx)(`rect`,{x:`0`,y:`0`,width:`38`,height:`9.5`,fill:`url(#goldStripeLogin)`}),(0,c.jsx)(`rect`,{x:`0`,y:`9.5`,width:`38`,height:`19`,fill:`url(#darkStripeLogin)`}),(0,c.jsx)(`rect`,{x:`0`,y:`28.5`,width:`38`,height:`9.5`,fill:`url(#goldStripeLogin)`}),(0,c.jsx)(`circle`,{cx:`19`,cy:`19`,r:`6.5`,fill:`url(#goldCircleLogin)`})]})]})})})]}),(0,c.jsx)(`h1`,{className:`ll-title`,children:`ເຂົ້າສູ່ລະບົບ`}),(0,c.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`}),(0,c.jsx)(`div`,{className:`ll-badge`,children:`✦ \xA0FORTUNE AWAITS\xA0 ✦`})]}),(0,c.jsxs)(`div`,{className:`ll-perf`,children:[(0,c.jsx)(`div`,{className:`ll-perf-hole left`}),(0,c.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,c.jsxs)(`div`,{className:`ll-form-area`,children:[T&&!g&&(0,c.jsxs)(`div`,{className:`ll-alert ll-alert-warn`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:16,fontVariationSettings:`'FILL' 1`},children:`info`}),`ກະລຸນາ login ກ່ອນເຂົ້າໃຊ້ໜ້ານີ້`]}),g&&(0,c.jsxs)(`div`,{className:`ll-alert ll-alert-err`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:16,fontVariationSettings:`'FILL' 1`},children:`error`}),g]}),(0,c.jsxs)(`form`,{onSubmit:async t=>{t.preventDefault(),_(``),y(!0);let r=await b(e,n);r.success?C(T||l(r.role??`member`),{replace:!0}):_(r.error),y(!1)},noValidate:!0,children:[(0,c.jsx)(`label`,{className:`ll-label`,children:`ຊື່ຜູ້ໃຊ້ (Username)`}),(0,c.jsxs)(`div`,{className:`ll-field`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined ll-input-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`person`}),(0,c.jsx)(`input`,{type:`text`,className:`ll-input`,autoComplete:`username`,placeholder:`ປ້ອນ username`,required:!0,value:e,onChange:e=>t(e.target.value)})]}),(0,c.jsx)(`label`,{className:`ll-label`,children:`ລະຫັດຜ່ານ (Password)`}),(0,c.jsxs)(`div`,{className:`ll-field`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined ll-input-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`lock`}),(0,c.jsx)(`input`,{type:m?`text`:`password`,className:`ll-input`,style:{paddingRight:`2.8rem`},autoComplete:`current-password`,placeholder:`••••••••`,required:!0,value:n,onChange:e=>p(e.target.value)}),(0,c.jsx)(`button`,{type:`button`,className:`ll-eye`,onClick:()=>h(e=>!e),children:(0,c.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:18},children:m?`visibility_off`:`visibility`})})]}),(0,c.jsx)(`button`,{type:`submit`,disabled:v,className:`ll-submit`,children:v?(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`div`,{className:`ll-spinner`}),`ກຳລັງເຂົ້າລະບົບ...`]}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`span`,{style:{fontSize:`1.1rem`},children:`🎯`}),`ເຂົ້າສູ່ລະບົບ`]})}),(0,c.jsx)(a,{to:`/forgot-password`,className:`ll-forgot`,children:`ລືມລະຫັດຜ່ານ?`})]}),(0,c.jsxs)(`div`,{className:`ll-divider`,children:[(0,c.jsx)(`div`,{className:`ll-div-line`}),(0,c.jsx)(`span`,{className:`ll-div-txt`,children:`OR`}),(0,c.jsx)(`div`,{className:`ll-div-line`})]}),(0,c.jsxs)(a,{to:`/register`,className:`ll-register`,children:[(0,c.jsx)(`span`,{style:{fontSize:`1rem`},children:`✨`}),`ສ້າງບັນຊີໃໝ່ ຟຣີ`]}),(0,c.jsx)(a,{to:`/`,className:`ll-back`,children:`← ກັບໄປໜ້າຫຼັກ`})]})]})})})]})]})}export{p as default};