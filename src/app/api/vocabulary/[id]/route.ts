import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Vocabulary } from '@/lib/db/models/vocabulary';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/vocabulary/[id] - Get a single vocabulary item
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const vocabulary = await Vocabulary.findById(params.id);

    if (!vocabulary) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vocabulary });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

// PUT /api/vocabulary/[id] - Update a vocabulary item
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const vocabulary = await Vocabulary.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!vocabulary) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vocabulary });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vocabulary' },
      { status: 500 }
    );
  }
}

// DELETE /api/vocabulary/[id] - Delete a vocabulary item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const vocabulary = await Vocabulary.findByIdAndDelete(params.id);

    if (!vocabulary) {
      return NextResponse.json(
        { success: false, error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vocabulary });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vocabulary' },
      { status: 500 }
    );
  }
}
