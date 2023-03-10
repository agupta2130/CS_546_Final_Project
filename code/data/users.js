const bcrypt = require("bcrypt");

const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const apartment = mongoCollections.apartment;
const { ObjectId } = require("mongodb");

const isAlpha = (str) => /^[a-zA-Z]*$/.test(str);

const createUser = async (
  email,
  password,
  username,
  phonenumber,
  city,
  gender,
  age,
  usertype
) => {
  console.log("email", email);
  console.log("usertype..", usertype);
  email = email.toLowerCase();
  const lowerUsername = username.toLowerCase();
  if (!lowerUsername || !password) {
    throw new Error("Username or password is empty");
  }
  if (typeof lowerUsername !== "string" || lowerUsername.length < 4) {
    throw new Error(
      "user name should be a valid string and should be at least 4 characters long."
    );
  }

  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("It is not email formet");
  }

  const userCollections = await users();
  if (
    await userCollections.findOne({
      email: email,
    })
  ) {
    throw new Error("There is already a user with that username");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error(
      "password should be a valid string and should be at least 4 characters long."
    );
  }

  if (String(Number(phonenumber)) == "NaN") {
    throw new Error("Phone number must be number");
  }

  if (String(Number(username)) !== "NaN") {
    throw new Error("user name must be string");
  }

  if(age<0) {
    throw new Error("Age can not be negative");
  }
  
  if (!city) throw new Error("You must provide city");
  if (typeof city !== "string") throw new Error("city must be a string");
  if (city.trim().length === 0)
    throw new Error("city cannot be an empty string or just spaces");
  city = city.trim();
  if (!isNaN(city)) throw new Error(`${city} is not a valid value for city.`);
  if (containsSpecialChars(city) === true) throw new Error("city cannot contain special characters");

  if (!phonenumber) throw new Error ("You must provide phonenumber");
  if (phonenumber.trim().length === 0)
  throw new Error ("phonenumber cannot be an empty string or just spaces");
    phonenumber = phonenumber.trim();
  if (phonenumber.trim().length !== 10) throw new Error ("phonenumber cannot be less than/greater than 10 digit");
  if (isNaN(phonenumber)) throw new Error (`${phonenumber} is not a valid value for phonenumber.`);
  if (isValidDetails(phonenumber) === false) throw new Error (`${contactInfo} is not a valid value for phonenumber.`);
  if (containsSpecialChars(phonenumber) === true) throw new Error ("Contact Information is Incorrect.");


  const salt = await bcrypt.genSalt(10);

  await userCollections.insertOne({
    username: lowerUsername,
    password: await bcrypt.hash(password, salt),
    email,
    phonenumber,
    city,
    gender,
    age,
    usertype,
    reviewsWritten:[],
    savedApartments:[],
    AddedProperty:[]

  });
  return { userInserted: true };
};

const checkUser = async (email, password, req) => {
  if (!email || !password) {
    throw new Error("email or password is empty");
  }
  if (typeof email !== "string" || email.length < 4) {
    throw new Error(
      "email should be a valid string and should be at least 4 characters long."
    );
  }

  console.log("email", email);
  console.log("@", email.includes("@"));
  console.log(".", email.includes("."));

  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("It is not email formet");
  }


  const userCollections = await users();

  if (typeof password !== "string" || password.length < 6) {
    throw new Error(
      "password should be a valid string and should be at least 4 characters long."
    );
  }

  email = email.toLowerCase();
  const findemail = await userCollections.findOne({
    email
  });
  console.log(email, password, findemail);
  if (!findemail) {
    throw new Error("Either the email or password is invalid");
  }
  if (!(await bcrypt.compare(password, findemail.password))) {
    throw new Error("Either the email or password is invalid");
  }
  req.session.user = findemail;
  return { authenticated: true };
};



const getReviewfromId = async (reviewId) => {
  /* const userCollections = await users();
  const userRecord = await userCollections.find({
    _id: ObjectId(userid),
  }).toArray();
  console.log("userRecord",userRecord);

  if (!userRecord) {
    throw new Error("No user record found");
  }
  //req.session.user = findemail;
  //return { authenticated: true };
  return userRecord; */

  if (!ObjectId.isValid(reviewId)) throw new Error ("review id is not a valid object ID");
  const apartmentCollection = await apartment();
  // const band = await bandsCollection.find({ 'albums._id': ObjectId(albumId)}).toArray();
  const aprtment = await apartmentCollection
    .find(
      { "reviews._id": ObjectId(reviewId) },
      {
        projection: {
          _id: 0,
          reviews: { $elemMatch: { _id: { $eq: ObjectId(reviewId) } } },
        },
      }
    )
    .toArray();

  if (aprtment.length === 0)
    throw "no review exist for the given id: " + reviewId;
  //console.log(JSON.stringify(band[0].albums[0],null,4));
  return aprtment[0].reviews[0];
};


function containsSpecialChars(str) {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}

function isValidDetails(rating) {
  if (rating.toString().includes('.')) {
    if (rating.toString().split('.')[1].length !== 1) {
      //console.log("inside if2",rating.toString().split('.')[1].length);
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }

};
module.exports = { createUser, checkUser, getReviewfromId };
