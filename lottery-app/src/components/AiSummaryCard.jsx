import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { API } from '../utils/api'

// ─────────────────────────────────────────────────────────────────────────────
// AI SUMMARY CARD — reusable "narrate these stats in Lao" widget.
// Backed by api/ai-summarize-stats.php. `context` selects the server-side
// prompt/fact-sheet template; `payload` carries the already-computed numbers
// (Claude never invents stats, it only narrates what's passed in).
// ─────────────────────────────────────────────────────────────────────────────

export default function AiSummaryCard({ context, payload, disabled, title = 'AI ສະຫຼຸບສະຖິຕິ', hint }) {
  const { user, authFetch } = useAuth()
  const navigate = useNavigate()
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSummarize = async () => {
    if (loading || disabled) return
    setLoading(true)
    setError('')
    setText('')
    const { ok, data } = await authFetch(`${API}/ai-summarize-stats.php`, {
      method: 'POST',
      body: JSON.stringify({ context, payload }),
    })
    setLoading(false)
    if (ok) setText(data.summary || '')
    else setError(data?.error || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ AI ໄດ້')
  }

  return (
    <div className="bg-gradient-to-br from-[#4c1d95]/20 via-card to-card backdrop-blur-2xl rounded-2xl p-5 border border-[#a78bfa]/25 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#a78bfa22', border: '1px solid #a78bfa44' }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#a78bfa' }}>smart_toy</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#a78bfaaa' }}>AI Insight</p>
          <h3 className="font-black text-foreground text-sm leading-tight">{title}</h3>
        </div>

        {user ? (
          <button
            onClick={handleSummarize}
            disabled={loading || disabled}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            )}
            {loading ? 'ກຳລັງສະຫຼຸບ...' : text ? 'ສະຫຼຸບຄືນໃໝ່' : 'ໃຫ້ AI ສະຫຼຸບ'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">lock</span>
            ເຂົ້າສູ່ລະບົບເພື່ອໃຊ້ AI
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-500 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">error</span>{error}
        </p>
      )}
      {text && !loading && (
        <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground border-t border-border/40 pt-4">{text}</p>
      )}
      {!text && !error && !loading && (
        <p className="mt-4 text-[11px] text-muted-foreground/60">
          {hint || 'ໃຫ້ Claude AI ອ່ານສະຖິຕິທີ່ຄິດໄລ່ໄວ້ແລ້ວ ແລ້ວສະຫຼຸບເປັນພາສາລາວແບບເຂົ້າໃຈງ່າຍ'}
        </p>
      )}
    </div>
  )
}
