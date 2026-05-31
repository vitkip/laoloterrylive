import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

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
]

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="ເງື່ອນໄຂການໃຊ້ງານ — Lao Lottery Live"
        description="ເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດການໃຊ້ງານ laolots.com"
      />

      <div className="max-w-3xl mx-auto py-6 sm:py-10">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
            ກັບຄືນ
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#003fb1]/10 dark:bg-[#003fb1]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
              ເງື່ອນໄຂການໃຊ້ງານ
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px]">
            ອັບເດດລ່າສຸດ: ມິຖຸນາ 2026 · laolots.com
          </p>
        </div>

        {/* Intro card */}
        <div className="bg-[#003fb1]/08 dark:bg-[#003fb1]/12 border border-[#003fb1]/20 rounded-2xl px-6 py-5 mb-8 text-sm text-foreground/80 leading-relaxed">
          ກ່ອນໃຊ້ງານ laolots.com ກະລຸນາອ່ານ ແລະ ທຳຄວາມເຂົ້າໃຈກັບເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດການໃຊ້ງານໃຫ້ຄົບຖ້ວນ.
          ທ່ານສາມາດຕິດຕໍ່ທີມງານໄດ້ທາງ <a href="mailto:noreply@laolots.com" className="text-[#003fb1] hover:underline font-semibold">noreply@laolots.com</a> ຫາກມີຄຳຖາມ.
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="bg-card border border-border rounded-2xl px-6 py-5"
            >
              <h2 className="text-base font-bold text-foreground mb-3">{s.title}</h2>
              {s.body && (
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              )}
              {s.items && (
                <ul className="flex flex-col gap-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="material-symbols-outlined text-sm text-[#003fb1] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center mt-10 pb-4">
          ຫາກທ່ານມີຄຳຖາມ ຕິດຕໍ່:{' '}
          <a href="mailto:noreply@laolots.com" className="text-[#003fb1] hover:underline">
            noreply@laolots.com
          </a>
        </p>
      </div>
    </>
  )
}
