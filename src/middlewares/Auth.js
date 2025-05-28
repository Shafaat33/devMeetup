const jwt = require('jsonwebtoken');
const User = require('./../models/user');

const userAuth = async (req, res, next) => {
  try{
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).send("Please login first!!");
    }
  
    const decodeObj = await jwt.verify(token, 'DEV@Tinder007');
  
    const { _id } = decodeObj;
  
    const user = await User.findById(_id);
  
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Err " + error.message);
  }
}

module.exports = {
  userAuth,
};
