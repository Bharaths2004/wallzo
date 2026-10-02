const mongoose = require('mongoose');

const pendingActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ADD_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'UPDATE_STOCK'],
    required: true
  },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: String,
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});

pendingActionSchema.index({ status: 1, submittedAt: -1 });
pendingActionSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('PendingAction', pendingActionSchema);
