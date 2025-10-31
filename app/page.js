export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-white mb-6">
          Bundle<span className="text-green-400">Up</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Transform your goals into optimized shopping solutions
        </p>
        <a 
          href="/solution-engine"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Get Started →
        </a>
      </div>
    </div>
  );
}