function e(e,t){if(!e?.length)return null;let n=t===`all`?e.length:Math.min(parseInt(t),e.length),r=[...e.slice(0,n)].reverse(),i={},a={};for(let e=0;e<100;e++){let t=e.toString().padStart(2,`0`);i[t]=0,a[t]=-1}let o=r.map((e,t)=>{let n=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;return n!==void 0&&i[n]!==void 0&&(i[n]++,a[n]=t),{idx:t,date:e.draw_date,drawNum:e.draw_number,v:n}}),s={},c={};for(let e=0;e<100;e++){let t=e.toString().padStart(2,`0`);s[t]=0,c[t]=0}r.slice(-10).forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;t&&s[t]!==void 0&&s[t]++}),r.slice(-30).forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;t&&c[t]!==void 0&&c[t]++});let l=Math.max(...Object.values(i),1),u=Math.min(...Object.values(i),0),d=Object.keys(i).map(e=>{let t=i[e],o=a[e],d=o===-1?n:n-1-o,f=t>0?n/t:n,p=d/Math.max(f,1),m=s[e],h=c[e],g=+(m/Math.max(Math.min(10,r.length),1)-h/Math.max(Math.min(30,r.length),1)).toFixed(3),_=l>u?(t-u)/(l-u):.5,v=t/l*35,y=Math.min(p/3,1)*35,b=Math.max(Math.min((g+.1)/.2,1),0)*30,x=+Math.min(v+y+b,100).toFixed(1),S=+(p>=1),C=+(g>0),w=+(x>=60),T=S+C+w;return{num:e,freq:t,gap:d,avgGap:Math.round(f),overdue:+p.toFixed(2),pct:+(t/Math.max(n,1)*100).toFixed(1),r10:m,r30:h,momentum:g,aiScore:x,heatIntensity:_,decisionScore:T,sig1:S,sig2:C,sig3:w}});return{n,freq:i,scores:d,series:o.filter(e=>e.v).slice(-50).map((e,t)=>({x:t+1,date:e.date?.slice(5),drawNum:e.drawNum,val:parseInt(e.v),label:e.v})),freqBars:[...d].sort((e,t)=>t.freq-e.freq).slice(0,20).map(e=>({num:e.num,freq:e.freq})),maxFreq:l,minFreq:u,hot:[...d].sort((e,t)=>t.freq-e.freq).slice(0,10),cold:[...d].sort((e,t)=>t.gap-e.gap).slice(0,10),aiTop:[...d].sort((e,t)=>t.aiScore-e.aiScore).slice(0,10),rising:[...d].filter(e=>e.momentum>0).sort((e,t)=>t.momentum-e.momentum).slice(0,8),falling:[...d].filter(e=>e.momentum<0).sort((e,t)=>e.momentum-t.momentum).slice(0,8),overdue:[...d].filter(e=>e.overdue>=1).sort((e,t)=>t.overdue-e.overdue).slice(0,12),decisionTop:[...d].filter(e=>e.decisionScore>0).sort((e,t)=>t.decisionScore-e.decisionScore||t.aiScore-e.aiScore).slice(0,20)}}function t(e){if(!e)return[];let{scores:t}=e,n=Math.max(...t.map(e=>e.freq),1),r=Math.max(...t.filter(e=>e.momentum>0).map(e=>e.momentum),.001),i=t.map(e=>{let t=e.freq/n*25,i=Math.min(e.overdue/3,1)*25,a=e.momentum>0?e.momentum/r*25:0,o=e.decisionScore/3*25,s=+(t+i+a+o).toFixed(1);return{...e,combined:s,freqW:+t.toFixed(1),overdueW:+i.toFixed(1),momentumW:+a.toFixed(1),decisionW:+o.toFixed(1)}}).sort((e,t)=>t.combined-e.combined),a=i[0]?.combined??1;return i.slice(0,10).map(e=>({...e,probability:+(e.combined/a*100).toFixed(1)}))}var n=[{key:`freqW`,label:`ຄວາມຖີ່`,color:`#ef4444`,max:25,icon:`equalizer`},{key:`overdueW`,label:`ຊ້ານານ`,color:`#fbbf24`,max:25,icon:`hourglass_top`},{key:`momentumW`,label:`Momentum`,color:`#6cf8bb`,max:25,icon:`trending_up`},{key:`decisionW`,label:`ສັນຍານ★`,color:`#f97316`,max:25,icon:`stars`}],r=[`ມັງກອນ`,`ກຸມພາ`,`ມີນາ`,`ເມສາ`,`ພຶດສະພາ`,`ມິຖຸນາ`,`ກໍລະກົດ`,`ສິງຫາ`,`ກັນຍາ`,`ຕຸລາ`,`ພະຈິກ`,`ທັນວາ`],i=[`ອາທິດ`,`ຈັນ`,`ອັງຄານ`,`ພຸດ`,`ພະຫັດ`,`ສຸກ`,`ເສົາ`];function a(e=new Date){let t=new Date(e);for(t.setDate(t.getDate()+1),t.setHours(12,0,0,0);t.getDay()===0||t.getDay()===6;)t.setDate(t.getDate()+1);return t}var o=[{key:`freqW`,label:`ຄວາມຖີ່`,color:`#ef4444`,max:15,icon:`equalizer`},{key:`overdueW`,label:`ຊ້ານານ`,color:`#fbbf24`,max:15,icon:`hourglass_top`},{key:`momentumW`,label:`Momentum`,color:`#6cf8bb`,max:12,icon:`trending_up`},{key:`decisionW`,label:`ສັນຍານ★`,color:`#f97316`,max:9,icon:`stars`},{key:`monthlyW`,label:`ເດືອນ`,color:`#818cf8`,max:15,icon:`calendar_month`},{key:`weekdayW`,label:`ວັນອອກ`,color:`#22d3ee`,max:15,icon:`today`},{key:`pairW`,label:`ຕໍ່ຈາກ`,color:`#a78bfa`,max:12,icon:`link`},{key:`mirrorW`,label:`ສະລັບ`,color:`#f472b6`,max:7,icon:`sync_alt`}];function s(t,n,o=null){if(!t?.length)return null;let s=n===`all`?t.length:Math.min(parseInt(n),t.length),c=t.slice(0,s),l=[...c].reverse(),u=e(t,n);if(!u)return null;let{scores:d}=u,f=c[0]?.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value??null,p=o?new Date(o):a(new Date),m=p.getMonth()+1,h=p.getDay(),g={},_={};for(let e=0;e<100;e++){let t=e.toString().padStart(2,`0`);g[t]=0,_[t]=0}l.forEach(e=>{let t=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;if(!t||g[t]===void 0)return;let n=new Date(e.draw_date);n.getMonth()+1===m&&g[t]++,n.getDay()===h&&_[t]++});let v={};for(let e=0;e<100;e++)v[e.toString().padStart(2,`0`)]=0;f&&l.forEach((e,t)=>{if(t>=l.length-1)return;let n=e.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value,r=l[t+1]?.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;n===f&&r&&v[r]!==void 0&&v[r]++});let y=Math.max(...Object.values(g),1),b=Math.max(...Object.values(_),1),x=Math.max(...Object.values(v),1),S=Math.max(...d.map(e=>e.freq),1),C=Math.max(...d.filter(e=>e.momentum>0).map(e=>e.momentum),.001),w=Object.fromEntries(d.map(e=>[e.num,e])),T=d.map(e=>{let{num:t}=e,n=e.freq/S*15,r=Math.min(e.overdue/3,1)*15,i=e.momentum>0?e.momentum/C*12:0,a=e.decisionScore/3*9,o=g[t]/y*15,s=_[t]/b*15,c=f?v[t]/x*12:0,l=t[1]+t[0],u=w[l],d=(u?(u.momentum>0?.5:0)+(u.overdue>1?.5:0):0)*7,p=+(n+r+i+a+o+s+c+d).toFixed(2);return{...e,num:t,total:p,freqW:+n.toFixed(1),overdueW:+r.toFixed(1),momentumW:+i.toFixed(1),decisionW:+a.toFixed(1),monthlyW:+o.toFixed(1),weekdayW:+s.toFixed(1),pairW:+c.toFixed(1),mirrorW:+d.toFixed(1),mirror:l,monthFreqCount:g[t],dayFreqCount:_[t],pairFollowCount:v[t]}}).sort((e,t)=>t.total-e.total),E=T[0]?.total??1,D=T.slice(0,10).map(e=>({...e,probability:+(e.total/E*100).toFixed(1)})),O=Object.entries(v).sort((e,t)=>t[1]-e[1]).slice(0,5).map(([e,t])=>({num:e,cnt:t}));return{top10:D,scored:T,lastResult:f,nextDate:p,nextMonth:m,nextWeekday:h,monthName:r[m-1],weekdayName:i[h],n:s,base:u,maxTotal:E,pairTopFollowers:O}}function c(e,t=21){if(!e?.length||e.length<t+5)return null;let n=[];for(let r=0;r<t;r++){let t=e[r],i=t?.results_detail?.find(e=>e.prize_type===`2_digits`)?.result_value;if(!i)continue;let a=e.slice(r+1);if(a.length<5)continue;let o=s(a,`all`,t.draw_date);if(!o)continue;let c=o.top10.map(e=>e.num),l=c.slice(0,5),u=c[0],d=c.indexOf(i);n.push({drawNum:t.draw_number,date:t.draw_date,actual:i,top1:u,top10Nums:c,hit1:u===i,hit5:l.includes(i),hit10:c.includes(i),score1:o.top10[0]?.probability,actualRank:d>=0?d+1:null})}return{results:n,trials:n.length,hits1:n.filter(e=>e.hit1).length,hits5:n.filter(e=>e.hit5).length,hits10:n.filter(e=>e.hit10).length}}function l(e){if(!e)return``;let t=new Date(e);return`${t.getDate()} ${[`ມັງກອນ`,`ກຸມພາ`,`ມີນາ`,`ເມສາ`,`ພຶດສະພາ`,`ມິຖຸນາ`,`ກໍລະກົດ`,`ສິງຫາ`,`ກັນຍາ`,`ຕຸລາ`,`ພະຈິກ`,`ທັນວາ`][t.getMonth()]} ${t.getFullYear()}`}function u(e,t,n,r,i){if(!e.length||!t)return``;let{hot:a,cold:o,rising:s,overdue:c,aiTop:u,decisionTop:d}=t,f=l(n?.draw_date)||l(new Date().toISOString()),p=n?.draw_number??`?`,m=i?` (${i})`:``,h=e.map((e,t)=>`  ${t+1}. ເລກ ${e.num}`).join(`
`),g=d.filter(e=>e.decisionScore===3).slice(0,3).map(e=>e.num),_=a.slice(0,5).map(e=>e.num),v=o.slice(0,5).map(e=>e.num),y=s.slice(0,5).map(e=>e.num),b=c.slice(0,5).map(e=>e.num);return`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 ວິເຄາະຫວຍລາວ — ເລກເດັ່ນງວດນີ້${m}
📅 ວັນທີ: ${f}  |  ງວດ: #${p}  |  ວິເຄາະ ${r} ງວດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ລະບົບ AI ໄດ້ວິເຄາະສະຖິຕິ ${r} ງວດ ໂດຍລວມ 4 ດ້ານ
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
   ${u.slice(0,5).map(e=>e.num).join(` · `)}

⭐ ສັນຍານຄົບ 3 (★★★ Decision Score):
   ${g.length?g.join(`, `):`ບໍ່ມີງວດນີ້`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ສະຫຼຸບ ເລກ 10 ໂຕເດັ່ນ:
   ${e.map(e=>e.num).join(` · `)}

⚠️  ຄຳເຕືອນ: ຫວຍລາວເປັນການສຸ່ມ — ຂໍ້ມູນນີ້ເປັນພຽງການວິເຄາະທາງສະຖິຕິ
     ບໍ່ຮັບປະກັນຜົນລາງວັນ — ຫ້າມລົງທຶນເກີນຄວາມສາມາດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📲 laolots.com — ຂໍ້ມູນຫວຍລາວ ຄົບຖ້ວນທີ່ສຸດ`}export{t as a,e as i,o as n,c as o,u as r,s,n as t};