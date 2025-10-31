// ============================================
// API ROUTE: /api/parse-intent
// Intent Parser - Decomposes user goals
// ============================================

import { NextResponse } from 'next/server';
import IntentParser from '@/lib/intent-parser';

export async function POST(request) {
  try {
    const { userIntent, userId } = await request.json();
    
    if (!userIntent || typeof userIntent !== 'string') {
      return NextResponse.json(
        { error: 'User intent is required' },
        { status: 400 }
      );
    }
    
    // Initialize Intent Parser
    const parser = new IntentParser();
    
    // Parse the intent
    const parsedIntent = await parser.parseIntent(
      userIntent,
      userId ? { userId } : null
    );
    
    // Validate the parsed intent
    const validation = parser.validateIntent(parsedIntent);
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        parsedIntent,
        validation
      }, { status: 200 });
    }
    
    return NextResponse.json({
      success: true,
      parsedIntent,
      validation
    });
    
  } catch (error) {
    console.error('Intent parsing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to parse intent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
