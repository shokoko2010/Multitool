import { NextRequest, NextResponse } from 'next/server'

interface PerformanceHistory {
  id: string
  url: string
  overallScore: number
  status: 'completed' | 'error'
  timestamp: string
  metrics: {
    loading: { score: number }
    assets: { score: number }
    code: { score: number }
    network: { score: number }
    accessibility: { score: number }
  }
}

// Mock data storage - in production, this would be stored in a database
let performanceHistory: PerformanceHistory[] = [
  {
    id: '1',
    url: 'https://example.com',
    overallScore: 88,
    status: 'completed',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    metrics: {
      loading: { score: 85 },
      assets: { score: 90 },
      code: { score: 92 },
      network: { score: 86 },
      accessibility: { score: 87 }
    }
  },
  {
    id: '2',
    url: 'https://demo-site.com',
    overallScore: 92,
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    metrics: {
      loading: { score: 94 },
      assets: { score: 89 },
      code: { score: 95 },
      network: { score: 91 },
      accessibility: { score: 93 }
    }
  }
]

export async function GET() {
  try {
    // Return the last 10 audits, sorted by most recent
    const recentAudits = performanceHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: recentAudits
    })

  } catch (error) {
    console.error('Error fetching performance history:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance history' 
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
    const newAudit: PerformanceHistory = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      overallScore,
      status: 'completed',
      timestamp: new Date().toISOString(),
      metrics: {
        loading: { score: metrics.loading.score },
        assets: { score: metrics.assets.score },
        code: { score: metrics.code.score },
        network: { score: metrics.network.score },
        accessibility: { score: metrics.accessibility.score }
      }
    }

    // Add to history (keep last 50 entries)
    performanceHistory.unshift(newAudit)
    if (performanceHistory.length > 50) {
      performanceHistory = performanceHistory.slice(0, 50)
    }

    return NextResponse.json({
      success: true,
      data: newAudit
    })

  } catch (error) {
    console.error('Error saving performance audit to history:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save performance audit history' 
      },
      { status: 500 }
    )
  }
}