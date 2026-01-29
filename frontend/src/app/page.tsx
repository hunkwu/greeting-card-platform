import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="text-white text-2xl font-bold">
            ✉️ Greeting Card
          </div>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="text-white hover:text-gray-200 transition px-4 py-2"
            >
              登录
            </Link>
            <Link
              href="/auth/register"
              className="bg-white text-purple-600 hover:bg-gray-100 transition px-6 py-2 rounded-lg font-semibold"
            >
              免费注册
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            AI驱动的
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
              电子贺卡平台
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto">
            用AI创作独特的祝福，支持多语言，一键分享到全球
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/register"
              className="bg-white text-purple-600 hover:bg-gray-100 transition px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              🚀 免费开始创作
            </Link>
            <Link
              href="/templates"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 transition px-8 py-4 rounded-xl font-bold text-lg"
            >
              🎨 浏览模板
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI智能助手</h3>
              <p className="text-gray-200">
                GPT-4驱动的文案生成，帮你表达真挚情感
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-xl font-semibold mb-2">多语言支持</h3>
              <p className="text-gray-200">
                支持英、法、德、西、中等多种语言
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2">实时协作</h3>
              <p className="text-gray-200">
                与朋友一起创作，实时同步编辑
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6 text-center text-white/80">
        <p>© 2026 Greeting Card. All rights reserved.</p>
      </footer>
    </div>
  );
}
