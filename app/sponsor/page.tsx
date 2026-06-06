"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Sparkles,
  Trophy,
  Award,
  Zap,
  Globe,
  MessageSquare,
  Shield,
  ArrowRight,
  Menu,
  X,
  Search,
  QrCode,
  Github,
  Linkedin,
  ChevronDown,
  Gift,
  Star,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// FAQs Data
const FAQS = [
  {
    q: "How are sponsorship funds utilized?",
    a: "Sponsorship funds directly cover our critical operational overhead—including AWS S3 secure PDF storage, Neon Serverless Postgres database resources, and Vercel hosting. Any surplus funds are allocated to rewarding open-source contributors who build features and fix issues.",
  },
  {
    q: "Can I get a custom api boost or enterprise SLA?",
    a: "Absolutely! Our Gold and Platinum tiers come with developer consulting. If your organization has custom bulk certificate limits or custom integration requirements (e.g., Salesforce, Canvas, or internal LMS), we will build and prioritize those pipelines for you.",
  },
  {
    q: "Is GitHub Sponsors the only way to support Vura?",
    a: "GitHub Sponsors is our preferred platform because it charges 0% transaction fees, ensuring 100% of your support goes directly to Vura's development. However, if your company requires standard Stripe invoicing or custom contracts, feel free to email us.",
  },
  {
    q: "How do I claim my logo placement or perks?",
    a: "Once you become a sponsor on GitHub, our system detects your sponsorship. We will immediately reach out to you via your GitHub email to obtain your brand assets (SVG logo and hyperlink) and configure your prioritized API quota booster.",
  },
];

// Sponsorship Tiers
const TIERS = [
  {
    name: "Bronze Backer",
    price: "$5",
    period: "month",
    description: "Support our database and hosting infrastructure.",
    color: "from-[rgba(0,122,204,0.15)] to-transparent border-[rgba(0,122,204,0.2)]",
    textColor: "text-[var(--color-neon-secondary)]",
    glowColor: "rgba(0, 122, 204, 0.05)",
    icon: Heart,
    perks: [
      "Dynamic Backer badge on GitHub",
      "Listed on Vura's Contributor Wall",
      "Access to community discussions",
    ],
    buttonText: "Back on GitHub",
    link: "https://github.com/sponsors/omn7",
  },
  {
    name: "Silver Supporter",
    price: "$25",
    period: "month",
    description: "Empower more builders with certificate storage.",
    color: "from-[rgba(157,78,221,0.15)] to-transparent border-[rgba(157,78,221,0.2)]",
    textColor: "text-[var(--color-neon-purple)]",
    glowColor: "rgba(157, 78, 221, 0.05)",
    icon: Award,
    perks: [
      "Vura Premium Profile Badge",
      "Small Logo/Name on GitHub README",
      "Public inclusion in monthly updates",
      "Everything in Bronze",
    ],
    buttonText: "Support Vura",
    link: "https://github.com/sponsors/omn7",
    popular: true,
  },
  {
    name: "Gold Partner",
    price: "$100",
    period: "month",
    description: "A major fuel for our scaling operations.",
    color: "from-[rgba(0,229,153,0.15)] to-transparent border-[rgba(0,229,153,0.25)]",
    textColor: "text-[var(--color-neon-primary)]",
    glowColor: "rgba(0, 229, 153, 0.1)",
    icon: Trophy,
    perks: [
      "Medium Logo on Homepage Footer",
      "Medium Logo on GitHub README",
      "Priority feature request voting",
      "1-on-1 developer onboarding session",
    ],
    buttonText: "Become Partner",
    link: "https://github.com/sponsors/omn7",
  },
  {
    name: "Platinum Guardian",
    price: "$250",
    period: "month",
    description: "Sustain Vura's enterprise-grade reliability.",
    color: "from-[rgba(0,229,153,0.25)] to-transparent border-[rgba(0,229,153,0.35)]",
    textColor: "text-[var(--color-neon-primary)]",
    glowColor: "rgba(0, 229, 153, 0.15)",
    icon: Sparkles,
    perks: [
      "Large Logo in Header & README",
      "Dedicated 2x API quota booster",
      "Monthly tech consulting session",
      "Dedicated slack support channel",
    ],
    buttonText: "Partner with Us",
    link: "https://github.com/sponsors/omn7",
  },
];

export default function SponsorPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const router = useRouter();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#030303] text-white">
      {/* ─── Green Radial Glow Background ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[700px] pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.15)_0%,rgba(0,122,204,0.03)_50%,transparent_75%)]" />
        <div className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-[var(--color-neon-primary)]/5 blur-[80px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-[var(--color-neon-primary)]/5 blur-[120px]" />
      </div>

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-neon-border)] bg-[rgba(3,3,3,0.85)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/vuralogo.png"
              alt="Vura Logo"
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-black tracking-widest uppercase text-white hidden sm:inline">
              VURA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--color-neon-muted)]">
            <Link
              href="/#features"
              className="hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/contributor"
              className="hover:text-white transition-colors"
            >
              Contributors
            </Link>
            <Link
              href="/sponsor"
              className="text-white font-semibold transition-colors"
            >
              Sponsor
            </Link>
            <Link
              href="/docs"
              className="text-[var(--color-neon-primary)] hover:text-white transition-colors"
            >
              API Docs
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!isSearchOpen)}
                className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-2 flex items-center justify-center rounded-full hover:bg-white/5"
              >
                <Search className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[rgba(10,10,10,0.95)] backdrop-blur-2xl border border-[var(--color-neon-border)] shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-2 z-50 origin-top-right"
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchId.trim())
                          router.push(`/verify/${searchId.trim()}`);
                      }}
                      className="relative flex items-center"
                    >
                      <div className="absolute left-3 pointer-events-none">
                        <QrCode className="w-4 h-4 text-[var(--color-neon-primary)] opacity-70" />
                      </div>
                      <input
                        type="text"
                        autoFocus
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Enter Certificate ID..."
                        className="w-full bg-[rgba(20,20,20,0.6)] border border-[var(--color-neon-border)] rounded-xl py-2.5 pr-20 pl-9 text-sm text-white focus:outline-none focus:border-[var(--color-neon-primary)] focus:ring-1 focus:ring-[var(--color-neon-primary)]/30 transition-all placeholder-[var(--color-neon-muted)]"
                      />
                      <button
                        type="submit"
                        className="absolute right-1 top-1 bottom-1 bg-[var(--color-neon-surface-hover)] border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] hover:text-[#00e599] text-[var(--color-neon-muted)] text-xs font-semibold px-4 rounded-lg transition-colors"
                      >
                        Verify
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              href="https://github.com/omn7/Vura"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-2 text-sm text-[var(--color-neon-muted)] hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[rgba(3,3,3,0.97)] backdrop-blur-xl border-b border-[var(--color-neon-border)] overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-4 gap-4 text-sm text-[var(--color-neon-muted)]">
                <Link
                  href="/#features"
                  onClick={closeMobileMenu}
                  className="hover:text-white py-1"
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  onClick={closeMobileMenu}
                  className="hover:text-white py-1"
                >
                  How It Works
                </Link>
                <Link
                  href="/contributor"
                  onClick={closeMobileMenu}
                  className="hover:text-white py-1"
                >
                  Contributors
                </Link>
                <Link
                  href="/sponsor"
                  onClick={closeMobileMenu}
                  className="text-white font-semibold py-1"
                >
                  Sponsor
                </Link>
                <Link
                  href="/docs"
                  onClick={closeMobileMenu}
                  className="text-[var(--color-neon-primary)] hover:text-white py-1 transition-colors"
                >
                  API Docs
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 relative z-10">
        
        {/* ─── Hero Section ─── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-20 mt-6"
        >
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-[var(--color-neon-primary)] mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            Fueling the Future of Verifiable Credentials
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-[var(--color-neon-muted)] leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Help us maintain and scale Vura's secure, open-source certificate infrastructure. Your backing fuels database storage, hosting bandwidth, and rewards developers building verifiable credential tech worldwide.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://github.com/sponsors/omn7"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 font-bold text-black bg-[var(--color-neon-primary)] rounded-full hover:bg-[#00ffaa] transition-all duration-300 shadow-[0_0_24px_rgba(0,229,153,0.35)] hover:shadow-[0_0_36px_rgba(0,229,153,0.55)] hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current text-rose-600" /> Sponsor on GitHub
            </a>
            <Link
              href="/contributor"
              className="px-8 py-3.5 font-semibold text-white bg-transparent border border-white/10 hover:border-[var(--color-neon-primary)]/30 hover:bg-white/5 rounded-full transition-all duration-300 inline-flex items-center gap-2"
            >
              Meet Our Builders <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.section>

        {/* ─── Sponsorship Tiers ─── */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <span className="section-label inline-flex">
              Support Tiers
            </span>
            <h2 className="mt-5 text-3.5xl md:text-4.5xl font-bold text-white tracking-tight">
              Select Your Sponsorship Level
            </h2>
            <p className="mt-2 text-sm text-[var(--color-neon-muted)]">
              Flexible options for independent backers and corporate partners alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {TIERS.map((tier) => {
              const TierIcon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  whileHover={{ y: -6, borderColor: "rgba(0,229,153,0.3)" }}
                  className={`glass-card flex flex-col p-6 rounded-2xl bg-gradient-to-b ${tier.color} relative overflow-hidden h-full flex-1 border`}
                  style={{
                    boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 30px ${tier.glowColor}`,
                  }}
                >
                  {/* Accent glow on card hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-neon-primary)]/5 to-transparent pointer-events-none" />
                  
                  {tier.popular && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/30 text-[10px] font-bold text-[var(--color-neon-primary)] tracking-wider uppercase">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${tier.textColor}`}>
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm tracking-wide uppercase text-white/90">
                      {tier.name}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-xs text-[var(--color-neon-muted)] ml-1">/ {tier.period}</span>
                  </div>

                  <p className="text-xs text-[var(--color-neon-muted)] leading-relaxed mb-6">
                    {tier.description}
                  </p>

                  <div className="border-t border-white/[0.05] pt-5 mb-8 space-y-3.5 flex-1">
                    {tier.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Star className="w-3.5 h-3.5 text-[var(--color-neon-primary)]/80 shrink-0 mt-0.5 fill-current" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={tier.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full text-center block py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      tier.popular
                        ? "bg-[var(--color-neon-primary)] text-black font-bold shadow-[0_0_15px_rgba(0,229,153,0.25)] hover:bg-[#00ffaa]"
                        : "bg-white/5 border border-white/10 hover:border-[var(--color-neon-primary)]/30 hover:bg-white/10 text-white"
                    }`}
                  >
                    {tier.buttonText}
                  </a>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── Why Sponsor Vura? ─── */}
        <section className="mb-24 py-16 px-8 rounded-3xl border border-[var(--color-neon-primary)]/10 bg-gradient-to-r from-[var(--color-neon-primary)]/[0.02] to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,153,0.02),transparent_70%)] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <span className="section-label inline-flex">
                Our Mission
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Sustaining a Public Utility for events, organizers, and event hosts
              </h2>
              <p className="mt-6 text-sm text-[var(--color-neon-muted)] leading-relaxed">
                Vura was created because organizing events, academies, and hackathons should not be bogged down by manual certificate creation or high-cost proprietary solutions. 
              </p>
              <p className="mt-4 text-sm text-[var(--color-neon-muted)] leading-relaxed">
                By keeping Vura open-source, we ensure that every community lead has absolute control over their branding, credentials are eternally verifiable, and students have secure cloud access to their qualifications. Your financial backing keeps this pipeline completely open and fast.
              </p>

              <div className="mt-8 flex gap-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-white">100%</span>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-neon-primary)] font-bold mt-1">Open-Source</span>
                </div>
                <div className="w-[1px] bg-white/10 self-stretch" />
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-white">0%</span>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-neon-primary)] font-bold mt-1">GitHub Fees</span>
                </div>
                <div className="w-[1px] bg-white/10 self-stretch" />
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-white">Secure</span>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-neon-primary)] font-bold mt-1">AWS S3 Cloud</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Secure Verification",
                  desc: "We host permanent verifiable landing pages for every certificate issued.",
                },
                {
                  icon: Zap,
                  title: "API Performance",
                  desc: "Keeps our high-concurrency certificate generator running sub-2 seconds.",
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  desc: "Empowers educators in under-funded academies to deliver professional credentials.",
                },
                {
                  icon: MessageSquare,
                  title: "Open Collaboration",
                  desc: "Supports dev bounties and issue resolution for our core repository builders.",
                },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-[rgba(10,10,10,0.8)] backdrop-blur-md">
                    <div className="p-2 rounded-xl bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 text-[var(--color-neon-primary)] w-fit mb-4">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs text-[var(--color-neon-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Frequently Asked Questions ─── */}
        <section className="max-w-4xl mx-auto mb-12">
           <div className="text-center mb-12">
             <span className="section-label inline-flex">
               FAQ
             </span>
            <h2 className="mt-5 text-3.5xl font-bold text-white tracking-tight">
              Sponsorship FAQ
            </h2>
            <p className="mt-2 text-sm text-[var(--color-neon-muted)]">
              Everything you need to know about sponsoring Vura.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/5 bg-[rgba(10,10,10,0.8)] backdrop-blur-md overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-[var(--color-neon-primary)] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--color-neon-primary)] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-[var(--color-neon-muted)] leading-relaxed border-t border-white/[0.02]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <footer className="relative bg-[#02040A] pt-16 pb-8 px-6 border-t border-[var(--color-neon-border)]/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-neon-primary)]/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
            <div className="col-span-2 flex flex-col items-start">
              <Link href="/" className="flex items-center gap-2 mb-6 w-fit group">
                <img
                  src="/vuralogo.png"
                  alt="Vura Logo"
                  className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
                />
                <span className="text-lg font-bold tracking-widest uppercase text-white">
                  Vura
                </span>
              </Link>
              <p className="text-[13px] text-[var(--color-neon-muted)] leading-relaxed max-w-xs mb-6">
                The modern certificate generation platform for educators, trainers, and startup events.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/omn7/Vura"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-neon-muted)] hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/mr_codex"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-neon-muted)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/in/omnarkhede/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-neon-muted)] hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">
                Product
              </h3>
              <ul className="space-y-4 text-[13px]">
                <li>
                  <Link href="/#features" className="text-[var(--color-neon-muted)] hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-[var(--color-neon-muted)] hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-[var(--color-neon-muted)] hover:text-white transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">
                Community
              </h3>
              <ul className="space-y-4 text-[13px]">
                <li>
                  <Link href="/contributor" className="text-[var(--color-neon-muted)] hover:text-white transition-colors">
                    Wall of Builders
                  </Link>
                </li>
                <li>
                  <Link href="/sponsor" className="text-[var(--color-neon-primary)] hover:text-white font-semibold transition-colors">
                    Become Sponsor
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/omn7/Vura"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-neon-muted)] hover:text-white transition-colors"
                  >
                    GitHub Issues
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.05] text-[11px] text-[var(--color-neon-muted)]">
            <p>© {new Date().getFullYear()} Vura. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
