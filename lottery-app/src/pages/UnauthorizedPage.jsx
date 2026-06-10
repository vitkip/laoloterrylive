import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { animals } from '../data/animals';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drawState, setDrawState] = useState('idle'); // 'idle' | 'spinning' | 'revealed'
  const [tempNumber, setTempNumber] = useState('00');
  const [luckyNumber, setLuckyNumber] = useState('');
  const [animal, setAnimal] = useState(null);

  // Date styling for the ticket
  const today = new Date();
  const formattedDate = today.toLocaleDateString('lo-LA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleDraw = () => {
    if (drawState === 'spinning') return;
    setDrawState('spinning');
    
    let counter = 0;
    const interval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * 100);
      setTempNumber(randomNum.toString().padStart(2, '0'));
      counter += 50;
      if (counter >= 1200) {
        clearInterval(interval);
        const finalNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        setLuckyNumber(finalNum);
        
        // Find animal by number
        const animalInfo = animals.find(a =>
          a.animal_numbers.split(',').includes(finalNum)
        ) || animals[0];

        setAnimal(animalInfo);
        setDrawState('revealed');
      }
    }, 50);
  };

  const barcodePattern = [3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-jakarta select-none">
      <style>{`
        @keyframes float-ball-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-ball-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(-6deg); }
        }
        @keyframes float-ball-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes spin-drum {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-float-1 { animation: float-ball-1 4s ease-in-out infinite; }
        .animate-float-2 { animation: float-ball-2 4.5s ease-in-out infinite; }
        .animate-float-3 { animation: float-ball-3 3.8s ease-in-out infinite; }
        .animate-spin-drum { animation: spin-drum 0.4s linear infinite; }
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
          transform: skewX(-25deg);
          animation: shine 2.5s infinite;
        }
      `}</style>

      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-destructive/5 dark:bg-destructive/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* 3D Locked Lottery Balls (4 - 0 - 3) */}
        <div className="flex justify-center gap-4 mb-8 relative">
          
          {/* Ball 1: 4 */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-neutral-700 via-neutral-600 to-neutral-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center relative text-white font-black text-3xl border border-white/10 select-none animate-float-1">
            <span className="absolute inset-0 flex items-center justify-center drop-shadow-md">4</span>
            <div className="absolute top-0.5 left-1.5 w-5 h-2 bg-white/30 rounded-full rotate-[-15deg]" />
          </div>

          {/* Ball 2: 0 (Locked with padlock overlay) */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-700 via-red-500 to-rose-200 shadow-[0_8px_20px_rgba(220,38,38,0.3)] flex items-center justify-center relative text-white font-black text-3xl border border-white/20 select-none animate-float-2 z-10">
            <span className="absolute inset-0 flex items-center justify-center drop-shadow-md opacity-25">0</span>
            <div className="absolute top-0.5 left-1.5 w-5 h-2 bg-white/30 rounded-full rotate-[-15deg]" />
            <span className="material-symbols-outlined text-white text-3xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>

          {/* Ball 3: 3 */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-neutral-700 via-neutral-600 to-neutral-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center relative text-white font-black text-3xl border border-white/10 select-none animate-float-3">
            <span className="absolute inset-0 flex items-center justify-center drop-shadow-md">3</span>
            <div className="absolute top-0.5 left-1.5 w-5 h-2 bg-white/30 rounded-full rotate-[-15deg]" />
          </div>
        </div>

        {/* Void Lottery Ticket */}
        <div className="w-full bg-card text-foreground rounded-3xl border border-border shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* Left & Right Circle Ticket Cutouts */}
          <div className="absolute left-[-10px] bottom-[114px] w-5 h-5 rounded-full bg-background border-r border-border z-20" />
          <div className="absolute right-[-10px] bottom-[114px] w-5 h-5 rounded-full bg-background border-l border-border z-20" />
          {/* Ticket Dashed Line */}
          <div className="absolute left-4 right-4 bottom-[123px] border-t border-dashed border-border/80 z-10" />

          {/* Ticket Body Content */}
          <div className="p-6 pb-10 relative text-center">
            
            {/* Stamp / Watermark behind content */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-16 border-4 border-dashed border-destructive/10 rounded-xl flex items-center justify-center text-destructive/10 font-black text-2xl uppercase tracking-widest rotate-[-12deg] select-none pointer-events-none font-mono">
              RESTRICTED
            </div>

            {/* Ticket Header metadata */}
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 border-b border-border/40 pb-2">
              <span>VOID TICKET / RESTRICTED</span>
              <span>ງວດ: {formattedDate}</span>
            </div>

            {/* Details */}
            <span className="inline-block bg-destructive/10 text-destructive font-bold text-[10px] px-2.5 py-0.5 rounded-full mb-3 tracking-wider">
              ERROR 403
            </span>
            <h1 className="text-xl font-black text-foreground mb-2 font-headline">ບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</h1>
            <p className="text-xs text-muted-foreground leading-relaxed px-4 mb-4">
              ຂໍອະໄພ, ບັນຊີຂອງທ່ານບໍ່ໄດ້ຮັບອະນຸຍາດ ຫຼື ບໍ່ມີສິດທິພຽງພໍໃນການເຂົ້າເຖິງໜ້າເວັບນີ້.
            </p>
            {user && (
              <div className="inline-flex items-center gap-1.5 bg-secondary/80 dark:bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground font-semibold">
                <span>ບົດບາດຂອງທ່ານ:</span>
                <span className="text-primary font-bold">{user.role}</span>
              </div>
            )}
          </div>

          {/* Ticket Stub (Interactive Unlock Draw) */}
          <div className="bg-secondary/40 dark:bg-secondary/20 p-5 pt-8 flex flex-col items-center justify-center min-h-[124px] z-10">
            
            {drawState === 'idle' && (
              <div className="text-center w-full flex flex-col items-center">
                <p className="text-[11px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  🔑 ໝູນຫາເລກລະຫັດປົດລັອກນຳໂຊກຂອງທ່ານ!
                </p>
                <button
                  onClick={handleDraw}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-base group-hover:rotate-180 transition-transform duration-500">key</span>
                  ໝູນເລກປົດລັອກ
                </button>
              </div>
            )}

            {drawState === 'spinning' && (
              <div className="flex flex-col items-center">
                {/* Bouncing/Spinning Ball */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-white font-black text-xl relative shadow-lg animate-spin-drum select-none border border-white/20">
                  <span className="drop-shadow-md">{tempNumber}</span>
                  <div className="absolute top-0.5 left-1.5 w-4 h-1.5 bg-white/40 rounded-full rotate-[-15deg]" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 animate-pulse font-medium">
                  ກຳລັງໝູນຫາເລກລະຫັດນຳໂຊກ...
                </p>
              </div>
            )}

            {drawState === 'revealed' && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="w-full flex items-center gap-3 bg-background/50 dark:bg-background/20 p-2.5 rounded-xl border border-border/40 shimmer-effect">
                  
                  {/* Lucky Ball */}
                  <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-200 flex items-center justify-center text-white font-black text-xl relative shadow-md border border-white/10 select-none">
                    <span className="drop-shadow-md">{luckyNumber}</span>
                    <div className="absolute top-0.5 left-1.5 w-4 h-1.5 bg-white/40 rounded-full rotate-[-15deg]" />
                  </div>

                  {/* Animal Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {animal?.icon || 'pets'}
                      </span>
                      <span>ເລກນາມສັດ: {animal?.animal_name_lao || 'ບໍ່ລະບຸ'}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-bold mt-0.5">
                      ຊຸດເລກ: {animal?.animal_numbers || luckyNumber}
                    </div>
                  </div>

                  {/* Draw again */}
                  <button
                    onClick={handleDraw}
                    title="ໝູນໃໝ່"
                    className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                  </button>
                </div>
                <span className="text-[9px] text-destructive dark:text-red-400 font-bold mt-2 text-center">
                  ⚠️ ລະຫັດນີ້ບໍ່ສາມາດປົດລັອກໜ້ານີ້ໄດ້, ແຕ່ອາດຈະນຳໂຊກໃນງວດນີ້! 🍀
                </span>
              </div>
            )}
          </div>

          {/* Barcode & Ticket Footer */}
          <div className="w-full flex flex-col items-center bg-card py-4 border-t border-border/20 z-10">
            {/* Barcode lines */}
            <div className="flex justify-center gap-0.5 h-6 w-3/5 items-center mb-1 overflow-hidden select-none opacity-40 dark:opacity-60">
              {barcodePattern.map((w, i) => (
                <div 
                  key={i} 
                  className="bg-foreground h-full" 
                  style={{ width: `${w}px` }} 
                />
              ))}
            </div>
            <span className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase">
              * 403-ACCESS-DENIED *
            </span>
          </div>

        </div>

        {/* Action Buttons Below the Ticket */}
        <div className="flex gap-3 mt-8 w-full justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold rounded-xl transition-all text-xs flex items-center gap-1 hover:translate-x-[-2px] active:scale-95 cursor-pointer"
          >
            ← ກັບຄືນ
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl transition-all text-xs flex items-center gap-1 shadow-md shadow-primary/10 hover:translate-y-[-1px] active:scale-95 cursor-pointer"
          >
            ໜ້າ Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
