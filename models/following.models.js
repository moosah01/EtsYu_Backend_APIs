const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const followingSchema = new Schema ({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    following: [{
        type: String
    }]
})

followingSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;        
    },
});

followingSchema.methods.addToFollowing = async function(userName) {
    try {
        this.following.items.push({ userName });
        this.save()
        .then((response) => {
            return callback(null, response);
        })
        .catch((error) => {
            return callback(error);
        });
    } catch (error) {
        throw error;
    }
}

followingSchema.methods.getFollowingLength = async function() {
    try {
        return this.following.length;
    } catch (error) {
        throw error;
    }
}

followingSchema.plugin(uniqueValidator, { messagse: "Follow Request already sent" });

const following = mongoose.model("following", followingSchema);
module.exports = following;