import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Vocabulary, type IVocabulary } from '@/lib/db/models/vocabulary';

// POST /api/vocabulary/bulk - Add multiple vocabulary items
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Request body must be an array' },
        { status: 400 }
      );
    }

    // Filter out items without required fields
    const validItems = body.filter((item: Partial<IVocabulary>) =>
      item.english && item.thai && item.level
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid vocabulary items provided' },
        { status: 400 }
      );
    }

    // Prepare bulk operations
    const operations = validItems.map((item: IVocabulary) => ({
      updateOne: {
        filter: { english: item.english },
        update: { $set: item },
        upsert: true
      }
    }));

    // Execute bulk operations
    const result = await Vocabulary.bulkWrite(operations);

    return NextResponse.json({
      success: true,
      data: {
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding vocabulary in bulk:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add vocabulary items' },
      { status: 500 }
    );
  }
}
