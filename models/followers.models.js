const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const followersSchema = new Schema ({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    followers: [{
        type: String
    }]
})

followersSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;        
    },
});

followersSchema.methods.addFollower = async function(acceptRequestFrom) {
    try {
        this.followers.items.push({ acceptRequestFrom });
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

followersSchema.methods.getFollowersLength = async function() {
    try {
        return this.followwers.length;
    } catch (error) {
        throw error;
    }
}

followersSchema.plugin(uniqueValidator, { messagse: "Follow Request already sent" });

const followers = mongoose.model("followers", followersSchema);
module.exports = followers;