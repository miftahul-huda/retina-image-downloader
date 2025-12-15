import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { FaDownload, FaSearch, FaTimes, FaCloudDownloadAlt, FaGoogle, FaCalendarAlt, FaMapMarkerAlt, FaImage, FaUser, FaBuilding, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import api from './api';
import AdminPanel from './AdminPanel';
import Modal from './Modal';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import './index.css';

function MainApp() {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    area: '',
    region: '',
    city: '',
    imageCategory: 'poster'
  });
  const [masterData, setMasterData] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadJobId, setDownloadJobId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [showExistingJobModal, setShowExistingJobModal] = useState(false);
  const [isClosingExistingModal, setIsClosingExistingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('downloads'); // 'downloads' or 'admin'
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [downloadCompleteModal, setDownloadCompleteModal] = useState({ isOpen: false, fileUrl: '' });
  const [emailConfirmModal, setEmailConfirmModal] = useState({ isOpen: false });
  const [cancelConfirmModal, setCancelConfirmModal] = useState({ isOpen: false });

  const uniqueAreas = [...new Set(masterData.map(d => d.area))].filter(Boolean);
  const uniqueRegions = [...new Set(masterData.filter(d => !filters.area || d.area === filters.area).map(d => d.region))].filter(Boolean);
  const uniqueCities = [...new Set(masterData.filter(d => (!filters.area || d.area === filters.area) && (!filters.region || d.region === filters.region)).map(d => d.city))].filter(Boolean);

  useEffect(() => {
    fetchMasterData();
    // Check if user is logged in (has token)
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Effect for checking active job on user login
  useEffect(() => {
    if (user) {
      checkActiveJob();
    }
  }, [user]);

  // Effect for pagination
  useEffect(() => {
    if (user && page > 1) {
      fetchUploads();
    }
  }, [page]);

  // Clear data when filters change
  useEffect(() => {
    setUploads([]);
    setTotalPages(1);
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (downloadJobId) {
      fetchDownloadStatus(); // Fetch immediately
      const interval = setInterval(() => {
        fetchDownloadStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [downloadJobId]);

  const checkActiveJob = async () => {
    try {
      const res = await api.get('/download/active');
      console.log("Checking active job...");
      console.log(res.data);

      if (res.data.active) {
        setDownloadJobId(res.data.jobId);
        setDownloading(true);
        if (res.data.progress) {
          // If job is queued, set the queue position
          if (res.data.status === 'queued') {
            setDownloadProgress({
              ...res.data.progress,
              queuePosition: res.data.queuePosition
            });
          } else {
            setDownloadProgress(res.data.progress);
          }
        } else if (res.data.status === 'queued') {
          // No progress yet but job is queued
          setDownloadProgress({
            status: 'queued',
            queuePosition: res.data.queuePosition
          });
        }
      }
    } catch (err) {
      console.error('Error checking active job:', err);
    }
  };

  // Google Login with Drive scope
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
    prompt: '', // Explicitly empty to prevent forced consent
    include_granted_scopes: true,
    onSuccess: async (codeResponse) => {
      try {
        // Send authorization code to backend
        const res = await api.post('/auth/google', {
          code: codeResponse.code
        });

        // Store token and user in localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      } catch (err) {
        console.error('Login failed:', err);

        // Show specific error message from backend in custom modal
        const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
        const errorTitle = err.response?.data?.error === 'User not registered'
          ? 'Account Not Registered'
          : 'Login Failed';

        setModal({
          isOpen: true,
          title: errorTitle,
          message: errorMessage,
          type: 'error'
        });
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      setModal({
        isOpen: true,
        title: 'Google Login Failed',
        message: 'There was an issue with Google login. Please try again.',
        type: 'error'
      });
    }
  });

  const fetchMasterData = async () => {
    try {
      const res = await api.get('/master-data');
      setMasterData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUploads = async (pageOverride) => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '',
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '',
        area: filters.area,
        region: filters.region,
        city: filters.city,
        imageCategory: filters.imageCategory,
        page: pageOverride || page,
        limit: 12
      };
      const res = await api.get('/uploads', { params });
      setUploads(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      alert('An error occurred while fetching data: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisplay = () => {
    // Validate date range - should not exceed 1 month (31 days)
    if (filters.startDate && filters.endDate) {
      const daysDifference = Math.ceil((filters.endDate - filters.startDate) / (1000 * 60 * 60 * 24));

      if (daysDifference > 31) {
        setModal({
          isOpen: true,
          title: 'Invalid Date Range',
          message: 'Date range is limited to 1 month maximum. Please select a shorter date range.',
          type: 'error'
        });
        return;
      }
    }

    setPage(1);
    fetchUploads(1);
  };

  const handleDownload = () => {
    // If already downloading, show cancel confirmation
    if (downloading) {
      setCancelConfirmModal({ isOpen: true });
      return;
    }

    // Validate date range - should not exceed 1 month (31 days)
    if (filters.startDate && filters.endDate) {
      const daysDifference = Math.ceil((filters.endDate - filters.startDate) / (1000 * 60 * 60 * 24));

      if (daysDifference > 31) {
        setModal({
          isOpen: true,
          title: 'Invalid Date Range',
          message: 'Date range is limited to 1 month maximum. Please select a shorter date range.',
          type: 'error'
        });
        return;
      }
    }

    // Show email confirmation modal
    setEmailConfirmModal({ isOpen: true });
  };

  const proceedWithDownload = async (sendEmail) => {
    setDownloading(true);
    setDownloadProgress(null);
    try {
      const params = {
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '',
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '',
        area: filters.area,
        region: filters.region,
        city: filters.city,
        imageCategory: filters.imageCategory,
        sendEmail: sendEmail
      };

      console.log("Starting download with params:", params);

      const response = await api.post('/download/start', params);

      setDownloadJobId(response.data.jobId);
      console.log("Download job ID:", response.data.jobId);

      // Check if job was queued
      if (response.data.queued) {
        setDownloadProgress({
          status: 'queued',
          queuePosition: response.data.position
        });
      }

      setDownloading(true);
      checkActiveJob();

    } catch (err) {
      console.error('Download failed', err);

      // Handle case where user already has an active/queued job
      if (err.response && err.response.status === 400 && err.response.data.existingJobId) {
        setDownloadJobId(err.response.data.existingJobId);
        setDownloading(true);
        if (err.response.data.status === 'queued') {
          setDownloadProgress({
            status: 'queued',
            queuePosition: err.response.data.queuePosition
          });
        }
        // Show custom modal instead of alert
        setShowExistingJobModal(true);
      } else {
        alert('Download failed. Please try again.');
        setDownloading(false);
      }
    }
  };

  const handleCancelDownload = async () => {
    try {
      await api.post(`/download/cancel/${downloadJobId}`);
      setDownloading(false);
      setDownloadJobId(null);
      setDownloadProgress(null);
      closeExistingJobModal();
    } catch (err) {
      console.error('Error cancelling download:', err);
      alert('Failed to cancel download.');
    }
  };

  const closeExistingJobModal = () => {
    setIsClosingExistingModal(true);
    setTimeout(() => {
      setShowExistingJobModal(false);
      setIsClosingExistingModal(false);
    }, 200);
  };

  const fetchDownloadStatus = async () => {
    try {
      const res = await api.get(`/download/status/${downloadJobId}`);
      setDownloadProgress(res.data);

      // Show modal when download is completed successfully
      console.log("Download status:", res.data);
      if (res.data.status === 'completed' && res.data.zipUrl) {
        setDownloadCompleteModal({ isOpen: true, fileUrl: res.data.zipUrl });
        // Reset UI after showing modal
        setTimeout(() => {
          setDownloading(false);
          setDownloadJobId(null);
          setDownloadProgress(null);
        }, 1000);
      }
      // Reset UI when email is sent or job failed/cancelled
      else if (res.data.status === 'email_sent' || res.data.status === 'failed' || res.data.status === 'cancelled') {
        // Wait 3 seconds to let user see the final status then reset
        setTimeout(() => {
          setDownloading(false);
          setDownloadJobId(null);
          setDownloadProgress(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error fetching download status', err);
    }
  };

  // handleLogin is now handled by GoogleLogin component

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUploads([]);
    setDownloading(false);
    setDownloadJobId(null);
    setDownloadProgress(null);
  };

  return (
    <div className="app">
      <header className="header">
        <a href="/" className="logo">
          <FaImage /> Retina Downloader
        </a>
        {user && user.isAdmin && (
          <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', marginRight: '2rem' }}>
            <button
              onClick={() => setActiveTab('downloads')}
              style={{
                background: activeTab === 'downloads' ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: activeTab === 'downloads' ? '600' : '400'
              }}
            >
              <FaDownload /> Downloads
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                background: activeTab === 'admin' ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: activeTab === 'admin' ? '600' : '400'
              }}
            >
              <FaShieldAlt /> Admin
            </button>
          </div>
        )}
        <div className="user-profile">
          {user ? (
            <>
              <div style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user.photo ? (
                  <img src={user.photo} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white' }} />
                ) : (
                  <FaUser style={{ color: "white", fontSize: "24px" }} />
                )}
                <div style={{ color: "white" }}>{user.displayName}</div>
                <button onClick={handleLogout} className="btn btn-outline"><FaSignOutAlt /> Logout</button>
              </div>

            </>
          ) : (
            <button onClick={googleLogin} className="btn btn-primary">
              <FaGoogle /> Login with Google
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {!user ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Please login to use the application.</h2>
          </div>
        ) : activeTab === 'admin' && user.isAdmin ? (
          <AdminPanel />
        ) : (
          <>
            <div className="filters-bar">
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt /> Date Range</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <DatePicker
                    selected={filters.startDate}
                    onChange={date => setFilters({ ...filters, startDate: date })}
                    selectsStart
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    className="form-input"
                    placeholderText="Start Date"
                    dateFormat="dd MMM yyyy"
                  />
                  <DatePicker
                    selected={filters.endDate}
                    onChange={date => setFilters({ ...filters, endDate: date })}
                    selectsEnd
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    minDate={filters.startDate}
                    className="form-input"
                    placeholderText="End Date"
                    dateFormat="dd MMM yyyy"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt /> Area</label>
                <select
                  className="form-select"
                  value={filters.area}
                  onChange={e => setFilters({ ...filters, area: e.target.value, region: '', city: '' })}
                >
                  <option value="">All Areas</option>
                  {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt /> Region</label>
                <select
                  className="form-select"
                  value={filters.region}
                  onChange={e => setFilters({ ...filters, region: e.target.value, city: '' })}
                  disabled={!filters.area}
                >
                  <option value="">All Regions</option>
                  {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt /> City</label>
                <select
                  className="form-select"
                  value={filters.city}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                  disabled={!filters.region}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label"><FaImage /> Tipe Gambar</label>
                <select
                  className="form-select"
                  value={filters.imageCategory}
                  onChange={e => setFilters({ ...filters, imageCategory: e.target.value })}
                >
                  <option value="poster">Poster</option>
                  <option value="etalase">Etalase</option>
                  <option value="storefront">Storefront</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleDisplay}
                  disabled={loading}
                >
                  <FaSearch /> Display
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {downloading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderTopColor: 'white' }}></div> : <FaCloudDownloadAlt />}
                  {downloading ? ' Click to Cancel' : ' Download All'}
                </button>
              </div>
            </div>

            {downloadProgress && (
              <div className="download-status">
                {downloadProgress.status === 'queued' && (
                  <>
                    <p><strong>In Queue - Position #{downloadProgress.queuePosition}</strong></p>
                    <p>Your download request is queued. It will start automatically when the current download completes.</p>
                    <button className="btn btn-danger" onClick={handleCancelDownload} style={{ marginTop: '0.5rem' }}>Cancel Request</button>
                  </>
                )}
                {downloadProgress.status !== 'queued' && (
                  <>
                    {/* Show running animation during active processing */}
                    {(downloadProgress.status === 'processing' || downloadProgress.status === 'zipping') && (
                      <div className="running-animation">
                        <div className="running-person">🏃</div>
                        <div className="running-person">🏃</div>
                        <div className="running-person">🏃</div>
                        <div className="running-track"></div>
                      </div>
                    )}

                    <p>Status: <strong>{downloadProgress.status.replace(/_/g, ' ').toUpperCase()}</strong></p>
                    {downloadProgress.status === 'starting' && (
                      <p>Starting download job... Please wait.</p>
                    )}
                    {downloadProgress.status === 'processing' && (
                      <p>Downloading file {downloadProgress.downloadedFiles} of {downloadProgress.totalFiles}...</p>
                    )}
                    {downloadProgress.status === 'zipping' && (
                      <p>Zipping files... This may take a moment.</p>
                    )}
                    {downloadProgress.status === 'zipping_completed' && (
                      <p>Zipping completed. Preparing upload...</p>
                    )}
                    {downloadProgress.status === 'uploading_to_drive' && (
                      <p>Uploading to Google Drive... {downloadProgress.uploadPercentage ? `${downloadProgress.uploadPercentage}%` : ''}</p>
                    )}
                    {downloadProgress.status === 'drive_upload_completed' && (
                      <p>Upload to Drive completed. Sending email...</p>
                    )}
                    {downloadProgress.status === 'sending_email' && (
                      <p>Sending notification email...</p>
                    )}
                    {downloadProgress.status === 'email_sent' && (
                      <p>Email sent! Finishing up...</p>
                    )}
                    {downloadProgress.status === 'completed' && (
                      <p>Download complete! The file has been uploaded to your Google Drive. Check your email for the link.</p>
                    )}
                    {downloadProgress.status === 'cancelled' && (
                      <p className="text-error">Download cancelled.</p>
                    )}
                    {downloadProgress.status === 'failed' && (
                      <p className="text-error">Download failed. Please try again.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="loading-spinner" style={{ width: 48, height: 48 }}></div>
              </div>
            ) : (
              <div className="grid-container">
                {uploads.map(upload => (
                  <div key={upload.id} className="card" onClick={() => setSelectedImage(upload)}>
                    <img src={import.meta.env.VITE_API_URL + upload.thumbnailUrl} alt={upload.OUTLET_NAME} className="card-image" loading="lazy" />
                    <div className="card-body">
                      <div className="card-title"><FaBuilding style={{ marginRight: '0.5rem', color: 'var(--primary-red)' }} /> {upload.OUTLET_NAME}</div>
                      <div className="card-meta"><FaCalendarAlt style={{ marginRight: '0.5rem' }} /> {format(new Date(upload.createdAt), 'dd MMM yyyy HH:mm')}</div>
                      <div className="card-meta"><FaMapMarkerAlt style={{ marginRight: '0.5rem' }} /> {upload.OUTLET_CITY}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && uploads.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-grey)' }}>
                No images found matching your filters.
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
                <button
                  className="btn btn-outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
                <button
                  className="btn btn-outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: '#666', borderTop: '1px solid #eee', marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} Retina Downloader. All rights reserved.</p>
        <div style={{ marginTop: '0.5rem' }}>
          <Link to="/privacy-policy" style={{ color: '#666', textDecoration: 'none', margin: '0 0.5rem' }}>Privacy Policy</Link>
          |
          <Link to="/terms-of-service" style={{ color: '#666', textDecoration: 'none', margin: '0 0.5rem' }}>Terms of Service</Link>
        </div>
      </footer>

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedImage(null)}><FaTimes /></button>
            <img src={selectedImage.thumbnailUrl} alt={selectedImage.OUTLET_NAME} className="modal-image" />
            <div className="modal-details">
              <h3>{selectedImage.OUTLET_NAME}</h3>
              <p><strong><FaCalendarAlt /> Date:</strong> {format(new Date(selectedImage.createdAt), 'dd MMM yyyy HH:mm')}</p>
              <p><strong><FaUser /> Uploader:</strong> {selectedImage.UPLOADER_EMAIL} ({selectedImage.UPLOADER_SFCODE})</p>
              <p><strong><FaMapMarkerAlt /> Location:</strong> {selectedImage.OUTLET_CITY}, {selectedImage.OUTLET_REGION}, {selectedImage.OUTLET_AREA}</p>
              <a href={selectedImage.thumbnailUrl} download target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
                <FaDownload /> Download Image
              </a>
            </div>
          </div>
        </div>
      )}

      {showExistingJobModal && (
        <div className={`modal-overlay ${isClosingExistingModal ? 'closing' : ''}`} onClick={closeExistingJobModal}>
          <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeExistingJobModal}><FaTimes /></button>
            <h3>Download Already in Progress</h3>
            <p>You already have an active or queued download request. Please wait for it to complete or cancel it before starting a new one.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeExistingJobModal}>Close</button>
              <button className="btn btn-primary btn-danger" onClick={handleCancelDownload}>Cancel Download</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Email Confirmation Modal */}
      <Modal
        isOpen={emailConfirmModal.isOpen}
        onClose={() => setEmailConfirmModal({ isOpen: false })}
        title="Send Email Notification?"
        message="Would you like to receive an email with the download link when the file is ready?"
        type="confirm"
        onConfirm={() => proceedWithDownload(true)}
        onCancel={() => proceedWithDownload(false)}
        confirmText="Yes, send email"
        cancelText="No, skip email"
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelConfirmModal.isOpen}
        onClose={() => setCancelConfirmModal({ isOpen: false })}
        title="Cancel Download?"
        message="Are you sure you want to cancel this download? All progress will be lost."
        type="confirm"
        onConfirm={() => {
          handleCancelDownload();
          setCancelConfirmModal({ isOpen: false });
        }}
        onCancel={() => setCancelConfirmModal({ isOpen: false })}
        confirmText="Yes, cancel download"
        cancelText="No, continue"
      />

      {/* Download Complete Modal */}
      {downloadCompleteModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDownloadCompleteModal({ isOpen: false, fileUrl: '' })}>
          <div className="modal-content modal-alert" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setDownloadCompleteModal({ isOpen: false, fileUrl: '' })}>
              <FaTimes />
            </button>
            <div className="modal-icon" style={{ color: '#27ae60', fontSize: '4rem' }}>
              <FaCloudDownloadAlt />
            </div>
            <h2 className="modal-title">Download Complete!</h2>
            <p className="modal-message">
              Your files have been successfully downloaded and zipped. Click the link below to download your file:
            </p>
            <a
              href={downloadCompleteModal.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                marginTop: '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaDownload /> Download ZIP File
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </Router>
  );
}

export default App;
