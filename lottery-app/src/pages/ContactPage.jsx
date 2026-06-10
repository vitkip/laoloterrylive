import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { animals } from '../data/animals';
import { API } from '../utils/api';

// ── Real contact configuration info ─────────────────
const CONTACT_INFO = {
  // ── ອົງກອນ / ບໍລິສັດ ─────────────────────────────────────────────────────
  orgName:    'Lao Lottery Live',
  orgType:    'ທີມພັດທະນາ',
  address:    null,
  workHours:  'ຈັນ – ສຸກ  08:00–17:00',

  // ── ຊ່ອງທາງຕິດຕໍ່ ─────────────────────────────────────────────────────────
  email:      {
    support:  'noreply@laolots.com',
    business: 'business@laolots.com',
  },
  phone:      '+856 20 597 508 24',
  line:       '@laolots',
  facebook:   'https://facebook.com/laolots',
  whatsApp:   'whatsApp://send?phone=8562059750824',
}

// ── Sub-components ──────────────────────────────────────────────────────────
function ContactItem({ icon, label, value, href, isTodo }) {
  const inner = (
    <div className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${
      isTodo
        ? 'border-dashed border-border bg-muted/40 opacity-60'
        : 'border-border bg-card hover:border-primary/30 hover:bg-secondary/20 hover:translate-y-[-2px] shadow-sm hover:shadow-md'
    }`}>
      <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 border border-primary/10">
        <span
          className="material-symbols-outlined text-lg text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
        {isTodo ? (
          <p className="text-xs text-muted-foreground/50 italic font-medium">— ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ (TODO) —</p>
        ) : (
          <p className="text-xs font-black text-foreground truncate">{value}</p>
        )}
      </div>
      {!isTodo && href && (
        <span className="material-symbols-outlined text-sm text-muted-foreground/40 self-center shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>
          open_in_new
        </span>
      )}
    </div>
  )

  if (!isTodo && href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {inner}
      </a>
    )
  }
  return inner
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const navigate = useNavigate();
  const { email, phone, line, facebook, whatsApp, orgName, orgType, address, workHours } = CONTACT_INFO;

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [luckyBall, setLuckyBall] = useState({ number: '', animal: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const res = await fetch(`${API}/index.php?action=submit_contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ສົ່ງຂໍ້ຄວາມບໍ່ສຳເລັດ');

      const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      const drawnAnimal = animals.find(a =>
        a.animal_numbers.split(',').includes(randomNum)
      ) || animals[0];

      setLuckyBall({
        number: randomNum,
        animal: drawnAnimal
      });
      setFormSubmitted(true);
      toast.success(data.message || 'ສົ່ງຂໍ້ຄວາມສຳເລັດ!');
    } catch (err) {
      toast.error(err.message || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່');
    } finally {
      setSending(false);
    }
  };

  const handleResetForm = () => {
    setForm({ name: '', email: '', message: '' });
    setFormSubmitted(false);
  };

  return (
    <>
      <SEO
        title="ຕິດຕໍ່ເຮົາ — Lao Lottery Live"
        description="ຊ່ອງທາງຕິດຕໍ່ທີມງານ laolots.com"
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

      {/* Background blurs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-0 relative z-10 select-none">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer hover:translate-x-[-2px] duration-200"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          ກັບຄືນ
        </button>

        {/* Page Title Header */}
        <div className="flex items-center gap-3.5 mb-2 text-left">
          <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
            <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              contact_support
            </span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight font-headline">ຕິດຕໍ່ເຮົາ</h1>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              ທ່ານສາມາດຕິດຕໍ່ທີມງານ {orgName} ໄດ້ຜ່ານຊ່ອງທາງຂ້າງລຸ່ມ
            </p>
          </div>
        </div>

        {/* Org Official Card */}
        <div className="bg-gradient-to-br from-[#09261a] via-[#103b29] to-[#17523a] rounded-3xl px-6 py-5.5 mt-6 mb-8 flex items-center gap-4 text-left border border-emerald-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.1),transparent_60%)]" />
          
          {/* Brand Flag Icon Badge */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md ring-2 ring-white/20 shrink-0 relative z-10 bg-white">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <rect x="0" y="0" width="36" height="9" fill="#CE1126"/>
              <rect x="0" y="9" width="36" height="18" fill="#002868"/>
              <rect x="0" y="27" width="36" height="9" fill="#CE1126"/>
              <circle cx="18" cy="18" r="6" fill="white"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col leading-none mb-1">
              <span className="text-[16px] font-black tracking-wide text-white font-headline">
                laolots<span className="text-amber-400">.com</span>
              </span>
              <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase mt-0.5">ຫວຍພັດທະນາລາວ</span>
            </div>
            <p className="text-xs text-white/70 font-semibold">{orgType}</p>
            {address && <p className="text-[11px] text-white/50 mt-0.5 font-medium">{address}</p>}
          </div>
        </div>

        {/* Two Column Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Direct Contacts */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1 text-left">
              ຊ່ອງທາງຕິດຕໍ່ດ່ວນ
            </h2>

            <ContactItem
              icon="mail"
              label="Email ຜູ້ໃຊ້ທົ່ວໄປ"
              value={email.support}
              href={`mailto:${email.support}`}
              isTodo={!email.support}
            />

            <ContactItem
              icon="business"
              label="Email ຮ່ວມທຸລະກິດ"
              value={email.business}
              href={email.business ? `mailto:${email.business}` : null}
              isTodo={!email.business}
            />

            <ContactItem
              icon="call"
              label="ເບີໂທລະສັບ"
              value={phone}
              href={phone ? `tel:${phone.replace(/\s/g, '')}` : null}
              isTodo={!phone}
            />

            <ContactItem
              icon="chat"
              label="LINE ID"
              value={line}
              href={line ? `https://line.me/ti/p/${line}` : null}
              isTodo={!line}
            />

            <ContactItem
              icon="thumb_up"
              label="Facebook Page"
              value={facebook ? facebook.replace('https://', '') : null}
              href={facebook}
              isTodo={!facebook}
            />

            <ContactItem
              icon="send"
              label="WhatsApp"
              value={whatsApp ? whatsApp.replace('whatsApp://send?phone=', '+') : null}
              href={whatsApp}
              isTodo={!whatsApp}
            />

            {/* Work hours details */}
            <div className="bg-card border border-border rounded-2xl p-4.5 flex items-center gap-4 hover:shadow-md transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/10 shrink-0">
                <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  schedule
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">ເວລາເຮັດວຽກ</p>
                <p className="text-xs font-black text-foreground">{workHours}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Feedback Contact Form */}
          <div className="md:col-span-7">
            <div className="bg-card border border-border/80 dark:border-border/10 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-amber-500 opacity-80" />
              
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest font-headline">
                      ສົ່ງຂໍ້ຄວາມຫາພວກເຮົາ
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                      ຝາກຂໍ້ຄວາມໄວ້ ແລ້ວພວກເຮົາຈະຕິດຕໍ່ກັບຫາທ່ານໂດຍໄວ.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">ຊື່ຂອງທ່ານ *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                      className="w-full bg-accent dark:bg-secondary/40 border border-border/80 dark:border-border/10 rounded-xl p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Email ຕິດຕໍ່ *</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="your@email.com"
                      className="w-full bg-accent dark:bg-secondary/40 border border-border/80 dark:border-border/10 rounded-xl p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">ຂໍ້ຄວາມ *</label>
                    <textarea 
                      required 
                      rows={4} 
                      placeholder="ພິມຂໍ້ຄວາມຂອງທ່ານທີ່ນີ້..."
                      className="w-full bg-accent dark:bg-secondary/40 border border-border/80 dark:border-border/10 rounded-xl p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                      value={form.message} 
                      onChange={e => setForm({ ...form, message: e.target.value })} 
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={sending}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/10 hover:translate-y-[-1px] active:scale-95 disabled:opacity-60 text-xs cursor-pointer"
                    >
                      {sending ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-base">send</span>
                      )}
                      ສົ່ງຂໍ້ຄວາມ
                    </button>
                  </div>
                </form>
              ) : (
                <div className="animate-fade-in flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/10">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                  <h3 className="text-base font-black text-foreground font-headline mb-1.5">ສົ່ງຂໍ້ຄວາມສຳເລັດແລ້ວ!</h3>
                  <p className="text-xs text-muted-foreground mb-6 px-4">
                    ຂໍຂອບໃຈສຳລັບຂໍ້ຄວາມຂອງທ່ານ, ທີມງານຈະຕິດຕໍ່ກັບຫາທ່ານໂດຍໄວ.
                  </p>
                  
                  {/* Lucky draw reward card */}
                  <div className="flex items-center gap-3 bg-secondary/50 dark:bg-secondary/15 p-2.5 rounded-2xl border border-border/40 max-w-xs w-full shadow-inner relative shimmer-effect mb-6">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-white font-black text-lg relative shadow-md select-none border border-white/20">
                      <span className="drop-shadow-md">{luckyBall.number}</span>
                      <div className="absolute top-0.5 left-1.5 w-4 h-1.5 bg-white/40 rounded-full rotate-[-15deg]" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                        <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {luckyBall.animal?.icon || 'pets'}
                        </span>
                        <span>ເລກນາມສັດນຳໂຊກ</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold mt-0.5 leading-none">
                        {luckyBall.animal?.animal_name_lao} ({luckyBall.animal?.animal_numbers})
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-6 animate-bounce">
                    🍀 ຂໍໃຫ້ເລກນຳໂຊກແທນຄຳຂອບໃຈນີ້ ນຳໂຊກດີມາໃຫ້ທ່ານ!
                  </span>

                  <button
                    onClick={handleResetForm}
                    className="px-5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold rounded-xl transition-all text-xs cursor-pointer active:scale-95"
                  >
                    ສົ່ງຂໍ້ຄວາມໃໝ່
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Developer configuration details note */}
        <div className="mt-8 border border-dashed border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-lg text-amber-500 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              construction
            </span>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-semibold">
              <strong>ສຳລັບ developer:</strong> ແກ້ໄຂ <code className="bg-amber-500/10 px-1 rounded font-mono text-[10px]">CONTACT_INFO</code> ຢູ່ດ້ານເທິງຂອງໄຟລ໌{' '}
              <code className="bg-amber-500/10 px-1 rounded font-mono text-[10px]">src/pages/ContactPage.jsx</code> ເພື່ອໃສ່ຂໍ້ມູນຈິງ.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
