import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginAdmin, verifyOTP, resendOTP, clearAuthError, resetOtpState } from '../../store/slices/authSlice';
import './AdminLogin.css';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, otpSent, otpEmail, otpMessage } = useSelector(
    (state) => state.auth
  );

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(resetOtpState());
    return () => { dispatch(clearAuthError()); dispatch(resetOtpState()); };
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) interval = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleChange = (e) => {
    if (error) dispatch(clearAuthError());
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOtpChange = (e) => {
    if (error) dispatch(clearAuthError());
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) setOtp(val);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (credentials.email && credentials.password) dispatch(loginAdmin(credentials));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6 && otpEmail) dispatch(verifyOTP({ email: otpEmail, otp }));
  };

  const handleResendOtp = () => {
    if (otpEmail && timer === 0) { setTimer(300); setOtp(''); dispatch(clearAuthError()); dispatch(resendOTP(otpEmail)); }
  };

  const handleBackToLogin = () => { dispatch(resetOtpState()); setOtp(''); setTimer(300); };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="al-page">
      {/* Dark background with subtle grid */}
      <div className="al-bg" />

      <div className="al-wrapper">

        {/* ═══════ LEFT COLUMN: Branding ═══════ */}
        <div className="al-left">
          {/* Logo */}
          <div className="al-logo">
            <div className="al-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2h1zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/>
              </svg>
            </div>
            <div>
              <div className="al-logo-name">Saqib Ali <span>Rind</span></div>
              <div className="al-logo-role">MERN STACK DEVELOPER</div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="al-welcome">
            <h1 className="al-welcome-title">Welcome Back</h1>
            <p className="al-welcome-sub">Sign in to your account to continue.</p>
          </div>

          {/* Quote */}
          <p className="al-quote">"Great things never come from comfort zones."</p>
        </div>

        {/* ═══════ CENTER COLUMN: Form ═══════ */}
        <div className="al-center">
          <div className="al-form-card">
            <div className="al-form-title-row">
              <div>
                <h2 className="al-form-heading">{otpSent ? 'Verify OTP' : 'Login'}</h2>
                <p className="al-form-sub">{otpSent ? 'Enter the 6-digit code sent to your email' : 'Access your portfolio dashboard'}</p>
              </div>
              <span className="al-dot" />
            </div>

            {(error || otpMessage) && (
              <div className={`al-alert ${error ? 'al-err' : 'al-ok'}`}>{error || otpMessage}</div>
            )}

            {!otpSent ? (
              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="al-field">
                  <label>Email Address</label>
                  <div className="al-inp-wrap">
                    <svg className="al-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="email" name="email" value={credentials.email} onChange={handleChange}
                      placeholder="saqibrind46@gmail.com" disabled={loading} required autoComplete="email" />
                  </div>
                </div>

                <div className="al-field">
                  <label>Password</label>
                  <div className="al-inp-wrap">
                    <svg className="al-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={credentials.password}
                      onChange={handleChange} placeholder="••••••••••••" disabled={loading} required autoComplete="current-password"/>
                    <button type="button" className="al-eye" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                      {showPassword
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                <div className="al-opts">
                  <label className="al-chk">
                    <input type="checkbox" />
                    <span className="al-chkbox" />
                    Remember me
                  </label>
                  <a href="#" className="al-forgot">Forgot password?</a>
                </div>

                <button type="submit" className="al-submit" disabled={loading || !credentials.email || !credentials.password}>
                  {loading ? 'Authenticating...' : 'Sign In →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} noValidate>
                <div className="al-field">
                  <label>One-Time Password</label>
                  <div className="al-inp-wrap">
                    <svg className="al-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="text" value={otp} onChange={handleOtpChange} placeholder="123456"
                      disabled={loading} required autoComplete="one-time-code" className="al-otp-inp"/>
                  </div>
                </div>
                <div className="al-otp-bar">
                  <span className={`al-timer ${timer < 60 ? 'al-timer-warn' : ''}`}>⏱ {formatTime(timer)}</span>
                  <button type="button" className="al-resend" onClick={handleResendOtp} disabled={timer > 0 || loading}>Resend OTP</button>
                </div>
                <button type="submit" className="al-submit" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Login →'}
                </button>
                <button type="button" className="al-back" onClick={handleBackToLogin} disabled={loading}>Back to Login</button>
              </form>
            )}

            <div className="al-footer-note">
              <p>Don't have an account? <Link to="/#contact">Contact Me</Link></p>
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT COLUMN: 3D Padlock ═══════ */}
        <div className="al-right">
          <div className="al-lock-scene">
            {/* Outer ring */}
            <div className="al-ring al-ring-1" />
            <div className="al-ring al-ring-2" />
            {/* Padlock body */}
            <div className="al-lock-body">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#lgrd)" strokeWidth="1.2" strokeLinecap="round">
                <defs>
                  <linearGradient id="lgrd" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1.5" fill="#f97316" stroke="none"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
