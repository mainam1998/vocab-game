import mongoose from 'mongoose';

// Use a placeholder during build time or when MONGODB_URI is not defined
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://placeholder:27017/vocabulary';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongooseGlobal: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseGlobal || { conn: null, promise: null };
global.mongooseGlobal = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Return early during build
      if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
        console.warn('Using mock connection for build');
        return mongoose;
      }
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;

    // Return early during build
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.warn('Using mock connection for build');
      return mongoose;
    }

    throw e;
  }

  return cached.conn;
}
