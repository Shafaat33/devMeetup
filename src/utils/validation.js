const validator = require("validator");

const signUpValidator = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Nameeee is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is incorrect");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditProfileData = (req) => {
  const editableKeys = ['firstName', 'LastName', 'age', 'gender'];
  const isEditAllowed = Object.keys(req.body).every((field) => editableKeys.includes(field));

  return isEditAllowed;
};

module.exports = {
  signUpValidator,
  validateEditProfileData,
};
