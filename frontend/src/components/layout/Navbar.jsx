import { useAppContext } from '../../context/AppContext';

const BrainIcon = () => (
  <svg className="brain-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" stroke="var(--primary)" strokeWidth="1.5" opacity="0.4" />
    <path d="M14 12c2-3 6-3 8 0s2 7 0 10-6 3-8 0" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 10c1-2 4-2 5 0s1 5 0 7-4 2-5 0" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M20 18v8M17 22h6" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="20" cy="12" r="1.5" fill="var(--primary)" opacity="0.8" />
    <circle cx="26" cy="18" r="1" fill="var(--primary)" opacity="0.5" />
    <circle cx="14" cy="20" r="1" fill="var(--primary)" opacity="0.5" />
  </svg>
);

export default function Navbar() {
  const { t, lang, toggleLang } = useAppContext();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <BrainIcon />
        <div className="brand-text">
          <span className="brand-name">{t('nav.brand')}</span>
          <span className="brand-sub">{t('nav.sub')}</span>
        </div>
      </div>
      <div className="nav-right">
        <span className="nav-tagline">{t('nav.tagline')}</span>
        <button
          className="lang-toggle-btn"
          onClick={toggleLang}
          title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
        >
          <span className="lang-globe">🌐</span>
          <span className="lang-label">{t('nav.lang')}</span>
        </button>
      </div>
    </nav>
  );
}
