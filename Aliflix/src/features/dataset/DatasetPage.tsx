import { useState, useEffect } from "react";
import type { Movie, DatasetStats } from "../../types/movie";
import { API } from "../../services/api";
import "./DatasetPage.scss";

const fmt = (n: number) => n?.toLocaleString("tr-TR");

const STEPS = [
  {
    text: (
      <>
        <strong>Eksik veri temizlendi:</strong> title/genres boş olan filmler,
        rating/tag kayıtları çıkarıldı.
      </>
    ),
  },
  {
    text: (
      <>
        <strong>Tekrarlı kayıtlar silindi:</strong> aynı movieId, userId-movieId
        çiftleri tekilleştirildi.
      </>
    ),
  },
  {
    text: (
      <>
        <strong>Gereksiz sütunlar kaldırıldı:</strong> ratings.timestamp,
        tags.timestamp.
      </>
    ),
  },
  {
    text: (
      <>
        <strong>Film eşiği ≥ 75:</strong> en az 75 puanlama almış filmler
        seçildi — gürültü azaltıldı.
      </>
    ),
  },
  {
    text: (
      <>
        <strong>Kullanıcı eşiği ≥ 30:</strong> en az 30 film puanlayan aktif
        kullanıcılar seçildi.
      </>
    ),
  },
  {
    text: (
      <>
        <strong>Tags birleştirildi:</strong> her film için kullanıcı etiketleri
        tek satıra indirgendi.
      </>
    ),
  },
];

export default function DatasetPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [mostRated, setMostRated] = useState<Movie[]>([]);

  useEffect(() => {
    API.stats()
      .then(setStats)
      .catch(() => {});
    API.topRated(10)
      .then(setTopRated)
      .catch(() => {});
    API.mostRated(10)
      .then(setMostRated)
      .catch(() => {});
  }, []);

  return (
    <div className="dataset">
      <div className="dataset__header">
        <h1 className="dataset__page-title">Veri Seti Analizi</h1>
        <p className="dataset__page-sub">
          MovieLens ml-32m — {stats?.algorithm}
        </p>
      </div>

      {/* Stat kartları */}
      <div className="dataset__stat-grid">
        {[
          {
            icon: "🎬",
            value: fmt(stats?.total_movies ?? 0),
            label: "Film Sayısı",
          },
          {
            icon: "👥",
            value: fmt(stats?.total_users ?? 0),
            label: "Kullanıcı Sayısı",
          },
          {
            icon: "⭐",
            value: fmt(stats?.total_ratings ?? 0),
            label: "Puanlama Sayısı",
          },
          {
            icon: "📊",
            value: String(stats?.avg_rating ?? "—"),
            label: "Ortalama Puan",
          },
        ].map((s) => (
          <div key={s.label} className="dataset__stat-card">
            <div className="dataset__stat-card-icon">{s.icon}</div>
            <div className="dataset__stat-card-value">{s.value || "—"}</div>
            <div className="dataset__stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tablo — en yüksek puanlı */}
      <div className="dataset__section">
        <div className="dataset__section-head">
          <span className="dataset__section-title">
            En Yüksek Ortalama Puanlı 10 Film
          </span>
          <span className="dataset__section-badge">/api/top-rated</span>
        </div>
        <div className="dataset__table-wrap">
          <table className="dataset__table">
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Film</th>
                <th>Tür</th>
                <th>Yıl</th>
                <th>Puan</th>
                <th>Oy</th>
              </tr>
            </thead>
            <tbody>
              {topRated.map((f, i) => (
                <tr key={f.movieId}>
                  <td className="rank">{i + 1}</td>
                  <td>{f.title}</td>
                  <td>{f.genres.replace(/\|/g, ", ")}</td>
                  <td>{f.year ?? "—"}</td>
                  <td className="rating">⭐ {f.avg_rating}</td>
                  <td className="count">{fmt(f.rating_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablo — en çok puanlanan */}
      <div className="dataset__section">
        <div className="dataset__section-head">
          <span className="dataset__section-title">
            En Çok Puanlanan 10 Film
          </span>
          <span className="dataset__section-badge">/api/most-rated</span>
        </div>
        <div className="dataset__table-wrap">
          <table className="dataset__table">
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Film</th>
                <th>Tür</th>
                <th>Yıl</th>
                <th>Puan</th>
                <th>Oy</th>
              </tr>
            </thead>
            <tbody>
              {mostRated.map((f, i) => (
                <tr key={f.movieId}>
                  <td className="rank">{i + 1}</td>
                  <td>{f.title}</td>
                  <td>{f.genres.replace(/\|/g, ", ")}</td>
                  <td>{f.year ?? "—"}</td>
                  <td className="rating">⭐ {f.avg_rating}</td>
                  <td className="count">{fmt(f.rating_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Veri temizleme */}
      <div className="dataset__section">
        <div className="dataset__section-head">
          <span className="dataset__section-title">
            Veri Temizleme ve Örneklem Optimizasyonu
          </span>
        </div>
        <div className="dataset__cleaning">
          <div className="dataset__cleaning-col dataset__cleaning-col--before">
            <div className="dataset__cleaning-col-title">
              ⚠ ÖNCESİ (Ham Veri)
            </div>
            {[
              ["Film Sayısı", "87.585"],
              ["Kullanıcı Sayısı", "200.948"],
              ["Rating Sayısı", "32.000.204"],
              ["Tag Kayıtları", "2.000.072"],
            ].map(([l, v]) => (
              <div key={l} className="dataset__cleaning-row">
                <span className="dataset__cleaning-row-label">{l}</span>
                <span className="dataset__cleaning-row-value">{v}</span>
              </div>
            ))}
          </div>
          <div className="dataset__cleaning-col dataset__cleaning-col--after">
            <div className="dataset__cleaning-col-title">
              ✓ SONRASI (Temizlenmiş)
            </div>
            {[
              ["Film Sayısı", fmt(stats?.total_movies ?? 0) || "13.626"],
              ["Kullanıcı Sayısı", fmt(stats?.total_users ?? 0) || "166.303"],
              ["Rating Sayısı", fmt(stats?.total_ratings ?? 0) || "30.526.544"],
              ["Film Eşiği", "≥ 75 puanlama"],
              ["Kullanıcı Eşiği", "≥ 30 puanlama"],
            ].map(([l, v]) => (
              <div key={l} className="dataset__cleaning-row">
                <span className="dataset__cleaning-row-label">{l}</span>
                <span className="dataset__cleaning-row-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dataset__steps">
          {STEPS.map((s, i) => (
            <div key={i} className="dataset__step">
              <span className="dataset__step-badge">✓ {i + 1}</span>
              <span className="dataset__step-text">{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
