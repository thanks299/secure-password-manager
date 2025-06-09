import React, { useState, useEffect } from 'react';
import { Shield, Lock, Plus, Search, Settings, Download, Upload, LogOut, FolderSync as Sync } from 'lucide-react';
import AuthModal from './components/AuthModal';
import PasswordGenerator from './components/PasswordGenerator';
import PasswordList from './components/PasswordList';
import AddEditPasswordModal from './components/AddEditPasswordModal';
import SettingsModal from './components/SettingsModal';
import { PasswordEntry, AppSettings, User } from './types';
import { generateKey } from './utils/encryption';
import { vaultService } from './services/vaultService';
import { supabase } from './lib/supabase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    autoLockTimeout: 15,
    clipboardTimeout: 30,
    defaultPasswordLength: 16,
    theme: 'dark'
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    if (isAuthenticated && masterKey && user) {
      loadData();
    }
  }, [isAuthenticated, masterKey, user]);

  const checkAuthState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email || '' });
    }
  };

  const loadData = async () => {
    if (!masterKey || !user) return;
    
    setIsLoading(true);
    try {
      const [loadedPasswords, loadedSettings] = await Promise.all([
        vaultService.loadPasswords(),
        vaultService.loadSettings()
      ]);
      
      setPasswords(loadedPasswords);
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = async (userId: string, masterPassword: string) => {
    try {
      const { key } = await generateKey(masterPassword);
      setMasterKey(key);
      setUser({ id: userId, email: '' });
      vaultService.setMasterKey(key, userId);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setMasterKey(null);
    setPasswords([]);
    setSettings({
      autoLockTimeout: 15,
      clipboardTimeout: 30,
      defaultPasswordLength: 16,
      theme: 'dark'
    });
  };

  const syncData = async () => {
    if (!masterKey || !user) return;
    
    setIsSyncing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddPassword = async (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPassword: PasswordEntry = {
      ...password,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedPasswords = [...passwords, newPassword];
    setPasswords(updatedPasswords);
    
    try {
      await vaultService.savePasswords(updatedPasswords);
    } catch (error) {
      console.error('Failed to save password:', error);
      setPasswords(passwords); // Revert on error
    }
  };

  const handleEditPassword = async (password: PasswordEntry) => {
    const updatedPasswords = passwords.map(p => 
      p.id === password.id ? { ...password, updatedAt: new Date() } : p
    );
    setPasswords(updatedPasswords);
    
    try {
      await vaultService.savePasswords(updatedPasswords);
    } catch (error) {
      console.error('Failed to update password:', error);
      await loadData(); // Reload on error
    }
  };

  const handleDeletePassword = async (id: string) => {
    const updatedPasswords = passwords.filter(p => p.id !== id);
    setPasswords(updatedPasswords);
    
    try {
      await vaultService.savePasswords(updatedPasswords);
    } catch (error) {
      console.error('Failed to delete password:', error);
      await loadData(); // Reload on error
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    
    try {
      await vaultService.saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const exportData = async () => {
    try {
      const exportData = await vaultService.exportVault();
      const dataBlob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await vaultService.importVault(text);
      await loadData(); // Reload data after import
      
      alert(`Import successful! Imported ${result.passwords} passwords and ${result.settings ? 'settings' : 'no settings'}.`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || password.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(passwords.map(p => p.category)))];

  if (!isAuthenticated) {
    return <AuthModal onAuthenticate={handleAuthentication} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
          <h1 className="text-xl font-bold text-white">SecureVault</h1>
          {user && (
            <p className="text-xs text-gray-400">{user.email}</p>
          )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center space-x-2">
          <button
          onClick={() => setShowGenerator(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
          >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Generate</span>
          </button>
          
          <button
          onClick={syncData}
          disabled={isSyncing}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50"
          title="Sync data"
          >
          <Sync className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
          onClick={exportData}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          title="Export data"
          >
          <Download className="w-5 h-5" />
          </button>
          
          <label className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer" title="Import data">
          <Upload className="w-5 h-5" />
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
          </label>
          
          <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
          <Settings className="w-5 h-5" />
          </button>
          
          <button
          onClick={handleSignOut}
          className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          title="Sign out"
          >
          <LogOut className="w-5 h-5" />
          </button>
        </div>
        </div>
      </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        </div>
        
        <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
          >
          {category.charAt(0).toUpperCase() + category.slice(1)}
          {category !== 'all' && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            {passwords.filter(p => p.category === category).length}
            </span>
          )}
          </button>
        ))}
        </div>
      </div>

      {/* Add Password Button */}
      <div className="mb-6">
        <button
        onClick={() => {
          setEditingPassword(null);
          setShowAddEdit(true);
        }}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
        <Plus className="w-5 h-5" />
        <span>Add New Password</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your vault...</p>
        </div>
      ) : (
        <PasswordList
        passwords={filteredPasswords}
        onEdit={(password) => {
          setEditingPassword(password);
          setShowAddEdit(true);
        }}
        onDelete={handleDeletePassword}
        clipboardTimeout={settings.clipboardTimeout}
        />
      )}
      </main>

      {/* Modals */}
      {showGenerator && (
      <PasswordGenerator
        onClose={() => setShowGenerator(false)}
        defaultLength={settings.defaultPasswordLength}
      />
      )}

      {showAddEdit && (
      <AddEditPasswordModal
        password={editingPassword}
        onSave={(password) => {
        if ('id' in password && 'createdAt' in password && 'updatedAt' in password) {
          handleEditPassword(password);
        } else {
          handleAddPassword(password);
        }
        }}
        onClose={() => {
        setShowAddEdit(false);
        setEditingPassword(null);
        }}
      />
      )}

      {showSettings && (
      <SettingsModal
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
      />
      )}
    </div>
  );
}

export default App;