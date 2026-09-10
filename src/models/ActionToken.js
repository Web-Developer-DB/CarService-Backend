import mongoose from 'mongoose';

const actionTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['verify_email', 'password_reset'], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true, strict: 'throw', versionKey: false }
);

export default mongoose.model('ActionToken', actionTokenSchema);
