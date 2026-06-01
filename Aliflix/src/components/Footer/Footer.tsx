import { useNavigate } from "react-router-dom";
import logoUrl from "../../assets/AliflixLogo.svg";
import "./Footer.scss";

const NAV_LINKS = [
  { label: "Ana Sayfa",  path: "/" },
  { label: "Veri Seti",  path: "/dataset" },
  { label: "Öneriler",   path: "/recommend" },
];

const INFO_LINKS = [
  "Gizlilik Politikası",
  "Kullanım Koşulları",
  "Çerez Tercihleri",
];

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Üst satır: logo + nav + bilgi */}
        <div className="footer__top">
          <div className="footer__brand" onClick={() => navigate("/")}>
            <img src={logoUrl} alt="Aliflix" className="footer__logo" />
          </div>

          <nav className="footer__nav">
            {NAV_LINKS.map((l) => (
              <button
                key={l.path}
                className="footer__nav-link"
                onClick={() => navigate(l.path)}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="footer__meta">
            <div className="footer__badges">
              <span className="footer__badge">KNN · K=10</span>
              <span className="footer__badge">MovieLens</span>
              <span className="footer__badge">32M+ Puanlama</span>
            </div>
          </div>
        </div>

        {/* Ayraç */}
        <div className="footer__divider" />

        {/* Alt satır: telif + info linkleri */}
        <div className="footer__bottom">
          <span className="footer__copy">
            © {year} Aliflix, Tüm hakları saklıdır.
          </span>
          <div className="footer__info-links">
            {INFO_LINKS.map((l) => (
              <span key={l} className="footer__info-link">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
