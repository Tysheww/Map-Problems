import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginModal from './LoginModal';
import './HomePage.css';
import ConfirmModal from './ConfirmModal';

// Кольори для кругової діаграми
const CATEGORY_COLORS = {
    "Пошкодження від прильотів": "#C53030", 
    "Дороги / Ями": "#0A3663", 
    "Освітлення": "#DDA22A", 
    "Сміття": "#2F855A", 
    "Водоканал": "#2B6CB0",
    "Інше": "#4A5568" 
};

function HomePage() {
    const navigate = useNavigate();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({ resolved: 0, total: 0, percentage: 0 });
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        // Перевіряємо, чи користувач вже авторизований
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }

        // Завантаження аналітики з бекенду
        axios.get('http://localhost:5023/api/Issues')
            .then(response => {
                const issues = response.data;
                const total = issues.length;
                
                const resolved = issues.filter(i => i.status === 'Вирішено' || i.status === 'done').length;
                const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
                setStats({ resolved, total, percentage });

                // Готуємо дані для графіка
                const counts = {};
                Object.keys(CATEGORY_COLORS).forEach(cat => counts[cat] = 0);
                
                issues.forEach(issue => {
                    const cat = issue.category || "";
                    if (cat.includes('Дорог')) counts['Дороги / Ями']++;
                    else if (cat.includes('Освітл') || cat.includes('світлофор')) counts['Освітлення']++;
                    else if (cat.includes('Смітт')) counts['Сміття']++;
                    else if (cat.includes('Водоканал') || cat.includes('Вода')) counts['Водоканал']++;
                    else if (cat.includes('прильот') || cat.includes('Пошкодж')) counts['Пошкодження від прильотів']++;
                    else counts['Інше']++;
                });

                const parsedCategories = Object.keys(counts)
                    .filter(key => counts[key] > 0)
                    .map(key => ({ name: key, count: counts[key], color: CATEGORY_COLORS[key] }));
                
                setCategoryData(parsedCategories);
            }).catch(console.error);
    }, []);

   const executeLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsLogoutModalOpen(false); // Закриваємо вікно після виходу
};

    const totalChartCount = categoryData.reduce((sum, c) => sum + c.count, 0);
    let accumulatedPercent = 0;

    return (
        <div id="start-container" className="welcome-overlay">
            <div className="city-shell">
                
                {/* --- HEADER --- */}
                <header className="city-header">
                    <div className="city-brand">
                        <div className="logo-wrapper">
                            <img src="/Image.png" alt="Логотип Житомира" className="dash-logo" />    
                             </div>

                        <div className="dash-titles">
                            <span className="city-kicker">Житомирська міська громада</span>
                            <h1>Контактний центр м. Житомира</h1>
                            <p>Єдина система моніторингу інфраструктурних проблем</p>
                        </div>
                    </div>

                    <div className="dash-top-right">
                        {!currentUser ? (
                            <button className="btn-profile" onClick={() => setIsAuthOpen(true)}>Авторизація</button>
                        ) : (
                            <>
                                {/* ВИПРАВЛЕНО: Тепер кнопка веде на /cabinet */}
                                <button className="btn-profile" onClick={() => navigate('/cabinet')}>Особистий кабінет</button>
                                <button className="btn-profile logout-btn" onClick={() => setIsLogoutModalOpen(true)}>Вийти</button>
                            </>
                        )}
                    </div>
                </header>

                {/* --- MAIN CARD --- */}
                <main className="dashboard-card municipal-card">
                    
                    {/* HERO PANEL */}
                    <section className="hero-panel">
                        <div>
                            <span className="section-eyebrow">Цифровий сервіс громади</span>
                            <h2>Повідомляйте про проблеми міської інфраструктури онлайн</h2>
                            <p>
                                Оберіть точку на мапі, додайте опис проблеми та відстежуйте стан її опрацювання
                                у відкритому реєстрі або власному кабінеті.
                            </p>
                        </div>

                        <div className="hero-actions">
                            <button className="btn-1551 primary-1551" onClick={() => navigate('/map')}>Відкрити мапу звернень</button>
                            <button className="btn-1551 secondary-1551" onClick={() => navigate('/registry')}>Реєстр проблем</button>
                        </div>
                    </section>

                    {/* DASHBOARD GRID */}
                    <section className="dash-grid">
                        
                        {/* LEFT COLUMN */}
                        <div className="dash-stats-col">
                            <div className="resolved-widget service-widget">
                                <h3>Статус виконання заявок</h3>

                                <div className="progress-info">
                                    <span className="status-done">{stats.resolved} вирішено</span>
                                    <span className="status-total">з {stats.total} загалом ({stats.percentage}%)</span>
                                </div>

                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: `${stats.percentage}%` }}></div>
                                </div>
                            </div>

                            <div className="chart-container">
                                {totalChartCount === 0 ? (
                                    <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>Немає даних для побудови графіка</p>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', width: '100%' }}>
                                        <svg width="160" height="160" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E4EAF2" strokeWidth="6" />
                                            {categoryData.map((cat) => {
                                                const percent = (cat.count / totalChartCount) * 100;
                                                const strokeDasharray = `${percent} ${100 - percent}`;
                                                const strokeDashoffset = 100 - accumulatedPercent;
                                                accumulatedPercent += percent;
                                                return (
                                                    <circle key={cat.name} cx="21" cy="21" r="15.915" fill="transparent" stroke={cat.color} strokeWidth="6" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
                                                );
                                            })}
                                        </svg>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {categoryData.map(cat => (
                                                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#1A202C' }}>
                                                    <div style={{ width: '12px', height: '12px', backgroundColor: cat.color, borderRadius: '3px' }}></div>
                                                    <span>{cat.name}: {cat.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="dash-actions-col">
                            <div className="info-board">
                                <h3>Категорії звернень</h3>

                                <div className="category-grid">
                                    <span>Пошкодження від прильотів</span>
                                    <span>Дороги / Ями</span>
                                    <span>Освітлення</span>
                                    <span>Сміття</span>
                                    <span>Водоканал</span>
                                    <span>Інше</span>
                                </div>
                            </div>

                            <div className="news-widget">
                                <h3>Новини нашого міста</h3>

                                <ul className="news-list">
                                    <li>
                                        <span className="news-date">Сьогодні</span>
                                        <span>Завершення реконструкції скверу на Польовій.</span>
                                    </li>
                                    <li>
                                        <span className="news-date">Вчора</span>
                                        <span>Зміни у графіку руху комунального транспорту.</span>
                                    </li>
                                </ul>

                                <button className="btn-1551 secondary-1551 small-action">Переглянути всі новини</button>
                            </div>
                        </div>

                    </section>
                </main>
            </div>

           {/* ВІКНО АВТОРИЗАЦІЇ */}
            <LoginModal 
                isOpen={isAuthOpen} 
                onClose={() => setIsAuthOpen(false)} 
                onLoginSuccess={(user) => setCurrentUser(user)} 
            />

            {/* НОВЕ ВІКНО ПІДТВЕРДЖЕННЯ ВИХОДУ */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Підтвердження виходу"
                message="Чи дійсно ви хочете вийти з особистого кабінету?"
                onConfirm={executeLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
            />
        </div>
    );
}

export default HomePage;