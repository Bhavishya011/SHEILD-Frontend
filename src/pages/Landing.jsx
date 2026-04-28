import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Eye, Map, FileText, Wifi, ChevronRight, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    glow: 'rgba(251,191,36,0.15)',
    title: 'Zero-Friction SOS',
    desc: 'Guests scan a QR code, speak in any language. Gemini translates and classifies the crisis in milliseconds. No app download. Ever.',
  },
  {
    icon: Eye,
    color: 'from-cyan-400 to-blue-500',
    glow: 'rgba(34,211,238,0.15)',
    title: 'Ethical Vision AI',
    desc: 'YOLOv8 + Re-ID tracks movement in public zones only. Color-coded live overlay. Zero biometrics. Hard architectural constraint — never in rooms.',
  },
  {
    icon: Zap,
    color: 'from-violet-400 to-purple-600',
    glow: 'rgba(167,139,250,0.15)',
    title: 'RL Dispatch Engine',
    desc: 'A custom PPO-trained model assigns the nearest, most qualified staff to each sub-task. Not a prompt. A model that gets smarter after every incident.',
  },
  {
    icon: Map,
    color: 'from-emerald-400 to-teal-500',
    glow: 'rgba(52,211,153,0.15)',
    title: 'Crisis Command Map',
    desc: 'Google Maps overlay — staff GPS, crisis epicenter, guest heatmap, 911 ETA. Manager war-room on tablet, simplified card on staff mobile.',
  },
  {
    icon: Shield,
    color: 'from-rose-400 to-red-600',
    glow: 'rgba(251,113,133,0.15)',
    title: 'Silent SOS',
    desc: 'Discreet 3-finger tap or TV remote IR trigger. Flags trafficking, hostage, domestic threats silently — zero notification to the perpetrator.',
  },
  {
    icon: FileText,
    color: 'from-sky-400 to-indigo-500',
    glow: 'rgba(56,189,248,0.15)',
    title: 'Auto Incident Report',
    desc: 'Gemini generates a structured PDF report — timeline, responders, outcome. Simultaneously feeds the RL model as a new training episode.',
  },
];

const stats = [
  { value: '<10s', label: 'Crisis detection to dispatch' },
  { value: '100+', label: 'Languages supported' },
  { value: '99.97%', label: 'Uptime in testing' },
  { value: '0', label: 'App downloads required' },
];

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.15, ...options });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView();
  const Icon = feature.icon;
  return (
    <div
      ref={ref}
      className="feature-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease, transform 0.6s ease`,
        transitionDelay: `${index * 80}ms`,
        '--glow-color': feature.glow,
      }}
    >
      <div className={`icon-pill bg-gradient-to-br ${feature.color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-desc">{feature.desc}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [statsRef, statsInView] = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-root">
      {/* ── Ambient blobs ── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="brand-icon">
              <Shield size={18} className="text-white" />
            </div>
            <span className="brand-name">SHIELD</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it Works</a>
            <a href="#stats" className="nav-link">Impact</a>
          </div>
          <div className="nav-actions flex items-center gap-4">
            <a href="/sos" className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider">
              Simulate SOS
            </a>
            <button
              onClick={() => navigate('/login')}
              className="nav-cta"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section" ref={heroRef}>
        <div
          className="hero-content"
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
          }}
        >
          <div className="hero-badge">
            <span className="badge-dot" />
            Google Solution Challenge 2026
          </div>

          <h1 className="hero-title">
            The nervous system<br />
            of a property <span className="hero-accent">in crisis.</span>
          </h1>

          <p className="hero-sub">
            SHIELD detects emergencies, understands them in any language,
            coordinates the right response, and learns from every incident —
            all in under 10 seconds.
          </p>

          <div className="hero-actions">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Enter Command Center
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/sos')} 
              className="btn-ghost"
            >
              Simulate Guest SOS
            </button>
          </div>

          <div className="hero-tags">
            {['Cloud Run Deployed', 'Gemini Integrated', 'Firebase Realtime', 'Production Ready'].map(t => (
              <span key={t} className="hero-tag">{t}</span>
            ))}
          </div>
        </div>

        {/* Hero visual — mock terminal */}
        <div
          className="hero-terminal"
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? 'translateX(0)' : 'translateX(40px)',
            transition: 'opacity 0.9s 0.2s ease, transform 0.9s 0.2s ease',
          }}
        >
          <div className="terminal-bar">
            <span className="t-dot red" /><span className="t-dot amber" /><span className="t-dot green" />
            <span className="t-title">SHIELD · Crisis Feed</span>
          </div>
          <div className="terminal-body">
            <TerminalLine delay={0} color="text-red-400" prefix="CRISIS" text="Fire detected — Floor 3, Room 302" />
            <TerminalLine delay={400} color="text-cyan-400" prefix="GEMINI" text="Classified: FIRE · Severity 4 · Hindi→EN" />
            <TerminalLine delay={800} color="text-violet-400" prefix="RL" text="Dispatching Ravi (Fire Warden, 22m away)" />
            <TerminalLine delay={1200} color="text-amber-400" prefix="MAP" text="Crisis pin active · 911 ETA 4m 12s" />
            <TerminalLine delay={1600} color="text-emerald-400" prefix="CCTV" text="Tracking 12 persons · 1 red-tag unmatched" />
            <TerminalLine delay={2000} color="text-sky-400" prefix="REPORT" text="Incident log started · PDF queued" />
            <div className="terminal-cursor" />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section" id="stats" ref={statsRef}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="stat-block"
            style={{
              opacity: statsInView ? 1 : 0,
              transform: statsInView ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.5s ease, transform 0.5s ease`,
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-label">Core Capabilities</div>
        <h2 className="section-title">Built for the worst moments.</h2>
        <p className="section-sub">Six integrated systems — each solving a real gap in how hospitality properties respond to emergencies today.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section" id="how">
        <div className="section-label">Workflow</div>
        <h2 className="section-title">From trigger to resolution.</h2>
        <div className="flow-steps">
          {[
            { n: '01', label: 'Detect', desc: 'QR scan, Silent SOS, or CCTV anomaly triggers an alert' },
            { n: '02', label: 'Understand', desc: 'Gemini translates, classifies crisis type and severity' },
            { n: '03', label: 'Coordinate', desc: 'RL engine dispatches optimal staff, Command Map activates' },
            { n: '04', label: 'Track', desc: 'Live overlay + staff navigation cards guide response' },
            { n: '05', label: 'Learn', desc: 'Gemini drafts report; incident data retrains the RL model' },
          ].map((step, i) => (
            <FlowStep key={step.n} step={step} index={i} />
          ))}
        </div>
      </section>

      {/* ── Resilience callout ── */}
      <section className="resilience-section">
        <div className="resilience-card">
          <Wifi size={28} className="text-amber-400 mb-4" />
          <h3 className="resilience-title">Works even when the Wi-Fi doesn't.</h3>
          <p className="resilience-desc">
            Edge-deployed YOLO inference, BLE mesh staff comms, and offline SOS queuing ensure SHIELD
            functions through power outages and network failure — the exact moment it matters most.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to see it live?</h2>
        <p className="cta-sub">Enter the command center and simulate a real crisis scenario.</p>
        <button onClick={() => navigate('/login')} className="btn-primary btn-large">
          Open SHIELD <ArrowRight size={18} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <Shield size={16} className="text-cyan-400" />
          <span>SHIELD</span>
        </div>
        <p className="footer-note">Google Solution Challenge 2026 · AI-Powered Crisis Response for Hospitality</p>
        <div className="footer-links">
          <a href="https://github.com/Bhavishya011/SHEILD-Frontend" target="_blank" rel="noreferrer">Frontend</a>
          <a href="https://github.com/Bhavishya011/SHEILD-Backend" target="_blank" rel="noreferrer">Backend</a>
          <a href="/sos" className="text-red-400">Guest SOS</a>
        </div>
      </footer>
    </div>
  );
}

function TerminalLine({ delay, color, prefix, text }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay + 300);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="t-line animate-fade-in">
      <span className={`t-prefix ${color}`}>[{prefix}]</span>
      <span className="t-text">{text}</span>
    </div>
  );
}

function FlowStep({ step, index }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="flow-step"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-24px)',
        transition: `opacity 0.5s ease, transform 0.5s ease`,
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="step-num">{step.n}</div>
      <div>
        <div className="step-label">{step.label}</div>
        <div className="step-desc">{step.desc}</div>
      </div>
    </div>
  );
}
