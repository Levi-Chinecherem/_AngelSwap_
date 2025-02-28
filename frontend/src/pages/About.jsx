import React from "react";

const AboutPage = () => {
  return (
    <main className="bg-sciFiBg text-sciFiText font-sans min-h-screen">
      {/* Hero Section */}
      <section
        id="about"
        className="relative min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg via-gray-900 to-gray-900 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-sciFiAccent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-sciFiAccent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="relative max-w-4xl z-10">
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-sciFiAccent/50 to-transparent rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <h1 className="relative text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sciFiAccent to-white leading-tight">
              About AngelSwap
            </h1>
          </div>
          <p className="text-lg text-gray-300 leading-relaxed">
            AngelSwap is a decentralized exchange (DEX) built on PulseChain, designed to provide
            seamless and secure token swaps. Our mission is to enable fast, efficient, and
            low-cost transactions on the PulseChain network, while ensuring high-level security
            and user-friendly interfaces.
          </p>
        </div>
      </section>

      {/* About Content Section */}
      <section className="relative py-24 bg-gray-800/50 text-gray-200">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent"></div>

        <div className="relative max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sciFiAccent to-white">
              Why AngelSwap?
            </h2>
            <div className="w-24 h-1 bg-sciFiAccent mx-auto rounded-full"></div>
          </div>

          <div className="space-y-8">
            {[
              {
                title: "Decentralization & Transparency",
                content:
                  "At AngelSwap, we believe in the power of decentralization and transparency. Built on PulseChain, we ensure lightning-fast transactions with minimal fees, making it an ideal platform for anyone looking to swap tokens efficiently.",
              },
              {
                title: "Accessible to Everyone",
                content:
                  "Whether you're a seasoned trader or a newcomer to the world of decentralized finance (DeFi), AngelSwap offers a secure and accessible platform for all your token-swapping needs.",
              },
              {
                title: "Superior Scalability",
                content:
                  "Our platform leverages the strengths of PulseChain to offer superior scalability and a robust ecosystem for its users. With a focus on user experience and scalability, AngelSwap is the next evolution in decentralized token swaps.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative bg-gray-900/50 rounded-xl p-8 hover:bg-gray-900 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sciFiAccent/0 to-sciFiAccent/0 group-hover:from-sciFiAccent/10 group-hover:to-transparent rounded-xl transition-all duration-500"></div>
                <div className="relative">
                  <h3 className="text-2xl font-semibold mb-4 text-sciFiAccent group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sciFiAccent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-sciFiAccent">
              Meet the Team
            </h2>
            <div className="w-24 h-1 bg-sciFiAccent mx-auto rounded-full"></div>
            <p className="text-lg text-gray-300 mt-8 max-w-2xl mx-auto leading-relaxed">
              AngelSwap is powered by a passionate team of experts in blockchain technology,
              cryptography, and financial technology. Our goal is to continuously innovate and
              create the best decentralized exchange for the digital asset ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "John Doe", role: "Supervisor", image: "/logo.jpg" },
              { name: "Mrs. Gbaraloo Angela", role: "CTO & Blockchain Expert", image: "/logo.jpg" },
              { name: "Mark Lee", role: "Lead Professor", image: "/logo.jpg" },
            ].map((member, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-sciFiAccent/50 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gray-800 rounded-xl p-8 hover:shadow-2xl transition-all duration-300 text-center">
                  <div className="relative mb-6 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-sciFiAccent/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto relative z-10 object-cover"
                      onError={(e) => (e.target.src = "/logo.jpg")} // Fallback to logo on error
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-sciFiAccent group-hover:text-white transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-lg text-gray-400 group-hover:text-gray-200 transition-colors mt-2">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;