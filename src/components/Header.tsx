import { Sun, Moon, Power, Play, Flag, LogOut, User as UserIcon, Bluetooth } from 'lucide-react';
import * as Blockly from 'blockly/core';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface HeaderProps {
  activeTab: 'blocks' | 'code' | 'circuit' | 'data' | 'manual';
  onTabChange: (tab: 'blocks' | 'code' | 'circuit' | 'data' | 'manual') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: User | null;
  onSignInClick: () => void;
  isConnected: boolean;
  onConnectDevice: () => void;
  isBleConnected?: boolean;
  onConnectBluetooth?: () => void;
  onFlash: () => void;
  onRunSimulation: () => void;
  logoUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab, onTabChange, theme, onToggleTheme,
  user, onSignInClick, isConnected,
  onConnectDevice, isBleConnected, onConnectBluetooth,
  onFlash, onRunSimulation,
  logoUrl,
}) => {
  const handleTabChange = (tab: 'blocks' | 'code' | 'circuit' | 'data' | 'manual') => {
    onTabChange(tab);
    try { Blockly.hideChaff(); } catch (e) { console.error(e); }
  };

  return (
    <header className="app-header">
      <div className="logo-section">
        <div className="logo-icon" style={{ overflow: 'hidden', padding: 0 }}>
          <img src={logoUrl} alt="RoboAI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span className="logo-text">ROBOAI HUB</span>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'blocks' ? 'active' : ''}`} onClick={() => handleTabChange('blocks')}>
          Visual Builder
        </button>
        <button className={`tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => handleTabChange('code')}>
          C++ Firmware
        </button>
        <button className={`tab ${activeTab === 'circuit' ? 'active' : ''}`} onClick={() => handleTabChange('circuit')}>
          Circuit Simulator
        </button>
        <button className={`tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => handleTabChange('data')}>
          Data Studio
        </button>
        <button className={`tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => handleTabChange('manual')}>
          Student Manual
        </button>
      </div>

      <div className="header-actions">
        {user ? (
          <div className="user-pill">
            <div className="user-avatar">
              <UserIcon size={14} />
            </div>
            <span className="user-name">
              {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
            </span>
            <button className="btn user-logout-btn" onClick={() => signOut(auth)} title="Sign Out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="btn btn-outline user-signin-btn" onClick={onSignInClick}>
            <UserIcon size={14} /> Sign In
          </button>
        )}

        <button
          onClick={onToggleTheme}
          className="btn btn-outline theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {activeTab !== 'circuit' && (
          <>
            <div className="divider-line"></div>
            
            <button className="btn btn-outline btn-run-sim" onClick={onRunSimulation}>
              <Flag size={16} fill="currentColor" />
              Run Simulation
            </button>
            <button className={`btn ${isConnected ? 'btn-success' : 'btn-outline'}`} onClick={onConnectDevice} title="Connect via USB Serial">
              <Power size={16} />
              {isConnected ? 'Serial Connected' : 'Connect USB'}
            </button>
            <button className={`btn ${isBleConnected ? 'btn-success' : 'btn-outline'}`} onClick={onConnectBluetooth} title="Connect via Bluetooth">
              <Bluetooth size={16} />
              {isBleConnected ? 'BLE Connected' : 'Connect BLE'}
            </button>
            <button className="btn btn-primary" disabled={!isConnected} style={{ opacity: isConnected ? 1 : 0.5 }} onClick={onFlash}>
              <Play size={16} fill="currentColor" />
              Flash & Run
            </button>
          </>
        )}
      </div>
    </header>
  );
};
