import mongoose from 'mongoose';

// ใช้ placeholder ถ้า MONGODB_URI ยังไม่ได้ตั้งค่า
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://placeholder:27017/vocabulary';

/**
 * ใช้ Global เพื่อเก็บการเชื่อมต่อในแคช
 * เพื่อไม่ให้สร้างการเชื่อมต่อซ้ำในระหว่างการพัฒนา
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
  console.log('Attempting to connect to MongoDB...'); // Log เมื่อเริ่มการเชื่อมต่อ

  if (cached.conn) {
    console.log('Using cached MongoDB connection');  // Log ถ้าใช้การเชื่อมต่อที่เก็บในแคช
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      console.log(`Connecting to MongoDB with URI: ${MONGODB_URI}`);  // Log MongoDB URI
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('MongoDB connected successfully');  // Log เมื่อเชื่อมต่อสำเร็จ
        return mongoose;
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);  // Log ข้อผิดพลาดการเชื่อมต่อ
      if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
        console.warn('Using mock connection for build');  // Log ถ้าไม่ได้ตั้งค่าฐานข้อมูลใน production
        return mongoose;
      }
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection failed:', e);  // Log ข้อผิดพลาดถ้าเชื่อมต่อล้มเหลว
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.warn('Using mock connection for build');  // Log ถ้าไม่ได้ตั้งค่าฐานข้อมูลใน production
      return mongoose;
    }
    throw e;
  }

  console.log('MongoDB connection cached successfully');  // Log เมื่อการเชื่อมต่อสำเร็จและเก็บในแคช
  return cached.conn;
}
