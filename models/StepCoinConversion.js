const mongoose = require('mongoose');

const stepCoinConversionSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    user_id: { type: String, required: true },
    request_date: { type: Date, default: Date.now },
    approve_date: { type: Date },
    suspected_date: { type: Date },
    reason: { type: String },
    steps_coins: { type: Number, required: true },
    points: { type: Number, required: true },
    wallet_address: { type: String, required: true },
    location: { type: String, required: true },
    ip: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspected'],
        default: 'pending'
    },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approved_by_name: { type: String }
},
{ timestamps: true }
);

module.exports = mongoose.model('StepCoinConversion', stepCoinConversionSchema);
