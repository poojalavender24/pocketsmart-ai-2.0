const m = require('mongoose');
module.exports = m.model('User', new m.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  phone: String,
  password: String,
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  otp: m.Schema.Types.Mixed,          // { email:{h,exp}, phone:{h,exp} } (hashed)
  threshold: { type: Number, default: 5000 },
}, { timestamps: true }));
