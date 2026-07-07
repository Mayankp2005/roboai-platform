import React, { useState } from 'react';
import { Mail, Key, LogIn, UserPlus } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;


  const handleForgotPassword = async () => {
    if (!email) {
      onError('Please enter your email address first to reset password');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      onSuccess('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      onError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        onSuccess('Account created successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess('Successfully signed in');
      }
      onClose();
    } catch (error: any) {
      console.error("Email Auth Error Code:", error.code);
      console.error("Email Auth Error Message:", error.message);
      if (error.code === 'auth/invalid-api-key') {
         onError('Authentication failed: Firebase is not fully configured yet. Please add your config keys to src/firebase.ts!');
      } else if (error.code === 'auth/operation-not-allowed') {
         onError('Email/Password Authentication is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method!');
      } else {
         onError(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="prompt-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ width: '380px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSignUp ? 'Sign up to save your projects to the cloud.' : 'Log in to continue where you left off.'}
          </p>
        </div>


        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="prompt-input"
              style={{ margin: 0, paddingLeft: '38px' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="prompt-input"
              style={{ margin: 0, paddingLeft: '38px' }}
            />
          </div>

          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              cursor: 'pointer',
              fontSize: '0.85rem',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
};
