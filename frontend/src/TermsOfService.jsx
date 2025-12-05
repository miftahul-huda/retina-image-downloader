import React from 'react';
import { FaFileContract, FaArrowLeft } from 'react-icons/fa';

function TermsOfService() {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ec1c24', textDecoration: 'none', fontWeight: '600' }}>
                    <FaArrowLeft /> Back to Home
                </a>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaFileContract style={{ fontSize: '3rem', color: '#ec1c24', marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
                    <p style={{ color: '#666' }}>Last updated: December 5, 2025</p>
                </div>

                <div style={{ lineHeight: '1.6', color: '#333' }}>
                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>1. Acceptance of Terms</h2>
                        <p>By accessing and using Retina Downloader, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Retina Downloader's website for personal, non-commercial transitory viewing only.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>3. Google Drive Integration</h2>
                        <p>Our service integrates with Google Drive. By using this feature, you agree to comply with Google's Terms of Service and Privacy Policy. You retain full ownership of your files.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>4. Disclaimer</h2>
                        <p>The materials on Retina Downloader's website are provided "as is". Retina Downloader makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>5. Limitations</h2>
                        <p>In no event shall Retina Downloader or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Retina Downloader's website.</p>
                    </section>

                    <section style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1a1a1a' }}>6. Governing Law</h2>
                        <p>Any claim relating to Retina Downloader's website shall be governed by the laws of Indonesia without regard to its conflict of law provisions.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;
