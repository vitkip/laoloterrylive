function e(e,t){if(!e?.length)return null;let n=t===`all`?e.length:Math.min(parseInt(t),e.length),r=[...e.slice(0,n)].reverse(),i={},a={};for(let e=0;e<100;e++){let t=e.toString().padStart(2,`0`);i[t]=0,a[t]=-1}let o=r.map((e,t)=>{let n=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;return n!==void 0&&i[n]!==void 0&&(i[n]++,a[n]=t),{idx:t,date:e.draw_date,drawNum:e.draw_number,v:n}}),s={},c={};for(let e=0;e<100;e++){let t=e.toString().padStart(2,`0`);s[t]=0,c[t]=0}r.slice(-10).forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;t&&s[t]!==void 0&&s[t]++}),r.slice(-30).forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;t&&c[t]!==void 0&&c[t]++});let l=Math.max(...Object.values(i),1),u=Math.min(...Object.values(i),0),d=Object.keys(i).map(e=>{let t=i[e],o=a[e],d=o===-1?n:n-1-o,f=t>0?n/t:n,p=d/Math.max(f,1),m=s[e],h=c[e],g=+(m/Math.max(Math.min(10,r.length),1)-h/Math.max(Math.min(30,r.length),1)).toFixed(3),_=l>u?(t-u)/(l-u):.5,v=t/l*35,y=Math.min(p/3,1)*35,b=Math.max(Math.min((g+.1)/.2,1),0)*30,x=+Math.min(v+y+b,100).toFixed(1),S=+(p>=1),C=+(g>0),w=+(x>=60),T=S+C+w;return{num:e,freq:t,gap:d,avgGap:Math.round(f),overdue:+p.toFixed(2),pct:+(t/Math.max(n,1)*100).toFixed(1),r10:m,r30:h,momentum:g,aiScore:x,heatIntensity:_,decisionScore:T,sig1:S,sig2:C,sig3:w}});return{n,freq:i,scores:d,series:o.filter(e=>e.v).slice(-50).map((e,t)=>({x:t+1,date:e.date?.slice(5),drawNum:e.drawNum,val:parseInt(e.v),label:e.v})),freqBars:[...d].sort((e,t)=>t.freq-e.freq).slice(0,20).map(e=>({num:e.num,freq:e.freq})),maxFreq:l,minFreq:u,hot:[...d].sort((e,t)=>t.freq-e.freq).slice(0,10),cold:[...d].sort((e,t)=>t.gap-e.gap).slice(0,10),aiTop:[...d].sort((e,t)=>t.aiScore-e.aiScore).slice(0,10),rising:[...d].filter(e=>e.momentum>0).sort((e,t)=>t.momentum-e.momentum).slice(0,8),falling:[...d].filter(e=>e.momentum<0).sort((e,t)=>e.momentum-t.momentum).slice(0,8),overdue:[...d].filter(e=>e.overdue>=1).sort((e,t)=>t.overdue-e.overdue).slice(0,12),decisionTop:[...d].filter(e=>e.decisionScore>0).sort((e,t)=>t.decisionScore-e.decisionScore||t.aiScore-e.aiScore).slice(0,20)}}function t(e){if(!e)return[];let{scores:t}=e,n=Math.max(...t.map(e=>e.freq),1),r=Math.max(...t.filter(e=>e.momentum>0).map(e=>e.momentum),.001),i=t.map(e=>{let t=e.freq/n*25,i=Math.min(e.overdue/3,1)*25,a=e.momentum>0?e.momentum/r*25:0,o=e.decisionScore/3*25,s=+(t+i+a+o).toFixed(1);return{...e,combined:s,freqW:+t.toFixed(1),overdueW:+i.toFixed(1),momentumW:+a.toFixed(1),decisionW:+o.toFixed(1)}}).sort((e,t)=>t.combined-e.combined),a=i[0]?.combined??1;return i.slice(0,10).map(e=>({...e,probability:+(e.combined/a*100).toFixed(1)}))}var n=[{key:`freqW`,label:`ຄວາມຖີ່`,color:`#ef4444`,max:25,icon:`equalizer`},{key:`overdueW`,label:`ຊ້ານານ`,color:`#fbbf24`,max:25,icon:`hourglass_top`},{key:`momentumW`,label:`Momentum`,color:`#6cf8bb`,max:25,icon:`trending_up`},{key:`decisionW`,label:`ສັນຍານ★`,color:`#f97316`,max:25,icon:`stars`}];function r(e){if(!e)return``;let t=new Date(e);return`${t.getDate()} ${[`ມັງກອນ`,`ກຸມພາ`,`ມີນາ`,`ເມສາ`,`ພຶດສະພາ`,`ມິຖຸນາ`,`ກໍລະກົດ`,`ສິງຫາ`,`ກັນຍາ`,`ຕຸລາ`,`ພະຈິກ`,`ທັນວາ`][t.getMonth()]} ${t.getFullYear()}`}function i(e,t,n,i,a){if(!e.length||!t)return``;let{hot:o,cold:s,rising:c,overdue:l,aiTop:u,decisionTop:d}=t,f=r(n?.draw_date)||r(new Date().toISOString()),p=n?.draw_number??`?`,m=a?` (${a})`:``,h=e.map((e,t)=>`  ${t+1}. ເລກ ${e.num} — ຄວາມໜ້າຈະເປັນລວມ ${e.probability}% (Overdue ${e.overdue}× · Momentum ${e.momentum>0?`↑`:`↓`} · ★${e.decisionScore})`).join(`
`),g=d.filter(e=>e.decisionScore===3).slice(0,3).map(e=>e.num),_=o.slice(0,5).map(e=>`${e.num}(${e.freq}ຄ)`),v=s.slice(0,5).map(e=>`${e.num}(${e.gap}ງ)`),y=c.slice(0,5).map(e=>e.num),b=l.slice(0,5).map(e=>`${e.num}(${e.overdue}×)`);return`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 ວິເຄາະຫວຍລາວ — ເລກເດັ່ນງວດນີ້${m}
📅 ວັນທີ: ${f}  |  ງວດ: #${p}  |  ວິເຄາະ ${i} ງວດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ລະບົບ AI ໄດ້ວິເຄາະສະຖິຕິ ${i} ງວດ ໂດຍລວມ 4 ດ້ານ
(ຄວາມຖີ່ · ຊ້ານານ · Momentum · ສັນຍານ Decision)
ຜ່ານ Algorithm Weighted Composite — ໄດ້ 10 ຕົວເລກເດັ່ນ ດັ່ງນີ້:

▶ TOP 10 ເລກລວມຄວາມໜ້າຈະເປັນສູງສຸດ
${h}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ບົດວິເຄາະສະຖິຕິ ແຕ່ລະດ້ານ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 ເລກ HOT (ອອກຫຼາຍສຸດ):
   ${_.join(` · `)}

🧊 ເລກ COLD (ຊ້ານານທີ່ສຸດ):
   ${v.join(` · `)}

📈 ເລກ RISING (ກຳລັງຂຶ້ນ Momentum):
   ${y.length?y.join(` · `):`ບໍ່ມີ`}

⏳ ເລກ OVERDUE (ເກີນຄ່າສະເລ່ຍ):
   ${b.join(` · `)}

🌟 AI TOP 5 (Composite Score):
   ${u.slice(0,5).map(e=>`${e.num}[${e.aiScore}pts]`).join(` · `)}

⭐ ສັນຍານຄົບ 3 (★★★ Decision Score):
   ${g.length?g.join(`, `):`ບໍ່ມີງວດນີ້`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ສະຫຼຸບ ເລກ 10 ໂຕເດັ່ນ:
   ${e.map(e=>e.num).join(` · `)}

⚠️  ຄຳເຕືອນ: ຫວຍລາວເປັນການສຸ່ມ — ຂໍ້ມູນນີ້ເປັນພຽງການວິເຄາະທາງສະຖິຕິ
     ບໍ່ຮັບປະກັນຜົນລາງວັນ — ຫ້າມລົງທຶນເກີນຄວາມສາມາດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📲 laolots.com — ຂໍ້ມູນຫວຍລາວ ຄົບຖ້ວນທີ່ສຸດ`}export{t as i,i as n,e as r,n as t};