import React from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
    // Якщо вікно закрите, нічого не малюємо
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2 style={{ color: '#0A3663', marginBottom: '10px' }}>{title}</h2>
                <p className="modal-desc">{message}</p>

                <div className="action-group">
                    {/* Червона кнопка для підтвердження виходу */}
                    <button className="btn-primary" style={{ backgroundColor: '#C53030' }} onClick={onConfirm}>
                        ТАК, ВИЙТИ
                    </button>
                    {/* Сіра кнопка для скасування */}
                    <button className="btn-secondary" onClick={onCancel}>
                        СКАСУВАТИ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;