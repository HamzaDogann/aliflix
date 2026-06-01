import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.scss';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './features/home/HomePage';
import DatasetPage from './features/dataset/DatasetPage';
import RecommendPage from './features/recommend/RecommendPage';
import MovieDetailPage from './features/movie/MovieDetailPage';
import CategoryDetailPage from './features/category/CategoryDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/dataset"           element={<DatasetPage />} />
        <Route path="/recommend"         element={<RecommendPage />} />
        <Route path="/movie/:movieId"    element={<MovieDetailPage />} />
        <Route path="/category/:genre"   element={<CategoryDetailPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
