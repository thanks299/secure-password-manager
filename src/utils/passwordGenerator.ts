export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = 'il1Lo0O';
const AMBIGUOUS = '{}[]()/\\\'"`~,;.<>';

export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  
  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;
  
  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => !SIMILAR.includes(char)).join('');
  }
  
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(char => !AMBIGUOUS.includes(char)).join('');
  }
  
  if (charset.length === 0) {
    throw new Error('No character types selected');
  }
  
  const array = new Uint8Array(options.length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 10;
    feedback.push('Consider using a longer password (12+ characters)');
  } else {
    feedback.push('Password is too short (minimum 8 characters)');
  }
  
  // Character variety
  if (/[a-z]/.test(password)) score += 5;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 5;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 5;
  else feedback.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  else feedback.push('Add special characters');
  
  // Patterns and repetition
  if (!/(.)\1{2,}/.test(password)) score += 10;
  else feedback.push('Avoid repeating characters');
  
  if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) {
    score += 10;
  } else {
    feedback.push('Avoid sequential characters');
  }
  
  // Common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'login'];
  if (!commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score += 10;
  } else {
    feedback.push('Avoid common words and patterns');
  }
  
  // Entropy bonus
  const entropy = Math.log2(Math.pow(getCharsetSize(password), password.length));
  if (entropy > 60) score += 20;
  else if (entropy > 40) score += 10;
  
  let label: string;
  let color: string;
  
  if (score >= 80) {
    label = 'Very Strong';
    color = 'text-green-400';
  } else if (score >= 60) {
    label = 'Strong';
    color = 'text-blue-400';
  } else if (score >= 40) {
    label = 'Moderate';
    color = 'text-yellow-400';
  } else if (score >= 20) {
    label = 'Weak';
    color = 'text-orange-400';
  } else {
    label = 'Very Weak';
    color = 'text-red-400';
  }
  
  return { score: Math.min(score, 100), label, color, feedback };
}

function getCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^A-Za-z0-9]/.test(password)) size += 32;
  return size;
}