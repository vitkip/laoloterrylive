import{r as e}from"./rolldown-runtime-Dw2cE7zH.js";import{v as t}from"./vendor-charts-ChC9cbBZ.js";import{t as n}from"./vendor-react-CtUuC_pd.js";import{n as r,t as i}from"./api-BbssrPr5.js";import{n as a}from"./AuthContext-ti_pHE1s.js";import{n as o}from"./DataContext-B15WmAbA.js";var s=e(t(),1),c=n(),l=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .aim-root {
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* ── Section wrapper ── */
  .aim-section {
    background: linear-gradient(160deg, #0F1424 0%, #0C1020 60%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.14);
    border-radius: 20px;
    padding: 28px 24px 24px;
    margin-top: 32px;
    position: relative;
    overflow: hidden;
  }
  .aim-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent);
  }
  .aim-section-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 5% 0%, rgba(212,175,55,0.05) 0%, transparent 45%),
      radial-gradient(ellipse at 95% 100%, rgba(212,175,55,0.04) 0%, transparent 45%);
    pointer-events: none;
  }

  /* ── Header ── */
  .aim-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
    position: relative;
  }
  .aim-header-icon {
    width: 40px; height: 40px;
    border-radius: 11px;
    background: linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%);
    border: 1px solid rgba(212,175,55,0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .aim-header-icon .mat-icon {
    font-size: 20px !important;
    color: #D4AF37;
  }
  .aim-title {
    font-size: 18px;
    font-weight: 700;
    color: #E8E6F0;
    letter-spacing: 0.01em;
  }
  .aim-subtitle {
    font-size: 11px;
    color: rgba(212,175,55,0.5);
    font-weight: 500;
    margin-top: 2px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── Toast notification ── */
  .aim-toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 13px;
    font-weight: 600;
    animation: aim-toast-in 0.2s ease;
    position: relative;
  }
  @keyframes aim-toast-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .aim-toast.success {
    background: rgba(52,211,153,0.1);
    border: 1px solid rgba(52,211,153,0.25);
    color: #6ee7b7;
  }
  .aim-toast.error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5;
  }
  .aim-toast-icon { font-size: 18px !important; flex-shrink: 0; }

  /* ── Grid ── */
  .aim-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }

  /* ── Animal item card ── */
  .aim-item {
    background: linear-gradient(160deg, #141828 0%, #0E1220 100%);
    border: 1px solid rgba(212,175,55,0.1);
    border-radius: 16px;
    padding: 18px 14px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .aim-item:hover {
    border-color: rgba(212,175,55,0.25);
    box-shadow: 0 8px 28px rgba(0,0,0,0.4), 0 0 20px rgba(212,175,55,0.05);
    transform: translateY(-2px);
  }
  .aim-item::before {
    content: '';
    position: absolute;
    top: 0; left: 20%; right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .aim-item:hover::before { opacity: 1; }

  /* ── Medallion ── */
  .aim-medallion {
    position: relative;
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }
  .aim-ring {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #D4AF37 0deg, #FFD54F 60deg, #B8860B 120deg,
      #D4AF37 180deg, #FFD54F 240deg, #B8860B 300deg, #D4AF37 360deg
    );
    opacity: 0.5;
    transition: opacity 0.2s, animation-duration 0.2s;
    animation: aim-spin 10s linear infinite;
  }
  .aim-item:hover .aim-ring {
    opacity: 0.9;
    animation-duration: 4s;
  }
  @keyframes aim-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .aim-medallion-bg {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: #0C1020;
    z-index: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .aim-animal-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 2;
  }
  .aim-animal-icon {
    position: absolute;
    font-size: 26px !important;
    color: rgba(212,175,55,0.4);
    z-index: 1;
  }

  /* Uploading overlay */
  .aim-uploading-overlay {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: rgba(6,8,18,0.75);
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .aim-spinner {
    width: 22px; height: 22px;
    border: 2px solid rgba(212,175,55,0.2);
    border-top-color: #D4AF37;
    border-radius: 50%;
    animation: aim-rotate 0.7s linear infinite;
  }
  @keyframes aim-rotate {
    to { transform: rotate(360deg); }
  }

  /* ── Animal name + numbers ── */
  .aim-animal-name {
    font-size: 12.5px;
    font-weight: 700;
    color: #E8E6F0;
    margin-bottom: 5px;
    line-height: 1.3;
  }
  .aim-numbers-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    margin-bottom: 12px;
    min-height: 24px;
  }
  .aim-ball {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 60%, #8B6914 100%);
    box-shadow: 0 1px 6px rgba(212,175,55,0.25), inset 0 1px 1px rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9.5px;
    font-weight: 700;
    color: #0C1020;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .aim-ball::after {
    content: '';
    position: absolute;
    top: 2px; left: 4px;
    width: 5px; height: 3px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    transform: rotate(-20deg);
  }

  /* ── Upload button ── */
  .aim-upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    cursor: pointer;
    transition: all 0.18s;
    border: 1px solid rgba(212,175,55,0.25);
    background: rgba(212,175,55,0.07);
    color: #D4AF37;
    white-space: nowrap;
  }
  .aim-upload-btn:hover {
    background: rgba(212,175,55,0.15);
    border-color: rgba(212,175,55,0.4);
    box-shadow: 0 0 12px rgba(212,175,55,0.15);
  }
  .aim-upload-btn.uploading {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
  }
  .aim-upload-btn .mat-icon {
    font-size: 14px !important;
  }
`;function u(e){return e?String(e).split(/[,\s\/]+/).map(e=>e.trim()).filter(Boolean):[]}function d(){let{animals:e,refreshData:t}=o(),{authFetch:n}=a(),[d,f]=(0,s.useState)(null),[p,m]=(0,s.useState)(``),[h,g]=(0,s.useState)(!0),_=async(e,r)=>{let a=e.target.files[0];if(!a)return;f(r),m(``);let o=new Image;o.src=URL.createObjectURL(a),await new Promise(e=>{o.onload=e});let s=document.createElement(`canvas`);s.width=300,s.height=300;let c=s.getContext(`2d`),l=Math.max(300/o.width,300/o.height),u=o.width*l,d=o.height*l,p=(300-u)/2,h=(300-d)/2;c.fillStyle=`#0C1020`,c.fillRect(0,0,300,300),c.drawImage(o,p,h,u,d),s.toBlob(async a=>{let o=new FormData;o.append(`animal_id`,r),o.append(`image`,a,`animal.png`);try{let{ok:e,data:r}=await n(`${i}/index.php?action=upload_animal_image`,{method:`POST`,body:o});e?(g(!0),m(`ອັບໂຫຼດຮູບພາບສຳເລັດ!`),t&&t()):(g(!1),m(r.error||`ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດ`))}catch{g(!1),m(`ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້`)}f(null),e.target.value=``},`image/png`)};return(0,c.jsxs)(`div`,{className:`aim-root aim-section`,children:[(0,c.jsx)(`style`,{children:l}),(0,c.jsx)(`div`,{className:`aim-section-bg`}),(0,c.jsxs)(`div`,{className:`aim-header`,children:[(0,c.jsx)(`div`,{className:`aim-header-icon`,children:(0,c.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,style:{fontVariationSettings:`'FILL' 1`},children:`image`})}),(0,c.jsxs)(`div`,{children:[(0,c.jsx)(`div`,{className:`aim-title`,children:`ຈັດການຮູບນາມສັດ`}),(0,c.jsx)(`div`,{className:`aim-subtitle`,children:`Animal Image Manager`})]})]}),p&&(0,c.jsxs)(`div`,{className:`aim-toast ${h?`success`:`error`}`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined aim-toast-icon`,style:{fontVariationSettings:`'FILL' 1`},children:h?`check_circle`:`error`}),p]}),(0,c.jsx)(`div`,{className:`aim-grid`,children:e.map(e=>{let t=r(e),n=d===e.animal_id,i=u(e.animal_numbers);return(0,c.jsxs)(`div`,{className:`aim-item`,children:[(0,c.jsxs)(`div`,{className:`aim-medallion`,children:[(0,c.jsx)(`div`,{className:`aim-ring`}),(0,c.jsxs)(`div`,{className:`aim-medallion-bg`,children:[(0,c.jsx)(`img`,{src:t,alt:e.animal_name_lao,className:`aim-animal-img`,onError:e=>{e.target.style.opacity=`0`}}),(0,c.jsx)(`span`,{className:`material-symbols-outlined aim-animal-icon`,style:{fontVariationSettings:`'FILL' 1`},children:e.image_url?``:`pets`}),n&&(0,c.jsx)(`div`,{className:`aim-uploading-overlay`,children:(0,c.jsx)(`div`,{className:`aim-spinner`})})]})]}),(0,c.jsx)(`div`,{className:`aim-animal-name`,children:e.animal_name_lao}),(0,c.jsx)(`div`,{className:`aim-numbers-row`,children:i.length>0?i.map(e=>(0,c.jsx)(`div`,{className:`aim-ball`,children:e},e)):(0,c.jsx)(`div`,{className:`aim-ball`,children:e.animal_numbers})}),(0,c.jsxs)(`label`,{className:`aim-upload-btn${n?` uploading`:``}`,children:[(0,c.jsx)(`span`,{className:`material-symbols-outlined mat-icon`,children:n?`hourglass_top`:`upload`}),n?`ກຳລັງອັບ...`:`ປ່ຽນຮູບ`,(0,c.jsx)(`input`,{type:`file`,accept:`image/*`,style:{display:`none`},onChange:t=>_(t,e.animal_id),disabled:n})]})]},e.animal_id)})})]})}export{d as default};