import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Riferimento allo schema User
    required: true,
  },
  fromUserEmail: {
    type: String,
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Riferimento allo schema User
    required: true,
  },
  toUserEmail: {
    type: String,
    required: true
  },
  fromUserCards: {
    type: [Number],
    required: true,
  },
  toUserCards: {
    type: [Number],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'], // Stato dello scambio
    default: 'pending',
  }
}, {
  timestamps: true, // Aggiunge createdAt e updatedAt
});

const Trade = mongoose.model('Trade', tradeSchema);

export default Trade;