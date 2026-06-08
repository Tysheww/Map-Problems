import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import RegistryPage from './pages/RegistryPage'; // 1. Імпортуємо нову сторінку
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        {/* 2. Додаємо шлях для реєстру */}
        <Route path="/registry" element={<RegistryPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;