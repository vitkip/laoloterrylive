import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{v as t}from"./vendor-charts-iQ_2Absj.js";import{t as n}from"./vendor-react-nvcEvhRQ.js";import{c as r,i,n as a,s as o}from"./chunk-OE4NN4TA-BrSHlpGf.js";import{t as s}from"./api-BbssrPr5.js";import{n as c}from"./AuthContext-CzfFrjcE.js";import{n as l,t as u}from"./RoleBadge-BvmENMqA.js";var d=e(t(),1),f=n();function p(e){let t=[{path:`/admin`,icon:`dashboard`,label:`ພາບລວມລະບົບ`,badge:null},{path:`/admin/live`,icon:`podcasts`,label:`ຖ່າຍທອດສົດ`,badge:`LIVE`},{path:`/admin/draws`,icon:`add_circle`,label:`ປ້ອນຜົນຫວຍ`,badge:null},{path:`/admin/types`,icon:`category`,label:`ປະເພດຫວຍ`,badge:null}],n=[{path:`/admin/animals`,icon:`image`,label:`ຮູບນາມສັດ`,badge:null},{path:`/admin/users`,icon:`manage_accounts`,label:`ຈັດການຜູ້ໃຊ້`,badge:null},{path:`/admin/banners`,icon:`view_carousel`,label:`Banner ເລື່ອນ`,badge:null},{path:`/admin/contacts`,icon:`mail`,label:`ຂໍ້ຄວາມຕິດຕໍ່`,badge:null},{path:`/admin/logs`,icon:`history`,label:`Audit Logs`,badge:null}],r=[{path:`/admin/animals`,icon:`image`,label:`ຮູບນາມສັດ`,badge:null},{path:`/admin/users`,icon:`manage_accounts`,label:`ຈັດການຜູ້ໃຊ້`,badge:null},{path:`/admin/contacts`,icon:`mail`,label:`ຂໍ້ຄວາມຕິດຕໍ່`,badge:null}];return e===`admin`?[...t,...n]:e===`staff`?[...t,...r]:t}var m=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  :root {
    --gold-100: #FFF8E1;
    --gold-200: #FFE082;
    --gold-300: #FFD54F;
    --gold-400: #FFCA28;
    --gold-500: #D4AF37;
    --gold-600: #B8860B;
    --gold-700: #8B6914;
    --dark-950: #060812;
    --dark-900: #0C1020;
    --dark-850: #101428;
    --dark-800: #141830;
    --dark-700: #1C2240;
    --dark-600: #242A4A;
    --sidebar-w: 248px;
    --sidebar-collapsed: 64px;
  }

  .admin-root {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    background: var(--dark-950);
    color: #E8E6F0;
  }

  /* Sidebar */
  .al-sidebar {
    background: linear-gradient(180deg, #0C1020 0%, #0A0E1C 60%, #080C18 100%);
    border-right: 1px solid rgba(212,175,55,0.12);
    position: relative;
    overflow: hidden;
  }
  .al-sidebar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold-500), transparent);
  }
  .al-sidebar-bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(212,175,55,0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(212,175,55,0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Logo area */
  .al-logo-zone {
    border-bottom: 1px solid rgba(212,175,55,0.1);
    background: rgba(0,0,0,0.2);
    position: relative;
  }

  /* Nav section label */
  .al-nav-label {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    font-size: 8px;
    letter-spacing: 0.22em;
    color: rgba(212,175,55,0.45);
    text-transform: uppercase;
    padding: 12px 14px 6px;
  }

  /* Nav item */
  .al-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 500;
    color: rgba(232,230,240,0.5);
    transition: all 0.18s ease;
    position: relative;
    text-decoration: none;
    margin: 1px 0;
  }
  .al-nav-item:hover {
    background: rgba(212,175,55,0.07);
    color: rgba(232,230,240,0.85);
  }
  .al-nav-item.active {
    background: linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.08) 100%);
    color: var(--gold-300);
    box-shadow: inset 0 0 0 1px rgba(212,175,55,0.2), 0 2px 12px rgba(212,175,55,0.08);
  }
  .al-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, var(--gold-400), var(--gold-600));
    box-shadow: 0 0 8px rgba(212,175,55,0.5);
  }
  .al-nav-icon {
    font-size: 19px !important;
    flex-shrink: 0;
    transition: color 0.18s;
  }
  .al-nav-item.active .al-nav-icon {
    color: var(--gold-400);
    text-shadow: 0 0 12px rgba(212,175,55,0.6);
  }

  /* Live badge */
  .al-live-badge {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
    background: linear-gradient(90deg, #ef4444, #dc2626);
    color: white;
    padding: 1px 5px;
    border-radius: 4px;
    animation: al-pulse-badge 2s ease-in-out infinite;
    margin-left: auto;
  }
  @keyframes al-pulse-badge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.65; }
  }

  /* Unread count badge */
  .al-count-badge {
    font-size: 9px;
    font-weight: 800;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    box-shadow: 0 0 8px rgba(239,68,68,0.5);
    animation: al-pulse-badge 2s ease-in-out infinite;
  }

  /* Tooltip for collapsed */
  .al-tooltip {
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--dark-700);
    border: 1px solid rgba(212,175,55,0.2);
    color: var(--gold-200);
    font-size: 12px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 7px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .al-nav-item:hover .al-tooltip {
    opacity: 1;
  }

  /* User footer */
  .al-user-footer {
    border-top: 1px solid rgba(212,175,55,0.1);
    background: rgba(0,0,0,0.15);
  }
  .al-user-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.18s;
    color: inherit;
  }
  .al-user-btn:hover {
    background: rgba(212,175,55,0.07);
  }

  /* Dropdown */
  .al-dropdown {
    position: absolute;
    background: var(--dark-800);
    border: 1px solid rgba(212,175,55,0.18);
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.05);
    overflow: hidden;
    min-width: 200px;
    z-index: 200;
    animation: al-drop-in 0.15s ease;
  }
  @keyframes al-drop-in {
    from { opacity: 0; transform: translateY(6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .al-dropdown-header {
    padding: 14px;
    border-bottom: 1px solid rgba(212,175,55,0.1);
    background: rgba(212,175,55,0.04);
  }
  .al-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(232,230,240,0.7);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .al-dropdown-item:hover {
    background: rgba(212,175,55,0.07);
    color: var(--gold-300);
  }
  .al-dropdown-item .mat-icon {
    font-size: 16px !important;
    color: var(--gold-600);
  }
  .al-dropdown-logout {
    border-top: 1px solid rgba(212,175,55,0.1);
    color: #f87171;
  }
  .al-dropdown-logout:hover {
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
  }
  .al-dropdown-logout .mat-icon {
    color: #f87171 !important;
  }

  /* Collapse toggle */
  .al-collapse-btn {
    width: 28px; height: 28px;
    border-radius: 8px;
    border: 1px solid rgba(212,175,55,0.15);
    background: rgba(212,175,55,0.05);
    color: rgba(212,175,55,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.18s;
    flex-shrink: 0;
  }
  .al-collapse-btn:hover {
    background: rgba(212,175,55,0.12);
    color: var(--gold-400);
    border-color: rgba(212,175,55,0.35);
  }

  /* Top header */
  .al-header {
    background: linear-gradient(180deg, var(--dark-900) 0%, var(--dark-850) 100%);
    border-bottom: 1px solid rgba(212,175,55,0.1);
    position: relative;
    z-index: 30;
  }
  .al-header::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 30%, rgba(212,175,55,0.25) 50%, rgba(212,175,55,0.15) 70%, transparent 100%);
  }

  /* Breadcrumb */
  .al-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(232,230,240,0.4);
  }
  .al-breadcrumb-sep {
    color: rgba(212,175,55,0.3);
  }
  .al-breadcrumb-current {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--gold-400);
    letter-spacing: 0.05em;
  }

  /* Header action buttons */
  .al-hdr-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    border: 1px solid rgba(212,175,55,0.1);
    background: rgba(212,175,55,0.04);
    color: rgba(232,230,240,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.18s;
    text-decoration: none;
    cursor: pointer;
  }
  .al-hdr-btn:hover {
    background: rgba(212,175,55,0.1);
    color: var(--gold-400);
    border-color: rgba(212,175,55,0.25);
  }

  /* Main content area */
  .al-main-bg {
    background:
      radial-gradient(ellipse at 10% 0%, rgba(212,175,55,0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 100%, rgba(212,175,55,0.03) 0%, transparent 50%),
      var(--dark-950);
  }

  /* Scrollbar */
  .al-scroll::-webkit-scrollbar { width: 4px; }
  .al-scroll::-webkit-scrollbar-track { background: transparent; }
  .al-scroll::-webkit-scrollbar-thumb {
    background: rgba(212,175,55,0.18);
    border-radius: 4px;
  }
  .al-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(212,175,55,0.32);
  }

  /* Logo text */
  .al-logo-text {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
  }
  .al-logo-text span {
    background: linear-gradient(90deg, var(--gold-400), var(--gold-600));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .al-logo-sub {
    font-size: 8px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.45);
    margin-top: 1px;
  }

  /* Lottery ball decoration */
  .al-ball {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #D4AF37, #FFF5C0, #B8860B, #8B6914, #D4AF37);
    box-shadow: 0 2px 12px rgba(212,175,55,0.35), inset 0 1px 2px rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  .al-ball::after {
    content: '';
    position: absolute;
    top: 3px; left: 6px;
    width: 8px; height: 5px;
    background: rgba(255,255,255,0.45);
    border-radius: 50%;
    transform: rotate(-30deg);
    z-index: 2;
    pointer-events: none;
  }

  /* Mobile overlay */
  .al-mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    backdrop-filter: blur(4px);
    background: rgba(0,0,0,0.6);
  }
  .al-mobile-sidebar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 260px;
    background: linear-gradient(180deg, #0C1020 0%, #0A0E1C 100%);
    border-right: 1px solid rgba(212,175,55,0.15);
    box-shadow: 20px 0 60px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    animation: al-slide-in 0.22s ease;
  }
  @keyframes al-slide-in {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }

  /* Role tag in user name */
  .al-role-gold {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold-500);
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* Divider */
  .al-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent);
    margin: 4px 12px;
  }
`;function h(){return(0,f.jsx)(`div`,{className:`al-ball`,children:(0,f.jsxs)(`svg`,{viewBox:`0 0 38 38`,style:{width:`100%`,height:`100%`,display:`block`,zIndex:1},children:[(0,f.jsxs)(`defs`,{children:[(0,f.jsx)(`clipPath`,{id:`circleClipAdmin`,children:(0,f.jsx)(`circle`,{cx:`19`,cy:`19`,r:`17`})}),(0,f.jsxs)(`linearGradient`,{id:`goldStripeAdmin`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,f.jsx)(`stop`,{offset:`0%`,stopColor:`#A67C1E`}),(0,f.jsx)(`stop`,{offset:`50%`,stopColor:`#F5D77F`}),(0,f.jsx)(`stop`,{offset:`100%`,stopColor:`#A67C1E`})]}),(0,f.jsxs)(`linearGradient`,{id:`darkStripeAdmin`,x1:`0%`,y1:`0%`,x2:`100%`,y2:`0%`,children:[(0,f.jsx)(`stop`,{offset:`0%`,stopColor:`#0F1326`}),(0,f.jsx)(`stop`,{offset:`50%`,stopColor:`#1E2548`}),(0,f.jsx)(`stop`,{offset:`100%`,stopColor:`#0F1326`})]}),(0,f.jsxs)(`radialGradient`,{id:`goldCircleAdmin`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,f.jsx)(`stop`,{offset:`0%`,stopColor:`#FFFDF5`}),(0,f.jsx)(`stop`,{offset:`70%`,stopColor:`#F3D072`}),(0,f.jsx)(`stop`,{offset:`100%`,stopColor:`#C99E32`})]})]}),(0,f.jsxs)(`g`,{clipPath:`url(#circleClipAdmin)`,children:[(0,f.jsx)(`rect`,{x:`0`,y:`0`,width:`38`,height:`9.5`,fill:`url(#goldStripeAdmin)`}),(0,f.jsx)(`rect`,{x:`0`,y:`9.5`,width:`38`,height:`19`,fill:`url(#darkStripeAdmin)`}),(0,f.jsx)(`rect`,{x:`0`,y:`28.5`,width:`38`,height:`9.5`,fill:`url(#goldStripeAdmin)`}),(0,f.jsx)(`circle`,{cx:`19`,cy:`19`,r:`6.5`,fill:`url(#goldCircleAdmin)`})]})]})})}function g({item:e,isActive:t,collapsed:n,onClick:r}){return(0,f.jsxs)(a,{to:e.path,onClick:r,className:`al-nav-item${t?` active`:``}`,title:n?e.label:void 0,children:[(0,f.jsx)(`span`,{className:`material-symbols-outlined al-nav-icon`,style:{fontVariationSettings:t?`'FILL' 1`:`'FILL' 0`},children:e.icon}),!n&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`span`,{style:{flex:1},children:e.label}),e.badge===`LIVE`&&(0,f.jsx)(`span`,{className:`al-live-badge`,children:e.badge}),typeof e.badge==`number`&&e.badge>0&&(0,f.jsx)(`span`,{className:`al-count-badge`,children:e.badge>99?`99+`:e.badge})]}),n&&(0,f.jsx)(`span`,{className:`al-tooltip`,children:e.label})]})}function _({user:e,onLogout:t,collapsed:n}){let[i,a]=(0,d.useState)(!1),o=(0,d.useRef)(null),s=r();return(0,d.useEffect)(()=>{let e=e=>{o.current&&!o.current.contains(e.target)&&a(!1)};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]),(0,f.jsxs)(`div`,{ref:o,style:{position:`relative`},children:[(0,f.jsxs)(`button`,{className:`al-user-btn`,onClick:()=>a(e=>!e),children:[(0,f.jsx)(l,{name:e?.name,username:e?.username,size:`sm`}),!n&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`div`,{style:{flex:1,textAlign:`left`,overflow:`hidden`},children:[(0,f.jsx)(`p`,{style:{fontSize:13,fontWeight:600,color:`#E8E6F0`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`,margin:0},children:e?.name||e?.username}),(0,f.jsx)(`p`,{className:`al-role-gold`,children:e?.role})]}),(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:16,color:`rgba(212,175,55,0.4)`,flexShrink:0,transition:`transform 0.18s`,transform:i?`rotate(180deg)`:`none`},children:`expand_more`})]})]}),i&&(0,f.jsxs)(`div`,{className:`al-dropdown `,style:n?{left:`calc(100% + 12px)`,bottom:0}:{bottom:`calc(100% + 8px)`,left:0,right:0},children:[(0,f.jsx)(`div`,{className:`al-dropdown-header`,children:(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:[(0,f.jsx)(l,{name:e?.name,username:e?.username,size:`sm`}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`p`,{style:{fontSize:13,fontWeight:600,color:`#E8E6F0`,margin:0},children:e?.name||e?.username}),(0,f.jsx)(u,{role:e?.role,size:`xs`})]})]})}),[{icon:`account_circle`,label:`Profile ຂອງຂ້ອຍ`,action:()=>{s(`/admin/profile`),a(!1)}},{icon:`key`,label:`ປ່ຽນ Password`,action:()=>{s(`/admin/users`),a(!1)}}].map(e=>(0,f.jsxs)(`button`,{className:`al-dropdown-item`,onClick:e.action,children:[(0,f.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,children:e.icon}),e.label]},e.label)),(0,f.jsxs)(`button`,{className:`al-dropdown-item al-dropdown-logout`,onClick:()=>{t(),a(!1)},children:[(0,f.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,children:`logout`}),`ອອກຈາກລະບົບ`]})]})]})}function v({location:e}){let t={"/admin":`Dashboard`,"/admin/live":`ຖ່າຍທອດສົດ`,"/admin/draws":`ປ້ອນຜົນຫວຍ`,"/admin/types":`ປະເພດຫວຍ`,"/admin/animals":`ຮູບນາມສັດ`,"/admin/users":`ຈັດການຜູ້ໃຊ້`,"/admin/banners":`Banner ເລື່ອນ`,"/admin/contacts":`ຂໍ້ຄວາມຕິດຕໍ່`,"/admin/logs":`Audit Logs`,"/admin/profile":`Profile ຂອງຂ້ອຍ`}[e.pathname]||e.pathname.split(`/`).pop();return(0,f.jsxs)(`div`,{className:`al-breadcrumb`,children:[(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:14,color:`rgba(212,175,55,0.4)`},children:`home`}),(0,f.jsx)(`span`,{className:`al-breadcrumb-sep`,children:`/`}),(0,f.jsx)(`span`,{className:`al-breadcrumb-sep`,children:`Admin`}),(0,f.jsx)(`span`,{className:`al-breadcrumb-sep`,children:`/`}),(0,f.jsx)(`span`,{className:`al-breadcrumb-current`,children:t})]})}function y({collapsed:e,navItems:t,location:n,onNavClick:r,user:i,onLogout:a}){return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`div`,{className:`al-sidebar-bg-pattern`}),(0,f.jsxs)(`nav`,{className:`al-scroll`,style:{flex:1,padding:`8px`,display:`flex`,flexDirection:`column`,gap:0,overflowY:`auto`},children:[!e&&(0,f.jsx)(`p`,{className:`al-nav-label`,children:`ເມນູຫຼັກ`}),e&&(0,f.jsx)(`div`,{style:{height:8}}),t.slice(0,4).map(t=>(0,f.jsx)(g,{item:t,isActive:n.pathname===t.path,collapsed:e,onClick:r},t.path)),t.length>4&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`div`,{className:`al-divider`,style:{margin:`8px 4px`}}),!e&&(0,f.jsx)(`p`,{className:`al-nav-label`,children:`ຈັດການຂໍ້ມູນ`}),t.slice(4).map(t=>(0,f.jsx)(g,{item:t,isActive:n.pathname===t.path,collapsed:e,onClick:r},t.path))]})]}),(0,f.jsx)(`div`,{className:`al-user-footer`,style:{padding:8},children:(0,f.jsx)(_,{user:i,onLogout:a,collapsed:e})})]})}function b(){let{user:e,logout:t,authFetch:n}=c(),r=o(),[u,g]=(0,d.useState)(!1),[_,b]=(0,d.useState)(!1),[x,S]=(0,d.useState)(0),C=(0,d.useCallback)(async()=>{try{let e=await n(`${s}/index.php?action=get_unread_contact_count`);e.ok&&S(e.data.count||0)}catch{}},[n]);(0,d.useEffect)(()=>{(e?.role===`admin`||e?.role===`staff`)&&C()},[r.pathname,C,e?.role]);let w=(0,d.useMemo)(()=>p(e?.role).map(e=>e.path===`/admin/contacts`&&x>0?{...e,badge:x}:e),[e?.role,x]),T=async()=>{try{await n(`${s}/auth.php?action=logout`,{method:`POST`})}catch{}t()};return(0,d.useEffect)(()=>{b(!1)},[r.pathname]),(0,f.jsxs)(`div`,{className:`admin-root`,style:{display:`flex`,height:`100vh`,overflow:`hidden`},children:[(0,f.jsx)(`style`,{children:m}),(0,f.jsxs)(`aside`,{className:`al-sidebar al-desktop-sidebar`,style:{flexDirection:`column`,transition:`width 0.28s cubic-bezier(0.4,0,0.2,1)`,width:u?`var(--sidebar-collapsed)`:`var(--sidebar-w)`,flexShrink:0},children:[(0,f.jsxs)(`div`,{className:`al-logo-zone`,style:{display:`flex`,alignItems:`center`,justifyContent:u?`center`:`space-between`,padding:u?`0 0`:`0 12px 0 14px`,height:64,gap:8},children:[!u&&(0,f.jsxs)(a,{to:`/home`,style:{display:`flex`,alignItems:`center`,gap:10,flex:1,textDecoration:`none`,minWidth:0},children:[(0,f.jsx)(h,{}),(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,minWidth:0},children:[(0,f.jsxs)(`span`,{className:`al-logo-text`,children:[`laolots`,(0,f.jsx)(`span`,{children:`.com`})]}),(0,f.jsx)(`span`,{className:`al-logo-sub`,children:`ຫວຍພັດທະນາລາວ`})]})]}),u&&(0,f.jsx)(a,{to:`/home`,title:`laolots.com`,style:{textDecoration:`none`},children:(0,f.jsx)(h,{})}),!u&&(0,f.jsx)(`button`,{className:`al-collapse-btn`,onClick:()=>g(e=>!e),title:`ຫຍໍ້ sidebar`,children:(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:17},children:`menu`})}),u&&(0,f.jsx)(`div`,{style:{position:`absolute`,top:70,left:0,right:0,display:`flex`,justifyContent:`center`,padding:`4px 0`},children:(0,f.jsx)(`button`,{className:`al-collapse-btn`,onClick:()=>g(e=>!e),title:`ຂະຫຍາຍ sidebar`,children:(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:17},children:`menu_open`})})})]}),(0,f.jsx)(y,{collapsed:u,navItems:w,location:r,onNavClick:null,user:e,onLogout:T})]}),_&&(0,f.jsx)(`div`,{className:`al-mobile-overlay`,onClick:()=>b(!1),children:(0,f.jsxs)(`aside`,{className:`al-mobile-sidebar`,onClick:e=>e.stopPropagation(),children:[(0,f.jsxs)(`div`,{className:`al-logo-zone`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0 14px`,height:64},children:[(0,f.jsxs)(a,{to:`/home`,style:{display:`flex`,alignItems:`center`,gap:10,textDecoration:`none`},children:[(0,f.jsx)(h,{}),(0,f.jsxs)(`div`,{children:[(0,f.jsxs)(`span`,{className:`al-logo-text`,children:[`laolots`,(0,f.jsx)(`span`,{children:`.com`})]}),(0,f.jsx)(`div`,{className:`al-logo-sub`,children:`ຫວຍພັດທະນາລາວ`})]})]}),(0,f.jsx)(`button`,{onClick:()=>b(!1),className:`al-collapse-btn`,style:{width:32,height:32},children:(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:18},children:`close`})})]}),(0,f.jsx)(`div`,{className:`al-sidebar-bg-pattern`}),(0,f.jsx)(y,{collapsed:!1,navItems:w,location:r,onNavClick:()=>b(!1),user:e,onLogout:T})]})}),(0,f.jsxs)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,height:`100%`,overflow:`hidden`},children:[(0,f.jsxs)(`header`,{className:`al-header`,style:{height:60,display:`flex`,alignItems:`center`,padding:`0 16px`,gap:10,flexShrink:0},children:[(0,f.jsx)(`button`,{className:`al-hdr-btn al-mobile-only`,onClick:()=>b(!0),children:(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:20},children:`menu`})}),(0,f.jsx)(`div`,{className:`al-desktop-only`,children:(0,f.jsx)(v,{location:r})}),(0,f.jsx)(`div`,{style:{flex:1}}),(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[(0,f.jsx)(a,{to:`/home`,target:`_blank`,className:`al-hdr-btn`,title:`ເບິ່ງໜ້າເວັບ`,style:{textDecoration:`none`},children:(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:17},children:`open_in_new`})}),(0,f.jsx)(a,{to:`/admin/profile`,className:`al-hdr-btn`,title:`Profile`,style:{textDecoration:`none`},children:(0,f.jsx)(`span`,{className:`material-symbols-outlined`,style:{fontSize:17},children:`account_circle`})})]}),(0,f.jsx)(`div`,{className:`al-mobile-only`,children:(0,f.jsx)(l,{name:e?.name,username:e?.username,size:`sm`})})]}),(0,f.jsx)(`main`,{className:`al-main-bg al-scroll`,style:{flex:1,overflowY:`auto`},children:(0,f.jsx)(`div`,{style:{padding:`24px 20px`,maxWidth:1280,margin:`0 auto`,width:`100%`},children:(0,f.jsx)(i,{})})})]}),(0,f.jsx)(`style`,{children:`
        .al-desktop-sidebar { display: flex; }
        .al-mobile-only     { display: none; }
        .al-desktop-only    { display: flex; align-items: center; }
        @media (max-width: 767px) {
          .al-desktop-sidebar { display: none !important; }
          .al-mobile-only     { display: flex !important; }
          .al-desktop-only    { display: none !important; }
        }
      `})]})}export{b as default};