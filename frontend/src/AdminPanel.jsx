import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaUser, FaShieldAlt, FaPlus } from 'react-icons/fa';
import api from './api';
import Modal from './Modal';

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [registering, setRegistering] = useState(false);

    // Modal states
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!newUserEmail || !newUserEmail.includes('@')) {
            setModal({
                isOpen: true,
                title: 'Invalid Email',
                message: 'Please enter a valid email address',
                type: 'error'
            });
            return;
        }

        setRegistering(true);
        try {
            await api.post('/admin/users/register', { email: newUserEmail });
            setNewUserEmail('');
            fetchUsers(); // Refresh list
            setModal({
                isOpen: true,
                title: 'Success',
                message: 'User registered successfully',
                type: 'success'
            });
        } catch (err) {
            console.error('Error registering user:', err);
            const errorMsg = err.response?.data?.error || 'Failed to register user';
            setModal({
                isOpen: true,
                title: 'Registration Failed',
                message: errorMsg,
                type: 'error'
            });
        } finally {
            setRegistering(false);
        }
    };

    const handleAuthorize = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/authorize`);
            fetchUsers(); // Refresh list
            setModal({
                isOpen: true,
                title: 'Success',
                message: 'User authorized successfully',
                type: 'success'
            });
        } catch (err) {
            console.error('Error authorizing user:', err);
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to authorize user',
                type: 'error'
            });
        }
    };

    const confirmRevoke = (userId) => {
        setConfirmModal({ isOpen: true, userId });
    };

    const handleRevoke = async () => {
        const userId = confirmModal.userId;
        setConfirmModal({ isOpen: false, userId: null });

        try {
            await api.post(`/admin/users/${userId}/revoke`);
            fetchUsers(); // Refresh list
            setModal({
                isOpen: true,
                title: 'Access Revoked',
                message: 'User access has been revoked',
                type: 'success'
            });
        } catch (err) {
            console.error('Error revoking access:', err);
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to revoke access',
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
                <p>{error}</p>
                <button onClick={fetchUsers} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaShieldAlt /> User Management
            </h2>

            {/* Registration Form */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Register New User</h3>
                <form onSubmit={handleRegister} style={{ display: 'flex', gap: '0', alignItems: 'flex-end', maxWidth: '600px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: '#555' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px 0 0 8px',
                                fontSize: '1rem',
                                height: '48px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={registering}
                        className="btn btn-primary"
                        style={{
                            padding: '0 2rem',
                            height: '48px',
                            borderRadius: '0 8px 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FaPlus /> {registering ? 'Registering...' : 'Register User'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCheck style={{ color: '#27ae60' }} /> User will be automatically authorized and can login immediately.
                </p>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
                            <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>User</th>
                            <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>Email</th>
                            <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Status</th>
                            <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Registered</th>
                            <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                        ) : (
                                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                                                <FaUser />
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#2d3748' }}>{user.name}</div>
                                            {user.isAdmin && (
                                                <span style={{ fontSize: '0.7rem', color: '#e53e3e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#fff5f5', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', color: '#4a5568' }}>{user.email}</td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                    {user.isAuthorized ? (
                                        <span style={{ color: '#38a169', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0fff4', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                                            <FaCheck size={12} /> Authorized
                                        </span>
                                    ) : (
                                        <span style={{ color: '#e53e3e', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff5f5', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
                                            <FaTimes size={12} /> Not Authorized
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#718096' }}>
                                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                    {!user.isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {!user.isAuthorized ? (
                                                <button
                                                    onClick={() => handleAuthorize(user.id)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                    <FaCheck /> Authorize
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => confirmRevoke(user.id)}
                                                    className="btn"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #e53e3e', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e53e3e'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#e53e3e'; }}
                                                >
                                                    <FaTimes /> Revoke
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#a0aec0', backgroundColor: 'white', borderRadius: '12px', marginTop: '1rem' }}>
                    <FaUser style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No users found</p>
                </div>
            )}

            {/* Alert Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ isOpen: false, userId: null })}>
                    <div className="modal-content modal-alert" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setConfirmModal({ isOpen: false, userId: null })}>
                            <FaTimes />
                        </button>

                        <div className="modal-icon" style={{ color: '#e74c3c' }}>
                            <FaShieldAlt />
                        </div>

                        <h2 className="modal-title">Revoke Access?</h2>

                        <p className="modal-message">
                            Are you sure you want to revoke this user's access? They will no longer be able to login to the application.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmModal({ isOpen: false, userId: null })}
                                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button"
                                onClick={handleRevoke}
                                style={{ width: 'auto', padding: '0.75rem 1.5rem', margin: 0 }}
                            >
                                Yes, Revoke
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
