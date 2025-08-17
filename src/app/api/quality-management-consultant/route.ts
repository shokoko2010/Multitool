import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface QualityManagementConsultantRequest {
  industry?: string;
  organizationType?: string;
  qualityChallenges?: string;
  currentQualitySystems?: string;
  budget?: string;
  timeline?: string;
  qualityStandards?: string;
  customerRequirements?: string;
  regulatoryRequirements?: string;
  improvementGoals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as QualityManagementConsultantRequest;
    
    const {
      industry = '',
      organizationType = '',
      qualityChallenges = '',
      currentQualitySystems = '',
      budget = '',
      timeline = '',
      qualityStandards = '',
      customerRequirements = '',
      regulatoryRequirements = '',
      improvementGoals = ''
    } = body;

    if (!industry.trim()) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As a Quality Management Consultant, provide comprehensive quality management strategy and implementation guidance for the following organization:

Industry: ${industry}
Organization Type: ${organizationType}
Quality Challenges: ${qualityChallenges}
Current Quality Systems: ${currentQualitySystems}
Budget: ${budget}
Timeline: ${timeline}
Quality Standards: ${qualityStandards}
Customer Requirements: ${customerRequirements}
Regulatory Requirements: ${regulatoryRequirements}
Improvement Goals: ${improvementGoals}

Please provide detailed quality management guidance including:
1. Quality assessment and gap analysis
2. Quality management system design
3. Process improvement methodologies (Six Sigma, Lean, TQM)
4. Quality control and assurance strategies
5. Performance measurement and metrics
6. Customer satisfaction enhancement
7. Compliance and certification guidance
8. Training and competency development
9. Continuous improvement framework
10. Implementation roadmap and change management

Format your response as a comprehensive quality management strategy with actionable recommendations and implementation guidance.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an experienced Quality Management Consultant with expertise in quality systems, process improvement, Six Sigma, Lean management, and quality assurance. You provide practical, results-oriented quality management guidance with strategic implementation approaches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const qualityGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        industry,
        organizationType,
        qualityChallenges,
        currentQualitySystems,
        budget,
        timeline,
        qualityStandards,
        customerRequirements,
        regulatoryRequirements,
        improvementGoals,
        qualityGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Quality Management Consultant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quality management guidance' },
      { status: 500 }
    );
  }
}