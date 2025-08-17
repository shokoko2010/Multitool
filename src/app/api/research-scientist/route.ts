import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ResearchScientistRequest {
  researchArea?: string;
  methodology?: string;
  dataset?: string;
  hypothesis?: string;
  objectives?: string[];
  timeline?: string;
  budget?: string;
  collaboration?: string;
  publication?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ResearchScientistRequest;
    
    const {
      researchArea = '',
      methodology = '',
      dataset = '',
      hypothesis = '',
      objectives = [],
      timeline = '',
      budget = '',
      collaboration = '',
      publication = ''
    } = body;

    if (!researchArea.trim()) {
      return NextResponse.json(
        { error: 'Research area is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `As an AI Research Scientist, provide comprehensive research guidance and analysis for the following request:

Research Area: ${researchArea}
Methodology: ${methodology}
Dataset: ${dataset}
Hypothesis: ${hypothesis}
Research Objectives: ${objectives.join(', ')}
Timeline: ${timeline}
Budget: ${budget}
Collaboration Needs: ${collaboration}
Publication Goals: ${publication}

Please provide a detailed research analysis including:
1. Research methodology recommendations
2. Dataset selection and preparation guidance
3. Experimental design suggestions
4. Statistical analysis approach
5. Implementation roadmap
6. Potential challenges and solutions
7. Collaboration opportunities
8. Publication strategy
9. Ethical considerations
10. Future research directions

Format your response as a comprehensive research plan with actionable insights.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Research Scientist with extensive experience in machine learning, deep learning, and artificial intelligence research. You provide detailed, practical research guidance with actionable insights and methodologies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const researchGuidance = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      data: {
        researchArea,
        methodology,
        dataset,
        hypothesis,
        objectives,
        timeline,
        budget,
        collaboration,
        publication,
        researchGuidance,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Research Scientist API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate research guidance' },
      { status: 500 }
    );
  }
}