import { useNavigate } from "react-router-dom";
import "./GenreGrid.scss";

const GENRES: { key: string; label: string; gradient: string }[] = [
  { key: "Action",      label: "Aksiyon",      gradient: "linear-gradient(135deg, #e63946, #c1121f)" },
  { key: "Adventure",   label: "Macera",        gradient: "linear-gradient(135deg, #f77f00, #d62828)" },
  { key: "Animation",   label: "Animasyon",     gradient: "linear-gradient(135deg, #9b5de5, #f15bb5)" },
  { key: "Comedy",      label: "Komedi",        gradient: "linear-gradient(135deg, #f9c74f, #f3722c)" },
  { key: "Crime",       label: "Suç",           gradient: "linear-gradient(135deg, #3a0ca3, #7209b7)" },
  { key: "Documentary", label: "Belgesel",      gradient: "linear-gradient(135deg, #2d6a4f, #52b788)" },
  { key: "Drama",       label: "Dram",          gradient: "linear-gradient(135deg, #4361ee, #3a0ca3)" },
  { key: "Fantasy",     label: "Fantastik",     gradient: "linear-gradient(135deg, #7b2d8b, #c77dff)" },
  { key: "Horror",      label: "Korku",         gradient: "linear-gradient(135deg, #1a0a0a, #6d1a1a)" },
  { key: "Mystery",     label: "Gizem",         gradient: "linear-gradient(135deg, #023e8a, #0096c7)" },
  { key: "Romance",     label: "Romantik",      gradient: "linear-gradient(135deg, #e63946, #ff85a1)" },
  { key: "Sci-Fi",      label: "Bilim Kurgu",   gradient: "linear-gradient(135deg, #0077b6, #00b4d8)" },
  { key: "Thriller",    label: "Gerilim",       gradient: "linear-gradient(135deg, #333533, #74502a)" },
  { key: "War",         label: "Savaş",         gradient: "linear-gradient(135deg, #4a4e69, #9a8c98)" },
];

export default function GenreGrid() {
  const navigate = useNavigate();

  const go = (genre: string) =>
    navigate("/category/" + genre);

  return (
    <div className="genre-grid">
      <div className="genre-grid__header">
        <h2 className="genre-grid__title">Tüm Kategoriler</h2>
      </div>
      <div className="genre-grid__list">
        {GENRES.map((g) => (
          <button
            key={g.key}
            className="genre-card"
            style={{ background: g.gradient }}
            onClick={() => go(g.key)}
          >
            <span className="genre-card__name">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
