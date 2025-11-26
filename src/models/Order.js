const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'routing', 'building', 'submitted', 'confirmed', 'failed'],
      required: true
    },
    details: {
      type: Object,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ['market'],
      default: 'market'
    },
    tokenIn: { type: String, required: true },  
    tokenOut: { type: String, required: true }, 
    amount: { type: Number, required: true },   
    status: {
      type: String,
      enum: ['pending', 'routing', 'building', 'submitted', 'confirmed', 'failed'],
      default: 'pending'
    },
    routedDex: {
      type: String,
      enum: ['raydium', 'meteora', null],
      default: null
    },
    quotes: {
      raydium: { type: Object, default: null },
      meteora: { type: Object, default: null }
    },
    executedPrice: {
      type: Number,
      default: null
    },
    txHash: {
      type: String,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    statusHistory: [StatusHistorySchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', OrderSchema);
