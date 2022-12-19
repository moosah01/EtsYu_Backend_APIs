const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const challengesSchema = new Schema ({
    challengeName: {
        type: String,
        required: true,
        unique: true
    },
    challengeDesc: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        default: Date.now()
    },
    totalAccepted: {
        type: Number,
        default: 0
    },
    totalCompleted: {
        type: Number,
        default: 0
    },
    successRate: {
        type: Number,
        default: 1,
        minimum: 1
    },
    creatorID: {
        type: String,
        required: true,
    },
    trophieID: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'no pain no gain'],
        required: true
    },
    acceptanceCriteria: {
        type: Object,
        properties: {
            minVotes: {
                type: Number,
                required: true
            },
            winPercent: {
                type: Number,
                required: true
            },
            timeLimit: {
                type: Number,
                default: Date.now() + 72*60*60*1000 
            }
        }
    },
    votingDuration: {
        type: Date,
        default: Date.now() + 72*60*60*1000
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
})

challengesSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        //delete returnedObject._id;        
        delete returnedObject.__v;
    },
});

challengesSchema.plugin(uniqueValidator, { messagse: "Follow Request already sent" });

const challenges = mongoose.model("challenges", challengesSchema);
module.exports = challenges;