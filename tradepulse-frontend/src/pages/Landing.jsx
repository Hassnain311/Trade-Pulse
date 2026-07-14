import { Link } from 'react-router-dom'
import { ArrowRight, Zap, TrendingUp, Shield, Users, BarChart2, Bot, ChevronRight } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import TickerBar from '../components/common/TickerBar'
import { ROUTES } from '../utils/constants'

const FEATURES = [
  {
    icon: BarChart2,
    title: 'Live Market Data',
    desc:  'Real-time prices, order books, and charts powered by Binance API with WebSocket streaming.',
    color: '#00D4FF',
  },
  {
    icon: Bot,
    title: 'AI Price Agents',
    desc:  'LSTM-powered prediction models analyze historical data and overlay trend forecasts on TradingView charts.',
    color: '#A78BFA',
  },
  {
    icon: Zap,
    title: 'Paper Trading',
    desc:  'Practice trading with $100,000 virtual balance. Real prices, zero risk. Perfect for learning strategies.',
    color: '#00E676',
  },
  {
    icon: Users,
    title: 'Social News Feed',
    desc:  'Connect with other traders in real-time. Share insights, post analysis, and discuss market movements live via Socket.io.',
    color: '#FFD166',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Charts',
    desc:  'Full TradingView integration with candlesticks, technical indicators, drawing tools, and AI prediction overlays.',
    color: '#FF6B6B',
  },
  {
    icon: Shield,
    title: 'Secure Authentication',
    desc:  'JWT + OTP email verification, bcrypt-hashed passwords, and session control including logout from all devices.',
    color: '#34D399',
  },
]

const STEPS = [
  { step: '01', title: 'Create Account', desc: 'Register with email & verify with a 6-digit OTP. Secure from day one.' },
  { step: '02', title: 'Explore Markets', desc: 'Browse live crypto prices, charts, and market data — all in real-time.' },
  { step: '03', title: 'Trade & Predict', desc: 'Place paper trades and run AI agents to forecast price movements.' },
]

const STATS = [
  { label: 'Crypto Pairs',     value: '300+' },
  { label: 'Data Updated',     value: 'Live'  },
  { label: 'Paper Balance',    value: '$100K' },
  { label: 'AI Model',         value: 'LSTM'  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0]">
      <Navbar />

      {/* ── Ticker Bar ───────────────────────────────────────── */}
      <div className="pt-16">
        <TickerBar />
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center hero-glow bg-grid overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                        bg-[radial-gradient(ellipse,rgba(0,212,255,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-[radial-gradient(ellipse,rgba(100,80,255,0.05),transparent_70%)] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]
                            rounded-full px-4 py-1.5 text-[#00D4FF] text-xs font-medium mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
              AI-Powered Crypto Trading Platform
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.05] mb-6 animate-slide-up">
              Trade.{' '}
              <span className="text-[#00D4FF] drop-shadow-[0_0_30px_rgba(0,212,255,0.4)]">Predict.</span>
              <br />Dominate.
            </h1>

            <p className="text-[#7E8BA0] text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10 animate-fade-in">
              Real-time crypto markets, AI price prediction agents, paper trading simulation,
              and a live social feed — all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
              <Link to={ROUTES.REGISTER} className="tp-btn-primary text-base px-8 py-3.5 glow-accent">
                Start Trading Free
                <ArrowRight size={16} />
              </Link>
              <Link to={ROUTES.LOGIN}
                className="border border-[#252836] hover:border-[#00D4FF] text-[#E2E8F0]
                           font-display px-8 py-3.5 rounded-lg transition-all duration-200
                           hover:bg-[rgba(0,212,255,0.05)] text-base flex items-center gap-2">
                Log In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {['Paper Trading Only', 'No Real Money', 'Free to Use'].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-[#5A6478] text-xs">
                  <span className="w-1 h-1 rounded-full bg-[#00E676]" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-2xl mx-auto">
            {STATS.map(({ label, value }) => (
              <div key={label} className="tp-card p-4 text-center hover:border-[#2E3246] transition-colors">
                <p className="font-display font-bold text-2xl text-[#00D4FF]">{value}</p>
                <p className="text-[#5A6478] text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Everything you need to{' '}
            <span className="text-[#00D4FF]">trade smarter</span>
          </h2>
          <p className="text-[#7E8BA0] text-base max-w-xl mx-auto">
            Built with Node.js, React, MongoDB, Socket.io, Python ML, and deployed on cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title}
              className="tp-card p-6 hover:border-[#2E3246] hover:-translate-y-1
                         transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">{title}</h3>
              <p className="text-[#5A6478] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0F1116] border-y border-[#252836]">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Get started in <span className="text-[#00D4FF]">3 steps</span>
          </h2>
          <p className="text-[#7E8BA0] text-base">No real money required.</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {STEPS.map(({ step, title, desc }, i) => (
            <div key={step} className="relative flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]
                              flex items-center justify-center mb-4">
                <span className="font-display font-bold text-[#00D4FF] text-lg">{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={18} className="text-[#252836] absolute top-10 -right-3 hidden md:block" />
              )}
              <h3 className="font-display font-semibold text-[#E2E8F0] mb-2">{title}</h3>
              <p className="text-[#5A6478] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="tp-card p-10 glow-accent">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Ready to start trading?
            </h2>
            <p className="text-[#7E8BA0] mb-8">
              Join TradePulse and practice crypto trading with real market data, AI predictions, and a social community.
            </p>
            <Link to={ROUTES.REGISTER} className="tp-btn-primary text-base px-10 py-3.5">
              Create Free Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[#252836] py-8 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00D4FF] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 12h3l3-6 4 12 3-9 2 3h3" stroke="#0B0C10" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold text-sm">Trade<span className="text-[#00D4FF]">Pulse</span></span>
          </div>
          <p className="text-[#5A6478] text-xs">
            Paper trading only — no real money involved.
          </p>
          <p className="text-[#5A6478] text-xs">© 2026 TradePulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
