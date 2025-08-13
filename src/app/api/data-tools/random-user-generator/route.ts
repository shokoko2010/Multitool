import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface UserGenerationOptions {
  quantity: number;
  nationality: string;
  gender: 'male' | 'female' | 'random';
  ageRange: {
    min: number;
    max: number;
  };
  includeProfile: boolean;
  includeAddress: boolean;
  includeContact: boolean;
  includeEmployment: boolean;
  includeOnline: boolean;
  seed?: string;
  format: 'full' | 'minimal' | 'detailed';
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  nationality: string;
  profile: {
    avatar: string;
    bio: string;
    interests: string[];
    personality: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  employment: {
    company: string;
    position: string;
    department: string;
    salary: number;
    startDate: string;
  };
  online: {
    username: string;
    domain: string;
    ip: string;
    userAgent: string;
  };
}

interface GenerationResult {
  success: boolean;
  users: UserProfile[];
  options: UserGenerationOptions;
  statistics: {
    totalGenerated: number;
    generationTime: number;
    nationalities: Record<string, number>;
    ageDistribution: {
      min: number;
      max: number;
      average: number;
    };
    genderDistribution: Record<string, number>;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// Data sources
const FIRST_NAMES = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura']
};

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const NATIONALITIES = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'BG', 'GR', 'PT'];

const COMPANIES = ['TechCorp', 'DataSystems', 'CloudNet', 'InfoTech', 'CyberSoft', 'DigitalSolutions', 'WebServices', 'AppDevelopment', 'SoftwareHouse', 'ITConsulting'];

const POSITIONS = ['Software Engineer', 'Data Analyst', 'Project Manager', 'UX Designer', 'DevOps Engineer', 'Product Manager', 'Business Analyst', 'System Administrator', 'Database Administrator', 'Network Engineer'];

const DEPARTMENTS = ['Engineering', 'Data Science', 'Design', 'Operations', 'Product', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'];

const INTERESTS = ['Technology', 'Sports', 'Music', 'Reading', 'Travel', 'Cooking', 'Photography', 'Gaming', 'Movies', 'Art', 'Fitness', 'Nature'];

const PERSONALITY_TRAITS = ['Friendly', 'Analytical', 'Creative', 'Organized', 'Adventurous', 'Calm', 'Energetic', 'Thoughtful', 'Outgoing', 'Reserved'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { options = {} } = body;

    // Default options
    const defaultOptions: UserGenerationOptions = {
      quantity: 1,
      nationality: 'random',
      gender: 'random',
      ageRange: { min: 18, max: 80 },
      includeProfile: true,
      includeAddress: true,
      includeContact: true,
      includeEmployment: true,
      includeOnline: true,
      format: 'full',
    };

    const finalOptions: UserGenerationOptions = { ...defaultOptions, ...options };

    // Validate options
    if (finalOptions.quantity < 1 || finalOptions.quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (finalOptions.ageRange.min < 1 || finalOptions.ageRange.max > 120) {
      return NextResponse.json(
        { error: 'Age range must be between 1 and 120' },
        { status: 400 }
      );
    }

    if (finalOptions.ageRange.min > finalOptions.ageRange.max) {
      return NextResponse.json(
        { error: 'Minimum age must be less than or equal to maximum age' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Generate users
    const users = generateUsers(finalOptions);
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;

    // Calculate statistics
    const statistics = calculateStatistics(users, generationTime);

    // Validate results
    const validation = validateUsers(users, finalOptions);

    const result: GenerationResult = {
      success: validation.isValid,
      users,
      options: finalOptions,
      statistics,
      validation,
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a data generation expert. Provide insights about random user generation and data privacy considerations.'
          },
          {
            role: 'user',
            content: `Analyze this random user generation operation:
            - Generated ${users.length} users
            - Age range: ${finalOptions.ageRange.min}-${finalOptions.ageRange.max}
            - Nationality: ${finalOptions.nationality}
            - Format: ${finalOptions.format}
            
            Provide insights about:
            1. Data generation quality and diversity
            2. Privacy and ethical considerations
            3. Best practices for using synthetic data
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
    console.error('Random user generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during user generation' },
      { status: 500 }
    );
  }
}

function generateUsers(options: UserGenerationOptions): UserProfile[] {
  const users: UserProfile[] = [];
  
  // Set up seed for reproducible results
  if (options.seed) {
    // Simple seed implementation - in production, use a proper RNG
    Math.seedrandom = function(seed) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
  }

  for (let i = 0; i < options.quantity; i++) {
    const user = generateSingleUser(options, i);
    users.push(user);
  }

  return users;
}

function generateSingleUser(options: UserGenerationOptions, index: number): UserProfile {
  // Determine gender
  let gender: string;
  if (options.gender === 'random') {
    gender = Math.random() < 0.5 ? 'male' : 'female';
  } else {
    gender = options.gender;
  }

  // Generate name
  const firstName = getRandomElement(FIRST_NAMES[gender as keyof typeof FIRST_NAMES]);
  const lastName = getRandomElement(LAST_NAMES);

  // Generate age
  const age = Math.floor(Math.random() * (options.ageRange.max - options.ageRange.min + 1)) + options.ageRange.min;

  // Generate date of birth
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1; // Simplified - doesn't handle month variations
  const dateOfBirth = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;

  // Determine nationality
  let nationality: string;
  if (options.nationality === 'random') {
    nationality = getRandomElement(NATIONALITIES);
  } else {
    nationality = options.nationality;
  }

  const user: UserProfile = {
    id: generateId(index),
    firstName,
    lastName,
    gender,
    age,
    dateOfBirth,
    nationality,
    profile: {
      avatar: '',
      bio: '',
      interests: [],
      personality: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    contact: {
      email: '',
      phone: '',
    },
    employment: {
      company: '',
      position: '',
      department: '',
      salary: 0,
      startDate: '',
    },
    online: {
      username: '',
      domain: '',
      ip: '',
      userAgent: '',
    },
  };

  // Generate profile information
  if (options.includeProfile) {
    user.profile = {
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
      bio: generateBio(firstName, age),
      interests: getRandomElements(INTERESTS, Math.floor(Math.random() * 5) + 1),
      personality: getRandomElement(PERSONALITY_TRAITS),
    };
  }

  // Generate address information
  if (options.includeAddress) {
    user.address = generateAddress(nationality);
  }

  // Generate contact information
  if (options.includeContact) {
    user.contact = {
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      website: Math.random() < 0.3 ? generateWebsite(firstName, lastName) : undefined,
    };
  }

  // Generate employment information
  if (options.includeEmployment) {
    user.employment = generateEmployment(age);
  }

  // Generate online information
  if (options.includeOnline) {
    user.online = generateOnline(firstName, lastName);
  }

  // Apply format
  if (options.format === 'minimal') {
    // Keep only essential fields
    const minimalUser: UserProfile = {
      ...user,
      profile: {
        avatar: user.profile.avatar,
        bio: '',
        interests: [],
        personality: '',
      },
      address: {
        street: '',
        city: user.address.city,
        state: '',
        zipCode: '',
        country: user.address.country,
        coordinates: { latitude: 0, longitude: 0 },
      },
      contact: {
        email: user.contact.email,
        phone: '',
      },
      employment: {
        company: '',
        position: '',
        department: '',
        salary: 0,
        startDate: '',
      },
      online: {
        username: '',
        domain: '',
        ip: '',
        userAgent: '',
      },
    };
    return minimalUser;
  }

  return user;
}

function generateId(index: number): string {
  return `user_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateBio(firstName: string, age: number): string {
  const bios = [
    `${firstName} is a passionate individual who loves exploring new opportunities and meeting new people.`,
    `With ${age} years of life experience, ${firstName} brings wisdom and enthusiasm to everything they do.`,
    `${firstName} believes in continuous learning and personal growth.`,
    `A creative thinker with a practical approach, ${firstName} enjoys solving complex problems.`,
    `${firstName} values authenticity and meaningful connections with others.`,
  ];
  return getRandomElement(bios);
}

function generateAddress(nationality: string): UserProfile['address'] {
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Birch Way', 'Willow Ct'];
  const cities = {
    'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
    'UK': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Glasgow'],
    'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle'],
    'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dresden', 'Hannover'],
    'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
  };

  const countryCities = cities[nationality as keyof typeof cities] || cities.US;
  const city = getRandomElement(countryCities);
  
  return {
    street: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streets)}`,
    city,
    state: 'State',
    zipCode: Math.floor(Math.random() * 99999).toString().padStart(5, '0'),
    country: nationality,
    coordinates: {
      latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
      longitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
    },
  };
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  return `${username}@${getRandomElement(domains)}`;
}

function generatePhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${exchange}-${number}`;
}

function generateWebsite(firstName: string, lastName): string {
  const domains = ['com', 'net', 'org', 'io', 'co'];
  return `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.${getRandomElement(domains)}`;
}

function generateEmployment(age: number): UserProfile['employment'] {
  const company = getRandomElement(COMPANIES);
  const position = getRandomElement(POSITIONS);
  const department = getRandomElement(DEPARTMENTS);
  
  // Salary based on position and age (simplified)
  const baseSalary = 50000;
  const experienceBonus = Math.max(0, age - 22) * 2000;
  const positionMultiplier = position.includes('Senior') ? 1.5 : position.includes('Manager') ? 1.3 : 1.0;
  const salary = Math.floor((baseSalary + experienceBonus) * positionMultiplier);

  // Start date (simplified)
  const yearsAtCompany = Math.floor(Math.random() * Math.min(age - 18, 10)) + 1;
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - yearsAtCompany);

  return {
    company,
    position,
    department,
    salary,
    startDate: startDate.toISOString().split('T')[0],
  };
}

function generateOnline(firstName: string, lastName: string): UserProfile['online'] {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  ];

  return {
    username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
    domain: getRandomElement(domains),
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: getRandomElement(userAgents),
  };
}

function calculateStatistics(users: UserProfile[], generationTime: number) {
  const nationalities: Record<string, number> = {};
  const ageDistribution = { min: 999, max: 0, average: 0 };
  const genderDistribution: Record<string, number> = {};

  let totalAge = 0;

  for (const user of users) {
    // Nationalities
    nationalities[user.nationality] = (nationalities[user.nationality] || 0) + 1;

    // Age distribution
    ageDistribution.min = Math.min(ageDistribution.min, user.age);
    ageDistribution.max = Math.max(ageDistribution.max, user.age);
    totalAge += user.age;

    // Gender distribution
    genderDistribution[user.gender] = (genderDistribution[user.gender] || 0) + 1;
  }

  ageDistribution.average = totalAge / users.length;

  return {
    totalGenerated: users.length,
    generationTime,
    nationalities,
    ageDistribution,
    genderDistribution,
  };
}

function validateUsers(users: UserProfile[], options: UserGenerationOptions) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  if (users.length !== options.quantity) {
    errors.push(`Expected ${options.quantity} users, got ${users.length}`);
    isValid = false;
  }

  for (const user of users) {
    if (!user.firstName || !user.lastName) {
      errors.push(`User ${user.id} is missing name`);
      isValid = false;
    }

    if (user.age < options.ageRange.min || user.age > options.ageRange.max) {
      warnings.push(`User ${user.id} age ${user.age} is outside specified range`);
    }

    if (options.gender !== 'random' && user.gender !== options.gender) {
      errors.push(`User ${user.id} gender mismatch`);
      isValid = false;
    }
  }

  return {
    isValid,
    errors,
    warnings,
  };
}

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}