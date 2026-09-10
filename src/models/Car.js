import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicleType: { type: String, trim: true, maxlength: 80 },
    licensePlate: { type: String, required: true, trim: true, maxlength: 20 },
    licensePlateNormalized: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    make: { type: String, trim: true, maxlength: 80 },
    model: { type: String, trim: true, maxlength: 80 },
    year: { type: Number, integer: true, min: 1886, max: 2100 },
    fuelType: { type: String, trim: true, maxlength: 40 },
    emissionClass: { type: String, trim: true, maxlength: 40 },
    powerKw: { type: Number, min: 0, max: 2000 },
    powerPs: { type: Number, min: 0, max: 3000 },
    odometerKm: { type: Number, required: true, min: 0, default: 0 },
    nextInspectionAt: Date,
    nextOilChangeAt: Date,
    nextOilChangeKm: { type: Number, min: 0 }
  },
  { timestamps: true, strict: 'throw', versionKey: false }
);

carSchema.index({ userId: 1, licensePlateNormalized: 1 }, { unique: true });
export default mongoose.model('Car', carSchema);
