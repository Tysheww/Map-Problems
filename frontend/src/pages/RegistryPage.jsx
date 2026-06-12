import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegistryPage.css';

function RegistryPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Завантажуємо проблеми з бази даних
    axios.get('http://localhost:5023/api/Issues')
      .then(response => {
        // Сортуємо: найновіші зверху
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIssues(sorted);
      })
      .catch(error => console.error("Помилка завантаження реєстру:", error));
  }, []);

  // Фільтрація та пошук "на льоту"
  const filteredIssues = issues.filter(issue => {
    const matchCategory = filter === 'all' || issue.category.includes(filter);
    const matchSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || 
                        issue.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Підрахунок статистики для верхніх карток
  const totalCount = issues.length;
  const newCount = issues.filter(i => i.status === 'Очікує розгляду' || i.status === 'new').length;
  const resolvedCount = issues.filter(i => i.status === 'Вирішено' || i.status === 'done').length;

  // Красиві бейджі статусів (з оригінального CSS)
  const renderStatusBadge = (status) => {
    if (status === 'Вирішено' || status === 'done') return <span className="badge done">Вирішено</span>;
    if (status === 'В обробці' || status === 'process') return <span className="badge process">В обробці</span>;
    return <span className="badge new">Очікує розгляду</span>;
  };

  return (
    <div className="page-view" style={{ position: 'relative', display: 'block' }}>
      <div className="list-shell">
        
        {/* ХЕДЕР РЕЄСТРУ */}
        <div className="list-header municipal-list-header">
          <div>
            <span className="section-eyebrow">Реєстр громади</span>
            <h2>Реєстр звернень</h2>
            <p className="list-subtitle">Відкритий перелік інфраструктурних проблем міста</p>
          </div>

          <div className="list-controls">
            <select className="sort-dropdown" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Всі категорії</option>
              <option value="Дороги">Дороги / Ями</option>
              <option value="Освітлення">Освітлення та світлофори</option>
              <option value="Сміття">Сміття</option>
              <option value="Інфраструктура">Інфраструктура</option>
            </select>

            <input 
              type="text" 
              className="sort-dropdown search-field" 
              placeholder="Пошук - назва, опис..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <button className="back-btn" onClick={() => navigate('/')}>Повернутися</button>
          </div>
        </div>

        {/* ПАНЕЛЬ СТАТИСТИКИ */}
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

        {/* СПИСОК ПРОБЛЕМ */}
        <ul id="issues-list">
          {filteredIssues.map(issue => (
            <li key={issue.id} className="issue-item">
              <div className="issue-top">
                <div>
                  <strong>{issue.category}</strong>
                  <div className="issue-status-row">
                    {renderStatusBadge(issue.status)}
                    <span className="watch-count">Підтримали: {issue.upvotes}</span>
                  </div>
                </div>
                
                <button className="btn-map-show" onClick={() => navigate('/map')}>
                  Показати на мапі
                </button>
              </div>

              {/* Назва та Опис */}
              <p className="issue-desc" style={{ marginTop: '15px' }}>
                <b style={{ color: '#0A3663' }}>{issue.title}</b><br/>
                {issue.description}
              </p>

              {/* Нижня панель з мета-даними */}
              <div className="issue-meta">
                <span>Координати: {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</span>
                <span>Дата: {new Date(issue.createdAt).toLocaleDateString('uk-UA')}</span>
              </div>
            </li>
          ))}

          {/* Якщо нічого не знайдено */}
          {filteredIssues.length === 0 && (
            <p className="empty-message">Записів не знайдено. Змініть параметри пошуку.</p>
          )}
        </ul>

      </div>
    </div>
  );
}

export default RegistryPage;