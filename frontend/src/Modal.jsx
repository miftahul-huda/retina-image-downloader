import React from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';

function Modal({ isOpen, onClose, title, message, type = 'info', onConfirm, onCancel, confirmText = 'Yes', cancelText = 'No' }) {
    if (!isOpen) return null;

    const isConfirmation = type === 'confirm';

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <FaExclamationCircle />;
            case 'success':
                return <FaCheckCircle />;
            case 'confirm':
                return <FaQuestionCircle />;
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
            case 'confirm':
                return '#f39c12';
            default:
                return '#3498db';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        if (onClose) onClose();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        if (onClose) onClose();
    };

    return (
        <div className="modal-overlay" onClick={isConfirmation ? undefined : onClose}>
            <div className="modal-content modal-alert" onClick={(e) => e.stopPropagation()}>
                {!isConfirmation && (
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                )}

                <div className="modal-icon" style={{ color: getIconColor() }}>
                    {getIcon()}
                </div>

                {title && <h2 className="modal-title">{title}</h2>}

                <p className="modal-message">{message}</p>

                {isConfirmation ? (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <button className="btn btn-outline" onClick={handleCancel}>
                            {cancelText}
                        </button>
                        <button className="btn btn-primary" onClick={handleConfirm}>
                            {confirmText}
                        </button>
                    </div>
                ) : (
                    <button className="modal-button" onClick={onClose}>
                        OK
                    </button>
                )}
            </div>
        </div>
    );
}

export default Modal;
