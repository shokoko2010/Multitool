import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      min = 0,
      max = 100,
      count = 1,
      allowDuplicates = true,
      precision = 0,
      distribution = 'uniform'
    } = body;

    // Input validation
    if (typeof min !== 'number' || typeof max !== 'number') {
      return NextResponse.json(
        { error: 'Min and max must be numbers' },
        { status: 400 }
      );
    }

    if (min >= max) {
      return NextResponse.json(
        { error: 'Min must be less than max' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(count) || count < 1 || count > 10000) {
      return NextResponse.json(
        { error: 'Count must be an integer between 1 and 10000' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(precision) || precision < 0 || precision > 10) {
      return NextResponse.json(
        { error: 'Precision must be an integer between 0 and 10' },
        { status: 400 }
      );
    }

    if (!['uniform', 'normal', 'exponential'].includes(distribution)) {
      return NextResponse.json(
        { error: 'Distribution must be uniform, normal, or exponential' },
        { status: 400 }
      );
    }

    // Generate random numbers
    const numbers: number[] = [];
    const usedNumbers = new Set<number>();

    for (let i = 0; i < count; i++) {
      let num: number;

      if (distribution === 'uniform') {
        // Uniform distribution
        const range = max - min;
        const randomBytes = crypto.randomBytes(4);
        const randomValue = randomBytes.readUInt32BE(0) / 0xffffffff;
        num = min + randomValue * range;
      } else if (distribution === 'normal') {
        // Normal distribution using Box-Muller transform
        const u1 = crypto.randomBytes(4).readUInt32BE(0) / 0xffffffff;
        const u2 = crypto.randomBytes(4).readUInt32BE(0) / 0xffffffff;
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const mean = (min + max) / 2;
        const stdDev = (max - min) / 6; // 99.7% of values within min-max
        num = mean + z0 * stdDev;
        // Clamp to range
        num = Math.max(min, Math.min(max, num));
      } else {
        // Exponential distribution
        const lambda = 1 / ((max - min) / 3); // Adjust lambda based on range
        const u = crypto.randomBytes(4).readUInt32BE(0) / 0xffffffff;
        num = min - Math.log(1 - u) / lambda;
        // Clamp to range
        num = Math.max(min, Math.min(max, num));
      }

      // Apply precision
      num = Number(num.toFixed(precision));

      // Handle duplicates
      if (!allowDuplicates) {
        if (usedNumbers.has(num)) {
          i--; // Retry this iteration
          continue;
        }
        usedNumbers.add(num);
      }

      numbers.push(num);
    }

    // Calculate statistics
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const mean = sum / numbers.length;
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    const standardDeviation = Math.sqrt(variance);

    const statistics = {
      count: numbers.length,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      mean: Number(mean.toFixed(precision)),
      median: sortedNumbers.length % 2 === 0 ?
        Number((sortedNumbers[sortedNumbers.length / 2 - 1] + sortedNumbers[sortedNumbers.length / 2]) / 2).toFixed(precision) :
        Number(sortedNumbers[Math.floor(sortedNumbers.length / 2)]).toFixed(precision),
      mode: calculateMode(numbers, precision),
      standardDeviation: Number(standardDeviation.toFixed(precision)),
      variance: Number(variance.toFixed(precision)),
      range: Number((Math.max(...numbers) - Math.min(...numbers)).toFixed(precision))
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a statistics and mathematics expert. Analyze the random number generation and provide insights about the distribution and statistical properties.'
          },
          {
            role: 'user',
            content: `Generated ${count} random numbers with ${distribution} distribution between ${min} and ${max} with ${precision} decimal places. Statistics: mean=${statistics.mean}, std=${statistics.standardDeviation}, range=${statistics.range}. Provide analysis of the distribution and statistical significance.`
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
      numbers,
      statistics,
      parameters: {
        min,
        max,
        count,
        allowDuplicates,
        precision,
        distribution
      },
      aiInsights
    });

  } catch (error) {
    console.error('Random number generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate random numbers' },
      { status: 500 }
    );
  }
}

function calculateMode(numbers: number[], precision: number): string {
  const frequency: Record<number, number> = {};
  
  for (const num of numbers) {
    const key = Number(num.toFixed(precision));
    frequency[key] = (frequency[key] || 0) + 1;
  }
  
  let maxFrequency = 0;
  let modes: number[] = [];
  
  for (const [num, freq] of Object.entries(frequency)) {
    if (freq > maxFrequency) {
      maxFrequency = freq;
      modes = [Number(num)];
    } else if (freq === maxFrequency) {
      modes.push(Number(num));
    }
  }
  
  if (maxFrequency === 1 || modes.length === numbers.length) {
    return 'No mode (all unique)';
  }
  
  return modes.map(m => m.toFixed(precision)).join(', ');
}

export async function GET() {
  return NextResponse.json({
    message: 'Random Number Generator API',
    usage: 'POST /api/math-tools/random-number-generator',
    parameters: {
      min: 'Minimum value (default: 0) - optional',
      max: 'Maximum value (default: 100) - optional',
      count: 'Number of random numbers to generate (1-10000, default: 1) - optional',
      allowDuplicates: 'Allow duplicate numbers (default: true) - optional',
      precision: 'Number of decimal places (0-10, default: 0) - optional',
      distribution: 'Distribution type: uniform, normal, or exponential (default: uniform) - optional'
    },
    distributions: {
      uniform: 'Equal probability across the range',
      normal: 'Bell curve distribution (Gaussian)',
      exponential: 'Exponential decay distribution'
    },
    example: {
      min: 1,
      max: 100,
      count: 10,
      allowDuplicates: false,
      precision: 2,
      distribution: 'uniform'
    }
  });
}