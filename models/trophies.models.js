const mongoose = require ("mongoose");
const {Schema} = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const trophiesSchema = new Schema({
    badgeUrl: {
        type: String,
        required: true,
        unique: true
    }
})

trophiesSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;        
        delete returnedObject.__v;
    },
});

trophiesSchema.plugin(uniqueValidator, { messagse: "A trophie with this badge already exists" });

const trophies = mongoose.model("trophies", trophiesSchema);
module.exports = trophies;