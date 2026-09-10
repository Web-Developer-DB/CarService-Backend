import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    emailVerifiedAt: { type: Date, default: null },
    tokenVersion: { type: Number, required: true, default: 0, min: 0 }
  },
  { timestamps: true, strict: 'throw', versionKey: false }
);

export default mongoose.model('User', userSchema);
