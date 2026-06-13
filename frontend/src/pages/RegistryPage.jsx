import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './RegistryPage.css';

function RegistryPage() {
    const navigate = useNavigate();
    const location = useLocation(); // Додаємо перевірку URL-адреси
    
    // Визначаємо: ми зараз в Кабінеті чи в Реєстрі?
    const isCabinetMode = location.pathname.includes('/cabinet');

    const [issues, setIssues] = useState([]);
    const [commentTexts, setCommentTexts] = useState({}); 
    
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        axios.get('http://localhost:5023/api/Issues')
            .then(res => setIssues(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleUpvote = (id) => {
        axios.put(`http://localhost:5023/api/Issues/${id}/upvote`)
            .then(res => setIssues(issues.map(iss => iss.id === id ? { ...iss, upvotes: res.data.upvotes } : iss)))
            .catch(err => console.error(err));
    };

    const handleCommentSubmit = (id) => {
        const text = commentTexts[id];
        if (!text) return;

        const authorName = currentUser ? currentUser.email.split('@')[0] : 'Анонім';

        axios.post(`http://localhost:5023/api/Issues/${id}/comments`, { text, authorName })
            .then(res => {
                setIssues(issues.map(iss => iss.id === id ? { ...iss, comments: [...(iss.comments || []), res.data] } : iss));
                setCommentTexts({ ...commentTexts, [id]: '' }); 
            })
            .catch(err => console.error(err));
    };

    const handleCommentChange = (id, text) => {
        setCommentTexts({ ...commentTexts, [id]: text });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Невідомо';
        return new Date(dateString).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // ГОЛОВНА ЛОГІКА ФІЛЬТРАЦІЇ
    const filteredIssues = issues.filter(issue => {
        const matchCategory = categoryFilter === 'all' || issue.category === categoryFilter;
        const lowerSearch = searchQuery.toLowerCase();
        const matchSearch = issue.title.toLowerCase().includes(lowerSearch) || 
                            (issue.description && issue.description.toLowerCase().includes(lowerSearch));
        
        // Якщо це режим "Кабінет" -> показуємо тільки проблеми цього юзера
        // Якщо це "Реєстр" -> показуємо всі
        let matchCabinet = true;
        if (isCabinetMode) {
            matchCabinet = currentUser ? (issue.authorEmail === currentUser.email) : false;
        }
        
        return matchCategory && matchSearch && matchCabinet;
    });

    const totalCount = filteredIssues.length;
    const newCount = filteredIssues.filter(i => i.status === 'Очікує розгляду' || !i.status).length;
    const resolvedCount = filteredIssues.filter(i => i.status === 'Вирішено' || i.status === 'done').length;

    const getStatusBadge = (status) => {
        if (status === 'Вирішено' || status === 'done') return <span className="badge done">Вирішено</span>;
        if (status === 'В роботі') return <span className="badge process">В роботі</span>;
        return <span className="badge new">Очікує розгляду</span>;
    };

    return (
        <div id="list-view">
            <div className="list-shell">
                
                <div className="list-header municipal-list-header">
                    <div>
                        <span className="section-eyebrow" style={{ color: '#0A3663', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                            {isCabinetMode ? 'Особистий профіль' : 'Реєстр громади'}
                        </span>
                        <h2 id="list-title">
                            {isCabinetMode ? 'Мій кабінет' : 'Реєстр звернень'}
                        </h2>
                        <p id="list-subtitle" className="list-subtitle">
                            {isCabinetMode ? 'Перелік проблем, які створили ви' : 'Відкритий перелік інфраструктурних проблем міста'}
                        </p>
                    </div>

                    <div className="list-controls">
                        
                        {/* Фільтр категорій показується і в кабінеті, і в реєстрі */}
                        <select className="sort-dropdown" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="all">Всі категорії</option>
                            <option value="Пошкодження від прильотів">Пошкодження від прильотів</option>
                            <option value="Дороги / Ями">Дороги / Ями</option>
                            <option value="Освітлення">Освітлення</option>
                            <option value="Сміття">Сміття</option>
                            <option value="Водоканал">Водоканал</option>
                            <option value="Інше">Інше</option>
                        </select>

                        <input 
                            type="text" 
                            className="sort-dropdown search-field" 
                            placeholder="Пошук - назва, опис..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <button className="back-btn" onClick={() => navigate('/')}>Повернутися</button>
                    </div>
                </div>

                <div className="dashboard stat-dashboard">
                    <div className="stat-card">
                        <span className="stat-label">Всього звернень</span>
                        <span className="stat-value">{totalCount}</span>
                    </div>
                    <div className="stat-card urgent">
                        <span className="stat-label">Нові - в очікуванні</span>
                        <span className="stat-value">{newCount}</span>
                    </div>
                    <div className="stat-card success">
                        <span className="stat-label">Успішно вирішено</span>
                        <span className="stat-value">{resolvedCount}</span>
                    </div>
                </div>

                <ul id="issues-list">
                    {filteredIssues.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748B', marginTop: '40px', fontWeight: 600 }}>
                            {isCabinetMode 
                                ? "Ви ще не створили жодного звернення." 
                                : "За вашим запитом нічого не знайдено."}
                        </p>
                    ) : null}
                    
                    {filteredIssues.map(issue => (
                        <li key={issue.id} className="issue-item">
                            <div className="issue-top">
                                <strong>{issue.category || 'Інше'}</strong>
                                <button className="btn-map-show" onClick={() => navigate('/map')}>ПОКАЗАТИ НА МАПІ</button>
                            </div>

                            <div className="issue-status-row">
                                {getStatusBadge(issue.status)}
                                <span className="watch-count">Відстежують: {issue.upvotes}</span>
                            </div>

                            <h3 style={{ fontSize: '18px', color: '#1A202C', margin: '0 0 10px 0' }}>{issue.title}</h3>
                            {issue.description && <p>{issue.description}</p>}

                            <button className="upvote-btn" onClick={() => handleUpvote(issue.id)}>
                                Підтримати і відстежувати ({issue.upvotes})
                            </button>

                            <p className="issue-address">
                                Адреса: Координати [{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}]
                            </p>

                            <div className="comments-box">
                                <h4>Обговорення ({(issue.comments || []).length})</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {(issue.comments || []).map(c => (
                                        <div key={c.id} className="comment-item">
                                            <b>{c.authorName}:</b> {c.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="comment-form">
                                    <input 
                                        type="text" 
                                        placeholder="Додати коментар..." 
                                        value={commentTexts[issue.id] || ''}
                                        onChange={(e) => handleCommentChange(issue.id, e.target.value)}
                                    />
                                    <button onClick={() => handleCommentSubmit(issue.id)}>Надіслати</button>
                                </div>
                            </div>

                            <div className="issue-meta">
                                <span>ЗАЯВНИК: {issue.authorEmail ? issue.authorEmail.toUpperCase() : 'АНОНІМ'}</span>
                                <span>ДАТА: {formatDate(issue.createdAt)}</span>
                            </div>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
}

export default RegistryPage;