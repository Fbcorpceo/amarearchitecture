// Amaré Architecture — landing & waitlist
// Single React component tree. View states: 'hero' | 'form' | 'success'

const { useState, useEffect, useRef, useLayoutEffect } = React;

const TARGET_DATE = new Date('2026-10-17T00:00:00');
const CATEGORIES = ['Architecture', 'Interiors', 'Hotels', 'Real Estate', 'Materials', 'Travel'];

// ─── Cursor effects ──────────────────────────────────────────────
function CursorEffects() {
  const ringRef = useRef(null);
  const lightRef = useRef(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    let lx = rx, ly = ry;
    let raf;
    const animate = () => {
      lx += (rx - lx) * 0.18;
      ly += (ry - ly) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${lx}px, ${ly}px, 0) translate(-50%, -50%)`;
      if (lightRef.current) lightRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animate);
    };
    const onMove = (e) => { rx = e.clientX; ry = e.clientY; };
    const onOver = (e) => {
      const target = e.target.closest('a, button, input, textarea, [data-cursor-hover]');
      setHover(!!target);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseover', onOver); };
  }, []);

  return (
    <>
      <div ref={lightRef} className="cursor-light" aria-hidden="true"></div>
      <div ref={ringRef} className={`cursor-ring ${hover ? 'cursor-ring--hover' : ''}`} aria-hidden="true"></div>
    </>
  );
}

// ─── Wordmark (uses real logo asset) ─────────────────────────────
function Wordmark({ size = 'lg' }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (size !== 'lg') return;
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      el.style.setProperty('--tilt-x', `${dx * 4}deg`);
      el.style.setProperty('--tilt-y', `${-dy * 3}deg`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [size]);

  return (
    <div ref={wrapRef} className={`wordmark wordmark--${size}`}>
      <img
        src="amare-logo.png"
        alt="Amaré Architecture"
        className="wordmark__img"
        draggable="false"
      />
    </div>
  );
}

// ─── Countdown ───────────────────────────────────────────────────
function useCountdown(target) {
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}
function diff(target) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function Countdown() {
  const t = useCountdown(TARGET_DATE);
  return (
    <div className="countdown" aria-label={`Counting down to October 17, 2026`}>
      <CountdownUnit value={t.days} label="Days" pad={3} />
      <CountdownDivider />
      <CountdownUnit value={t.hours} label="Hours" pad={2} />
      <CountdownDivider />
      <CountdownUnit value={t.minutes} label="Minutes" pad={2} />
      <CountdownDivider />
      <CountdownUnit value={t.seconds} label="Seconds" pad={2} />
    </div>
  );
}

function CountdownUnit({ value, label, pad }) {
  const str = String(value).padStart(pad, '0');
  return (
    <div className="cd-unit">
      <div className="cd-value">
        {str.split('').map((d, i) => <FlipDigit key={i} digit={d} />)}
      </div>
      <div className="cd-label">{label}</div>
    </div>
  );
}

function FlipDigit({ digit }) {
  const [prev, setPrev] = useState(digit);
  const [current, setCurrent] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  useEffect(() => {
    if (digit !== current) {
      setPrev(current);
      setCurrent(digit);
      setFlipping(true);
      const id = setTimeout(() => setFlipping(false), 600);
      return () => clearTimeout(id);
    }
  }, [digit, current]);
  return (
    <span className="cd-digit">
      <span className={`cd-digit__current ${flipping ? 'cd-digit__current--flip' : ''}`}>{current}</span>
      {flipping && <span className="cd-digit__prev">{prev}</span>}
    </span>
  );
}

function CountdownDivider() {
  return <div className="cd-divider" aria-hidden="true">:</div>;
}

// ─── Hero ────────────────────────────────────────────────────────
function Hero({ onJoin }) {
  return (
    <section className="hero">
      <div className="hero__tag">
        <span className="hero__tag-text">The life you build is the architecture you leave behind.</span>
      </div>

      <Wordmark size="lg" />

      <div className="hero__categories">
        {CATEGORIES.map((c, i) => (
          <React.Fragment key={c}>
            <span className="hero__cat">{c}</span>
            {i < CATEGORIES.length - 1 && <span className="hero__cat-dot">·</span>}
          </React.Fragment>
        ))}
      </div>


      <div className="hero__stats">
        <Stat top="100–120" bottom="Pages, Quarterly" />
        <Stat top="Oct 2026" bottom="Premiere Issue" />
        <Stat top="National" bottom="Distribution" />
        <Stat top="12" bottom="Ad Categories" />
      </div>

      <div className="hero__countdown-wrap">
        <div className="hero__countdown-label">
          <span className="rule rule--med"></span>
          <span>Premiere Issue Releases</span>
          <span className="rule rule--med"></span>
        </div>
        <Countdown />
      </div>

      <div className="hero__cta">
        <button className="btn btn--gold" onClick={onJoin} data-cursor-hover>
          <span className="btn__label">Request Invitation</span>
          <span className="btn__arrow" aria-hidden="true">→</span>
        </button>
        <p className="hero__cta-sub">Limited charter subscriptions for the inaugural issue.</p>
      </div>
    </section>
  );
}

function Stat({ top, bottom }) {
  return (
    <div className="stat">
      <div className="stat__top">{top}</div>
      <div className="stat__bottom">{bottom}</div>
    </div>
  );
}

// ─── Waitlist form ───────────────────────────────────────────────
const STEPS = [
  { key: 'email',    label: 'Email Address',   placeholder: 'you@studio.com',         type: 'email',  hint: 'Where to send your invitation.' },
  { key: 'name',     label: 'Full Name',       placeholder: 'First & last name',       type: 'text',   hint: 'How shall we address you?' },
  { key: 'city',     label: 'City',            placeholder: 'New York, Milan, Tokyo…', type: 'text',   hint: 'Your primary market or residence.' },
  { key: 'industry', label: 'Practice',        placeholder: '',                        type: 'select', hint: 'Where you sit within the industry.',
    options: ['Architect', 'Interior Designer', 'Real Estate Developer', 'Hospitality', 'Materials & Manufacture', 'Press & Media', 'Patron / Reader', 'Other'] },
  { key: 'source',   label: 'How did you hear of us?', placeholder: 'A friend, a journal, a search…', type: 'text', hint: 'Optional — but we are curious.' },
];

function WaitlistForm({ formData, setFormData, step, setStep, onComplete, onBack, submitting, submitError, clearError }) {
  const total = STEPS.length;
  const current = STEPS[step];
  const value = formData[current.key] || '';
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [step]);

  const validate = (val) => {
    if (current.key === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (current.key === 'source') return true; // optional
    return val.trim().length > 0;
  };

  const next = () => {
    if (submitting) return;
    if (!validate(value)) return;
    if (step < total - 1) setStep(step + 1);
    else onComplete();
  };

  const prev = () => {
    if (step === 0) onBack();
    else setStep(step - 1);
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && current.type !== 'select') { e.preventDefault(); next(); }
  };

  return (
    <section className="form">
      <header className="form__header">
        <button className="form__back" onClick={prev} data-cursor-hover aria-label="Back">
          <span aria-hidden="true">←</span>
          <span className="form__back-label">{step === 0 ? 'Return' : 'Back'}</span>
        </button>
        <div className="form__brand">
          <Wordmark size="sm" />
        </div>
        <div className="form__progress" aria-label={`Step ${step + 1} of ${total}`}>
          <span className="form__progress-num">{String(step + 1).padStart(2, '0')}</span>
          <span className="form__progress-sep">/</span>
          <span className="form__progress-total">{String(total).padStart(2, '0')}</span>
        </div>
      </header>

      <div className="form__body">
        <div key={step} className="form__step">
          <div className="form__index">— {String(step + 1).padStart(2, '0')}</div>
          <label className="form__label" htmlFor={`f-${current.key}`}>{current.label}</label>

          {current.type === 'select' ? (
            <div className="form__options">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`form__option ${value === opt ? 'form__option--active' : ''}`}
                  onClick={() => { setFormData({ ...formData, [current.key]: opt }); setTimeout(next, 220); }}
                  data-cursor-hover
                >
                  <span className="form__option-mark" aria-hidden="true"></span>
                  <span className="form__option-text">{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <input
              ref={inputRef}
              id={`f-${current.key}`}
              className="form__input"
              type={current.type}
              value={value}
              placeholder={current.placeholder}
              onChange={(e) => { if (submitError) clearError?.(); setFormData({ ...formData, [current.key]: e.target.value }); }}
              onKeyDown={onKey}
              autoComplete="off"
              spellCheck={false}
              disabled={submitting}
            />
          )}

          <div className="form__hint">{current.hint}</div>
        </div>
      </div>

      <footer className="form__footer">
        <div className="form__progress-bar" aria-hidden="true">
          <div className="form__progress-fill" style={{ width: `${((step + 1) / total) * 100}%` }}></div>
        </div>
        {submitError && (
          <div className="form__error" role="alert">{submitError}</div>
        )}
        {current.type !== 'select' && (
          <button
            className={`btn btn--gold ${(!validate(value) || submitting) ? 'btn--disabled' : ''}`}
            onClick={next}
            data-cursor-hover
            disabled={!validate(value) || submitting}
          >
            <span className="btn__label">
              {submitting
                ? 'Reserving…'
                : step === total - 1 ? 'Submit' : 'Continue'}
            </span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </button>
        )}
        <div className="form__keyhint">
          press <kbd>Enter</kbd> to continue
        </div>
      </footer>
    </section>
  );
}

// ─── Success ─────────────────────────────────────────────────────
function Success({ formData, position }) {
  return (
    <section className="success">
      <div className="success__seal" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="success__seal-svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <text x="50" y="44" textAnchor="middle" fontSize="6" letterSpacing="2" fill="currentColor" style={{fontFamily: 'var(--ff-sans)'}}>AMARÉ</text>
          <text x="50" y="54" textAnchor="middle" fontSize="3.5" letterSpacing="1.5" fill="currentColor" style={{fontFamily: 'var(--ff-sans)'}}>FOUNDING</text>
          <text x="50" y="60" textAnchor="middle" fontSize="3.5" letterSpacing="1.5" fill="currentColor" style={{fontFamily: 'var(--ff-sans)'}}>READER</text>
          <text x="50" y="72" textAnchor="middle" fontSize="3" letterSpacing="1" fill="currentColor" style={{fontFamily: 'var(--ff-sans)', opacity: 0.6}}>EST · 2026</text>
        </svg>
      </div>

      <div className="success__index">— Confirmation</div>
      <h1 className="success__title">
        <span className="success__title-line1">Welcome to</span>
        <span className="success__title-line2">Amaré.</span>
      </h1>
      <p className="success__body">
        Your invitation is reserved{formData?.name ? `, ${formData.name.split(' ')[0]}` : ''}. We will write to {formData?.email || 'your inbox'} as the premiere issue approaches — and again, by hand, when it ships on the 17th of October.
      </p>

      <div className="success__meta">
        <div className="success__meta-item">
          <div className="success__meta-label">Position</div>
          <div className="success__meta-value">№ {String(position).padStart(4, '0')}</div>
        </div>
        <div className="success__meta-item">
          <div className="success__meta-label">Premiere</div>
          <div className="success__meta-value">17 · 10 · 2026</div>
        </div>
      </div>

      <div className="success__signoff">
        <div className="success__signoff-rule"></div>
        <div className="success__signoff-text">Until then — Amaré</div>
      </div>
    </section>
  );
}

// ─── Curtain transition ──────────────────────────────────────────
function Curtain({ active }) {
  if (!active) return null;
  return <div className={`curtain curtain--${active}`} aria-hidden="true"></div>;
}

// ─── App ─────────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState('hero'); // 'hero' | 'form' | 'success'
  const [formData, setFormData] = useState({ email: '', name: '', city: '', industry: '', source: '' });
  const [step, setStep] = useState(0);
  const [transition, setTransition] = useState(null);
  const [position] = useState(() => 100 + Math.floor(Math.random() * 800));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  const transitionTo = (nextView, dir = 'wipe-up') => {
    setTransition(dir);
    setTimeout(() => { setView(nextView); }, 600);
    setTimeout(() => { setTransition(null); }, 1300);
  };

  const submitWaitlist = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          city: formData.city.trim(),
          industry: formData.industry,
          source: formData.source?.trim() || '',
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Could not submit. Please try again.');
      }
      transitionTo('success', 'wipe-gold');
    } catch (err) {
      setSubmitError(err.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <CursorEffects />
      <div className="texture" aria-hidden="true"></div>
      <main className={`screen screen--${view}`}>
        {view === 'hero' && <Hero onJoin={() => transitionTo('form', 'wipe-up')} />}
        {view === 'form' && (
          <WaitlistForm
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
            onComplete={submitWaitlist}
            onBack={() => { setStep(0); setSubmitError(null); transitionTo('hero', 'wipe-down'); }}
            submitting={submitting}
            submitError={submitError}
            clearError={() => setSubmitError(null)}
          />
        )}
        {view === 'success' && <Success formData={formData} position={position} />}
      </main>
      <SiteFooter view={view} />
      {view === 'hero' && <MediaKitButton onOpen={() => setMediaKitOpen(true)} />}
      {mediaKitOpen && <MediaKitModal onClose={() => setMediaKitOpen(false)} />}
      <Curtain active={transition} />
    </>
  );
}

function MediaKitButton({ onOpen }) {
  const handleClick = () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
      || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open('/media-kit.pdf', '_blank', 'noopener,noreferrer');
    } else {
      onOpen();
    }
  };
  return (
    <button className="media-kit-btn" onClick={handleClick} data-cursor-hover>
      <span className="media-kit-btn__dot" aria-hidden="true"></span>
      <span>View Media Kit</span>
    </button>
  );
}

function MediaKitModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="media-kit-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Media Kit">
      <div className="media-kit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="media-kit-close" onClick={onClose} aria-label="Close media kit">×</button>
        <iframe
          src="/media-kit.pdf#view=FitH"
          title="Amaré Architecture Media Kit"
          allow="fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function SiteFooter({ view }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__left">Amaré Architecture · A Quarterly</div>
      <div className="site-footer__center">{view === 'success' ? 'Reserved' : view === 'form' ? 'Reserving Your Copy' : ''}</div>
      <div className="site-footer__right">© 2026 · All Rights Reserved</div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
