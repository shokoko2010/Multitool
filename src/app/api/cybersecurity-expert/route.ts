import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationType,
      currentSecurityMeasures,
      securityConcerns,
      complianceRequirements,
      budget,
      timeline,
      riskTolerance,
      infrastructureSize
    } = body;

    // Validate required fields
    if (!organizationType || !securityConcerns) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationType, securityConcerns' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Cybersecurity Expert, analyze the following cybersecurity requirements and provide comprehensive security recommendations:

Organization Type: ${organizationType}
Current Security Measures: ${currentSecurityMeasures || 'Not specified'}
Security Concerns: ${securityConcerns}
Compliance Requirements: ${complianceRequirements || 'Not specified'}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Risk Tolerance: ${riskTolerance || 'Not specified'}
Infrastructure Size: ${infrastructureSize || 'Not specified'}

Please provide a detailed analysis including:
1. Security Assessment
2. Risk Analysis
3. Security Architecture
4. Implementation Strategy
5. Compliance Requirements
6. Monitoring Solutions
7. Incident Response
8. Employee Training
9. Security Tools
10. Maintenance Plan

Format the response as a structured JSON object with these sections.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Cybersecurity Expert with deep knowledge of security frameworks, threat analysis, compliance requirements, and security best practices. Provide practical, actionable cybersecurity guidance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    let analysis;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, return the raw content
      analysis = {
        rawAnalysis: responseContent,
        message: 'AI response was not in valid JSON format, but contains valuable insights'
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        organizationType,
        securityConcerns,
        analysis,
        disclaimer: 'This AI-generated cybersecurity advice is for informational purposes only and does not constitute professional security advice. Please consult with qualified cybersecurity professionals for security implementations.',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cybersecurity Expert API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate cybersecurity recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}