import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; replace with a real error-reporting service in production
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060410] px-4 relative overflow-hidden">
        {/* Immersive background meshes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#ba1a1a1c_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1c0e3477_0%,transparent_60%)] pointer-events-none" />
        
        {/* Luxury Obsidian Card */}
        <div className="max-w-md w-full text-center bg-[#0d0e1c]/80 backdrop-blur-md border border-[#d4af37]/25 shadow-2xl rounded-3xl p-8 relative z-10 space-y-6">
          
          {/* Glowing Red Warning Badge */}
          <div className="relative group w-20 h-20 mx-auto flex items-center justify-center mb-2">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500/30 to-red-500/0 rounded-full blur-md opacity-75 animate-pulse pointer-events-none" />
            <div className="relative w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <span className="material-symbols-outlined text-[40px] text-red-500 drop-shadow-[0_0_10px_#ef4444]">
                error
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Title with metallic text gradient */}
            <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-red-400">
              ເກີດຂໍ້ຜິດພາດໃນລະບົບ
            </h1>
            <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
              ແອັບເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ. ກະລຸນາລອງໂຫຼດໜ້າຄືນໃໝ່.
            </p>
          </div>

          {/* Dev Debug Code Block */}
          {import.meta.env.DEV && this.state.error && (
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-sans font-bold text-red-400/80 tracking-wider">
                Developer Debug Logs:
              </span>
              <pre className="bg-black/55 border border-red-500/20 rounded-xl p-4 text-[10px] font-mono text-red-400/90 overflow-auto max-h-40 leading-normal custom-scrollbar">
                {this.state.error.toString()}
              </pre>
            </div>
          )}

          {/* Luxury reload button */}
          <button
            onClick={this.handleReset}
            className="w-full bg-gradient-to-r from-[#ffd700] via-[#e5c158] to-[#aa7c11] hover:from-[#ffe240] hover:to-[#c69b22] text-[#0d0e1c] font-black font-sans tracking-widest py-3 px-6 rounded-xl transition duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 uppercase text-xs transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-sm font-black">refresh</span>
            ໂຫຼດຄືນໃໝ່
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
