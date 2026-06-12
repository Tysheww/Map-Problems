import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from './LoginModal'; // Імпортуємо нашу нову модалку
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({ resolved: 0, total: 0, percentage: 0 });

    useEffect(() => {
        // Перевіряємо, чи користувач вже авторизований (збережений в браузері)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }

        // Завантаження аналітики
        axios.get('http://localhost:5023/api/Issues')
            .then(response => {
                const total = response.data.length;
                const resolved = response.data.filter(i => i.status === 'Вирішено' || i.status === 'done').length;
                setStats({ resolved, total, percentage: total > 0 ? Math.round((resolved / total) * 100) : 0 });
            }).catch(console.error);
    }, []);

    const handleLogout = () => {
        if (window.confirm("Чи точно ви хочете вийти з особистого кабінету?")) {
            localStorage.removeItem('user');
            setCurrentUser(null);
        }
    };

    return (
        <div id="start-container" className="welcome-overlay">
            <div className="city-shell">
                <header className="city-header">
                    <div className="city-brand">
                        <div className="logo-wrapper">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Coat_of_arms_of_Zhytomyr.svg/500px-Coat_of_arms_of_Zhytomyr.svg.png" alt="Логотип Житомира" className="dash-logo" />
                        </div>
                        <div className="dash-titles">
                            <span className="city-kicker">Житомирська міська громада</span>
                            <h1>Контактний центр м. Житомира</h1>
                            <p>Єдина система моніторингу інфраструктурних проблем</p>
                        </div>
                    </div>

                    {/* ДИНАМІЧНІ КНОПКИ АВТОРЫЗАЦІЇ */}
                    <div className="dash-top-right">
                        {!currentUser ? (
                            <button className="btn-profile" onClick={() => setIsAuthOpen(true)}>Авторизація</button>
                        ) : (
                            <>
                                <button className="btn-profile" onClick={() => navigate('/registry')}>Особистий кабінет</button>
                                <button className="btn-profile logout-btn" onClick={handleLogout}>Вийти</button>
                            </>
                        )}
                    </div>
                </header>

                {/* Твій основний контент та картки (hero-panel, dash-grid) залишаються без змін */}
                <main className="dashboard-card municipal-card">
                    <section className="hero-panel">
                        <div>
                            <span className="section-eyebrow">Цифровий сервіс громади</span>
                            <h2>Повідомляйте про проблеми міської інфраструктури онлайн</h2>
                            <p>Оберіть точку на мапі, додайте опис проблеми та відстежуйте стан її опрацювання.</p>
                        </div>
                        <div className="hero-actions">
                            <button className="btn-1551 primary-1551" onClick={() => navigate('/map')}>Відкрити мапу звернень</button>
                            <button className="btn-1551 secondary-1551" onClick={() => navigate('/registry')}>Реєстр проблем</button>
                        </div>
                    </section>
                    {/* ... інша частина твоєї розмітки із сіткою ... */}
                </main>
            </div>

            {/* НАШЕ ВІКНО АВТОРЫЗАЦІЇ */}
            <LoginModal 
                isOpen={isAuthOpen} 
                onClose={() => setIsAuthOpen(false)} 
                onLoginSuccess={(user) => setCurrentUser(user)} 
            />
        </div>
    );
}

export default HomePage;