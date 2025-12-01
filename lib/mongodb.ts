import mongoose, { ConnectOptions } from 'mongoose';

/**
 * MongoDB connection URI.
 *
 * Must be provided via the MONGODB_URI environment variable.
 * Using an explicit error message here helps fail fast during boot
 * rather than failing later when a request first hits the database layer.
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside your environment configuration');
}

/**
 * Shape of the cached Mongoose connection stored on the Node.js global object.
 *
 * We cache the connection across hot reloads in development to avoid
 * creating multiple connections, which can lead to performance issues
 * and `Too many connections` errors.
 */
interface MongooseGlobalCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Augment the Node.js global type to include our Mongoose cache.
 *
 * `var` is used intentionally because we want a single global instance
 * across the entire Node.js runtime (including when Next.js reloads files
 * during development).
 */
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseGlobalCache | undefined;
}

/**
 * Use the existing global cache if present, otherwise initialize it.
 */
const cached: MongooseGlobalCache = global.__mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.__mongoose) {
  global.__mongoose = cached;
}

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * This function is safe to call from any server-side code path in a
 * Next.js application (e.g. route handlers, server actions, API routes).
 *
 * The first call will create the connection and cache the resulting
 * promise. Subsequent calls will reuse the same pending promise or the
 * resolved connection, ensuring that only a single MongoDB connection
 * is established per server instance.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if already established.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise does not exist yet, create one and cache it.
  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  // Await the cached promise and store the resolved connection.
  cached.conn = await cached.promise;
  return cached.conn;
}
