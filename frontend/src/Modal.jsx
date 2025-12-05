import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

function Modal({ isOpen, onClose, title, message, type = 'info' }) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <FaExclamationCircle />;
            case 'success':
                return <FaCheckCircle />;
            default:
                return <FaInfoCircle />;
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'error':
                return '#e74c3c';
            case 'success':
                return '#27ae60';
            default:
                return '#3498db';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-alert" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-icon" style={{ color: getIconColor() }}>
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
