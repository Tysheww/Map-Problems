import { useState } from 'react';
import axios from 'axios';
import './LoginModal.css'; // ОДНА ЦЯ СТРОЧКА РОБИТЬ ВСЮ МАГІЮ!

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("Введіть електронну пошту та пароль.");
            return;
        }
        if (!isLoginMode && password.length < 6) {
            setError("Пароль має містити щонайменше 6 символів.");
            return;
        }

        setIsLoading(true);
        setError('');

        const endpoint = isLoginMode ? '/api/Auth/login' : '/api/Auth/register';

        try {
            const response = await axios.post(`http://localhost:5023${endpoint}`, {
                email: email,
                password: password
            });

            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            onLoginSuccess(user);
            
            setEmail('');
            setPassword('');
            onClose();

        } catch (err) {
            console.error("Деталі помилки авторизації:", err); // Виводимо всю правду в консоль
            
            if (err.response) {
                // Якщо C# повернув складний об'єкт з помилками валідації
                if (typeof err.response.data === 'object') {
                    setError("Перевірте правильність пошти та пароля.");
                } else {
                    // Якщо C# повернув наш текст ("Користувач з такою поштою вже існує")
                    setError(err.response.data); 
                }
            } else {
                setError("Сервер не відповідає. Перевір консоль (F12).");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMode = (e) => {
        e.preventDefault();
        setIsLoginMode(!isLoginMode);
        setError('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <span className="section-eyebrow">Кабінет мешканця</span>
                <h2>{isLoginMode ? "АВТОРИЗАЦІЯ" : "РЕЄСТРАЦІЯ"}</h2>
                <p className="modal-desc">
                    {isLoginMode ? "Вхід до особистого кабінету мешканця." : "Створення нового облікового запису."}
                </p>

                <input 
                    type="email" 
                    placeholder="Електронна пошта" 
                    className="auth-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                
                <input 
                    type="password" 
                    placeholder="Пароль - мінімум 6 символів" 
                    className="auth-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p id="auth-error" style={{ display: 'block', color: '#E53E3E', fontSize: '12px', fontWeight: 600 }}>{error}</p>}

                <div className="action-group">
                    <button 
                        className={`btn-primary ${!isLoginMode ? 'btn-green' : ''}`} 
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "ЗАЧЕКАЙТЕ..." : (isLoginMode ? "УВІЙТИ" : "СТВОРИТИ АКАУНТ")}
                    </button>
                    <button className="btn-secondary" onClick={onClose}>СКАСУВАТИ</button>
                </div>

                <div className="auth-toggle">
                    <span>{isLoginMode ? "Немає облікового запису?" : "Вже є акаунт?"}</span>
                    <a href="#" onClick={handleToggleMode}>
                        {isLoginMode ? "Зареєструватися" : "Увійти"}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default LoginModal;