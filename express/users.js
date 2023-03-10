const bcrypt = require("bcrypt");

const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");

const isAlpha = (str) => /^[a-zA-Z]*$/.test(str);

const createUser = async (username, password) => {
  const lowerUsername = username.toLowerCase();
  if (!lowerUsername || !password) {
    throw new Error("Username or password is empty");
  }
  if (typeof lowerUsername !== "string" || lowerUsername.length < 4) {
    throw new Error(
      "user name should be a valid string and should be at least 4 characters long."
    );
  }

  const userCollections = await users();
  if (
    await userCollections.findOne({
      username: lowerUsername,
    })
  ) {
    throw new Error("There is already a user with that username");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error(
      "password should be a valid string and should be at least 4 characters long."
    );
  }

  const salt = await bcrypt.genSalt(10);

  await userCollections.insertOne({
    username: lowerUsername,
    password: await bcrypt.hash(password, salt),
  });
  return { userInserted: true };
};

const checkUser = async (username, password) => {
  const lowerUsername = username.toLowerCase();
  if (!lowerUsername || !password) {
    throw new Error("Username or password is empty");
  }
  if (typeof lowerUsername !== "string" || lowerUsername.length < 4) {
    throw new Error(
      "user name should be a valid string and should be at least 4 characters long."
    );
  }

  const userCollections = await users();

  if (typeof password !== "string" || password.length < 6) {
    throw new Error(
      "password should be a valid string and should be at least 4 characters long."
    );
  }

  const findUserName = await userCollections.findOne({
    username: lowerUsername,
  });
  if (!findUserName) {
    throw new Error("Either the username or password is invalid");
  }
  if (!(await bcrypt.compare(password, findUserName.password))) {
    throw new Error("Either the username or password is invalid");
  }
  return { authenticated: true };
};

module.exports = { createUser, checkUser };