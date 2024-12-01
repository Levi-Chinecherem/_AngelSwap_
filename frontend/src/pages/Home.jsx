import React from "react";

const Home = () => {
  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      
      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg to-gray-900"
      >
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-6">
            AngelSwap: The Future of Hybrid DEX
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Swap tokens securely using zkProof or explore open transactions.
            Experience limit orders, mempool insights, and much more.
          </p>
          <a
            href="/swap"
            className="bg-sciFiAccent text-sciFiBg px-6 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-white transition animate-pulse"
          >
            Start Swapping
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose AngelSwap?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Secure Transactions",
                description: "Protect your trades with state-of-the-art zkProof security.",
              },
              {
                title: "Limit Orders",
                description: "Place limit orders to trade at your desired price point.",
              },
              {
                title: "Mempool Insights",
                description: "Visualize pending transactions for better market decisions.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-900 rounded-lg hover:shadow-xl hover:-translate-y-2 transition"
              >
                <h3 className="text-xl font-semibold mb-4 text-sciFiAccent">
                  {feature.title}
                </h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-900">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold">How It Works</h3>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect Wallet",
                description: "Securely connect your crypto wallet to start trading.",
              },
              {
                title: "Choose Your Method",
                description:
                  "Select zkProof for security or open transactions for speed.",
              },
              {
                title: "Start Trading",
                description:
                  "Enjoy seamless token swaps and advanced trading features.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="p-6 bg-gray-800 rounded-lg shadow-md"
              >
                <h4 className="text-xl font-semibold mb-4 text-sciFiAccent">
                  {step.title}
                </h4>
                <p className="mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
