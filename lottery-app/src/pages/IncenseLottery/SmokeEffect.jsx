import { motion } from 'framer-motion';

const PUFFS = [
  { x: 0,   delay: 0,    dur: 3.5, scale: 1.0 },
  { x: -6,  delay: 0.7,  dur: 4.0, scale: 0.8 },
  { x: 8,   delay: 1.4,  dur: 3.2, scale: 0.6 },
  { x: -4,  delay: 2.1,  dur: 4.5, scale: 0.9 },
  { x: 5,   delay: 0.3,  dur: 3.8, scale: 0.7 },
];

export default function SmokeEffect({ active }) {
  if (!active) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '100%', width: 40, height: 120, pointerEvents: 'none' }}>
      {PUFFS.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0, scale: 0.3, x: p.x }}
          animate={{
            y: [-10, -50, -100, -130],
            opacity: [0, 0.35, 0.2, 0],
            scale: [0.3, p.scale, p.scale * 1.4, p.scale * 2],
            x: [p.x, p.x - 4, p.x + 3, p.x - 2],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(180,160,220,0.5) 0%, rgba(120,100,160,0.15) 70%, transparent 100%)',
            filter: 'blur(6px)',
            transform: `translateX(${p.x}px)`,
          }}
        />
      ))}
    </div>
  );
}
