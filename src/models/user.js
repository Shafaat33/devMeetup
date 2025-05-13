const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 18,
  },
  gender: {
    type: String,
    validate(value) {
      if(!['male', 'female', 'others'].includes(value)) {
        throw new Error('Gender is invalid');
      }
    }
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;