import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import './App.css';
import logo from './assets/images/logo.png';
import lightMode from './assets/images/light-mode.png';
import darkMode from './assets/images/night-mode.png';
import ImagePreview from './ImagePreview';

function Header({ theme, toggleTheme }) {
  return (
    <header className="header">
      <div className="title">
        <img src={logo} alt="logo" className="logo" />
        <h1>ImageUploader</h1>
      </div>
      <button onClick={toggleTheme} className="themeToggle">
        <div className="themeToggleIconBox">
          <img 
            src={theme === 'light' ? darkMode : lightMode} 
            alt={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="themeToggleIcon"
          />
        </div>
      </button>
    </header>
  );
}

function AppRoutes({ theme, toggleTheme }) {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<ImageUploader />} />
          <Route path="/preview" element={<ImagePreview />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      <AppRoutes theme={theme} toggleTheme={toggleTheme} />
    </BrowserRouter>
  );
}

export default App;
