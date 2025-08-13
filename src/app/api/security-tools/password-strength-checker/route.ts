import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      password,
      includeSuggestions = true,
      includeAnalysis = true,
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true
    } = body;

    // Input validation
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required and must be a string' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: 'Password too long. Maximum 128 characters' },
        { status: 400 }
      );
    }

    if (typeof includeSuggestions !== 'boolean' || typeof includeAnalysis !== 'boolean') {
      return NextResponse.json(
        { error: 'Boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(minLength) || minLength < 1 || minLength > 32) {
      return NextResponse.json(
        { error: 'Min length must be between 1 and 32' },
        { status: 400 }
      );
    }

    if (typeof requireUppercase !== 'boolean' || typeof requireLowercase !== 'boolean' || 
        typeof requireNumbers !== 'boolean' || typeof requireSpecialChars !== 'boolean') {
      return NextResponse.json(
        { error: 'Requirement flags must be boolean values' },
        { status: 400 }
      );
    }

    // Analyze password strength
    const analysis = analyzePasswordStrength(password, {
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars
    });

    // Generate suggestions if requested
    let suggestions: string[] = [];
    if (includeSuggestions) {
      suggestions = generatePasswordSuggestions(analysis, {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialChars
      });
    }

    // Calculate crack time estimation
    const crackTime = estimateCrackTime(password);

    // Check against common passwords
    const commonPasswordCheck = checkCommonPasswords(password);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity and password security expert. Analyze the password strength assessment and provide insights about password security, best practices, and recommendations for improvement.'
          },
          {
            role: 'user',
            content: `Analyzed password strength: ${analysis.score}/100 (${analysis.strength}). Length: ${password.length}, meets requirements: ${analysis.meetsRequirements}. ${commonPasswordCheck.isCommon ? 'Found in common passwords list.' : 'Not a common password.'} Estimated crack time: ${crackTime.time}. ${includeSuggestions ? `Suggestions provided: ${suggestions.length}.` : ''} Provide insights about password security and best practices.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      password: {
        length: password.length,
        masked: maskPassword(password)
      },
      strength: {
        score: analysis.score,
        strength: analysis.strength,
        meetsRequirements: analysis.meetsRequirements,
        requirements: analysis.requirements
      },
      analysis: includeAnalysis ? analysis.detailedAnalysis : undefined,
      suggestions: includeSuggestions ? suggestions : undefined,
      crackTime,
      commonPasswordCheck,
      parameters: {
        includeSuggestions,
        includeAnalysis,
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialChars
      },
      aiInsights
    });

  } catch (error) {
    console.error('Password strength check error:', error);
    return NextResponse.json(
      { error: 'Failed to check password strength' },
      { status: 500 }
    );
  }
}

// Helper functions
function analyzePasswordStrength(password: string, requirements: any): any {
  const analysis: any = {
    score: 0,
    strength: 'Very Weak',
    meetsRequirements: true,
    requirements: {},
    detailedAnalysis: {}
  };

  // Length analysis
  const lengthScore = Math.min(password.length * 4, 40);
  analysis.score += lengthScore;
  analysis.detailedAnalysis.length = {
    score: lengthScore,
    length: password.length,
    recommendation: password.length < 8 ? 'Password too short' : 'Good length'
  };

  // Character variety analysis
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const varietyScore = (hasUppercase ? 10 : 0) + (hasLowercase ? 10 : 0) + (hasNumbers ? 10 : 0) + (hasSpecialChars ? 15 : 0);
  analysis.score += varietyScore;
  analysis.detailedAnalysis.characterVariety = {
    score: varietyScore,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialChars,
    varietyCount: [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length
  };

  // Entropy analysis
  const entropy = calculateEntropy(password);
  const entropyScore = Math.min(entropy * 2, 30);
  analysis.score += entropyScore;
  analysis.detailedAnalysis.entropy = {
    score: entropyScore,
    entropy: entropy,
    bits: entropy.toFixed(2)
  };

  // Pattern analysis
  const patternAnalysis = analyzePatterns(password);
  const patternScore = patternAnalysis.score;
  analysis.score += patternScore;
  analysis.detailedAnalysis.patterns = patternAnalysis;

  // Check requirements
  analysis.requirements = {
    minLength: password.length >= requirements.minLength,
    requireUppercase: !requirements.requireUppercase || hasUppercase,
    requireLowercase: !requirements.requireLowercase || hasLowercase,
    requireNumbers: !requirements.requireNumbers || hasNumbers,
    requireSpecialChars: !requirements.requireSpecialChars || hasSpecialChars
  };

  analysis.meetsRequirements = Object.values(analysis.requirements).every(req => req);

  // Deductions for common patterns
  if (patternAnalysis.hasCommonPatterns) {
    analysis.score -= 20;
  }

  // Deductions for repeated characters
  const repeatedChars = (password.match(/(.)\1{2,}/g) || []).length;
  if (repeatedChars > 0) {
    analysis.score -= repeatedChars * 5;
  }

  // Deductions for sequential characters
  const sequentialChars = findSequentialChars(password);
  if (sequentialChars > 0) {
    analysis.score -= sequentialChars * 10;
  }

  // Ensure score is within bounds
  analysis.score = Math.max(0, Math.min(100, analysis.score));

  // Determine strength level
  if (analysis.score >= 80) {
    analysis.strength = 'Very Strong';
  } else if (analysis.score >= 60) {
    analysis.strength = 'Strong';
  } else if (analysis.score >= 40) {
    analysis.strength = 'Medium';
  } else if (analysis.score >= 20) {
    analysis.strength = 'Weak';
  } else {
    analysis.strength = 'Very Weak';
  }

  return analysis;
}

function calculateEntropy(password: string): number {
  const charSet = new Set(password);
  const poolSize = charSet.size;
  return password.length * Math.log2(poolSize);
}

function analyzePatterns(password: string): any {
  const patterns: any = {
    hasCommonPatterns: false,
    hasKeyboardPatterns: false,
    hasDatePatterns: false,
    hasRepeatingPatterns: false,
    score: 0
  };

  // Check for common patterns
  const commonPatterns = [
    /123456/, /234567/, /345678/, /456789/, /567890/,
    /qwerty/, /asdfgh/, /zxcvbn/,
    /abcde/, /bcdef/, /cdefg/, /defgh/, /efghi/,
    /password/, /admin/, /user/, /login/, /welcome/
  ];

  patterns.hasCommonPatterns = commonPatterns.some(pattern => 
    pattern.test(password.toLowerCase())
  );

  // Check for keyboard patterns
  const keyboardPatterns = [
    /qwer/, /wert/, /erty/, /rtyu/, /tyui/,
    /asdf/, /sdfg/, /dfgh/, /fghj/, /ghjk/,
    /zxcv/, /xcvb/, /cvbn/, /vbnm/
  ];

  patterns.hasKeyboardPatterns = keyboardPatterns.some(pattern => 
    pattern.test(password.toLowerCase())
  );

  // Check for date patterns
  const datePatterns = [
    /\d{2}\/\d{2}\/\d{4}/,
    /\d{4}-\d{2}-\d{2}/,
    /\d{2}-\d{2}-\d{4}/
  ];

  patterns.hasDatePatterns = datePatterns.some(pattern => pattern.test(password));

  // Check for repeating patterns
  patterns.hasRepeatingPatterns = /(.)\1{3,}/.test(password);

  // Calculate score
  patterns.score = patterns.hasCommonPatterns ? -10 : 0;
  patterns.score += patterns.hasKeyboardPatterns ? -10 : 0;
  patterns.score += patterns.hasDatePatterns ? -5 : 0;
  patterns.score += patterns.hasRepeatingPatterns ? -15 : 0;

  return patterns;
}

function findSequentialChars(password: string): number {
  let sequentialCount = 0;
  const lowerPassword = password.toLowerCase();
  
  for (let i = 0; i < lowerPassword.length - 2; i++) {
    const char1 = lowerPassword.charCodeAt(i);
    const char2 = lowerPassword.charCodeAt(i + 1);
    const char3 = lowerPassword.charCodeAt(i + 2);
    
    // Check for ascending sequence
    if (char2 === char1 + 1 && char3 === char2 + 1) {
      sequentialCount++;
    }
    // Check for descending sequence
    else if (char2 === char1 - 1 && char3 === char2 - 1) {
      sequentialCount++;
    }
  }
  
  return sequentialCount;
}

function generatePasswordSuggestions(analysis: any, requirements: any): string[] {
  const suggestions: string[] = [];

  // Length suggestions
  if (analysis.detailedAnalysis.length.length < requirements.minLength) {
    suggestions.push(`Increase password length to at least ${requirements.minLength} characters`);
  } else if (analysis.detailedAnalysis.length.length < 12) {
    suggestions.push('Consider using a longer password (12+ characters) for better security');
  }

  // Character variety suggestions
  if (!analysis.detailedAnalysis.characterVariety.hasUppercase && requirements.requireUppercase) {
    suggestions.push('Add uppercase letters (A-Z)');
  }
  if (!analysis.detailedAnalysis.characterVariety.hasLowercase && requirements.requireLowercase) {
    suggestions.push('Add lowercase letters (a-z)');
  }
  if (!analysis.detailedAnalysis.characterVariety.hasNumbers && requirements.requireNumbers) {
    suggestions.push('Add numbers (0-9)');
  }
  if (!analysis.detailedAnalysis.characterVariety.hasSpecialChars && requirements.requireSpecialChars) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  // Pattern suggestions
  if (analysis.detailedAnalysis.patterns.hasCommonPatterns) {
    suggestions.push('Avoid common patterns and sequences');
  }
  if (analysis.detailedAnalysis.patterns.hasKeyboardPatterns) {
    suggestions.push('Avoid keyboard patterns like "qwerty" or "asdf"');
  }
  if (analysis.detailedAnalysis.patterns.hasDatePatterns) {
    suggestions.push('Avoid using dates in your password');
  }
  if (analysis.detailedAnalysis.patterns.hasRepeatingPatterns) {
    suggestions.push('Avoid repeating characters');
  }

  // Entropy suggestions
  if (analysis.detailedAnalysis.entropy.entropy < 50) {
    suggestions.push('Use a more complex combination of characters to increase entropy');
  }

  // General suggestions
  if (analysis.score < 60) {
    suggestions.push('Consider using a passphrase (multiple random words)');
    suggestions.push('Use a password manager to generate and store complex passwords');
  }

  return suggestions;
}

function estimateCrackTime(password: string): any {
  const entropy = calculateEntropy(password);
  const combinations = Math.pow(2, entropy);
  
  // Assuming 1 billion guesses per second (modern GPU)
  const guessesPerSecond = 1000000000;
  const secondsToCrack = combinations / guessesPerSecond;
  
  const timeUnits = [
    { unit: 'seconds', value: 1 },
    { unit: 'minutes', value: 60 },
    { unit: 'hours', value: 3600 },
    { unit: 'days', value: 86400 },
    { unit: 'months', value: 2592000 },
    { unit: 'years', value: 31536000 },
    { unit: 'centuries', value: 3153600000 }
  ];
  
  let time = secondsToCrack;
  let timeString = '';
  
  for (let i = timeUnits.length - 1; i >= 0; i--) {
    const unit = timeUnits[i];
    if (time >= unit.value) {
      const amount = Math.floor(time / unit.value);
      timeString = `${amount} ${unit.unit}`;
      break;
    }
  }
  
  if (!timeString) {
    timeString = 'Less than 1 second';
  }
  
  return {
    time: timeString,
    seconds: secondsToCrack,
    entropy: entropy,
    securityLevel: entropy >= 100 ? 'Excellent' : entropy >= 80 ? 'Good' : entropy >= 60 ? 'Fair' : 'Poor'
  };
}

function checkCommonPasswords(password: string): any {
  const commonPasswords = [
    'password', '123456', '12345678', '123456789', '12345',
    'qwerty', 'abc123', '111111', '123123', 'admin',
    'letmein', 'welcome', 'monkey', 'password1', 'sunshine'
  ];
  
  const isCommon = commonPasswords.includes(password.toLowerCase());
  
  return {
    isCommon,
    commonPassword: isCommon ? password.toLowerCase() : null,
    recommendation: isCommon ? 'This is a very common password and should be changed immediately' : 'Not found in common passwords list'
  };
}

function maskPassword(password: string): string {
  if (password.length <= 2) {
    return '*'.repeat(password.length);
  }
  
  const firstChar = password[0];
  const lastChar = password[password.length - 1];
  const maskedLength = password.length - 2;
  
  return firstChar + '*'.repeat(maskedLength) + lastChar;
}

export async function GET() {
  return NextResponse.json({
    message: 'Password Strength Checker API',
    usage: 'POST /api/security-tools/password-strength-checker',
    parameters: {
      password: 'Password to analyze (required)',
      includeSuggestions: 'Include improvement suggestions (default: true) - optional',
      includeAnalysis: 'Include detailed analysis (default: true) - optional',
      minLength: 'Minimum required length (1-32, default: 8) - optional',
      requireUppercase: 'Require uppercase letters (default: true) - optional',
      requireLowercase: 'Require lowercase letters (default: true) - optional',
      requireNumbers: 'Require numbers (default: true) - optional',
      requireSpecialChars: 'Require special characters (default: true) - optional'
    },
    strengthLevels: {
      '0-20': 'Very Weak',
      '21-40': 'Weak',
      '41-60': 'Medium',
      '61-80': 'Strong',
      '81-100': 'Very Strong'
    },
    analysisFactors: [
      'Password length',
      'Character variety (uppercase, lowercase, numbers, special chars)',
      'Entropy (randomness)',
      'Pattern detection (common patterns, sequences, repetitions)',
      'Common password check'
    ],
    examples: [
      {
        password: 'weak123',
        includeSuggestions: true,
        includeAnalysis: true
      },
      {
        password: 'Str0ngP@ssw0rd!',
        includeSuggestions: true,
        includeAnalysis: true
      }
    ],
    tips: [
      'Use at least 12 characters for better security',
      'Include a mix of uppercase, lowercase, numbers, and special characters',
      'Avoid common patterns, keyboard sequences, and personal information',
      'Use unique passwords for each account',
      'Consider using a password manager for complex passwords'
    ]
  });
}