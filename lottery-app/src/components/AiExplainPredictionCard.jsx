import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { API } from '../utils/api'

// ─────────────────────────────────────────────────────────────────────────────
// AI EXPLAIN PREDICTION CARD — Claude writes a Lao-language narrative grounded
// in the already-computed Enhanced Prediction Engine (8-signal) top10 output.
// Backed by api/ai-explain-prediction.php. Shared by PredictionSummaryPage and
// AnalyticsPage (NewsPanel) — both compute `enhanced` via computeEnhancedPrediction().
// ─────────────────────────────────────────────────────────────────────────────

export default function AiExplainPredictionCard({ enhanced, drawNum, dateStr, n }) {
  const { user, authFetch } = useAuth()
  const navigate = useNavigate()
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleExplain = async () => {
    if (loading || !enhanced?.top10?.length) return
    setLoading(true)
    setError('')
    setText('')
    const top = enhanced.top10.slice(0, 5).map(s => ({
      num: s.num, total: s.total, probability: s.probability,
      freqW: s.freqW, overdueW: s.overdueW, momentumW: s.momentumW, decisionW: s.decisionW,
      monthlyW: s.monthlyW, weekdayW: s.weekdayW, pairW: s.pairW, mirrorW: s.mirrorW,
      freq: s.freq, gap: s.gap, overdue: s.overdue, momentum: s.momentum,
    }))
    const { ok, data } = await authFetch(`${API}/ai-explain-prediction.php`, {
      method: 'POST',
      body: JSON.stringify({ n, drawNum, dateStr, digitLen: 2, top }),
    })
    setLoading(false)
    if (ok) setText(data.explanation || '')
    else setError(data?.error || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ AI ໄດ້')
  }

  return (
    <div className="bg-gradient-to-br from-[#4c1d95]/25 via-zinc-950/95 to-zinc-950/95 backdrop-blur-2xl rounded-2xl p-5 border border-[#a78bfa]/25 shadow-xl shadow-black/40">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#a78bfa22', border: '1px solid #a78bfa44' }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#a78bfa' }}>smart_toy</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa]/70">AI ອະທິບາຍ</p>
          <h3 className="font-black text-white text-sm leading-tight">ເປັນຫຍັງເລກເຫຼົ່ານີ້ຈຶ່ງຖືກເລືອກ?</h3>
        </div>

        {user ? (
          <button
            onClick={handleExplain}
            disabled={loading || !enhanced?.top10?.length}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            )}
            {loading ? 'ກຳລັງວິເຄາະ...' : text ? 'ວິເຄາະຄືນໃໝ່' : 'ໃຫ້ AI ອະທິບາຍ'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] text-white/50 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            ເຂົ້າສູ່ລະບົບເພື່ອໃຊ້ AI
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-400 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">error</span>{error}
        </p>
      )}
      {text && !loading && (
        <p className="mt-4 text-[12.5px] leading-relaxed text-white/70 border-t border-white/10 pt-4">{text}</p>
      )}
      {!text && !error && !loading && (
        <p className="mt-4 text-[11px] text-white/35">
          ໃຫ້ Claude AI ອ່ານຄະແນນຈາກ 8-Signal Engine ຂອງເລກ 2 ຕົວອັນດັບຕົ້ນ ແລ້ວອະທິບາຍເປັນພາສາລາວ
        </p>
      )}
    </div>
  )
}
