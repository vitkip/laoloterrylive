import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import IncenseStick from './IncenseStick';
import { fetchHotNumbers, pickWeightedNumbers } from './hotNumbersEngine';

// Seeded so particles don't re-randomize on re-render
const PARTICLES = [
  { x: 8, y: 25, size: 3, delay: 0, dur: 5.5 },
  { x: 18, y: 60, size: 2, delay: 1.2, dur: 4.8 },
  { x: 30, y: 40, size: 4, delay: 2.5, dur: 6.2 },
  { x: 45, y: 70, size: 2, delay: 0.7, dur: 5.0 },
  { x: 55, y: 30, size: 3, delay: 3.1, dur: 4.5 },
  { x: 68, y: 55, size: 2, delay: 1.8, dur: 6.0 },
  { x: 78, y: 45, size: 4, delay: 0.3, dur: 5.8 },
  { x: 88, y: 65, size: 2, delay: 2.0, dur: 4.2 },
  { x: 92, y: 28, size: 3, delay: 1.5, dur: 5.3 },
  { x: 12, y: 80, size: 2, delay: 3.8, dur: 6.5 },
  { x: 62, y: 20, size: 3, delay: 0.9, dur: 4.7 },
  { x: 38, y: 85, size: 2, delay: 2.3, dur: 5.6 },
];

const LABEL = ['ໂຊກດີ', 'ຮັງມີ', 'ລ້ຳລ້ວຍ'];

const STATE_DUR = { lighting: 2200, burning: 6500 };

export default function IncenseLotteryPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle');
  const [numbers, setNumbers] = useState([]);
  const [revealed, setRevealed] = useState(0);
  const [entering, setEntering] = useState(false);

  const stickState = ['lighting', 'burning', 'revealed'].includes(gameState) ? gameState : 'idle';
  const allRevealed = revealed >= 3;

  const startRitual = useCallback(async () => {
    setGameState('loading');
    setNumbers([]);
    setRevealed(0);
    const { pool1d, pool2d } = await fetchHotNumbers();
    setNumbers(pickWeightedNumbers(pool1d, pool2d));
    setGameState('lighting');
    setTimeout(() => setGameState('burning'), STATE_DUR.lighting);
    setTimeout(() => setGameState('revealed'), STATE_DUR.lighting + STATE_DUR.burning);
  }, []);

  useEffect(() => {
    if (gameState !== 'revealed') return;
    setRevealed(0);
    const t = [0, 1, 2].map(i => setTimeout(() => setRevealed(c => c + 1), i * 1200 + 400));
    return () => t.forEach(clearTimeout);
  }, [gameState]);

  const enterSite = () => {
    setEntering(true);
    setTimeout(() => navigate('/home'), 900);
  };

  const reset = () => {
    setGameState('idle');
    setNumbers([]);
    setRevealed(0);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 0%, #1c0428 0%, #0d000f 45%, #040008 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', fontFamily: 'var(--font-body)',
    }}>

      {/* Grain texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.5,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
      }} />

      {/* Radial top glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 320, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(160,40,40,0.14) 0%, transparent 70%)',
      }} />

      {/* Ambient floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.55, 0], y: -65, x: [0, p.size * 3, -p.size] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(212,175,55,0.55) 0%, transparent 70%)',
          }}
        />
      ))}

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, padding: '0 24px', textAlign: 'center' }}>

        {/* Site brand — top */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 8, color: 'rgba(212,175,55,0.4)', marginBottom: 6 }}>
            LAOLOTS · ດວງຊາຕາ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3))' }} />
            <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: 12 }}>✦</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.3))' }} />
          </div>
        </motion.div>

        {/* Headline — changes by state */}
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div key="h-idle"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: 28 }}
            >
              <h1 style={{
                fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px',
                textShadow: '0 0 28px rgba(212,175,55,0.35)', letterSpacing: '0.04em'
              }}>
                ຈູດທູບ ກ່ອນເຂົ້າສູ່ດວງຊາຕາ
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', letterSpacing: 2, margin: 0 }}>
                Light the incense to receive your lucky numbers
              </p>
            </motion.div>
          )}
          {(gameState === 'loading' || gameState === 'lighting' || gameState === 'burning') && (
            <motion.div key="h-ritual"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: 28 }}
            >
              <h1 style={{
                fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 6px',
                textShadow: '0 0 24px rgba(212,175,55,0.3)', letterSpacing: '0.04em'
              }}>
                {gameState === 'loading' ? 'ກຳລັງຮຽກຄວາມດວງ...' :
                  gameState === 'lighting' ? 'ກຳລັງຈູດທູບ...' :
                    'ທູບກຳລັງໄໝ້... ຂໍພອນ...'}
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', letterSpacing: 2, margin: 0 }}>
                {gameState === 'burning' ? 'ກະລຸນາຖ້າ ໜ້ອຍໜຶ່ງ...' : 'Please wait...'}
              </p>
            </motion.div>
          )}
          {gameState === 'revealed' && (
            <motion.div key="h-revealed"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: 20 }}
            >
              <h1 style={{
                fontSize: 20, fontWeight: 900, margin: '0 0 4px',
                color: 'rgba(212,175,55,0.95)',
                textShadow: '0 0 20px rgba(212,175,55,0.5)', letterSpacing: '0.04em'
              }}>
                ✦ ເລກດວງໂຊກຂອງທ່ານ ✦
              </h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: 2, margin: 0 }}>
                Your lucky numbers for today
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Incense altar ── */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', padding: '0 0 18px', position: 'relative' }}>
            {/* Altar shelf */}
            <svg viewBox="0 0 160 36" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 160 }}>
              <rect x="6" y="8" width="148" height="18" rx="5" fill="url(#ag)" />
              <rect x="0" y="22" width="160" height="14" rx="3" fill="url(#ab)" />
              {[32, 80, 128].map(cx => <circle key={cx} cx={cx} cy="17" r="2" fill="rgba(212,175,55,0.45)" />)}
              <text x="80" y="18.5" textAnchor="middle" fontSize="7.5" fill="rgba(212,175,55,0.6)" fontFamily="Noto Sans Lao Looped, sans-serif" letterSpacing="3">✦ ໂຊກດີ ✦</text>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d1a1a" /><stop offset="100%" stopColor="#2a0f0f" />
                </linearGradient>
                <linearGradient id="ab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a0a0a" /><stop offset="100%" stopColor="#0d0505" />
                </linearGradient>
              </defs>
            </svg>
            <IncenseStick state={stickState} />
          </div>
          {/* Sand pot */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
            <svg viewBox="0 0 88 44" width="104">
              <ellipse cx="44" cy="9" rx="38" ry="7.5" fill="#180808" />
              <path d="M6 9 Q9 44 44 44 Q79 44 82 9 Z" fill="url(#pg)" />
              <ellipse cx="44" cy="9" rx="32" ry="5.5" fill="rgba(212,175,55,0.07)" />
              <ellipse cx="44" cy="9" rx="24" ry="4" fill="#c8a050" opacity="0.11" />
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d2010" /><stop offset="100%" stopColor="#1a0d08" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ── Number reveal cards ── */}
        <AnimatePresence>
          {gameState === 'revealed' && numbers.length > 0 && (
            <motion.div key="cards"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 32 }}
            >
              {numbers.map((num, i) => (
                i < revealed ? (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 28, scale: 0.55 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.45, duration: 0.7 }}
                    style={{ position: 'relative', textAlign: 'center' }}
                  >
                    <motion.div animate={{ opacity: [0.25, 0.65, 0.25] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        position: 'absolute', inset: -18, borderRadius: '50%', pointerEvents: 'none',
                        background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 70%)'
                      }}
                    />
                    <div style={{
                      position: 'relative',
                      background: 'linear-gradient(150deg, rgba(212,175,55,0.1) 0%, rgba(90,45,10,0.18) 100%)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: 12, padding: '12px 18px 8px', minWidth: 68,
                    }}>
                      <div style={{
                        fontSize: num.length === 1 ? 52 : 40, fontWeight: 900,
                        color: '#fff', lineHeight: 1, letterSpacing: '-0.02em',
                        fontFamily: 'var(--font-jakarta)',
                        textShadow: '0 0 16px rgba(212,175,55,1), 0 0 32px rgba(212,175,55,0.55), 0 0 56px rgba(212,175,55,0.2)',
                      }}>
                        {num}
                      </div>
                      <div style={{ fontSize: 9, marginTop: 5, color: 'rgba(212,175,55,0.5)', letterSpacing: 2, fontFamily: 'var(--font-body)' }}>
                        {LABEL[i]}
                      </div>
                    </div>
                  </motion.div>
                ) : <div key={i} style={{ minWidth: 68 }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action area ── */}
        <AnimatePresence mode="wait">
          {/* IDLE: light incense button */}
          {gameState === 'idle' && (
            <motion.div key="btn-idle"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(192,57,43,0.6), 0 6px 24px rgba(0,0,0,0.6)' }}
                whileTap={{ scale: 0.97 }}
                onClick={startRitual}
                style={{
                  background: 'linear-gradient(135deg, #7b1515 0%, #c0392b 50%, #7b1515 100%)',
                  border: '1px solid rgba(212,175,55,0.45)',
                  borderRadius: 50, padding: '18px 52px',
                  color: '#fff', fontSize: 19, fontWeight: 700,
                  fontFamily: 'var(--font-headline)', letterSpacing: '0.07em',
                  cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(192,57,43,0.4), 0 4px 18px rgba(0,0,0,0.5)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                }}
              >
                🔥 ຈູດທູບຂໍເລກ
              </motion.button>
              {/* Skip link */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                <button onClick={() => navigate('/home')}
                  style={{
                    marginTop: 20, background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: 3,
                    fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 3
                  }}
                >
                  ຂ້າມໄປໜ້າຫຼັກ
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* LOADING: spinner */}
          {gameState === 'loading' && (
            <motion.div key="btn-loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}
            >
              <motion.div animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  border: '2px solid rgba(212,175,55,0.18)',
                  borderTopColor: 'rgba(212,175,55,0.8)'
                }}
              />
            </motion.div>
          )}

          {/* REVEALED + all numbers shown: ENTER SITE button */}
          {gameState === 'revealed' && allRevealed && (
            <motion.div key="btn-enter"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              {/* Primary: Enter Site */}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(212,175,55,0.45), 0 6px 28px rgba(0,0,0,0.6)' }}
                whileTap={{ scale: 0.97 }}
                onClick={enterSite}
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(180,130,30,0.28) 50%, rgba(212,175,55,0.18) 100%)',
                  border: '1.5px solid rgba(212,175,55,0.65)',
                  borderRadius: 50, padding: '18px 52px',
                  color: '#f5e090', fontSize: 19, fontWeight: 700,
                  fontFamily: 'var(--font-headline)', letterSpacing: '0.08em',
                  cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(212,175,55,0.25), 0 4px 18px rgba(0,0,0,0.5)',
                  textShadow: '0 0 12px rgba(212,175,55,0.8)',
                  width: '100%',
                }}
              >
                ✦ ເຂົ້າສູ່ເວັບ ✦
              </motion.button>

              {/* Secondary: redo ritual */}
              <button onClick={reset}
                style={{
                  marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'rgba(212,175,55,0.4)', letterSpacing: 2,
                  fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 3
                }}
              >
                🔄 ຈູດທູບໃໝ່
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{ marginTop: 36, fontSize: 9, color: 'rgba(255,255,255,0.1)', letterSpacing: 2 }}>
          ສຳລັບຄວາມບັນເທີງເທົ່ານັ້ນ · For entertainment purposes only
        </div>
      </div>

      {/* ── Enter-site transition overlay ── */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: '#050008',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.95] }}
              transition={{ duration: 0.85, times: [0, 0.3, 0.7, 1] }}
              style={{ fontSize: 14, letterSpacing: 8, color: 'rgba(212,175,55,0.7)', fontFamily: 'var(--font-headline)' }}
            >
              ✦ ຍິນດີຕ້ອນຮັບ ✦
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
