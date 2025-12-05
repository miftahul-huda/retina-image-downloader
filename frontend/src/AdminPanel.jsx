import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaUser, FaShieldAlt } from 'react-icons/fa';
import api from './api';

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [registering, setRegistering] = useState(false);

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
            alert('Please enter a valid email address');
            return;
        }

        setRegistering(true);
        try {
            await api.post('/admin/users/register', { email: newUserEmail });
            setNewUserEmail('');
            fetchUsers(); // Refresh list
            alert('User registered successfully');
        } catch (err) {
            console.error('Error registering user:', err);
            const errorMsg = err.response?.data?.error || 'Failed to register user';
            alert(errorMsg);
        } finally {
            setRegistering(false);
        }
    };

    const handleAuthorize = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/authorize`);
            fetchUsers(); // Refresh list
            alert('User authorized successfully');
        } catch (err) {
            console.error('Error authorizing user:', err);
            alert('Failed to authorize user');
        }
    };

    const handleRevoke = async (userId) => {
        if (!confirm('Are you sure you want to revoke this user\'s access?')) {
            return;
        }
        try {
            await api.post(`/admin/users/${userId}/revoke`);
            fetchUsers(); // Refresh list
            alert('User access revoked');
        } catch (err) {
            console.error('Error revoking access:', err);
            alert('Failed to revoke access');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
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
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Register New User</h3>
                <form onSubmit={handleRegister} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                                padding: '0.75rem',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={registering}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        {registering ? 'Registering...' : 'Register User'}
                    </button>
                </form>
                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6c757d' }}>
                    User will be automatically authorized and can login immediately after registration.
                </p>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Registered</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaUser />
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{user.name}</div>
                                            {user.isAdmin && (
                                                <span style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: '600' }}>
                                                    <FaShieldAlt style={{ fontSize: '0.7rem' }} /> ADMIN
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {user.isAuthorized ? (
                                        <span style={{ color: '#27ae60', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                            <FaCheck /> Authorized
                                        </span>
                                    ) : (
                                        <span style={{ color: '#e74c3c', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                            <FaTimes /> Not Authorized
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6c757d' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {!user.isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {!user.isAuthorized ? (
                                                <button
                                                    onClick={() => handleAuthorize(user.id)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                >
                                                    <FaCheck /> Authorize
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRevoke(user.id)}
                                                    className="btn"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: '#e74c3c', color: 'white' }}
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
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                    <p>No users found</p>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
