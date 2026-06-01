import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.scss";
import logoUrl from "../../assets/AliflixLogo.svg";
import NavbarSearch from "./NavbarSearch";

const LINKS = [
  { label: "Ana Sayfa", path: "/" },
  { label: "Veri Seti", path: "/dataset" },
  { label: "Öneriler", path: "/recommend" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__left">
        <div className="navbar__logo" onClick={() => navigate("/")}>
          <div className="navbar__brand">
            <img src={logoUrl} alt="Aliflix" />
          </div>
        </div>
      </div>

      <div className="navbar__center">
        <div className="navbar__center-inner">
          {LINKS.map((l) => (
            <button
              key={l.path}
              className={`navbar__link${pathname === l.path ? " navbar__link--active" : ""}`}
              onClick={() => navigate(l.path)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="navbar__right">
        <NavbarSearch />
      </div>
    </nav>
  );
}
