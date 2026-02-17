import validator from "validator";

const validate = (data) => {
  const mandatoryFields = ["firstName", "emailId", "password", "mobile"];
  const allPresent = mandatoryFields.every((k) => Object.keys(data).includes(k));

  if (!allPresent) {
    throw new Error("Some field is missing");
  }

  if (!validator.isEmail(data.emailId)) {
    throw new Error("Invalid Email");
  }

  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Weak Password: must contain uppercase, lowercase, number, symbol, min 8 chars");
  }

  if (!validator.isMobilePhone(data.mobile.toString())) {
    throw new Error("Invalid Mobile Number");
  }
};

export default validate;
