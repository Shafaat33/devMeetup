const validator = require("validator");

const signUpValidator = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is incorrect");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditProfileData = (req) => {
  const editableKeys = ['firstName', 'lastName', 'age', 'gender', 'photoUrl', 'about'];
  const keys = Object.keys(req.body);
  
  const invalidFields = keys.filter((field) => !editableKeys.includes(field));
  
  if (invalidFields.length > 0) {
    console.log('Invalid fields:', invalidFields);
    return false;
  }
  
  return true;
};

module.exports = {
  signUpValidator,
  validateEditProfileData,
};
