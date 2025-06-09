import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Check } from 'lucide-react';
import { generatePassword, calculatePasswordStrength, PasswordOptions } from '../utils/passwordGenerator';

interface PasswordGeneratorProps {
  onClose: () => void;
  defaultLength: number;
}

export default function PasswordGenerator({ onClose, defaultLength }: PasswordGeneratorProps) {
  const [options, setOptions] = useState<PasswordOptions>({
    length: defaultLength,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });
  
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState<ReturnType<typeof calculatePasswordStrength>>();

  useEffect(() => {
    generateNewPassword();
  }, [options]);

  const generateNewPassword = () => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
      setStrength(calculatePasswordStrength(newPassword));
    } catch (error) {
      console.error('Password generation failed:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl md:max-w-xl sm:max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Password Generator</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generated Password */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-4 py-3 pr-20 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                onClick={generateNewPassword}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Generate new password"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Copy password"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Password Strength */}
          {strength && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Strength</span>
                <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strength.score >= 80 ? 'bg-green-500' :
                    strength.score >= 60 ? 'bg-blue-500' :
                    strength.score >= 40 ? 'bg-yellow-500' :
                    strength.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${strength.score}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Length: {options.length}
            </label>
            <input
              type="range"
              min="4"
              max="128"
              value={options.length}
              onChange={(e) => updateOption('length', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Character Types */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300">Numbers (0-9)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300">Symbols (!@#$)</span>
            </label>
          </div>

          {/* Advanced Options */}
          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center space-x-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300">Exclude similar characters (il1Lo0O)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300">Exclude ambiguous characters ({}[]()...)</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {copied ? 'Copied!' : 'Copy Password'}
          </button>
        </div>
      </div>
    </div>
  );
}