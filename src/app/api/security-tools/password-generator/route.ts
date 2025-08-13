import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  requireEach: boolean;
  customSymbols: string;
  customExclude: string;
  quantity: number;
  separator: string;
  prefix: string;
  suffix: string;
}

interface PasswordStrength {
  score: number;
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  entropy: number;
  crackTime: string;
  feedback: string[];
}

interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
  characterTypes: {
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  };
  patterns: string[];
}

interface GenerationResult {
  success: boolean;
  passwords: GeneratedPassword[];
  options: PasswordOptions;
  statistics: {
    totalGenerated: number;
    averageStrength: number;
    averageEntropy: number;
    generationTime: number;
  };
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { options = {} } = body;

    // Default options
    const defaultOptions: PasswordOptions = {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      requireEach: true,
      customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      customExclude: '',
      quantity: 1,
      separator: '',
      prefix: '',
      suffix: '',
    };

    const finalOptions: PasswordOptions = { ...defaultOptions, ...options };

    // Validate options
    if (finalOptions.length < 1 || finalOptions.length > 128) {
      return NextResponse.json(
        { error: 'Password length must be between 1 and 128 characters' },
        { status: 400 }
      );
    }

    if (finalOptions.quantity < 1 || finalOptions.quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (!finalOptions.includeUppercase && 
        !finalOptions.includeLowercase && 
        !finalOptions.includeNumbers && 
        !finalOptions.includeSymbols) {
      return NextResponse.json(
        { error: 'At least one character type must be included' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Generate passwords
    const passwords = generatePasswords(finalOptions);
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;

    // Calculate statistics
    const totalGenerated = passwords.length;
    const averageStrength = passwords.reduce((sum, p) => sum + p.strength.score, 0) / totalGenerated;
    const averageEntropy = passwords.reduce((sum, p) => sum + p.strength.entropy, 0) / totalGenerated;

    // Generate recommendations
    const recommendations = generateRecommendations(passwords, finalOptions);

    const result: GenerationResult = {
      success: true,
      passwords,
      options: finalOptions,
      statistics: {
        totalGenerated,
        averageStrength,
        averageEntropy,
        generationTime,
      },
      recommendations,
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a password security expert. Provide insights about password generation and security best practices.'
          },
          {
            role: 'user',
            content: `Analyze this password generation operation:
            - Generated ${totalGenerated} passwords
            - Average length: ${finalOptions.length} characters
            - Average strength score: ${averageStrength.toFixed(2)}/100
            - Average entropy: ${averageEntropy.toFixed(2)} bits
            
            Provide insights about:
            1. Password security effectiveness
            2. Best practices for password management
            3. Recommendations for improvement
            Keep it concise and informative.`
          }
        ],
        max_tokens: 250,
        temperature: 0.3,
      });

      aiInsights = completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiInsights = 'AI analysis unavailable';
    }

    return NextResponse.json({
      result,
      aiInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Password generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during password generation' },
      { status: 500 }
    );
  }
}

function generatePasswords(options: PasswordOptions): GeneratedPassword[] {
  const passwords: GeneratedPassword[] = [];

  // Define character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = options.customSymbols || '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Characters to exclude
  const similarChars = 'il1Lo0O';
  const ambiguousChars = '{}[]()/\\\'"`~,;.<>';

  let charset = '';
  const requiredChars: string[] = [];

  if (options.includeUppercase) {
    let chars = uppercase;
    if (options.excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    if (options.excludeAmbiguous) chars = chars.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
    charset += chars;
    if (options.requireEach) requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (options.includeLowercase) {
    let chars = lowercase;
    if (options.excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    if (options.excludeAmbiguous) chars = chars.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
    charset += chars;
    if (options.requireEach) requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (options.includeNumbers) {
    let chars = numbers;
    if (options.excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    charset += chars;
    if (options.requireEach) requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (options.includeSymbols) {
    let chars = symbols;
    if (options.excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    if (options.excludeAmbiguous) chars = chars.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
    charset += chars;
    if (options.requireEach) requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  // Apply custom exclusions
  if (options.customExclude) {
    charset = charset.replace(new RegExp(`[${options.customExclude}]`, 'g'), '');
  }

  if (charset.length === 0) {
    throw new Error('No characters available for password generation');
  }

  // Generate passwords
  for (let i = 0; i < options.quantity; i++) {
    let password = '';
    const remainingLength = options.length - requiredChars.length;

    // Generate random characters
    for (let j = 0; j < remainingLength; j++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Add required characters
    for (const char of requiredChars) {
      const position = Math.floor(Math.random() * (password.length + 1));
      password = password.slice(0, position) + char + password.slice(position);
    }

    // Add prefix and suffix
    password = options.prefix + password + options.suffix;

    // Analyze password
    const strength = calculatePasswordStrength(password, charset.length);
    const characterTypes = analyzeCharacterTypes(password);
    const patterns = detectPatterns(password);

    passwords.push({
      password,
      strength,
      characterTypes,
      patterns,
    });
  }

  return passwords;
}

function calculatePasswordStrength(password: string, charsetSize: number): PasswordStrength {
  // Calculate entropy
  const entropy = password.length * Math.log2(charsetSize);

  // Calculate score based on various factors
  let score = 0;
  const feedback: string[] = [];

  // Length score
  if (password.length >= 12) score += 30;
  else if (password.length >= 8) score += 20;
  else if (password.length >= 6) score += 10;
  else feedback.push('Password is too short');

  // Character variety score
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
  score += varietyCount * 15;

  if (varietyCount < 3) {
    feedback.push('Include more character types (uppercase, lowercase, numbers, symbols)');
  }

  // Entropy score
  if (entropy >= 100) score += 30;
  else if (entropy >= 80) score += 25;
  else if (entropy >= 60) score += 20;
  else if (entropy >= 40) score += 15;
  else if (entropy >= 20) score += 10;
  else feedback.push('Low entropy - make password longer or use more character types');

  // Pattern detection
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequences = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  const hasCommonWords = /(password|qwerty|letmein|welcome|admin|user|login|abc123)/i.test(password);

  if (hasRepeatingChars) {
    score -= 10;
    feedback.push('Avoid repeating characters');
  }

  if (hasSequences) {
    score -= 10;
    feedback.push('Avoid sequential characters');
  }

  if (hasCommonWords) {
    score -= 15;
    feedback.push('Avoid common words and patterns');
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Determine strength level
  let level: PasswordStrength['level'] = 'very-weak';
  if (score >= 90) level = 'very-strong';
  else if (score >= 70) level = 'strong';
  else if (score >= 50) level = 'good';
  else if (score >= 30) level = 'fair';
  else if (score >= 15) level = 'weak';

  // Calculate crack time (very rough estimate)
  let crackTime = 'instant';
  if (entropy >= 100) crackTime = 'centuries';
  else if (entropy >= 80) crackTime = 'years';
  else if (entropy >= 60) crackTime = 'months';
  else if (entropy >= 40) crackTime = 'days';
  else if (entropy >= 20) crackTime = 'hours';
  else if (entropy >= 10) crackTime = 'minutes';

  return {
    score,
    level,
    entropy,
    crackTime,
    feedback,
  };
}

function analyzeCharacterTypes(password: string) {
  return {
    uppercase: (password.match(/[A-Z]/g) || []).length,
    lowercase: (password.match(/[a-z]/g) || []).length,
    numbers: (password.match(/\d/g) || []).length,
    symbols: (password.match(/[^A-Za-z0-9]/g) || []).length,
  };
}

function detectPatterns(password: string): string[] {
  const patterns: string[] = [];

  // Check for repeating characters
  if (/(.)\1{2,}/.test(password)) {
    patterns.push('repeating characters');
  }

  // Check for sequences
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    patterns.push('sequential characters');
  }

  // Check for common words
  if (/(password|qwerty|letmein|welcome|admin|user|login|abc123)/i.test(password)) {
    patterns.push('common words');
  }

  // Check for keyboard patterns
  if (/(qwerty|asdfgh|zxcvbn|123456|098765)/i.test(password)) {
    patterns.push('keyboard patterns');
  }

  // Check for dates
  if (/\d{2}[-\/]\d{2}[-\/]\d{4}/.test(password) || /\d{4}[-\/]\d{2}[-\/]\d{2}/.test(password)) {
    patterns.push('date patterns');
  }

  // Check for phone numbers
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(password)) {
    patterns.push('phone number patterns');
  }

  return patterns;
}

function generateRecommendations(passwords: GeneratedPassword[], options: PasswordOptions): string[] {
  const recommendations: string[] = [];
  const avgStrength = passwords.reduce((sum, p) => sum + p.strength.score, 0) / passwords.length;

  if (avgStrength < 50) {
    recommendations.push('Increase password length for better security');
    recommendations.push('Include more character types (uppercase, lowercase, numbers, symbols)');
  }

  if (options.length < 12) {
    recommendations.push('Consider using passwords of at least 12 characters');
  }

  if (!options.includeSymbols) {
    recommendations.push('Include symbols for stronger passwords');
  }

  if (options.excludeSimilar) {
    recommendations.push('Excluding similar characters reduces password strength - consider enabling them');
  }

  if (passwords.some(p => p.patterns.length > 0)) {
    recommendations.push('Avoid passwords with predictable patterns');
  }

  recommendations.push('Use a password manager to store generated passwords securely');
  recommendations.push('Enable two-factor authentication where possible');
  recommendations.push('Use unique passwords for each account');

  return recommendations;
}