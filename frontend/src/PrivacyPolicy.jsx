import React from 'react';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

function PrivacyPolicy() {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ec1c24', textDecoration: 'none', fontWeight: '600' }}>
                    <FaArrowLeft /> Back to Home
                </a>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaShieldAlt style={{ fontSize: '3rem', color: '#ec1c24', marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
                    <p style={{ color: '#666' }}>Last updated: December 5, 2025</p>
                </div>

                <div style={{ lineHeight: '1.6', color: '#333' }}>
                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>1. Introduction</h2>
                        <p>Welcome to Retina Downloader ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our services.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>2. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you use our services, including:</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>Google Account information (email, name, profile picture) via Google OAuth.</li>
                            <li>Files you upload to Google Drive through our application.</li>
                            <li>Usage data and logs.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Process your file uploads to Google Drive.</li>
                            <li>Authenticate your identity and prevent fraud.</li>
                            <li>Communicate with you about our services.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>4. Data Security</h2>
                        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                        <p style={{ marginTop: '0.5rem', fontWeight: '500' }}>miftahul.huda@devoteam.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
