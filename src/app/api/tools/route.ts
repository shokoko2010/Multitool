import { NextRequest, NextResponse } from 'next/server'
import { tools, getToolsByCategory, getFeaturedTools, searchTools, getCategories } from '@/data/tools'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const query = searchParams.get('q')
    const categories = searchParams.get('categories')

    if (categories === 'true') {
      return NextResponse.json({
        success: true,
        data: getCategories()
      })
    }

    if (category) {
      return NextResponse.json({
        success: true,
        data: getToolsByCategory(category)
      })
    }

    if (featured === 'true') {
      return NextResponse.json({
        success: true,
        data: getFeaturedTools()
      })
    }

    if (query) {
      return NextResponse.json({
        success: true,
        data: searchTools(query)
      })
    }

    return NextResponse.json({
      success: true,
      data: tools
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}