import mongoose from 'mongoose';

const vehicleEventSchema = new mongoose.Schema(
  {
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['mileage', 'inspection', 'oil_change', 'service'], required: true },
    occurredAt: { type: Date, required: true },
    odometerKm: { type: Number, min: 0 },
    nextOilChangeKm: { type: Number, min: 0 },
    note: { type: String, trim: true, maxlength: 500 },
    description: { type: String, trim: true, maxlength: 1000 },
    migrationKey: { type: String, unique: true, sparse: true }
  },
  { timestamps: true, strict: 'throw', versionKey: false }
);

vehicleEventSchema.index({ carId: 1, occurredAt: -1, _id: -1 });
export default mongoose.model('VehicleEvent', vehicleEventSchema);
