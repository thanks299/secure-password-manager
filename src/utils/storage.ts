export function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(`secureVault_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function loadFromStorage(key: string): any {
  try {
    const item = localStorage.getItem(`secureVault_${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`secureVault_${key}`);
  } catch (error) {
    console.error('Failed to remove from storage:', error);
  }
}