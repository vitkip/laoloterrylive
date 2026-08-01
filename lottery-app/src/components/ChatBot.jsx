import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../utils/api'

const SUGGESTIONS = [
  'ເລກຮ້ອນ ຄື​ຫຍັງ?',
  'ຈະເບິ່ງເລກທຳນາຍໄດ້ຢູ່ໃສ?',
  'ວິທີການແທງເປັນແນວໃດ?',
  'ຕີຄວາມຝັນຢູ່ໃສ?',
]

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING AI CHATBOT — site-wide FAB, gated behind login (same pattern as
// DreamDictionary's AI mode). Talks to api/ai-chat.php.
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatBot() {
  const { user, authFetch } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    setError('')
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setLoading(true)
    const { ok, data } = await authFetch(`${API}/ai-chat.php`, {
      method: 'POST',
      body: JSON.stringify({ messages: nextMessages }),
    })
    setLoading(false)
    if (ok) {
      setMessages(m => [...m, { role: 'assistant', content: data.reply || '' }])
    } else {
      setError(data?.error || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ AI ໄດ້')
    }
  }

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
          boxShadow: '0 8px 28px rgba(124,58,237,0.5)',
        }}
        aria-label="AI Chat"
      >
        <span className="material-symbols-outlined text-white text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {open ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(92vw,360px)] h-[min(70vh,520px)] flex flex-col rounded-2xl overflow-hidden border border-[#a78bfa]/25 shadow-2xl"
          style={{ background: 'linear-gradient(148deg, #0d0a1e 0%, #160d2e 55%, #0f0818 100%)' }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/10 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#a78bfa22', border: '1px solid #a78bfa44' }}>
              <span className="material-symbols-outlined text-[17px]" style={{ color: '#a78bfa' }}>smart_toy</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black text-white leading-tight">AI ຜູ້ຊ່ວຍ</p>
              <p className="text-[10px] text-[#a78bfa]/60">ຖາມກ່ຽວກັບຫວຍ, ສະຖິຕິ, ວິທີຫຼິ້ນ</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {!user ? (
            /* ── Login gate ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(124,58,237,0.3)' }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: '#a78bfa' }}>lock</span>
              </div>
              <p className="text-sm font-bold text-[#c4b5fd]">ສຳລັບສະມາຊິກເທົ່ານັ້ນ</p>
              <p className="text-xs text-white/40 leading-relaxed">ເຂົ້າສູ່ລະບົບເພື່ອສົນທະນາກັບ AI ຜູ້ຊ່ວຍ</p>
              <button
                onClick={() => { setOpen(false); navigate('/login') }}
                className="px-5 py-2 rounded-xl text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)' }}
              >
                ເຂົ້າສູ່ລະບົບ
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-white/35 text-center py-2">ສະບາຍດີ! ຖາມຫຍັງກ່ຽວກັບຫວຍລາວໄດ້ເລີຍ</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="text-[10.5px] font-semibold px-3 py-1.5 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-[#c4b5fd] hover:bg-[#7c3aed]/20 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#7c3aed] text-white rounded-br-sm'
                          : 'bg-white/[0.06] text-white/80 border border-white/10 rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1.5 justify-center">
                    <span className="material-symbols-outlined text-[13px]">error</span>{error}
                  </p>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={e => { e.preventDefault(); send() }}
                className="flex items-center gap-2 p-3 border-t border-white/10 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  maxLength={1000}
                  placeholder="ພິມຄຳຖາມ..."
                  className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3.5 py-2.5 text-[12.5px] text-white placeholder:text-white/30 outline-none focus:border-[#7c3aed]/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)' }}
                >
                  <span className="material-symbols-outlined text-white text-[16px]">send</span>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
