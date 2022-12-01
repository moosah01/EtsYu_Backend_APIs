const mongoose = require("mongoose");
const {Schema} = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const mychallengesSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    challengesAccepted: [{
        type: Object,
        properties: {
            challengeID: {
                type: String,
                required: true,
            },
            startDate: {
                type: Date,
                default: Date.now(),
            },
            endDate: {
                type: Date,
                default: Date.now() + 72*60*60*1000 // 72 hours from now
            },
            status: {
                type: String,
                enum: ['pending', 'failed', 'success', 'uploaded'],
                default: 'pending'
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
            },
            hasPosted: {
                type: Boolean,
                default: false
            },
        }
    }]
})

mychallengesSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        //delete returnedObject._id;        
    },
});

mychallengesSchema.plugin(uniqueValidator, {message: "userName already has document created"});

const mychallenges = mongoose.model("mychallenges", mychallengesSchema);
module.exports = mychallenges;
