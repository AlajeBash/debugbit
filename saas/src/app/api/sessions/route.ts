import { NextResponse } from 'next/server';
import { localSessions } from '../../../lib/localStore';

export async function GET() {
  try {
    // Return all locally buffered development session streams
    return NextResponse.json({
      status: 'success',
      sessions: localSessions
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve local development sessions', details: err.message || err },
      { status: 500 }
    );
  }
}
