import React from "react";

const Home = () => {
  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      {/* Hero Section with enhanced visuals */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg via-gray-900 to-gray-900 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-sciFiAccent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-sciFiAccent/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative max-w-3xl mx-auto px-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-sciFiAccent/50 to-gray-900/50 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <h1 className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sciFiAccent to-white mb-6">
                AngelSwap: The Future of Hybrid DEX
              </h1>
            </div>
          </div>
          
          <p className="text-lg md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Swap tokens securely using zkProof or explore open transactions.
            Experience limit orders, mempool insights, and much more.
          </p>
          
          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-sciFiAccent rounded-full blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <a
              href="/swap"
              className="relative btn-glow bg-sciFiAccent text-sciFiBg px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-sciFiAccent/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
            >
              Start Swapping
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section with enhanced cards */}
      <section id="features" className="relative py-24 bg-gray-800 text-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sciFiAccent to-white">
              Why Choose AngelSwap?
            </h2>
            <div className="w-24 h-1 bg-sciFiAccent mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔒",
                title: "Secure Transactions",
                description: "Protect your trades with state-of-the-art zkProof security.",
              },
              {
                icon: "📊",
                title: "Limit Orders",
                description: "Place limit orders to trade at your desired price point.",
              },
              {
                icon: "🔍",
                title: "Mempool Insights",
                description: "Visualize pending transactions for better market decisions.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gray-900 rounded-xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sciFiAccent/0 to-sciFiAccent/0 group-hover:from-sciFiAccent/10 group-hover:to-transparent rounded-xl transition-all duration-500"></div>
                <div className="relative">
                  <span className="text-4xl mb-6 block transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </span>
                  <h3 className="text-2xl font-semibold mb-4 text-sciFiAccent group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-200 transition-colors">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sciFiAccent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section with enhanced steps */}
      <section id="how-it-works" className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-sciFiAccent">
              How It Works
            </h3>
            <div className="w-24 h-1 bg-sciFiAccent mx-auto rounded-full"></div>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sciFiAccent to-transparent transform -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: "👛",
                  title: "Connect Wallet",
                  description: "Securely connect your crypto wallet to start trading.",
                },
                {
                  icon: "🔐",
                  title: "Choose Your Method",
                  description: "Select zkProof for security or open transactions for speed.",
                },
                {
                  icon: "📈",
                  title: "Start Trading",
                  description: "Enjoy seamless token swaps and advanced trading features.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-sciFiAccent/50 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative bg-gray-800 rounded-xl p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="w-16 h-16 bg-sciFiAccent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <h4 className="text-2xl font-semibold mb-4 text-sciFiAccent group-hover:text-white transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-gray-400 group-hover:text-gray-200 transition-colors">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
