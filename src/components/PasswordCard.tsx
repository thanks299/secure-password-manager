import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, ExternalLink, Check, Star } from 'lucide-react';
import { PasswordEntry } from '../types';
import { calculatePasswordStrength } from '../utils/passwordGenerator';

interface PasswordCardProps {
  password: PasswordEntry;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
  clipboardTimeout: number;
}

export default function PasswordCard({ password, onEdit, onDelete, clipboardTimeout }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const strength = calculatePasswordStrength(password.password);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), clipboardTimeout * 1000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWebsiteClick = () => {
    if (password.website) {
      const url = password.website.startsWith('http') ? password.website : `https://${password.website}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-black/30 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-white truncate">{password.title}</h3>
            {password.isFavorite && (
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">{password.username}</p>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(password)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Website */}
      {password.website && (
        <div className="mb-4">
          <button
            onClick={handleWebsiteClick}
            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="truncate">{password.website}</span>
          </button>
        </div>
      )}

      {/* Password Field */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Password</label>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleCopy(password.password, 'password')}
              className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
            >
              {copiedField === 'password' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password.password}
            readOnly
            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none"
          />
        </div>
        
        {/* Password Strength */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Strength</span>
            <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                strength.score >= 80 ? 'bg-green-500' :
                strength.score >= 60 ? 'bg-blue-500' :
                strength.score >= 40 ? 'bg-yellow-500' :
                strength.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${strength.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Username with Copy */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Username</label>
          <button
            onClick={() => handleCopy(password.username, 'username')}
            className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
          >
            {copiedField === 'username' ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <input
          type="text"
          value={password.username}
          readOnly
          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none mt-1"
        />
      </div>

      {/* Category and Tags */}
      <div className="flex items-center justify-between">
        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
          {password.category}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(password.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Notes Preview */}
      {password.notes && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 line-clamp-2">{password.notes}</p>
        </div>
      )}
    </div>
  );
}