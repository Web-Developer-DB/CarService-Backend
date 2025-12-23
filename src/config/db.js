
/**
 * Connects to the MongoDB database using Mongoose.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} - A promise that resolves when the connection is established.
 * @throws {Error} - Throws an error if the connection fails.
 * 
 * @example
 * connectDB()
 *   .then(() => console.log('Database connected successfully'))
 *   .catch(err => console.error('Database connection error:', err));
 */

//----------------------------------------------------------------------------------------------------------

// src/config/db.js
import mongoose from "mongoose";

mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI ist nicht gesetzt');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
     /*  useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false, */
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Beendet den Prozess mit einem Fehler
  }
};

export default connectDB;
