const mongoCollections = require('../config/mongoCollections');
const apartment = mongoCollections.apartment;
const apartmentData = require('./apartment');
const users = mongoCollections.users;
const usersData = require('./users');
const { ObjectId } = require('mongodb');

module.exports = {

  async create(apartmentId, userSessionId, sessionUser, rating, description) {
    let updatedInfo2;
    /* let tracksInvalidFlag = false;  
    if(arguments.length !== 5 ) throw "Number of arguments should be 5"; 
    if (!bandId) throw 'You must provide a band ID to search for';
    if (!title) throw 'You must provide a title to search for';
    if (!releaseDate) throw 'You must provide a releaseDate to search for';
    if (!tracks) throw 'You must provide tracks to search for';
    if (!rating) throw 'You must provide rating to search for';
    if (typeof bandId !== 'string') throw 'bandId must be a string';
    if (bandId.trim().length === 0) throw 'bandId cannot be an empty string or just spaces';
    if (typeof title !== 'string') throw 'title must be a string';
    if (title.trim().length === 0) throw 'title cannot be an empty string or just spaces';
    title = title.trim();
    bandId = bandId.trim();
    if (!ObjectId.isValid(bandId)) throw 'Provided band ID is not a valid object ID';
      // If the band  doesn't exist with that bandId, the method should throw - check this condition- working
    
    if (!tracks ||  !Array.isArray(tracks)) throw 'You must provide an array of tracks';
    if (tracks.length < 3) throw 'You must supply at least three tracks';
    for (i in tracks) {
      if (typeof tracks[i] !== 'string' || tracks[i].trim().length === 0) {
        tracksInvalidFlag = true;
        break;
      }
      tracks[i] = tracks[i].trim();
    }
    if (tracksInvalidFlag)
          throw 'One or more tracks is not a string or is an empty string';
     if(releaseDate<1900 || releaseDate>2022) throw "Only years 1900-2022 are valid values";  
     if(!isValidDateString(releaseDate)) throw "Invalid date string";   
     if(typeof rating !== 'number') throw 'Incorrect rating';
     if(rating> 5 || rating<1) throw 'rating should be a range from 1 to 5'; 
     if(isValidRating(rating) === false) throw 'Only one decimal place value in rating is accepted'; */

    //const myId = new ObjectId(); // No argument
    console.log("inside reviews.js data folder");
    let review = {
      _id: ObjectId(),
      name: sessionUser,
      apartmentid: apartmentId,
      rating: rating,
      description: description

    };
    console.log("inside reviews.js data folder12345");
    let singleApartment = await apartmentData.getApartmentById(apartmentId);

    console.log("singleApartment", singleApartment);
    console.log("singleApartment reviews", singleApartment.reviews, "singleApartment type", typeof singleApartment);

    singleApartment[0].reviews.push(review);
    console.log("inside reviews data folder single review", singleApartment);
    //console.log(singleBand);
    const apartmentCollection = await apartment();
    const updatedInfo = await apartmentCollection.updateOne({ _id: ObjectId(apartmentId) }, { $addToSet: { reviews: review } });

    if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
      throw 'could not update apartment successfully';

    if (updatedInfo.modifiedCount === 1) {

      const usersCollection = await users();
      console.log("inside modified count 1 block");
      console.log("userSessionId", userSessionId);
      console.log("222");
      console.log(review);
      console.log("333");
      console.log("review._id", review._id);
      // console.log(ObjectId(_id),_id.toString());
      // console.log(usersCollection);
      //console.log("req.session.user._id",req.session.user._id);
      updatedInfo2 = await usersCollection.updateOne({ _id: ObjectId(userSessionId) }, { $addToSet: { reviewsWritten: review._id.toString() } });

    }

    if (updatedInfo2.modifiedCount === 1) {
      console.log("users is updated with review id");
      //const updatedInfo2 = await userCollection.updateOne({
      //_id: ObjectId(bandId)}, [{ $set: {overallRating: { $round: [ { $avg: "$albums.rating" }, 1 ] }} }]);
    }
    //return singleBand.albums; if only the newly created band then do looping - need to ask TA
    //return singleBand;

    return review;

  },

  //return an array of objects of the albums given the band id.
  /*  async getAll(bandId){
    if(arguments.length !== 1 ) throw "Number of arguments should be 1"; 
    if (!bandId) throw 'You must provide a band id to search for';
    if (typeof bandId !== 'string') throw 'Id must be a string';
    if (bandId.trim().length === 0) throw 'Band Id cannot be an empty string or just spaces';
    if (!ObjectId.isValid(bandId)) throw 'Band ID is not a valid object ID';
    bandId = bandId.trim();
    let singleBand = await bandsData.get(bandId);
      if (!singleBand) throw 'Could not find band with id of ' + id;
     // const postCollection = await posts();
      //const post = await postCollection.findOne({ _id: id });
  
      //if (!post) throw 'Post not found';
     // return post; 
  
      //if(bandsList.albums.length === 0) //If there are no albums for the band, this function will return an empty array- condition working
     return singleBand.albums;   
     //return singleBand;
  }, */

  //return an album from the band
  /* async get(albumId){
    let flag = false;
    if(arguments.length !== 1 ) throw "Number of arguments should be 1"; 
    if (!albumId) throw 'You must provide an album id to search for';
      if (typeof albumId !== 'string') throw 'Album Id must be a string';
      if (albumId.trim().length === 0) throw 'Album Id cannot be an empty string or just spaces';
      albumId = albumId.trim();
      if (!ObjectId.isValid(albumId)) throw 'albumId is not a valid object ID';
      const bandsCollection = await bands();
     // const band = await bandsCollection.find({ 'albums._id': ObjectId(albumId)}).toArray();
            const band = await bandsCollection
            .find({ 'albums._id': ObjectId(albumId) },
               {   
               projection: { _id:0, albums: {$elemMatch: {_id: {$eq: ObjectId(albumId)}}}} 
             }).toArray();
   
        if(band.length === 0) throw 'album does not exist with the given id: '+albumId;
        //console.log(JSON.stringify(band[0].albums[0],null,4));
       return band[0].albums[0];    
    // if(flag === false) throw 'album does not exist with the given id: '+albumId;
   
  }, */

  async remove(reviewId, userSessionId, sessionUser) {
    if (arguments.length !== 3) throw "Number of arguments should be 1";
    if (!reviewId) throw 'You must provide an review id to search for';
    if (typeof reviewId !== 'string') throw 'review Id must be a string';
    if (reviewId.trim().length === 0)
      throw 'reviewId cannot be an empty string or just spaces';
    reviewId = reviewId.trim();
    if (!ObjectId.isValid(reviewId)) throw 'review Id is not a valid object ID';

    const apartmentCollection = await apartment();
    const apartReview = await apartmentCollection.find({ 'reviews._id': ObjectId(reviewId) }).toArray();
    console.log(apartReview, "......apartReview");
    //apartReview.reviews

    if (apartReview.length !== 0) {
      let apartmentInfo = '';
      apartmentInfo = await apartmentCollection.updateOne({ _id: apartReview[0]._id }, { $pull: { reviews: { _id: ObjectId(reviewId) } } });

      if (apartmentInfo.modifiedCount === 1) {
        console.log("review has been deleted successfully from apartment", apartmentInfo);
        console.log("session user id userSessionId", userSessionId);
        console.log("session user id seesion User", sessionUser);
        console.log("reviewId", reviewId);

        const usersCollection = await users();
        //  updatedInfo2 = await usersCollection.updateOne({_id: ObjectId(userSessionId)}, { $pull: { reviewsWritten: { _id: ObjectId(reviewId)} }}); 
        updatedInfo2 = await usersCollection.updateOne({ _id: ObjectId(userSessionId) }, { $pull: { reviewsWritten: reviewId } });
        console.log("review has been deleted successfully from user collection", updatedInfo2);

        return updatedInfo2.modifiedCount;
      }
      else {
        //return bandInfo.modifiedCount;
        throw "review does not exists";
      }
    }
}},



function isValidRating(rating) {
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


//module.exports = exportedMethods;
