const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const postsSchema = new Schema ({
    description: {
        type: String,
        default: " "
    },
    mediaURL: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        default: Date.now()
    },
    challengeID: {
        type: String,
        required: true,
    },
    numberOfLikes: {
        type: Number,
        default: 0,
        minimum: 0
    },
    commentIDs: [{
        type: String
    }],
    likedByIDs: [{
        type: String,
    }],
    isPrivated: {
        type: Boolean,
        default: false
    },
    userName: {
        type: String,
        required: true
    },
    winCount: {
        type: Number,
        default: 0,
        minimum: 0
    },
    lossCount: {
        type: Number,
        default: 0,
        minimum: 0
    }
})



postsSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        //delete returnedObject.id;
        //delete returnedObject._id;        
        delete returnedObject.__v;
    },
});

postsSchema.plugin(uniqueValidator, { messagse: "Follow Request already sent" });

const Posts = mongoose.model("posts", postsSchema);
module.exports = Posts;