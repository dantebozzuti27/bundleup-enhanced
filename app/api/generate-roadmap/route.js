// ============================================
// API ROUTE: /api/generate-roadmap
// Roadmap Generator - Creates solution blueprint
// ============================================

import { NextResponse } from 'next/server';
import RoadmapGenerator from '@/lib/roadmap-generator';

export async function POST(request) {
  try {
    const { parsedIntent, userId, sessionId } = await request.json();
    
    if (!parsedIntent || !parsedIntent.components) {
      return NextResponse.json(
        { error: 'Parsed intent with components is required' },
        { status: 400 }
      );
    }
    
    // Initialize Roadmap Generator
    const generator = new RoadmapGenerator();
    
    // Generate roadmap
    const roadmap = await generator.generateRoadmap(parsedIntent);
    
    // Save roadmap to database if user is provided
    if (userId || sessionId) {
      try {
        await generator.saveRoadmap(roadmap, userId, sessionId);
      } catch (dbError) {
        console.error('Failed to save roadmap:', dbError);
        // Continue even if save fails
      }
    }
    
    return NextResponse.json({
      success: true,
      roadmap
    });
    
  } catch (error) {
    console.error('Roadmap generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate roadmap',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
