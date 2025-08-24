import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ToolRecommendationService } from '@/lib/user/recommendations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'personalized'
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')

    let recommendations

    switch (type) {
      case 'personalized':
        recommendations = await ToolRecommendationService.getPersonalizedRecommendations(
          session.user.id,
          limit
        )
        break
      case 'trending':
        recommendations = await ToolRecommendationService.getTrendingTools(limit)
        break
      case 'category':
        if (!category) {
          return NextResponse.json(
            { error: 'Category parameter is required for category recommendations' },
            { status: 400 }
          )
        }
        recommendations = await ToolRecommendationService.getCategoryBasedRecommendations(
          session.user.id,
          category,
          limit
        )
        break
      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}