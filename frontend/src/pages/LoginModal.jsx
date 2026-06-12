import { useState } from 'react';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!email || !password) {
      setError("Введіть електронну пошту та пароль.");
      return;
    }
    if (!isLoginMode && password.length < 6) {
      setError("Пароль має містити щонайменше 6 символів.");
      return;
    }

    // ТУТ БУДЕ ЗАПИТ ДО ТВОГО C# БЕКЕНДУ НА /api/auth/login або register
    // Зараз зробимо імітацію успішного входу для тестування інтерфейсу:
    const mockUser = {
      email: email,
      isAdmin: email === "adminzt@gmail.com"
    };

    // Зберігаємо в браузері, щоб логін не злітав при перезавантаженні F5
    localStorage.setItem('user', JSON.stringify(mockUser));
    onLoginSuccess(mockUser);
    onClose();
    
    // Очищаємо поля
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <span className="section-eyebrow">Кабінет мешканця</span>
        <h2>{isLoginMode ? "Авторизація" : "Реєстрація"}</h2>
        <p>{isLoginMode ? "Вхід до особистого кабінету мешканця." : "Створення нового облікового запису."}</p>

        <input 
          type="email" 
          placeholder="Електронна пошта" 
          className="auth-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Пароль - мінімум 6 символів" 
          className="auth-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={{ color: '#E53E3E', fontSize: '12px', fontWeight: 600 }}>{error}</p>}

        <div className="action-group">
          <button className="btn-primary" onClick={handleSubmit}>
            {isLoginMode ? "УВІЙТИ" : "СТВОРИТИ АКАУНТ"}
          </button>
          <button className="btn-secondary" onClick={onClose}>Скасувати</button>
        </div>

        <div className="auth-toggle" style={{ marginTop: '20px', fontSize: '13px' }}>
          <span style={{ color: '#718096' }}>{isLoginMode ? "Немає облікового запису? " : "Вже є акаунт? "}</span>
          <a 
            href="#" 
            style={{ color: '#0B3768', fontWeight: 700 }}
            onClick={(e) => { e.preventDefault(); setIsLoginMode(!isLoginMode); setError(''); }}
          >
            {isLoginMode ? "Зареєструватися" : "Увійти"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;