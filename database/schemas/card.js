import mongoose from 'mongoose';

// Schema della carta
const cardSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  copy: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default cardSchema;