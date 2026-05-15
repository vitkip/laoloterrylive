import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <p className="text-[10rem] font-black text-[#003fb1]/10 dark:text-[#003fb1]/20 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-5xl text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>search_off</span>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">ບໍ່ພົບໜ້ານີ້</h1>
        <p className="text-sm text-muted-foreground mb-8">
          ໜ້າທີ່ທ່ານຊອກຫາອາດຈະຖືກຍ້າຍ ຫຼື ບໍ່ມີຢູ່ໃນລະບົບ.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="px-6 py-3 bg-accent text-muted-foreground font-bold rounded-xl hover:bg-[#dee9fd] transition-colors text-sm">
            ← ກັບຄືນ
          </button>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db] transition-colors text-sm">
            ໜ້າຫຼັກ
          </button>
        </div>
      </div>
    </div>
  );
}
