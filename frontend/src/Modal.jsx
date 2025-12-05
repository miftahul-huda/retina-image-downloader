import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

function Modal({ isOpen, onClose, title, message, type = 'info' }) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <FaExclamationCircle style={{ color: '#e74c3c', fontSize: '3rem' }} />;
            case 'success':
                return <FaCheckCircle style={{ color: '#27ae60', fontSize: '3rem' }} />;
            default:
                return <FaInfoCircle style={{ color: '#3498db', fontSize: '3rem' }} />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-icon">
                    {getIcon()}
                </div>

                {title && <h2 className="modal-title">{title}</h2>}

                <p className="modal-message">{message}</p>

                <button className="modal-button" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
}

export default Modal;
