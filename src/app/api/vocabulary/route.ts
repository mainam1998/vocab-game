import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Vocabulary } from '@/lib/db/models/vocabulary';

// GET /api/vocabulary?level=A1 - Get all vocabulary items or filter by level
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');

    const query = level ? { level } : {};
    const vocabularies = await Vocabulary.find(query).sort({ english: 1 });

    return NextResponse.json({ success: true, data: vocabularies });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

// POST /api/vocabulary - Add a new vocabulary item
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Check if word already exists
    const existingWord = await Vocabulary.findOne({ english: body.english });
    if (existingWord) {
      return NextResponse.json(
        { success: false, error: 'Word already exists' },
        { status: 400 }
      );
    }

    const vocabulary = await Vocabulary.create(body);
    return NextResponse.json({ success: true, data: vocabulary }, { status: 201 });
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add vocabulary' },
      { status: 500 }
    );
  }
}

// DELETE /api/vocabulary - Delete all vocabulary items
export async function DELETE() {
  try {
    await connectToDatabase();
    await Vocabulary.deleteMany({});
    return NextResponse.json({ success: true, message: 'All vocabulary items deleted' });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vocabulary items' },
      { status: 500 }
    );
  }
}
