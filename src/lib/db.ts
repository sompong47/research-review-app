import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
	// Allow app to start in local dev without uri; operations should fail fast when used.
	console.warn('Warning: MONGODB_URI is not set. DB operations will fail until configured.');
}

type MongooseCache = {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
};

declare global {
	// eslint-disable-next-line no-var
	var _mongoose: MongooseCache | undefined;
}

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectToDatabase() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			// useNewUrlParser, useUnifiedTopology are defaults in mongoose v6+
		} as mongoose.ConnectOptions;

		cached.promise = mongoose.connect(MONGODB_URI || '', opts).then((m) => m);
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default mongoose;
