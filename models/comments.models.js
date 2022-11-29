const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const commentsSchema = new Schema ({
    commentedByID: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    commentDate: {
        type: Date,
        default: Date.now()
    },
    numberOfLikes: {
        type: Number,
        default: 0,
        minimum: 0
    },
})


commentsSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;        
    },
});

commentsSchema.plugin(uniqueValidator, { messagse: "Waisay iski Zaroorat nahi ye unique validtor ki" });

const comments = mongoose.model("comments", commentsSchema);
module.exports = comments;