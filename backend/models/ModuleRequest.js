const mongoose = require('mongoose');

const ModuleRequestSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('ModuleRequest', ModuleRequestSchema);

