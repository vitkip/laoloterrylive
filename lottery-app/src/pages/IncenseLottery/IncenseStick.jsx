import { motion, AnimatePresence } from 'framer-motion';
import SmokeEffect from './SmokeEffect';

function Spark({ angle, delay }) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * 32;
  const dy = Math.sin(rad) * 32;
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 5, height: 5,
        borderRadius: '50%',
        background: '#ffcc44',
        boxShadow: '0 0 8px #ff8800',
        pointerEvents: 'none',
        marginTop: -2.5, marginLeft: -2.5,
      }}
    />
  );
}

const SPARK_ANGLES = [0, 22, 45, 67, 90, 112, 135, 157, 180, 202, 225, 247, 270, 292, 315, 337];

export default function IncenseStick({ state }) {
  const isLighting = state === 'lighting';
  const isBurning  = state === 'burning' || state === 'revealed';

  const stickHeight = isBurning ? 180 : 240;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56 }}>
      {/* Smoke */}
      {isBurning && (
        <div style={{ position: 'absolute', bottom: stickHeight + 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SmokeEffect active />
        </div>
      )}

      {/* Stick */}
      <motion.div
        animate={{ height: stickHeight }}
        transition={{ duration: 7, ease: 'easeInOut' }}
        style={{ position: 'relative', width: 32, overflow: 'visible' }}
      >
        <svg viewBox="0 0 32 240" width="32" height={stickHeight} style={{ overflow: 'visible' }}>
          {/* Ambient glow around stick when burning */}
          {isBurning && (
            <ellipse cx="16" cy="120" rx="20" ry="110"
              fill="none" stroke="rgba(220,60,60,0.07)" strokeWidth="16" />
          )}

          {/* Wooden base section */}
          <rect x="13" y="212" width="6" height="28" rx="2" fill="#c8a96e" />

          {/* Main red stick body */}
          <rect x="11" y="16" width="10" height="198" rx="4" fill="url(#sg)" />

          {/* Embossed stripe */}
          <rect x="14" y="40" width="4" height="120" rx="1.5" fill="rgba(255,80,60,0.3)" />

          {/* Vertical text on stick */}
          <text x="16" y="70"  textAnchor="middle" fontSize="6" fontWeight="700" fill="rgba(255,220,180,0.75)" fontFamily="Noto Sans Lao Looped, sans-serif">ໂ</text>
          <text x="16" y="82"  textAnchor="middle" fontSize="6" fontWeight="700" fill="rgba(255,220,180,0.75)" fontFamily="Noto Sans Lao Looped, sans-serif">ຊ</text>
          <text x="16" y="94"  textAnchor="middle" fontSize="6" fontWeight="700" fill="rgba(255,220,180,0.75)" fontFamily="Noto Sans Lao Looped, sans-serif">ກ</text>
          <text x="16" y="108" textAnchor="middle" fontSize="5" fill="rgba(255,200,150,0.5)" fontFamily="Noto Sans Lao Looped, sans-serif">ດີ</text>
          <text x="16" y="120" textAnchor="middle" fontSize="5" fill="rgba(255,200,150,0.5)" fontFamily="Noto Sans Lao Looped, sans-serif">มี</text>
          <text x="16" y="132" textAnchor="middle" fontSize="5" fill="rgba(255,200,150,0.5)" fontFamily="Noto Sans Lao Looped, sans-serif">โ</text>
          <text x="16" y="143" textAnchor="middle" fontSize="5" fill="rgba(255,200,150,0.5)" fontFamily="Noto Sans Lao Looped, sans-serif">ชค</text>

          {/* Burning tip */}
          {isBurning && (
            <>
              <circle cx="16" cy="16" r="9"  fill="rgba(255,120,20,0.55)" filter="url(#tb)" />
              <circle cx="16" cy="16" r="5"  fill="rgba(255,200,60,0.95)" />
              <circle cx="16" cy="16" r="2.5" fill="#fff" />
            </>
          )}

          {/* Unlit tip */}
          {!isBurning && (
            <circle cx="16" cy="14" r="5" fill="#8b3a3a" />
          )}

          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#7b1a1a" />
              <stop offset="35%"  stopColor="#c0392b" />
              <stop offset="65%"  stopColor="#a93226" />
              <stop offset="100%" stopColor="#6b1a1a" />
            </linearGradient>
            <filter id="tb"><feGaussianBlur stdDeviation="4" /></filter>
          </defs>
        </svg>

        {/* Lighting sparks burst */}
        <AnimatePresence>
          {isLighting && (
            <div style={{ position: 'absolute', top: 14, left: '50%' }}>
              {SPARK_ANGLES.map((angle, i) => (
                <Spark key={i} angle={angle} delay={i * 0.025} />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Pulsing glow when lighting */}
        {isLighting && (
          <motion.div
            animate={{ scale: [1, 3, 1], opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 0.65, repeat: 3 }}
            style={{
              position: 'absolute', top: 5, left: '50%',
              transform: 'translateX(-50%)',
              width: 24, height: 24, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,210,60,0.9) 0%, rgba(255,80,0,0.5) 60%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
