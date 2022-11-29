const mongoose = require("mongoose");
const {Schema} = mongoose;
const uniqueValidator = require("mongoose-unique-validator");


const mypostsSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    myposts: [{
        type: String,
    }]
})

mypostsSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject.id;
        delete returnedObject._id;        
    },
});

mypostsSchema.plugin(uniqueValidator, {message: "A post with this ID already exists"});

const myposts = mongoose.model("myposts", mypostsSchema);
module.exports = myposts;