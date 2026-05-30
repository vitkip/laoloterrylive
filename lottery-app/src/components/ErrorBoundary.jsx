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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800">ເກີດຂໍ້ຜິດພາດ</h1>
          <p className="text-gray-500">
            ແອັບເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ. ກະລຸນາລອງໃໝ່.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 overflow-auto max-h-40">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            ໂຫຼດໃໝ່
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
