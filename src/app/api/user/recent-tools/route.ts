import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { UserPreferencesService } from '@/lib/user/preferences'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferences = await UserPreferencesService.getPreferences(session.user.id)
    
    return NextResponse.json({
      success: true,
      data: preferences.recentTools
    })
  } catch (error) {
    console.error('Error fetching recent tools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent tools' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { toolId } = await request.json()
    
    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    const preferences = await UserPreferencesService.addToRecentTools(session.user.id, toolId)
    
    return NextResponse.json({
      success: true,
      data: preferences.recentTools
    })
  } catch (error) {
    console.error('Error adding recent tool:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add recent tool' },
      { status: 500 }
    )
  }
}