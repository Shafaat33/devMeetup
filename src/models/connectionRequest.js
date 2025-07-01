const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionRequestSchema = new Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ['interested', 'ignored', 'accepted', 'reject'],
      message: `{VALUE} is incorrect type`,
    },
  },
}, { timestamps: true });

connectionRequestSchema.pre('save', function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself");
  }
  next();
});

const ConnectionRequestModel = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequestModel;
