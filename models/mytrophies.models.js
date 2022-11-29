const mongoose = require("mongoose");
const {Schema} = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const mytrophiesSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    trophiesAwarded: [{
        type: String
    }]
})

mytrophiesSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;        
    },
});

mytrophiesSchema.plugin(uniqueValidator, {message: "userName already has document created"});

const mytrophies = mongoose.model("mytrophies", mytrophiesSchema);
module.exports = mytrophies;
