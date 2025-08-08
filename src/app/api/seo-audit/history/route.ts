import { NextRequest, NextResponse } from 'next/server'

interface AuditHistory {
  id: string
  url: string
  overallScore: number
  status: 'completed' | 'error'
  timestamp: string
  metrics: {
    technical: { score: number }
    performance: { score: number }
    seo: { score: number }
    accessibility: { score: number }
    content: { score: number }
  }
}

// Mock data storage - in production, this would be stored in a database
let auditHistory: AuditHistory[] = [
  {
    id: '1',
    url: 'https://example.com',
    overallScore: 85,
    status: 'completed',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    metrics: {
      technical: { score: 88 },
      performance: { score: 82 },
      seo: { score: 85 },
      accessibility: { score: 87 },
      content: { score: 83 }
    }
  },
  {
    id: '2',
    url: 'https://demo-site.com',
    overallScore: 92,
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    metrics: {
      technical: { score: 95 },
      performance: { score: 90 },
      seo: { score: 91 },
      accessibility: { score: 93 },
      content: { score: 94 }
    }
  }
]

export async function GET() {
  try {
    // Return the last 10 audits, sorted by most recent
    const recentAudits = auditHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: recentAudits
    })

  } catch (error) {
    console.error('Error fetching audit history:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch audit history' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, overallScore, metrics } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Create new audit entry
    const newAudit: AuditHistory = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      overallScore,
      status: 'completed',
      timestamp: new Date().toISOString(),
      metrics: {
        technical: { score: metrics.technical.score },
        performance: { score: metrics.performance.score },
        seo: { score: metrics.seo.score },
        accessibility: { score: metrics.accessibility.score },
        content: { score: metrics.content.score }
      }
    }

    // Add to history (keep last 50 entries)
    auditHistory.unshift(newAudit)
    if (auditHistory.length > 50) {
      auditHistory = auditHistory.slice(0, 50)
    }

    return NextResponse.json({
      success: true,
      data: newAudit
    })

  } catch (error) {
    console.error('Error saving audit to history:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save audit history' 
      },
      { status: 500 }
    )
  }
}