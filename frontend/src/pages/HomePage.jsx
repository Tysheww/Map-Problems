import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Константи з твого файлу config.js
const CATEGORY_COLORS = {
    "Пошкодження від прильотів": "#B42318",
    "Дороги / Ями": "#0A3663",
    "Освітлення": "#DDA22A",
    "Сміття": "#2F855A",
    "Водоканал": "#2563EB",
    "Інше": "#64748B"
};

function HomePage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ resolved: 0, total: 0, percentage: 0 });
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        // Отримуємо дані з нашого C# бекенду!
        axios.get('http://localhost:5023/api/Issues')
            .then(response => {
                const issues = response.data;
                const total = issues.length;
                
                // Рахуємо статус (в твоїй БД ми писали "Вирішено" або "done")
                const resolved = issues.filter(i => i.status === 'Вирішено' || i.status === 'done').length;
                const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
                setStats({ resolved, total, percentage });

                // Готуємо дані для графіка за твоїми категоріями
                const counts = {};
                Object.keys(CATEGORY_COLORS).forEach(cat => counts[cat] = 0);
                
                issues.forEach(issue => {
                    const cat = issue.category;
                    if (counts[cat] !== undefined) counts[cat]++;
                    else counts['Інше']++;
                });

                const parsedCategories = Object.keys(counts)
                    .filter(key => counts[key] > 0)
                    .map(key => ({ name: key, count: counts[key], color: CATEGORY_COLORS[key] }));
                
                setCategoryData(parsedCategories);
            })
            .catch(error => console.error("Помилка завантаження даних:", error));
    }, []);

    // Математика для SVG кругового графіка
    const totalChartCount = categoryData.reduce((sum, c) => sum + c.count, 0);
    let accumulatedPercent = 0;

    return (
        <div id="start-container" className="welcome-overlay">
            <div className="city-shell">
                
                {/* ХЕДЕР */}
                <header className="city-header">
                    <div className="city-brand">
                        <div className="logo-wrapper">
                            <img src="/Image.png" alt="Логотип Житомира" className="dash-logo" onError={(e) => e.target.style.display='none'} />
                        </div>
                        <div className="dash-titles">
                            <span className="city-kicker">Житомирська міська громада</span>
                            <h1>Контактний центр м. Житомира</h1>
                            <p>Єдина система моніторингу інфраструктурних проблем</p>
                        </div>
                    </div>

                    <div className="dash-top-right">
                        <button className="btn-profile" onClick={() => alert('Тут буде модалка авторизації!')}>Авторизація</button>
                    </div>
                </header>

                {/* ГОЛОВНИЙ КОНТЕЙНЕР */}
                <main className="dashboard-card municipal-card">
                    
                    {/* ГЕРОЙ ПАНЕЛЬ */}
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
                            <button className="btn-1551 primary-1551" onClick={() => navigate('/map')}>
                                Відкрити мапу звернень
                            </button>
                            <button className="btn-1551 secondary-1551" onClick={() => navigate('/registry')}>
                                Реєстр проблем
                            </button>
                        </div>
                    </section>

                    {/* СТАТИСТИКА ТА НОВИНИ */}
                    <section className="dash-grid">
                        
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
                                    <p style={{ color: '#64748b' }}>Немає даних для побудови графіка</p>
                                ) : (
                                    <>
                                        <svg width="150" height="150" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
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
                                                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                                                    <div style={{ width: '12px', height: '12px', backgroundColor: cat.color, borderRadius: '4px' }}></div>
                                                    <span>{cat.name}: {cat.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="dash-actions-col">
                            <div className="info-board">
                                <h3>Категорії звернень</h3>
                                <div className="category-grid">
                                    {Object.keys(CATEGORY_COLORS).map(cat => (
                                        <span key={cat}>{cat}</span>
                                    ))}
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
        </div>
    );
}

export default HomePage;