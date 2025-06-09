import { supabase } from '../lib/supabase';
import { PasswordEntry, VaultData, AppSettings } from '../types';
import { encryptData, decryptData, arrayToHex, hexToArray } from '../utils/encryption';

export class VaultService {
  private masterKey: CryptoKey | null = null;
  private userId: string | null = null;

  setMasterKey(key: CryptoKey, userId: string) {
    this.masterKey = key;
    this.userId = userId;
  }

  async savePasswords(passwords: PasswordEntry[]): Promise<void> {
    if (!this.masterKey || !this.userId) {
      throw new Error('Not authenticated');
    }

    const vaultData: VaultData = {
      passwords,
      version: '1.0',
      lastSync: new Date().toISOString()
    };

    const encrypted = await encryptData(JSON.stringify(vaultData), this.masterKey);

    const { error } = await supabase
      .from('user_vaults')
      .upsert({
        user_id: this.userId,
        encrypted_data: encrypted.encryptedData,
        iv: encrypted.iv,
        salt: '', // Salt is managed during key derivation
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to save passwords: ${error.message}`);
    }
  }

  async loadPasswords(): Promise<PasswordEntry[]> {
    if (!this.masterKey || !this.userId) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_vaults')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return empty array
        return [];
      }
      throw new Error(`Failed to load passwords: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    try {
      const encryptedData = {
        encryptedData: data.encrypted_data,
        iv: data.iv,
        salt: data.salt
      };

      const decryptedData = await decryptData(encryptedData, this.masterKey);
      const vaultData: VaultData = JSON.parse(decryptedData);
      
      // Convert date strings back to Date objects
      return vaultData.passwords.map(password => ({
        ...password,
        createdAt: new Date(password.createdAt),
        updatedAt: new Date(password.updatedAt)
      }));
    } catch (decryptError) {
      throw new Error('Failed to decrypt vault data. Please check your master password.');
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.masterKey || !this.userId) {
      throw new Error('Not authenticated');
    }

    const encrypted = await encryptData(JSON.stringify(settings), this.masterKey);

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: this.userId,
        encrypted_settings: encrypted.encryptedData,
        iv: encrypted.iv,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to save settings: ${error.message}`);
    }
  }

  async loadSettings(): Promise<AppSettings | null> {
    if (!this.masterKey || !this.userId) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found
        return null;
      }
      throw new Error(`Failed to load settings: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    try {
      const encryptedData = {
        encryptedData: data.encrypted_settings,
        iv: data.iv,
        salt: ''
      };

      const decryptedData = await decryptData(encryptedData, this.masterKey);
      return JSON.parse(decryptedData);
    } catch (decryptError) {
      console.error('Failed to decrypt settings:', decryptError);
      return null;
    }
  }

  async exportVault(): Promise<string> {
    if (!this.masterKey || !this.userId) {
      throw new Error('Not authenticated');
    }

    const passwords = await this.loadPasswords();
    const settings = await this.loadSettings();

    const exportData = {
      passwords,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importVault(jsonData: string): Promise<{ passwords: number; settings: boolean }> {
    if (!this.masterKey || !this.userId) {
      throw new Error('Not authenticated');
    }

    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.passwords && Array.isArray(importData.passwords)) {
        await this.savePasswords(importData.passwords);
      }

      if (importData.settings) {
        await this.saveSettings(importData.settings);
      }

      return {
        passwords: importData.passwords?.length || 0,
        settings: !!importData.settings
      };
    } catch (error) {
      throw new Error('Invalid import file format');
    }
  }
}

export const vaultService = new VaultService();