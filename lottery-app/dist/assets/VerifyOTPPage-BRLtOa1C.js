import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{v as t}from"./vendor-charts-iQ_2Absj.js";import{r as n,t as r}from"./vendor-react-nvcEvhRQ.js";import{n as i,s as a}from"./chunk-OE4NN4TA-BrSHlpGf.js";import{t as o}from"./authService-Db2iuydt.js";var s=e(t(),1),c=r();function l({length:e=6,value:t=``,onChange:n,disabled:r=!1}){let i=(0,s.useRef)([]),a=(t+`      `).split(``).slice(0,e).map(e=>/\d/.test(e)?e:``);(0,s.useEffect)(()=>{r||i.current[0]?.focus()},[r]);let o=e=>n(e.join(``).replace(/\s/g,``)),l=(t,n)=>{let r=n.target.value.replace(/\D/g,``);if(!r)return;let s=[...a];s[t]=r.slice(-1),o(s),t<e-1&&i.current[t+1]?.focus()},u=(t,n)=>{if(n.key===`Backspace`){n.preventDefault();let e=[...a];e[t]?(e[t]=``,o(e)):t>0&&(e[t-1]=``,o(e),i.current[t-1]?.focus())}n.key===`ArrowLeft`&&t>0&&i.current[t-1]?.focus(),n.key===`ArrowRight`&&t<e-1&&i.current[t+1]?.focus()},d=t=>{t.preventDefault();let n=t.clipboardData.getData(`text`).replace(/\D/g,``).slice(0,e),r=Array(e).fill(``);n.split(``).forEach((e,t)=>{r[t]=e}),o(r);let a=Math.min(n.length,e-1);i.current[a]?.focus()};return(0,c.jsx)(`div`,{className:`flex gap-2 justify-center`,role:`group`,"aria-label":`OTP input`,children:a.map((e,t)=>(0,c.jsx)(`input`,{ref:e=>i.current[t]=e,type:`text`,inputMode:`numeric`,pattern:`[0-9]`,maxLength:1,value:e,disabled:r,autoComplete:`one-time-code`,"aria-label":`Digit ${t+1}`,onChange:e=>l(t,e),onKeyDown:e=>u(t,e),onPaste:d,onFocus:e=>e.target.select(),className:`
            w-11 h-14 text-center text-2xl font-black rounded-xl border transition-all duration-150
            bg-black/45 text-white
            focus:outline-none
            ${e?`border-[#d4af37] bg-[#0e1124] shadow-md shadow-[#d4af37]/10 scale-105`:`border-white/[0.08]`}
            focus:border-[#d4af37] focus:bg-[#0e1124] focus:scale-105 focus:shadow-md focus:shadow-[#d4af37]/15
            disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
          `},t))})}function u({seconds:e,onExpire:t}){let[n,r]=(0,s.useState)(e),i=(0,s.useRef)(t);i.current=t,(0,s.useEffect)(()=>{r(e)},[e]),(0,s.useEffect)(()=>{if(n<=0){i.current?.();return}let e=setInterval(()=>{r(t=>t<=1?(clearInterval(e),i.current?.(),0):t-1)},1e3);return()=>clearInterval(e)},[+(n>0)]);let a=Math.floor(n/60),o=n%60,l=n/e*100,u=n>0&&n<=60;return n===0?null:(0,c.jsxs)(`div`,{className:`inline-flex items-center gap-2 bg-[#0d0e1c]/75 border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-full px-2.5 py-1`,children:[(0,c.jsx)(`div`,{className:`relative w-4.5 h-4.5 flex items-center justify-center`,children:(0,c.jsxs)(`svg`,{className:`w-4.5 h-4.5 -rotate-90`,viewBox:`0 0 20 20`,children:[(0,c.jsxs)(`defs`,{children:[(0,c.jsxs)(`linearGradient`,{id:`timerGoldGrad`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`100%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#ffd700`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#aa7c11`})]}),(0,c.jsxs)(`linearGradient`,{id:`timerUrgentGrad`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`100%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#ff7b7b`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#ff4646`})]})]}),(0,c.jsx)(`circle`,{cx:`10`,cy:`10`,r:`8`,fill:`none`,stroke:`rgba(255, 255, 255, 0.08)`,strokeWidth:`2.5`}),(0,c.jsx)(`circle`,{cx:`10`,cy:`10`,r:`8`,fill:`none`,stroke:u?`url(#timerUrgentGrad)`:`url(#timerGoldGrad)`,strokeWidth:`2.5`,strokeDasharray:`${2*Math.PI*8}`,strokeDashoffset:`${2*Math.PI*8*(1-l/100)}`,strokeLinecap:`round`,className:`transition-all duration-1000`})]})}),u?(0,c.jsx)(`span`,{className:`text-xs font-black font-sans tracking-wider tabular-nums text-[#ff4646] drop-shadow-[0_0_6px_#ff4646] animate-pulse`,children:a>0?`${a}:${String(o).padStart(2,`0`)}`:`0:${String(o).padStart(2,`0`)}`}):(0,c.jsx)(`span`,{className:`text-xs font-black font-sans tracking-wider tabular-nums text-[#ffd700] drop-shadow-[0_0_4px_rgba(255,215,0,0.2)]`,children:a>0?`${a}:${String(o).padStart(2,`0`)}`:`0:${String(o).padStart(2,`0`)}`})]})}var d=600,f=5,p=Array.from({length:22},(e,t)=>({id:t,num:Math.floor(Math.random()*60)+1,x:Math.random()*100,y:Math.random()*100,size:Math.random()*18+22,dur:Math.random()*14+10,delay:-(Math.random()*12),op:Math.random()*.13+.04})),m=Array.from({length:50},(e,t)=>({id:t,x:Math.random()*100,y:Math.random()*100,s:Math.random()*2.5+.5,dur:Math.random()*3+2,delay:Math.random()*6})),h=`
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
`;function g({children:e}){return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`style`,{dangerouslySetInnerHTML:{__html:h}}),(0,c.jsxs)(`div`,{className:`ll-wrap`,children:[(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[#060410] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#1c0e34_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`fixed inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1a0a08_0%,transparent_55%)] -z-20 pointer-events-none`}),(0,c.jsx)(`div`,{className:`ll-glow-tl`}),(0,c.jsx)(`div`,{className:`ll-glow-br`}),m.map(e=>(0,c.jsx)(`div`,{className:`ll-star`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.s}px`,height:`${e.s}px`,"--d":`${e.dur}s`,"--dl":`${e.delay}s`}},e.id)),p.map(e=>(0,c.jsx)(`div`,{className:`ll-ball`,style:{left:`${e.x}%`,top:`${e.y}%`,width:`${e.size}px`,height:`${e.size}px`,fontSize:`${e.size*.34}px`,opacity:e.op,"--d":`${e.dur}s`,"--dl":`${e.delay}s`},children:e.num},e.id)),(0,c.jsx)(`div`,{className:`ll-card-wrap`,children:(0,c.jsx)(`div`,{className:`ll-border`,children:(0,c.jsx)(`div`,{className:`ll-card`,children:e})})})]})]})}function _(){let{state:e}=a(),t=e?.userId,r=e?.email,p=e?.devOtp,[m,h]=(0,s.useState)(``),[_,v]=(0,s.useState)(!1),[y,b]=(0,s.useState)(!1),[x,S]=(0,s.useState)(!1),[C,w]=(0,s.useState)(0),[T,E]=(0,s.useState)(``),[D,O]=(0,s.useState)(0),[k,A]=(0,s.useState)(null);if(!t)return(0,c.jsxs)(g,{children:[(0,c.jsxs)(`div`,{className:`ll-header`,children:[(0,c.jsxs)(`div`,{className:`ll-logo`,children:[(0,c.jsx)(`div`,{className:`ll-ring-outer`}),(0,c.jsx)(`div`,{className:`ll-ring-inner`,children:(0,c.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,c.jsxs)(`svg`,{viewBox:`0 0 38 38`,style:{width:`100%`,height:`100%`,display:`block`},children:[(0,c.jsxs)(`defs`,{children:[(0,c.jsx)(`clipPath`,{id:`circleClipVerifyOTP1`,children:(0,c.jsx)(`circle`,{cx:`19`,cy:`19`,r:`17`})}),(0,c.jsxs)(`linearGradient`,{id:`goldStripeVerifyOTP1`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#A67C1E`}),(0,c.jsx)(`stop`,{offset:`50%`,stopColor:`#F5D77F`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#A67C1E`})]}),(0,c.jsxs)(`linearGradient`,{id:`darkStripeVerifyOTP1`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#0F1326`}),(0,c.jsx)(`stop`,{offset:`50%`,stopColor:`#1E2548`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#0F1326`})]}),(0,c.jsxs)(`radialGradient`,{id:`goldCircleVerifyOTP1`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#FFFDF5`}),(0,c.jsx)(`stop`,{offset:`70%`,stopColor:`#F3D072`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#C99E32`})]})]}),(0,c.jsxs)(`g`,{clipPath:`url(#circleClipVerifyOTP1)`,children:[(0,c.jsx)(`rect`,{x:`0`,y:`0`,width:`38`,height:`9.5`,fill:`url(#goldStripeVerifyOTP1)`}),(0,c.jsx)(`rect`,{x:`0`,y:`9.5`,width:`38`,height:`19`,fill:`url(#darkStripeVerifyOTP1)`}),(0,c.jsx)(`rect`,{x:`0`,y:`28.5`,width:`38`,height:`9.5`,fill:`url(#goldStripeVerifyOTP1)`}),(0,c.jsx)(`circle`,{cx:`19`,cy:`19`,r:`6.5`,fill:`url(#goldCircleVerifyOTP1)`})]})]})})})]}),(0,c.jsx)(`h1`,{className:`ll-title`,children:`Session ໝົດອາຍຸ`}),(0,c.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`})]}),(0,c.jsxs)(`div`,{className:`ll-perf`,children:[(0,c.jsx)(`div`,{className:`ll-perf-hole left`}),(0,c.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,c.jsxs)(`div`,{className:`ll-form-area text-center py-4 space-y-6`,children:[(0,c.jsx)(`div`,{className:`w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto border border-white/[0.08] text-white/45`,children:(0,c.jsx)(`span`,{className:`material-symbols-outlined text-3xl`,style:{fontVariationSettings:`'FILL' 1`},children:`hourglass_disabled`})}),(0,c.jsx)(`p`,{className:`text-sm text-white/50`,children:`Session ການລົງທະບຽນໝົດອາຍຸແລ້ວ`}),(0,c.jsx)(`div`,{className:`pt-2`,children:(0,c.jsxs)(i,{to:`/register`,className:`ll-register`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[18px]`,children:`person_add`}),`ສ້າງບັນຊີໃໝ່`]})})]})]});let j=r?r.replace(/^(.{2}).+(@.+)$/,`$1***$2`):``,M=C>=f,N=k??p,P=async()=>{if(m.length!==6){E(`ກະລຸນາປ້ອນ OTP ໃຫ້ຄົບ 6 ຕົວ`);return}if(y){E(`OTP ໝົດອາຍຸແລ້ວ ກະລຸນາຂໍ OTP ໃໝ່`);return}if(M){E(`ລອງ OTP ຫຼາຍເກີນໄປ ກະລຸນາຂໍ OTP ໃໝ່`);return}v(!0),E(``);let e=await o.verifyOTP(t,m).catch(()=>null);if(!e){v(!1),E(`ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ`);return}if(e.ok){let{token:t,user:r}=e.data;localStorage.setItem(`lao_lottery_token`,t),localStorage.setItem(`lao_lottery_user`,JSON.stringify(r)),n.success(`ຍິນດີຕ້ອນຮັບ ${r.name}!`),window.location.replace(`/`)}else{let t=C+1;w(t),h(``),E(t>=f?`ລອງ OTP ຜິດ 5 ຄັ້ງ ກະລຸນາຂໍ OTP ໃໝ່`:e.data?.error||`OTP ບໍ່ຖືກຕ້ອງ (ຍັງເຫຼືອ ${f-t} ຄັ້ງ)`),v(!1)}},F=async()=>{S(!0),E(``);let e=await o.resendOTP(t).catch(()=>null);e?e.ok?(b(!1),w(0),h(``),A(e.data.dev_otp??null),O(e=>e+1),n.success(`ສົ່ງ OTP ໃໝ່ສຳເລັດ`)):n.error(e.data?.error||`ຂໍ OTP ໃໝ່ບໍ່ສຳເລັດ`):n.error(`ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ`),S(!1)},I=y||M;return(0,c.jsxs)(g,{children:[(0,c.jsxs)(`div`,{className:`ll-header`,children:[(0,c.jsxs)(`div`,{className:`ll-logo`,children:[(0,c.jsx)(`div`,{className:`ll-ring-outer`}),(0,c.jsx)(`div`,{className:`ll-ring-inner`,children:(0,c.jsx)(`span`,{className:`ll-logo-icon`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,width:38,height:38},children:(0,c.jsxs)(`svg`,{viewBox:`0 0 38 38`,style:{width:`100%`,height:`100%`,display:`block`},children:[(0,c.jsxs)(`defs`,{children:[(0,c.jsx)(`clipPath`,{id:`circleClipVerifyOTP2`,children:(0,c.jsx)(`circle`,{cx:`19`,cy:`19`,r:`17`})}),(0,c.jsxs)(`linearGradient`,{id:`goldStripeVerifyOTP2`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#A67C1E`}),(0,c.jsx)(`stop`,{offset:`50%`,stopColor:`#F5D77F`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#A67C1E`})]}),(0,c.jsxs)(`linearGradient`,{id:`darkStripeVerifyOTP2`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#0F1326`}),(0,c.jsx)(`stop`,{offset:`50%`,stopColor:`#1E2548`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#0F1326`})]}),(0,c.jsxs)(`radialGradient`,{id:`goldCircleVerifyOTP2`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,c.jsx)(`stop`,{offset:`0%`,stopColor:`#FFFDF5`}),(0,c.jsx)(`stop`,{offset:`70%`,stopColor:`#F3D072`}),(0,c.jsx)(`stop`,{offset:`100%`,stopColor:`#C99E32`})]})]}),(0,c.jsxs)(`g`,{clipPath:`url(#circleClipVerifyOTP2)`,children:[(0,c.jsx)(`rect`,{x:`0`,y:`0`,width:`38`,height:`9.5`,fill:`url(#goldStripeVerifyOTP2)`}),(0,c.jsx)(`rect`,{x:`0`,y:`9.5`,width:`38`,height:`19`,fill:`url(#darkStripeVerifyOTP2)`}),(0,c.jsx)(`rect`,{x:`0`,y:`28.5`,width:`38`,height:`9.5`,fill:`url(#goldStripeVerifyOTP2)`}),(0,c.jsx)(`circle`,{cx:`19`,cy:`19`,r:`6.5`,fill:`url(#goldCircleVerifyOTP2)`})]})]})})})]}),(0,c.jsx)(`h1`,{className:`ll-title`,children:`ຢືນຢັນ OTP`}),(0,c.jsx)(`p`,{className:`ll-subtitle`,children:`Lao Lottery Live System`}),(0,c.jsxs)(`p`,{className:`text-white/60 text-xs mt-2 leading-relaxed`,children:[`ສົ່ງລະຫັດ OTP ໄປຍັງ `,(0,c.jsx)(`span`,{className:`text-white font-black`,children:j})]})]}),(0,c.jsxs)(`div`,{className:`ll-perf`,children:[(0,c.jsx)(`div`,{className:`ll-perf-hole left`}),(0,c.jsx)(`div`,{className:`ll-perf-hole right`})]}),(0,c.jsxs)(`div`,{className:`ll-form-area space-y-5`,children:[N&&(0,c.jsxs)(`div`,{className:`flex items-start gap-2.5 bg-black/35 border border-[#d4af37]/20 rounded-xl px-4 py-3 shadow-inner text-left`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[#d4af37] text-[18px] mt-0.5`,style:{fontVariationSettings:`'FILL' 1`},children:`developer_mode`}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`p`,{className:`text-[10px] font-black text-[#d4af37] uppercase tracking-wider`,children:`DEV MODE — OTP Code`}),(0,c.jsxs)(`p`,{className:`text-xs text-white/80 font-black mt-1`,children:[`OTP: `,(0,c.jsx)(`span`,{className:`font-mono tracking-[0.3em] font-black`,children:N})]})]})]}),T&&(0,c.jsxs)(`div`,{className:`flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-left`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-red-400 text-[18px] mt-0.5`,style:{fontVariationSettings:`'FILL' 1`},children:`error`}),(0,c.jsx)(`p`,{className:`text-xs font-bold text-red-400`,children:T})]}),(0,c.jsxs)(`div`,{className:`flex items-center justify-between bg-black/25 rounded-xl border border-white/[0.04] px-4 py-3 text-left`,children:[(0,c.jsx)(`p`,{className:`text-xs font-black text-white/45 uppercase tracking-wide`,children:`OTP ໝົດອາຍຸໃນ:`}),y?(0,c.jsxs)(`span`,{className:`text-xs font-black text-red-400 flex items-center gap-1`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[14px]`,style:{fontVariationSettings:`'FILL' 1`},children:`schedule`}),`ໝົດອາຍຸແລ້ວ`]}):(0,c.jsx)(`div`,{className:`text-xs font-black text-[#d4af37] flex items-center gap-1`,children:(0,c.jsx)(u,{seconds:d,onExpire:()=>{b(!0),E(`OTP ໝົດອາຍຸ ກະລຸນາຂໍ OTP ໃໝ່`)}},D)})]}),(0,c.jsxs)(`div`,{className:`py-2 text-center`,children:[(0,c.jsx)(`p`,{className:`text-center text-xs font-black text-white/35 uppercase tracking-wider mb-4`,children:`ປ້ອນລະຫັດ 6 ຕົວ`}),(0,c.jsx)(l,{value:m,onChange:h,disabled:_||y||M}),C>0&&!M&&(0,c.jsx)(`div`,{className:`flex justify-center gap-2 mt-5 select-none`,children:Array.from({length:f}).map((e,t)=>(0,c.jsx)(`div`,{className:`w-2 h-2 rounded-full transition-colors duration-200 ${t<C?`bg-red-400 shadow-[0_0_6px_#f87171]`:`bg-white/10`}`},t))})]}),(0,c.jsx)(`button`,{onClick:P,disabled:_||m.replace(/\s/g,``).length!==6||y||M,className:`ll-submit cursor-pointer`,children:_?(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`div`,{className:`ll-spinner`}),`ກຳລັງຢືນຢັນ...`]}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[18px]`,children:`verified`}),`ຢືນຢັນ OTP`]})}),(0,c.jsxs)(`div`,{className:`text-center pt-2 border-t border-white/[0.04]`,children:[(0,c.jsx)(`p`,{className:`text-[10px] font-black text-white/35 uppercase tracking-wider mb-2.5`,children:`ບໍ່ໄດ້ຮັບ OTP ຫຼື OTP ໝົດອາຍຸ?`}),(0,c.jsx)(`button`,{onClick:F,disabled:x||!I,className:`inline-flex items-center gap-1.5 text-xs text-[#d4af37]
              font-black hover:underline disabled:opacity-30 disabled:no-underline transition-all cursor-pointer`,children:x?(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`span`,{className:`w-3.5 h-3.5 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin shrink-0`}),`ກຳລັງສົ່ງ...`]}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined text-[16px]`,children:`refresh`}),`ຂໍ OTP ໃໝ່`]})}),!I&&(0,c.jsx)(`p`,{className:`text-[10px] text-white/35 font-bold mt-1.5`,children:`✦ ສາມາດຂໍໃໝ່ໄດ້ຫຼັງ OTP ໝົດອາຍຸ`})]}),(0,c.jsx)(`div`,{className:`text-center pt-2 border-t border-white/[0.04]`,children:(0,c.jsx)(i,{to:`/register`,className:`text-sm text-white/35 hover:text-[#d4af37] transition-colors font-medium`,children:`← ກັບໄປສ້າງບັນຊີໃໝ່`})})]})]})}export{_ as default};