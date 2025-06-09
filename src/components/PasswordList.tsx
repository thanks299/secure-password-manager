import React from 'react';
import { PasswordEntry } from '../types';
import PasswordCard from './PasswordCard';

interface PasswordListProps {
  passwords: PasswordEntry[];
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
  clipboardTimeout: number;
}

export default function PasswordList({ passwords, onEdit, onDelete, clipboardTimeout }: PasswordListProps) {
  if (passwords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No passwords found</h3>
        <p className="text-gray-400">Add your first password to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {passwords.map((password) => (
        <PasswordCard
          key={password.id}
          password={password}
          onEdit={onEdit}
          onDelete={onDelete}
          clipboardTimeout={clipboardTimeout}
        />
      ))}
    </div>
  );
}