const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

// mongoose.collection('UsersTest', function (err, collection) {
//     collection.find({fullname: 'myanmeishaheeer'});
// });

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    userType: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: "USER"
    },
    private: {
        type: Boolean,
        default: true
    },
    profileBio: {
        type: String,
        default: " "
    },
    totalPoints: {
        type: String,
        default: "0 points"
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now()
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    verifiedPhone: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String,
        default: "0321 - 2T1L"
    },
    userProfilePicture: {
        type: String,
        default: "need empty url loader for user PP"
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
});


// returns in API whenever we do register/login
// converts mongoDB document to JSON to show client side

//this is to return reci
userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password;
        //delete returnedObject.date;
        delete returnedObject.phoneNumber;
        
    },
});

//this line to check if email already in use
userSchema.plugin(uniqueValidator, { messagse: "Email or Username already in use" });

const Users = mongoose.model("user", userSchema);
module.exports = Users;

