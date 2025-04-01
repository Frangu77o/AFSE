import mongoose from 'mongoose';

const cardTrade = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
});

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
    type: [cardTrade],
    required: true,
  },
  toUserCards: {
    type: [cardTrade],
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