import React from "react";

const AboutPage = () => {
  return (
    <main className="bg-sciFiBg text-sciFiText font-sans">
      {/* Hero Section */}
      <section id="about" className="min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg to-gray-900">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-4">
            About AngelSwap
          </h1>
          <p className="text-lg text-sciFiText mb-8">
            AngelSwap is a decentralized exchange (DEX) built on PulseChain, designed to provide seamless and secure token swaps.
            Our mission is to enable fast, efficient, and low-cost transactions on the PulseChain network, while ensuring high-level security and user-friendly interfaces.
          </p>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-8">Why AngelSwap?</h2>
          <p className="text-lg mb-6">
            At AngelSwap, we believe in the power of decentralization and transparency. Built on PulseChain, we ensure lightning-fast transactions with minimal fees, making it an ideal platform for anyone looking to swap tokens efficiently.
          </p>
          <p className="text-lg mb-6">
            Whether you're a seasoned trader or a newcomer to the world of decentralized finance (DeFi), AngelSwap offers a secure and accessible platform for all your token-swapping needs.
          </p>
          <p className="text-lg mb-6">
            Our platform leverages the strengths of PulseChain to offer superior scalability and a robust ecosystem for its users. With a focus on user experience and scalability, AngelSwap is the next evolution in decentralized token swaps.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-8 text-sciFiAccent">Meet the Team</h2>
          <p className="text-lg mb-6">
            AngelSwap is powered by a passionate team of experts in blockchain technology, cryptography, and financial technology. Our goal is to continuously innovate and create the best decentralized exchange for the digital asset ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <img src="team-member1.jpg" alt="Team Member 1" className="w-32 h-32 rounded-full mx-auto mb-4" />
              <h4 className="text-xl font-semibold">John Doe</h4>
              <p className="text-lg text-gray-400">Founder & CEO</p>
            </div>
            <div className="text-center">
              <img src="team-member2.jpg" alt="Team Member 2" className="w-32 h-32 rounded-full mx-auto mb-4" />
              <h4 className="text-xl font-semibold">Jane Smith</h4>
              <p className="text-lg text-gray-400">CTO & Blockchain Expert</p>
            </div>
            <div className="text-center">
              <img src="team-member3.jpg" alt="Team Member 3" className="w-32 h-32 rounded-full mx-auto mb-4" />
              <h4 className="text-xl font-semibold">Mark Lee</h4>
              <p className="text-lg text-gray-400">Lead Developer</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
