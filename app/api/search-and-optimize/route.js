import { NextResponse } from 'next/server';
import CatalogAdapter from '@/lib/catalog-adapter';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.roadmap || !body.roadmap.roadmap || !Array.isArray(body.roadmap.roadmap)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: roadmap is required'
        },
        { status: 400 }
      );
    }
    
    // Extract queries from roadmap
    const queries = body.roadmap.roadmap.map(item => item.componentName);
    
    console.log(`Starting search for ${queries.length} queries with rate limiting...`);
    console.log('Queries:', queries);
    
    const catalogAdapter = new CatalogAdapter();
    const results = await catalogAdapter.searchWithCache({ queries });
    
    console.log(`Search completed. Found ${results.length} total results`);
    
    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      optimizedBundles: [],
      compatibilityReport: null,
      insights: {
        priceRange: { min: 0, max: 0 },
        qualityRange: { average: 0 }
      }
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    // Handle rate limiting errors
    if (error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again in a minute.',
          retryAfter: 60
        },
        { status: 429 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Search failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    {
      message: 'Search API is running. Use POST method to search.',
      usage: {
        method: 'POST',
        body: {
          roadmap: { roadmap: [{ componentName: 'item' }] }
        }
      }
    },
    { status: 200 }
  );
}