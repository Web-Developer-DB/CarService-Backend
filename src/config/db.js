import mongoose from 'mongoose';

export const connectDatabase = async (config, logger) => {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (config.NODE_ENV === 'production' && !hello.setName)
    throw new Error('MongoDB replica set is required in production');
  logger.info({ host: mongoose.connection.host, database: mongoose.connection.name }, 'MongoDB connected');
  config.isDatabaseReady = () => mongoose.connection.readyState === 1;
};

export const disconnectDatabase = () => mongoose.disconnect();
