import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fahrzeugart: String,
  kennzeichen: String,
  marke: String,
  modell: String,
  baujahr: Number,
  kraftstoff: String,
  schadstoffklasse: String,
  leistungKW: Number,
  leistungPS: Number,
  kilometerstand: Number,
  nächsteTüvUntersuchung: Date,
  nächsteoelwechsel: Date,
  nächsteoelwechselKm: Number,

  // history fields
  kilometerstandHistory: [{
    datum: Date,
    kilometerstand: Number,
  }],
  tuevHistory: [{
    datum: Date,
    bemerkung: String, // Optional: Zusätzliche Bemerkungen zum TÜV-Termin
  }],
  oelwechselHistory: [{
    datum: Date,
    kilometerstand: Number,
    naechsterOelwechselKm: Number, // Optional: Nächster Ölwechsel nach Kilometern
  }],
  serviceHistory: [{
    datum: Date,
    beschreibung: String, // Beschreibung des durchgeführten Services
  }]
});

const Car = mongoose.model('Car', carSchema);

export default Car;
