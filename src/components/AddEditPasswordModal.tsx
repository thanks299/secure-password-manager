import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, RefreshCw, Star } from 'lucide-react';
import { PasswordEntry } from '../types';
import { generatePassword, calculatePasswordStrength } from '../utils/passwordGenerator';

interface AddEditPasswordModalProps {
  password?: PasswordEntry | null;
  onSave: (password: PasswordEntry | Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export default function AddEditPasswordModal({ password, onSave, onClose }: AddEditPasswordModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    category: 'general',
    notes: '',
    isFavorite: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof calculatePasswordStrength>>();

  useEffect(() => {
    if (password) {
      setFormData({
        title: password.title,
        username: password.username,
        password: password.password,
        website: password.website,
        category: password.category,
        notes: password.notes || '',
        isFavorite: password.isFavorite || false,
      });
    }
    
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [password]);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [formData.password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password) {
      onSave({
        ...password,
        ...formData,
      });
    } else {
      onSave(formData);
    }
    
    onClose();
  };

  const generateNewPassword = () => {
    const newPassword = generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
    });
    
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const categories = [
    'general',
    'social',
    'work',
    'finance',
    'shopping',
    'entertainment',
    'utilities',
    'travel',
    'health',
    'education'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {password ? 'Edit Password' : 'Add New Password'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Gmail, GitHub, Bank Account"
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username/Email *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="your@email.com or username"
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter or generate a password"
                className="w-full px-4 py-3 pr-20 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  type="button"
                  onClick={generateNewPassword}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Generate password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Password Strength */}
            {passwordStrength && formData.password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Strength</span>
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 80 ? 'bg-green-500' :
                      passwordStrength.score >= 60 ? 'bg-blue-500' :
                      passwordStrength.score >= 40 ? 'bg-yellow-500' :
                      passwordStrength.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${passwordStrength.score}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Favorite */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
              />
              <div className="flex items-center space-x-2">
                <Star className={`w-4 h-4 ${formData.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-300">Mark as favorite</span>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or information"
              rows={3}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {password ? 'Update Password' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
}