const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const followRequestsSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  requests: [
    {
      type: String
    },
  ],
});

followRequestsSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    (returnedObject.id = returnedObject._id.toString()),
      delete returnedObject.id;
    delete returnedObject._id;
  },
});

followRequestsSchema.methods.deleteRequest = async function (
  acceptRequestFrom
) {
  try {
    if (this.requests.length > 0) {
      var isFound = 0;
      for (var i = 0; i < this.requests.length; i++) {
        if (this.requests[i] === acceptRequestFrom) {
          isFound = 1;
          this.requests[i].remove(i);
        }
      }
      if (isFound == 0) {
        return callback({
          message: "This guy never sent you a req in the first place",
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

followRequestsSchema.methods.getFollowRequestsLength = async function () {
  try {
    return this.requests.length;
  } catch (error) {
    return error;
  }
};

followRequestsSchema.plugin(uniqueValidator, {
  messagse: "Follow Request already sent",
});

const followRequests = mongoose.model("followRequests", followRequestsSchema);
module.exports = followRequests;
