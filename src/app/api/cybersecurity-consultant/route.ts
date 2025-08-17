import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface CybersecurityConsultantRequest {
  organizationType?: string;
  industry?: string;
  currentSecurityPosture?: string;
  securityChallenges?: string;
  budget?: string;
  timeline?: string;
  regulatoryRequirements?: string;
  threatLandscape?: string;
  securityMaturity?: string;
  complianceGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CybersecurityConsultantRequest;
    
    const {
      organizationType = '',
      industry = '',
      currentSecurityPosture = '',
      securityChallenges = '',
      budget = '',
      timeline = '',
      regulatoryRequirements = '',
      threatLandscape = '',
      securityMaturity = '',
      complianceGoals = ''
    } = body;

    if (!organizationType.trim()) {
      return NextResponse.json(
        { error: 'Organization type is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Cybersecurity Consultant, provide comprehensive cybersecurity strategy and guidance for the following organization:

Organization Type: ${organizationType}
Industry: ${industry}
Current Security Posture: ${currentSecurityPosture}
Security Challenges: ${securityChallenges}
Budget: ${budget}
Timeline: ${timeline}
Regulatory Requirements: ${regulatoryRequirements}
Threat Landscape: ${threatLandscape}
Security Maturity: ${securityMaturity}
Compliance Goals: ${complianceGoals}

Please provide detailed cybersecurity guidance including:
1. Security assessment and risk analysis
2. Security architecture and framework design
3. Threat detection and prevention strategies
4. Incident response and recovery planning
5. Security awareness and training programs
6. Compliance and regulatory alignment
7. Security technology stack recommendations
8. Security operations and monitoring
9. Third-party risk management
10. Implementation roadmap and governance

Format your response as a comprehensive cybersecurity strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Cybersecurity Consultant with expertise in security architecture, risk management, threat detection, and compliance frameworks. You provide practical, security-focused guidance with implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const cybersecurityGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        industry,
        currentSecurityPosture,
        securityChallenges,
        budget,
        timeline,
        regulatoryRequirements,
        threatLandscape,
        securityMaturity,
        complianceGoals,
        cybersecurityGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cybersecurity Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cybersecurity guidance' },
      { status: 500 }
    );
  }
}