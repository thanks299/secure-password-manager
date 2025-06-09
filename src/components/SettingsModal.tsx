import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto Lock Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Auto Lock Timeout (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.autoLockTimeout}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                autoLockTimeout: parseInt(e.target.value) || 15 
              }))}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              Automatically lock the vault after inactivity
            </p>
          </div>

          {/* Clipboard Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Clipboard Clear Timeout (seconds)
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={formData.clipboardTimeout}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                clipboardTimeout: parseInt(e.target.value) || 30 
              }))}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              Clear clipboard after copying passwords
            </p>
          </div>

          {/* Default Password Length */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Password Length
            </label>
            <input
              type="number"
              min="4"
              max="128"
              value={formData.defaultPasswordLength}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                defaultPasswordLength: parseInt(e.target.value) || 16 
              }))}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              Default length for generated passwords
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                theme: e.target.value as 'light' | 'dark' 
              }))}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="dark" className="bg-gray-800">Dark</option>
              <option value="light" className="bg-gray-800">Light</option>
            </select>
          </div>

          {/* Security Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Security Information</h3>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• All passwords are encrypted using AES-256-GCM</li>
              <li>• Your master password is never stored</li>
              <li>• Data is stored locally in your browser</li>
              <li>• Export your data regularly for backup</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}