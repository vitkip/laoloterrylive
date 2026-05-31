import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

// ── TODO: Replace placeholder values with real information ─────────────────
const CONTACT_INFO = {
  // ── ອົງກອນ / ບໍລິສັດ ─────────────────────────────────────────────────────
  orgName:    'Lao Lottery Live',         // TODO: ຊື່ອົງກອນ / ບໍລິສັດ
  orgType:    'ທີມພັດທະນາ',              // TODO: ປະເພດ (ບໍລິສັດ, ຫ້ອງການ, ທີມ)
  address:    null,                        // TODO: 'ຖະໜົນ ..., ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ'
  workHours:  'ຈັນ – ສຸກ  08:00–17:00', // TODO: ເວລາເຮັດວຽກ

  // ── ຊ່ອງທາງຕິດຕໍ່ ─────────────────────────────────────────────────────────
  email:      {
    support:  'support@laolots.com',      // TODO: email ສຳລັບຜູ້ໃຊ້ທົ່ວໄປ
    business: null,                        // TODO: 'business@laolots.com' — ຮ່ວມທຸລະກິດ
  },
  phone:      null,                        // TODO: '+856 20 XXXX XXXX'
  line:       null,                        // TODO: LINE ID ຫຼື QR
  facebook:   null,                        // TODO: 'https://facebook.com/laolots'
  telegram:   null,                        // TODO: 'https://t.me/laolots'
}

// ── Sub-components ──────────────────────────────────────────────────────────
function ContactItem({ icon, label, value, href, isTodo }) {
  const inner = (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
      isTodo
        ? 'border-dashed border-border bg-muted/40 opacity-60'
        : 'border-border bg-card hover:border-[#003fb1]/30 hover:bg-accent/40'
    }`}>
      <div className="w-9 h-9 rounded-lg bg-[#003fb1]/10 dark:bg-[#003fb1]/20 flex items-center justify-center shrink-0 mt-0.5">
        <span
          className="material-symbols-outlined text-lg text-[#003fb1]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        {isTodo ? (
          <p className="text-sm text-muted-foreground/60 italic">— ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ (TODO) —</p>
        ) : (
          <p className="text-sm font-semibold text-foreground truncate">{value}</p>
        )}
      </div>
      {!isTodo && href && (
        <span className="material-symbols-outlined text-base text-muted-foreground/40 self-center shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>
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
  const navigate = useNavigate()
  const { email, phone, line, facebook, telegram, orgName, orgType, address, workHours } = CONTACT_INFO

  return (
    <>
      <SEO
        title="ຕິດຕໍ່ເຮົາ — Lao Lottery Live"
        description="ຊ່ອງທາງຕິດຕໍ່ທີມງານ laolots.com"
      />

      <div className="max-w-2xl mx-auto py-6 sm:py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
          ກັບຄືນ
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#003fb1]/10 dark:bg-[#003fb1]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>contact_support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">ຕິດຕໍ່ເຮົາ</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10 ml-[52px]">
          ທ່ານສາມາດຕິດຕໍ່ທີມງານ {orgName} ໄດ້ຜ່ານຊ່ອງທາງຂ້າງລຸ່ມ
        </p>

        {/* Org card */}
        <div className="bg-gradient-to-br from-[#003fb1]/08 to-[#003fb1]/04 border border-[#003fb1]/20 rounded-2xl px-6 py-5 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#003fb1] flex items-center justify-center shrink-0">
            <span className="text-white font-black text-lg">L</span>
          </div>
          <div>
            <p className="font-black text-foreground text-base">{orgName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{orgType}</p>
            {address && <p className="text-xs text-muted-foreground mt-0.5">{address}</p>}
          </div>
        </div>

        {/* Grid of contact methods */}
        <div className="flex flex-col gap-3 mb-8">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 mb-1">ຊ່ອງທາງຕິດຕໍ່</h2>

          <ContactItem
            icon="mail"
            label="Email ສຳລັບຜູ້ໃຊ້ທົ່ວໄປ"
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
            label="Telegram"
            value={telegram ? telegram.replace('https://', '') : null}
            href={telegram}
            isTodo={!telegram}
          />
        </div>

        {/* Work hours */}
        <div className="bg-card border border-border rounded-2xl px-6 py-5 flex items-center gap-4">
          <span className="material-symbols-outlined text-2xl text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">ເວລາເຮັດວຽກ</p>
            <p className="text-sm font-bold text-foreground">{workHours}</p>
          </div>
        </div>

        {/* Dev note */}
        <div className="mt-8 border border-dashed border-amber-400/40 bg-amber-400/05 rounded-xl px-5 py-4">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-amber-500 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
            <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              <strong>ສຳລັບ developer:</strong> ແກ້ໄຂ <code className="bg-amber-400/15 px-1 rounded font-mono">CONTACT_INFO</code> ຢູ່ດ້ານເທິງຂອງໄຟລ໌{' '}
              <code className="bg-amber-400/15 px-1 rounded font-mono">src/pages/ContactPage.jsx</code> ເພື່ອໃສ່ຂໍ້ມູນຈິງ.
              ລາຍການທີ່ <code className="bg-amber-400/15 px-1 rounded font-mono">null</code> ຈະສະແດງ "TODO".
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
