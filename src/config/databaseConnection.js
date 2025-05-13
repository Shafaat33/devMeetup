const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect('mongodb+srv://shafaat:kjRDjMGtsGf2e60z@dev-tinder.llofucf.mongodb.net/dev-tinder');
}

module.exports = connectDB;
