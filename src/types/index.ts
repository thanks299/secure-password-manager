export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website: string;
  category: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isFavorite?: boolean;
}

export interface AppSettings {
  autoLockTimeout: number;
  clipboardTimeout: number;
  defaultPasswordLength: number;
  theme: 'light' | 'dark';
}

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface User {
  id: string;
  email: string;
}

export interface VaultData {
  passwords: PasswordEntry[];
  version: string;
  lastSync: string;
}