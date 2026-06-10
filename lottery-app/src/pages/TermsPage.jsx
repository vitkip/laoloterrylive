import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SEO from '../components/SEO';
import { animals } from '../data/animals';

const SECTIONS = [
  {
    title: '1. ການຍອມຮັບເງື່ອນໄຂ',
    body: 'ການໃຊ້ງານເວັບໄຊ laolots.com ຖືວ່າທ່ານໄດ້ຍອມຮັບເງື່ອນໄຂການໃຊ້ງານທັງໝົດທີ່ລະບຸໄວ້ໃນເອກະສານນີ້. ຫາກທ່ານບໍ່ຕົກລົງ, ກະລຸນາຢຸດໃຊ້ງານທັນທີ.',
  },
  {
    title: '2. ຈຸດປະສົງຂອງການໃຫ້ບໍລິການ',
    body: 'laolots.com ໃຫ້ບໍລິການສະແດງຜົນຫວຍ, ສະຖິຕິ, ແລະ ຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ ເພື່ອຈຸດປະສົງດ້ານຂໍ້ມູນຂ່າວສານສ່ວນຕົວເທົ່ານັ້ນ. ບໍລິການທັງໝົດໃຫ້ໂດຍ ຊ. ໂດຍບໍ່ມີຄ່າໃຊ້ຈ່າຍ.',
  },
  {
    title: '3. ຂໍ້ຈຳກັດຄວາມຮັບຜິດຊອບ',
    body: 'ຂໍ້ມູນຜົນຫວຍທີ່ສະແດງໃນເວັບໄຊນີ້ໄດ້ຮັບມາຈາກແຫຼ່ງທີ່ໜ້າເຊື່ອຖືໄດ້ ແຕ່ອາດມີຄວາມຜິດພາດໄດ້. ທ່ານຄວນຢືນຢັນຜົນລັດທາງການກ່ອນຕັດສິນໃຈ. ທາງເວັບໄຊຈະບໍ່ຮັບຜິດຊອບຕໍ່ຄວາມສູນເສຍໃດໆທີ່ເກີດຈາກການນໍາໃຊ້ຂໍ້ມູນ.',
  },
  {
    title: '4. ຂໍ້ຫ້າມໃຊ້ງານ',
    items: [
      'ຫ້າມນໍາໃຊ້ລະບົບໃນທາງທີ່ຜິດກົດໝາຍ ຫຼື ຂັດຕໍ່ສີລະທຳ',
      'ຫ້າມ scrape, crawl ຫຼື ດຶງຂໍ້ມູນຈຳນວນຫຼາຍໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ',
      'ຫ້າມປ່ຽນ, ແກ້ໄຂ ຫຼື ທຳລາຍລະບົບ',
      'ຫ້າມສ້າງ account ຫຼາຍຕົວໂດຍເຈດຕະນາ ເພື່ອຫລຸດຕ່ຳ rate limit',
      'ຫ້າມໃຊ້ API ໃນຜະລິດຕະພັນ commercial ໂດຍບໍ່ໄດ້ຮັບການຕົກລົງ',
    ],
  },
  {
    title: '5. ສິດທິທາງປັນຍາ',
    body: 'ເນື້ອຫາ, ການອອກແບບ, ລະຫັດ ແລະ ທຸກຊັບສິນທາງດ້ານດິຈິຕອນໃນ laolots.com ເປັນຂອງ laolots.com ທັງໝົດ. ຫ້າມຄັດລອກ, ທຳຊ້ຳ ຫຼື ແຈກຢາຍໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ.',
  },
  {
    title: '6. ຄວາມເປັນສ່ວນຕົວ',
    body: 'ທ່ານຍິນຍອມໃຫ້ເວັບໄຊເກັບລວບລວມຂໍ້ມູນ anonymous ເຊັ່ນ: ຈຳນວນຜູ້ເຂົ້າຊົມ, ໜ້າທີ່ເຂົ້າໄປ ເພື່ອປັບປຸງບໍລິການ. ຂໍ້ມູນສ່ວນຕົວທີ່ທ່ານລົງທະບຽນ (email, username) ຈະຖືກເກັບ encrypted ແລະ ຈະ ບໍ່ ຖືກແບ່ງປັນຕໍ່ຜູ້ອື່ນ.',
  },
  {
    title: '7. ການສິ້ນສຸດບັນຊີ',
    body: 'ທາງເວັບໄຊສະຫງວນສິດໃນການລົບ ຫຼື ລະງັບ account ທີ່ລະເມີດເງື່ອນໄຂ, ໂດຍບໍ່ຈຳເປັນຕ້ອງແຈ້ງລ່ວງໜ້າ.',
  },
  {
    title: '8. ການປ່ຽນແປງເງື່ອນໄຂ',
    body: 'ທາງເວັບໄຊອາດປ່ຽນແປງເງື່ອນໄຂນີ້ໄດ້ທຸກເວລາ. ຈະແຈ້ງການປ່ຽນແປງທີ່ສຳຄັນຜ່ານໜ້າເວັບ ຫຼື email. ການໃຊ້ງານຕໍ່ໄປຫຼັງຈາກການປ່ຽນແປງ ຖືວ່າຍອມຮັບເງື່ອນໄຂໃໝ່.',
  },
  {
    title: '9. ກົດໝາຍທີ່ໃຊ້ບັງຄັບ',
    body: 'ເງື່ອນໄຂນີ້ຢູ່ພາຍໃຕ້ກົດໝາຍ ສປປ ລາວ. ຂໍ້ຂັດແຍ່ງໃດໆຈະໄດ້ຮັບການແກ້ໄຂ ຕາມກົດໝາຍ ສປປ ລາວ.',
  },
];

export default function TermsPage() {
  const navigate = useNavigate();
  const [isAccepted, setIsAccepted] = useState(false);
  const [luckyBall, setLuckyBall] = useState({ number: '', animal: null });

  const handleAccept = () => {
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    // Find animal corresponding to the number
    const drawnAnimal = animals.find(a =>
      a.animal_numbers.split(',').includes(randomNum)
    ) || animals[0];

    setLuckyBall({
      number: randomNum,
      animal: drawnAnimal
    });
    setIsAccepted(true);
  };

  return (
    <>
      <SEO
        title="ເງື່ອນໄຂການໃຊ້ງານ — Lao Lottery Live"
        description="Term and condition of laolots.com"
      />

      <style>{`
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-20deg);
          animation: shine 2.5s infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>

      {/* Decorative glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto py-6 sm:py-10 text-left select-none relative z-10 px-4 sm:px-0">
        
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer hover:translate-x-[-2px] duration-200"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            ກັບຄືນ
          </button>

          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
              <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight font-headline">
              ເງື່ອນໄຂການໃຊ້ງານ
            </h1>
          </div>
          <p className="text-xs font-semibold text-muted-foreground ml-[58px]">
            ອັບເດດລ່າສຸດ: ມິຖຸນາ 2026 · laolots.com
          </p>
        </div>

        {/* Intro card */}
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/5 rounded-3xl px-6 py-5 mb-8 text-sm text-foreground/80 leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-amber-500 opacity-60" />
          ກ່ອນໃຊ້ງານ laolots.com ກະລຸນາອ່ານ ແລະ ທຳຄວາມເຂົ້າໃຈກັບເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດການໃຊ້ງານໃຫ້ຄົບຖ້ວນ.
          ທ່ານສາມາດຕິດຕໍ່ທີມງານໄດ້ທາງ <a href="mailto:noreply@laolots.com" className="text-primary hover:underline font-bold transition-all ml-1">noreply@laolots.com</a> ຫາກມີຄຳຖາມ.
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-5">
          {SECTIONS.map((s, index) => (
            <section
              key={s.title}
              className="bg-card border border-border/80 dark:border-border/10 rounded-3xl px-6 py-5.5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 group"
            >
              {/* Huge Background Number */}
              <span className="absolute right-6 top-3 text-7xl font-black text-primary/5 dark:text-primary/10 select-none group-hover:scale-105 transition-transform duration-300 font-mono">
                {(index + 1).toString().padStart(2, '0')}
              </span>

              <h2 className="text-sm font-black text-foreground uppercase tracking-widest font-headline mb-3.5 pr-12">
                {s.title}
              </h2>
              
              {s.body && (
                <p className="text-xs text-muted-foreground leading-relaxed pr-8 font-medium">
                  {s.body}
                </p>
              )}
              
              {s.items && (
                <ul className="flex flex-col gap-2.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground font-medium pr-8">
                      <span className="material-symbols-outlined text-sm text-destructive mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        cancel
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Interactive Accept Widget */}
        <div className="bg-card border border-border/80 dark:border-border/10 rounded-3xl p-6 mt-8 relative overflow-hidden text-center shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 opacity-80" />
          
          {isAccepted ? (
            <div className="animate-fade-in flex flex-col items-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="text-base font-black text-foreground font-headline mb-1">ຂອບໃຈທີ່ຍອມຮັບເງື່ອນໄຂ!</h3>
              <p className="text-[11px] text-muted-foreground mb-4">ນີ້ຄືເລກນາມສັດນຳໂຊກຂອງທ່ານສຳລັບການອ່ານຂໍ້ກຳນົດ:</p>
              
              <div className="flex items-center gap-3 bg-secondary/40 dark:bg-secondary/15 p-2.5 rounded-2xl border border-border/40 max-w-xs w-full shadow-inner relative shimmer-effect">
                <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-white font-black text-lg relative shadow-md select-none border border-white/20">
                  <span className="drop-shadow-md">{luckyBall.number}</span>
                  <div className="absolute top-0.5 left-1.5 w-4 h-1.5 bg-white/40 rounded-full rotate-[-15deg]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                    <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {luckyBall.animal?.icon || 'pets'}
                    </span>
                    <span>ເລກນາມສັດ: {luckyBall.animal?.animal_name_lao}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-bold mt-0.5 leading-none">
                    ຊຸດເລກ: {luckyBall.animal?.animal_numbers || luckyBall.number}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-3 animate-bounce">
                🍀 ຂໍໃຫ້ເລກນາມສັດນີ້ເປັນໂຊກໃຫຍ່ຂອງທ່ານ!
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2">
              <h3 className="text-sm font-black text-foreground font-headline mb-1.5">ອ່ານເງື່ອນໄຂຄົບຖ້ວນແລ້ວບໍ?</h3>
              <p className="text-xs text-muted-foreground mb-5 px-4">
                ກົດຍອມຮັບເງື່ອນໄຂການໃຊ້ງານດ້ານລຸ່ມ ເພື່ອຮັບເລກນາມສັດນຳໂຊກຂອງທ່ານ!
              </p>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                ຂ້ອຍອ່ານ ແລະ ຍອມຮັບເງື່ອນໄຂ
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground text-center mt-10 pb-4">
          ຫາກທ່ານມີຄຳຖາມ ຕິດຕໍ່:{' '}
          <a href="mailto:noreply@laolots.com" className="text-primary hover:underline font-bold transition-all ml-1">
            noreply@laolots.com
          </a>
        </p>
      </div>
    </>
  );
}
