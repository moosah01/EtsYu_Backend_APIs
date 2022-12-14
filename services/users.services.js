const User = require("../models/users.models.js");
const Posts = require("../models/posts.models.js");
const Challenges = require("../models/challenges.models.js");
const Followers = require("../models/followers.models.js");
const Following = require("../models/following.models.js");
const FollowRequests = require("../models/followRequests.models.js");
const MyPosts = require("../models/myposts.models.js");
const MyChallenges = require("../models/mychallenges.models.js");
const Comments = require("../models/comments.models.js");
const Trophies = require("../models/trophies.models.js");
const MyTrophies = require("../models/mytrophies.models.js");

const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.js");
//const mytrophies = require("../models/mytrophies.models.js");
//const { getOwnProfile } = require("../controllers/users.controllers.js");
const Users = require("../models/users.models.js");
const { userProfile } = require("../controllers/users.controllers.js");
var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//var mongoose = require('mongoose');

// var fNode = function(userName, fullName, userProfilePicture) {
//   this.userName = userName
//   this.fullName = fullName
//   this.userProfilePicture = userProfilePicture
// }

// class fNode {
//   constructor(userName, fullName, userProfilePicture) {
//     this.userName = userName;
//     this.fullName = fullName;
//     this.userProfilePicture = userProfilePicture;
//   }
// }

function fNode(userName, fullName, userProfilePicture) {
  this.userName = userName;
  this.fullName = fullName;
  this.userProfilePicture = userProfilePicture;
}

function challengeNode(challenge, challengeImage) {
  this.challenge = challenge;
  this.challengeImage = challengeImage;
}

function myChallengeNode(challengeDetails, myChallenge, challengeImage) {
  this.challengeDetails = challengeDetails;
  (this.myChallenge = myChallenge), (this.challengeImage = challengeImage);
}



function postNode(
  postDetails,
  userProfilePicture,
  challengeName,
  challengeImage
) {
  this.postDetails = postDetails;
  this.userProfilePicture = userProfilePicture;
  this.challengeName = challengeName;
  this.challengeImage = challengeImage;
}

const shuffle = (array) => {
  for (let i = array.length-1; i>0 ; i--) {
    const j = Math.floor(Math.random()*(i+1));
    const temp = array[i];

    //swap
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function compare(a, b) {
  if (a > b) {
    return 1;
  }
  if (b > a) {
    return -1;
  }

  return 0;
}

async function login({ userName, password }, callback) {
  //find the first user with the given fullname
  const user = await User.findOne({ userName });

  //if user exists
  if (user != null) {
    //if the passwords match
    if (bcrypt.compareSync(password, user.password)) {
      const token = auth.generateAccessToken(userName);
      //first parameter is for error
      //since the is the user exists + password match condition
      //you wont return any error and pass parameter as null
      return callback(null, { ...user.toJSON(), token });
    }
    //even if passwor is wrong u will say
    //both password and fullname are invalid
    else {
      return callback({
        message: "Invalid fullname AND/OR password!",
      });
    }
  }
  //if user is not found
  else {
    return callback({
      message: "User does not exist",
    });
  }
}

async function register(params, callback) {
  //if the user did not type in any fullname

  if (!params.fullName || !params.userName) {
    console.log("fullname or username is undefined");
    return callback({ message: "Full Name AND User Name is required" });
  }

  if (!params.password) {
    console.log("Password is undefined");
    return callback({ message: "Password is required" });
  }

  if (!params.email) {
    console.log("Email is undefined");
    return callback({ message: "Email is required" });
  }

  if (!params.email.match(mailformat)) {
    return callback({ message: "Invalid  Email" });
  }

  const user = new User(params);
  user
    .save()
    .then((responseUser) => {
      console.log("User Saved");
      const follower = new Followers(params);
      follower
        .save()
        .then((responseFollower) => {
          console.log("Followers document created");
          const following = new Following(params);
          following
            .save()
            .then((responseFollowing) => {
              console.log("Following document created");
              const followRequests = new FollowRequests(params);
              followRequests
                .save()
                .then((responseFollowReqs) => {
                  console.log("Follow Requests document created");

                  const myPosts = new MyPosts(params);
                  myPosts.save().then((responseMyPosts) => {
                    console.log("My Posts document created");
                    const myChallenges = new MyChallenges(params);
                    myChallenges.save().then((responseMyChallenges) => {
                      console.log("My Challenges document created");
                      const myTrophies = new MyTrophies(params);
                      myTrophies.save().then((responseMyTrophies) => {
                        console.log("My Trophies document has been created");
                        return callback(null, responseUser);
                      });
                    });
                  });
                })
                .catch((error) => {
                  return callback(error);
                });
            })
            .catch((error) => {
              return callback(error);
            });
        })
        .catch((error) => {
          return callback(error);
        });
    })
    .catch((error) => {
      return callback(error);
    });
}

async function updatePassword(
  { userName, newPassword, oldPassword },
  callback
) {
  if (!oldPassword) {
    console.log("Old password is required");
    return callback({ message: "Current password is required" });
  }

  if (!newPassword) {
    console.log("new password is required");
    return callback({ message: "New password is required" });
  }

  if (!userName) {
    console.log("userName is required");
    return callback({ message: "userName is required" });
  }

  const user = await User.findOne({ userName });

  if (user != null) {
    if (bcrypt.compareSync(oldPassword, user.password)) {
      user.password = newPassword;
    } else {
      return callback({
        message: "The password entered is incorrect",
      });
    }
  } else {
    //user is nulll
    return callback({
      message: "User does not exist",
    });
  }

  //update password
  user
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function updatePrivateStatus({ userName }, callback) {
  if (!userName) {
    console.log("userName is required");
    return callback({ message: "userName is required" });
  }

  const user = await User.findOne({ userName });

  if (user != null) {
    user.private = !user.private;
  } else {
    return callback({
      message: "User does not exist",
    });
  }
  //update private status
  user
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function updateProfilePicture({ userName, newProfileUrl }, callback) {
  if (!userName) {
    console.log("userName is required");
    return callback({ message: "userName is required" });
  }

  if (!newProfileUrl) {
    console.log("profile url is required");
    return callback({ message: "profile url is required" });
  }

  const user = await User.findOne({ userName });

  if (user != null) {
    user.userProfilePicture = newProfileUrl;
  } else {
    return callback({
      message: "User does not exist",
    });
  }
  //update private status
  user
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function updateProfileBio({ userName, newProfileBio }, callback) {
  if (!userName) {
    console.log("userName is required");
    return callback({ message: "userName is required" });
  }

  if (!newProfileBio) {
    console.log("Bio needs to be entered");
    return callback({ message: "Add a Bio bro" });
  }

  const user = await User.findOne({ userName });

  if (user != null) {
    user.profileBio = newProfileBio;
  } else {
    return callback({
      message: "User does not exist",
    });
  }
  //update private status
  user
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function sendFollowRequest({ userName, sendRequestTo }, callback) {
  if (!userName || !sendRequestTo) {
    console.log("userName & sendRequestTo Missing");
    return callback({ message: "userName & sendRequestTo is required" });
  }

  if (userName === sendRequestTo) {
    return callback({ message: "You cant send request to yourself" });
  } else {
    const user = await User.findOne({ userName: userName }); //sending req
    const user2 = await User.findOne({ userName: sendRequestTo }); //this user is being sent request to

    if (user != null && user2 != null) {
      const isAlreadyFollowing = await Following.findOne({
        userName: userName,
        following: sendRequestTo,
      });

      const hasAlreadySentRequest = await FollowRequests.findOne({
        userName: sendRequestTo,
        requests: userName,
      });

      if (isAlreadyFollowing == null && hasAlreadySentRequest == null) {
        await FollowRequests.findOneAndUpdate(
          {
            //first is filter on the basis of
            userName: sendRequestTo,
          },
          {
            //use $push if you dont want unique check before pushing
            $addToSet: {
              requests: userName,
            },
          }
        );
        return callback(null, "Success");
      } else {
        if (isAlreadyFollowing) {
          return callback({
            message: "You are already following this user",
          });
        }
        if (hasAlreadySentRequest) {
          return callback({
            message: "You have already sent this user a friend request",
          });
        }
      }
    } else {
      if (!user) {
        return callback({
          message: "User 1 does not exist.",
        });
      } else if (!user2) {
        return callback({
          message: "User 2 does not exist.",
        });
      }
    }
    return callback({
      message: "Error Request Failed",
    });
  }
}

async function deleteFollowRequest({ userName, deleteRequestFrom }, callback) {
  if (!userName || !deleteRequestFrom) {
    console.log("userName & deleteRequestFrom Missing");
    return callback({ message: "userName & deleteRequestFrom is required" });
  }

  const user = await User.findOne({ userName: userName }); //accepts the request
  const user2 = await User.findOne({ userName: deleteRequestFrom }); //the user being deleted

  if (user != null && user2 != null) {
    const hasSentFollowReq = await FollowRequests.findOne({
      userName: userName,
      requests: deleteRequestFrom,
    });

    if (hasSentFollowReq != null) {
      await FollowRequests.findOneAndUpdate(
        {
          //first is filter on the basis of
          userName: userName,
        },
        {
          //use $push if you dont want unique check before pushing
          $pull: {
            requests: deleteRequestFrom,
          },
        }
      );
      return callback(null, "Success");
    } else {
      return callback({
        message: "Has not sent a request to you in the first place",
      });
    }
  } else {
    if (!user) {
      return callback({
        message: "User 1 does not exist.",
      });
    } else if (!user2) {
      return callback({
        message: "User 2 does not exist.",
      });
    }
  }
}

async function acceptFollowRequest({ userName, acceptRequestFrom }, callback) {
  if (!userName || !acceptRequestFrom) {
    //console.log("userName & acceotRequestFrom Missing");
    return callback({ message: "userName & acceptRequestFrom is required" });
  }

  const user = await User.findOne({ userName: userName }); //accepts the request
  const user2 = await User.findOne({ userName: acceptRequestFrom }); //the user being accepted

  if (user != null && user2 != null) {
    const FR = await FollowRequests.findOneAndUpdate(
      {
        userName: userName,
        requests: acceptRequestFrom,
      },
      {
        $pull: {
          requests: acceptRequestFrom,
        },
      }
    )
      .then()
      .catch((error) => {
        return callback(error);
      });

    if (FR != null) {
      await Followers.findOneAndUpdate(
        {
          userName: userName,
        },
        {
          $addToSet: {
            followers: acceptRequestFrom,
          },
        }
      )
        .then()
        .catch((error) => {
          return callback(error);
        });

      await Following.findOneAndUpdate(
        {
          userName: acceptRequestFrom,
        },
        {
          $addToSet: {
            following: userName,
          },
        }
      )
        .then()
        .catch((error) => {
          return callback(error);
        });
      return callback(null, "Success");
    } else {
      return callback({
        message: "You have not recieved a request from this person",
      });
    }
  } else {
    return callback({
      message: "one of the two users or both do not exists",
    });
  }
}

async function uploadPost(
  { mediaURL, challengeID, userName, description },
  callback
) {
  if (!mediaURL) {
    return callback({
      message: "Medai needed to upload a post. Media is missing",
    });
  }
  if (!challengeID) {
    return callback({
      message: "No post can be uploaded without a valid challenge id",
    });
  }
  if (!userName) {
    return callback({
      message: "Have to specify which user is making the post",
    });
  }

  //bruh it can crash if string is of length 24 and not this format
  if (challengeID.length != 24) {
    return callback({
      message: "Invalid ID => does not follow MongoDB format for _id",
    });
  }

  if (
    (await Challenges.find({
      _id: challengeID,
    }).count()) > 0
  ) {
    //check if they have accepted challenge
    if (
      (await MyChallenges.findOne({
        userName: userName,
        "challengesAccepted.challengeID": challengeID,
        "challengesAccepted.status": "pending",
        "challengesAccepted.hasPosted": false,
      }).count()) > 0
    ) {
      //console.log("step 3");
      var thisChallenge = await MyChallenges.findOne({
        userName: userName,
      });

      //console.log(thisChallenge)
      for (var i = 0; i < thisChallenge.challengesAccepted.length; i++) {
        // console.log(thisChallenge.challengesAccepted[i])
        if (thisChallenge.challengesAccepted[i].challengeID === challengeID) {
          const endDate = thisChallenge.challengesAccepted[i].endDate;

          console.log(i);
          console.log(thisChallenge.challengesAccepted[i]);
          thisChallenge.challengesAccepted[i].status = "uploaded";
          await thisChallenge.save();
          //  console.

          console.log("step 4");
          const nowDate = new Date(Date.now());
          //  console.log(nowDate);

          //deadline to post challenge has passed
          if (nowDate.getTime() < endDate.getTime()) {
            var post;

            if (!description) {
              post = new Posts({
                userName: userName,
                mediaURL: mediaURL,
                challengeID: challengeID,
              });
            } else {
              post = new Posts({
                userName: userName,
                mediaURL: mediaURL,
                challengeID: challengeID,
                description: description,
              });
            }

            post
              .save()
              .then(async (response) => {
                await MyPosts.findOneAndUpdate(
                  {
                    userName: userName,
                  },
                  {
                    $addToSet: {
                      myposts: post._id,
                    },
                  }
                );

                console.log("Post Added to myposts");
                return callback(null, response);
              })
              .catch((error) => {
                return callback({
                  message: "Post Creation Failed",
                });
              });

            await MyChallenges.findOneAndUpdate(
              {
                userName: userName,
                "challengesAccepted.challengeID": challengeID,
                "challengesAccepted.status": "pending",
                //"challengesAccepted.hasPosted": false,
              },
              {
                $set: {
                  "challengesAccepted.$.status": "uploaded",
                  "challengesAccepted.$.hasPosted": true,
                },
              }
            ).then((response) => {
              return callback(null, "post uploaded succesfully");
            });
          } else {
            return callback({
              message:
                "You cannot upload for this challenge anymore, the date has passed",
            });
          }
        }
      }
      return callback({
        message: "ABCD",
      });
    } else {
      return callback({
        message: "You have not accepted this challenge ",
      });
    }
  } else {
    return callback({
      message: "this challenge does not exist",
    });
  }
}

async function togglePostPrivacy({ userName, postID }, callback) {
  if (!postID) {
    return callback({ message: "Cant toggle without PostID -> empty sent" });
  }

  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }

  const post = await Posts.findById({ _id: postID });

  if (!post) {
    return callback({
      message: "the post you are trying to toggle privacy of does not exist",
    });
  } else {
    post.isPrivated = !post.isPrivated;

    post
      .save()
      .then((response) => {
        return callback(null, response);
      })
      .catch((error) => {
        return callback(error);
      });
  }
}

async function deletePost({ userName, postID }, callback) {
  if (!postID) {
    return callback({ message: "Cant delete without PostID -> empty send" });
  }

  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }

  const post = await Posts.findById({ _id: postID });
  if (!post) {
    return callback({
      message: "the post you are trying to delete does not exist",
    });
  } else {
    post
      .delete()
      .then(async (response) => {
        await MyPosts.findOneAndUpdate(
          {
            userName: userName,
          },
          {
            $pull: {
              myposts: postID,
            },
          }
        );
        return callback(null, "Post deleted -> sent from User Services");
      })
      .catch((error) => {
        return callback(error);
      });
  }
}

// //async function likeToggle({ userName, postID }, callback) {
// if (!postID) {
//   return callback({ message: "Cant delete without PostID -> empty send" });
// }

// if (!userName) {
//   return callback({
//     message: "need details of author of post you are trying to delete",
//   });
// }

// console.log("abcd");

// const post = await Posts.findById({ _id: postID });
// if (!post) {
//   return callback({
//     message: "the post you are trying to like does not exist",
//   });
// } else {
//   //check if document is already liked
//   var isLiked = false;
//   console.log(isLiked);

//   isLiked =
//     (await Posts.find({
//       _id: postID,
//       likedbyIDs: {
//         $in: [userName],
//       },
//     }).count()) > 0;

//   console.log(isLiked);

//   if (isLiked === true) {
//     // post.updateOne(
//     //   {
//     //     _id: postID,
//     //   },
//     //   {
//     //     $inc: {
//     //       numberOfLikes: -1,
//     //     },
//     //     $pull: {
//     //       likedByIDs: userName,
//     //     },
//     //   }
//     // );
//     // post
//     //   .save()
//     //   .then((response) => {
//     //     return callback(null, response);
//     //   })
//     //   .catch((error) => {
//     //     return callback(error);
//     //   });
//     await Posts.findByIdAndUpdate(
//       {
//         _id: postID,
//       },
//       {
//         $inc: {
//           numberOfLikes: -1,
//         },
//         $pull: {
//           likedByIDs: userName,
//         },
//       }
//     );
//     console.log("I am here --> UNLIKE");
//     return callback(null, "Post unliked");
//   } else {
//     // post.updateOne(
//     //   {
//     //     _id: postID,
//     //   },
//     //   {
//     //     $inc: {
//     //       numberOfLikes: 1,
//     //     },
//     //     $addToSet: {
//     //       likedByIDs: userName,
//     //     },
//     //   }
//     // );
//     // post
//     //   .save()
//     //   .then((response) => {
//     //     return callback(null, response);
//     //   })
//     //   .catch((error) => {
//     //     return callback(error);
//     //   });
//     await Posts.findByIdAndUpdate(
//       {
//         _id: postID,
//       },
//       {
//         $inc: {
//           numberOfLikes: 1,
//         },
//         $addToSet: {
//           likedByIDs: userName,
//         },
//       }
//     );
//     console.log("I am here --> LIKE");
//     return callback(null, "Post liked");
//   }
// }
// //}

async function likeToggle({ userName, postID }, callback) {
  if (!postID) {
    return callback({ message: "Cant delete without PostID -> empty send" });
  }
  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }

  const user = await Users.findOne({ userName: userName });

  const post = await Posts.findById({ _id: postID });
  if (user != null) {
    if (!post) {
      return callback({
        message: "the post you are trying to like does not exist",
      });
    } else {
      //console.log(result);
      if (
        (await Posts.find({
          _id: postID,
          likedByIDs: userName,
        }).count()) > 0
      ) {
        await Posts.findByIdAndUpdate(
          {
            _id: postID,
          },
          {
            $inc: {
              numberOfLikes: -1,
            },
            $pull: {
              likedByIDs: userName,
            },
          }
        );
        //console.log("I am here --> UNLIKE");
        return callback(null, "Post unliked");
      } else {
        await Posts.findByIdAndUpdate(
          {
            _id: postID,
          },
          {
            $inc: {
              numberOfLikes: 1,
            },
            $addToSet: {
              likedByIDs: userName,
            },
          }
        );
        //console.log("I am here --> LIKE");
        return callback(null, "Post liked");
      }
    }
  } else {
    return callback({
      message: "user does not exist",
    });
  }
}

async function likePost({ userName, postID }, callback) {
  if (!postID) {
    return callback({ message: "Cant delete without PostID -> empty send" });
  }

  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }

  const post = await Posts.findById({ _id: postID });
  if (!post) {
    return callback({
      message: "the post you are trying to like does not exist",
    });
  } else {
    await Posts.findByIdAndUpdate(
      {
        _id: postID,
      },
      {
        $inc: {
          numberOfLikes: 1,
        },
        $addToSet: {
          likedByIDs: userName,
        },
      }
    );
    console.log("I am here --> LIKE");
    return callback(null, "Post liked");
  }
}

async function unLikePost({ userName, postID }, callback) {
  if (!postID) {
    return callback({ message: "Cant delete without PostID -> empty send" });
  }

  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }

  const post = await Posts.findById({ _id: postID });
  if (!post) {
    return callback({
      message: "the post you are trying to like does not exist",
    });
  } else {
    await Posts.findByIdAndUpdate(
      {
        _id: postID,
      },
      {
        $inc: {
          numberOfLikes: -1,
        },
        $pull: {
          likedByIDs: userName,
        },
      }
    );
    console.log("I am here --> UNLIKE");
    return callback(null, "Post Unliked");
  }
}

async function commentOnPost({ userName, postID, comment }, callback) {
  if (!postID) {
    return callback({ message: "Cant delete without PostID -> empty send" });
  }
  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }
  if (!comment) {
    return callback({
      message: "comment cannot be empty",
    });
  }
  if (comment.trim().length === 0) {
    return callback({
      message: "comment cannot consist of only white spaces",
    });
  }

  const newComment = new Comments({
    commentedByID: userName,
    comment: comment,
  });
  // Comments.create({
  //   commentedByID: userName,
  //   comment: comment
  // }).then(result => {
  //   console.log(result)
  // })
  await Posts.findByIdAndUpdate(
    {
      _id: postID,
    },
    {
      $push: {
        commentIDs: newComment._id,
      },
    }
  );
  newComment
    .save()
    .then((responseComment) => {
      console.log("Comment created");
      return callback(null, responseComment);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function deleteComment({ userName, postID, commentID }, callback) {
  if (!postID) {
    return callback({ message: "Cant delete without PostID -> empty send" });
  }
  if (!userName) {
    return callback({
      message: "need details of author of post you are trying to delete",
    });
  }
  if (!commentID) {
    return callback({
      message: "comment cannot be empty",
    });
  }
  const post1 = await Posts.findById({ _id: postID });
  const comm1 = await Comments.find({ _id: commentID });
  if (post1 != null && comm1 != null) {
    if (
      (await Posts.find({
        _id: postID,
        commentIDs: commentID,
      }).count()) > 0
    ) {
      await Posts.findByIdAndUpdate(
        {
          _id: postID,
        },
        {
          $pull: {
            commentIDs: commentID,
          },
        }
      );
      await Comments.deleteOne({
        _id: commentID,
      });

      return callback({
        message: "Comment succesfully deleted",
      });
    } else {
      return callback({
        message: "this comment does not exist",
      });
    }
  } else {
    if (post1 != null) {
      return callback({
        message: "this comment ID does not exist",
      });
    } else if (comm1 != null) {
      return callback({
        message: "this post ID does not exist",
      });
    } else {
      return callback({
        message: "the post and comment ids are incorrect",
      });
    }
  }
}

async function addChallenge(params, callback) {
  if (!params.challengeDesc) {
    return callback({ message: "every challenge needs a description" });
  }
  if (!params.userName) {
    return callback({ message: "every challenge needs an author" });
  }

  if (!params.challengeName) {
    return callback({ message: "every challenge needs a name" });
  }
  if (!params.badgeUrl) {
    return callback({ message: "every challenge needs a trophie" });
  }
  if (!params.difficulty) {
    return callback({ message: "every challenge needs a difficulty" });
  }
  if (!params.acceptanceCriteria.minVotes) {
    return callback({
      message: "every challenge needs minimum votes to be accepted",
    });
  }
  if (!params.acceptanceCriteria.winPercent) {
    return callback({
      message: "every challenge needs a win percentage votes to be accepted",
    });
  }

  const user = await Users.findOne({ userName: params.userName });

  if (user != null) {
    if (user.userType === "ADMIN") {
      if (
        params.difficulty === "easy" ||
        params.difficulty === "medium" ||
        params.difficulty === "no pain no gain"
      ) {
        const newTrophie = new Trophies({
          badgeUrl: params.badgeUrl,
        });

        const newChallenge = new Challenges({
          challengeDesc: params.challengeDesc,
          challengeName: params.challengeName,
          creatorID: params.userName,
          trophieID: newTrophie._id,
          difficulty: params.difficulty,
          acceptanceCriteria: {
            properties: {
              minVotes: params.acceptanceCriteria.minVotes,
              winPercent: params.acceptanceCriteria.winPercent,
              timeLimit: "3 days",
            },
          },
        });

        newChallenge
          .save()
          .then((responseChallenge) => {
            newTrophie
              .save()
              .then((responseTrophie) => {
                console.log("Trophie Saved");
                return callback(null, responseChallenge);
              })
              .catch((error) => {
                console.log("i am here");
                return callback(error);
              });
          })
          .catch((error) => {
            console.log("i am here 2");
            return callback(error);
          });
      } else {
        return callback({ message: "invalid challenge difficulty" });
      }
    } else {
      return callback({ message: "you are not authorised to do this" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
  // if (!params.acceptanceCriteria.timeLimit) {
  //   return callback({ message: "every challenge needs a time limit" });
  // }
}

async function toggleChallengeStatus(
  { challengeID, newStatus, userName },
  callback
) {
  if (!challengeID) {
    return callback({ message: "challenge ID not entered" });
  }
  if (!newStatus) {
    return callback({ message: "new Status not specified" });
  }

  if (!userName) {
    return callback({ message: "invalid input - userName not given" });
  }

  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    if (user.userType === "ADMIN") {
      if (
        newStatus === "inactive" ||
        newStatus === "active" ||
        newStatus === "deleted"
      ) {
        if (
          (await Challenges.find({
            _id: challengeID,
          }).count()) > 0
        ) {
          await Challenges.findByIdAndUpdate(
            {
              _id: challengeID,
            },
            {
              status: newStatus,
            }
          );
          return callback(null,({ message: "challenge status is now changed" }));
        } else {
          return callback({
            message: "challenge with entered ID does not exist",
          });
        }
      } else {
        return callback({ message: "invalid status given" });
      }
    } else {
      return callback({ message: "you are not authorised to do this" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function acceptChallenge({ userName, challengeID }, callback) {
  if (!userName) {
    return callback({
      message: "need to specify who is accepting the challenge",
    });
  }

  if (!challengeID) {
    return callback({ message: "invalid challenge ID" });
  }

  if (challengeID.length != 24) {
    return callback({
      message: "Invalid ID => does not follow MongoDB format for _id",
    });
  }

  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    if (
      (await MyChallenges.findOne({
        userName: userName,
        "challengesAccepted.challengeID": challengeID,
        "challengesAccepted.status": "pending",
      }).count()) > 0
    ) {
      return callback({
        message:
          "You have already accepted this challenge. We're waiting for you to upload",
      });
    } else {
      if (
        (await Challenges.find({
          _id: challengeID,
        }).count()) > 0
      ) {
        await MyChallenges.findOneAndUpdate(
          {
            userName: userName,
          },
          {
            $push: {
              challengesAccepted: {
                challengeID: challengeID,
                startDate: new Date(Date.now()),
                endDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
                status: "pending",
                winCount: 0,
                lossCount: 0,
                hasPosted: false,
              },
            },
          }
        );

        await Challenges.findByIdAndUpdate(
          {
            _id: challengeID,
          },
          {
            $inc: {
              totalAccepted: 1,
            },
          }
        );

        return callback(null, "Challenge officially accepted");
      } else {
        return callback({
          message: "A challenge with this challenge ID does not exist",
        });
      }
    }
  } else {
    return callback({
      message: "User does not exist.",
    });
  }
}

async function voteWin({ userName, challengeID, postID }, callback) {
  if (!userName) {
    return callback({ message: "every challenge needs an author" });
  }
  if (!challengeID) {
    return callback({ message: "invalid challenge ID" });
  }
  if (!postID) {
    return callback({ message: "invalid Post ID" });
  }

  if (
    (await Challenges.find({
      _id: challengeID,
    }).count()) > 0
  ) {
    if (
      (await Posts.find({
        _id: postID,
      }).count()) > 0
    ) {
      const post = await Posts.findOne({ _id: postID });
      const challenge = await Challenges.findOne({ _id: challengeID });
      const mychallenge = await MyChallenges.find({ userName: userName });
      //console.log(mychallenge);

      for (var i = 0; i < mychallenge[0].challengesAccepted.length; i++) {
        if (mychallenge[0].challengesAccepted[i].challengeID == challengeID) {
          const endDate = mychallenge[0].challengesAccepted[i].endDate;
          //  console.log(endDate);

          const nowDate = new Date(Date.now());
          //console.log(nowDate);

          if (nowDate.getTime() < endDate.getTime()) {
            await Posts.findByIdAndUpdate(
              {
                _id: postID,
              },
              {
                $inc: {
                  winCount: 1,
                },
              }
            );

            console.log(mychallenge[0].challengesAccepted[i].winCount);
            mychallenge[0].challengesAccepted[i].winCount++;
            console.log(mychallenge[0].challengesAccepted[i].winCount);
            mychallenge[0]
              .save()
              .then((responseSaveMyChallenge) => {
                console.log(mychallenge[0].challengesAccepted[i].winCount);
                console.log(responseSaveMyChallenge);
              })
              .catch((errorchallengesave) => {
                return callback(errorchallengesave);
              });
            // await MyChallenges.findOneAndUpdate(
            //   {
            //     userName: userName,
            //   },
            //   {
            //     challengesAccepted: {
            //       $inc: {
            //         winCount: 1,
            //       },
            //     }
            //   }
            // );
            const totalVotes = post.winCount + post.lossCount;
            var wPercentage = 0;
            if (totalVotes >= challenge.acceptanceCriteria.minVotes) {
              lossCount = post.lossCount;
              wPercentage = (post.winCount / totalVotes) * 100;
              if (wPercentage > challenge.acceptanceCriteria.winPercent) {
                await MyChallenges.findOneAndUpdate(
                  {
                    userName: userName,
                  },
                  {
                    status: "success",
                  }
                );

                await Challenges.findByIdAndUpdate(
                  {
                    _id: challengeID,
                  },
                  {
                    $inc: {
                      totalCompleted: 1,
                    },
                  }
                );
                const successPercentage =
                  (challenge.totalCompleted / challenge.totalAccepted) * 100;

                await Challenges.findByIdAndUpdate(
                  {
                    _id: challengeID,
                  },
                  {
                    successRate: successPercentage,
                  }
                );

                const trophieID = challenge.trophieID;
                await MyTrophies.findOneAndUpdate(
                  {
                    userName: userName,
                  },
                  {
                    $addToSet: {
                      trophiesAwarded: trophieID,
                    },
                  }
                );
                return callback(
                  null,
                  "Vote given as Win => user has now won the trophie!"
                );
              }
            } else {
              console.log("Too early to give decision right now");
              return callback(null, "Vote given as Win");
            }
          } else {
            return callback({
              message:
                "Vote duration for this post has ended, you can no longer vote",
            });
          }
        } else {
          return callback({
            message: "This challenge has not been accepted by the user",
          });
        }
      }
    } else {
      return callback({ message: "This challenge does not exist" });
    }
  } else {
    return callback({ message: "This post does not exist" });
  }
}

async function getOwnProfile({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }

  const user = await Users.findOne({ userName: userName });
  if (user != null) {
    console.log("i am at get own profile");
    //return callback(null, { ...user.toJSON()});
    // await Users.findOne({ userName: userName }).then((result) => {
    //   return callback(null, result);
    // });

    const following = await Following.findOne({ userName: userName });
    const followers = await Followers.findOne({ userName: userName });

    const followingCount = following.following.length;
    const followerCount = followers.followers.length;

    return callback(null, { ...user.toJSON(), followingCount, followerCount });
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function getOwnPosts({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }

  const user = await Users.findOne({ userName: userName });
  if (user != null) {
    var postNodeList = [];
    var currPost;
    var userProfilePicture;
    var challengeName;
    var challengeImage;
    var tempChallenge;
    var tempChallengeID;

    var tempTrophie;
    var tempTrophieID;

    userProfilePicture = user.userProfilePicture;

    if (
      (await Posts.find({
        userName: userName,
      }).count()) > 0
    ) {
      const allPosts = await Posts.find({ userName: userName }).sort({
        dateAdded: "desc",
      });

      for (var i = 0; i < allPosts.length; i++) {
        currPost = allPosts[i];
        tempChallengeID = allPosts[i].challengeID;
        tempChallenge = await Challenges.findById({ _id: tempChallengeID });

        tempTrophieID = tempChallenge.trophieID;
        challengeName = tempChallenge.challengeName;

        tempTrophie = await Trophies.findById({ _id: tempTrophieID });

        challengeImage = tempTrophie.badgeUrl;

        postNodeList.push(
          new postNode(
            currPost,
            userProfilePicture,
            challengeName,
            challengeImage
          )
        );
      }

      return callback(null, postNodeList);
    } else {
      return callback({ message: " this user has not made any posts" });
      //return callback(null, "No posts uploaded yet")
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function getOwnFollowers({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }

  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    var fNodeList = [];
    var fullName;
    var userProfilePicture;
    const userFollowers = await Followers.findOne({ userName: userName });

    if (userFollowers != null) {
      var currUser;
      for (var i = 0; i < userFollowers.followers.length; i++) {
        currUser = await Users.findOne({
          userName: userFollowers.followers[i],
        });
        fullName = currUser.fullName;
        userProfilePicture = currUser.userProfilePicture;
        fNodeList.push(
          new fNode(currUser.userName, fullName, userProfilePicture)
        );
      }

      return callback(null, fNodeList);
    } else {
      return callback({ message: "user does not exist" });
    }

    // await Followers.findOne({ userName: userName }).then((result) => {
    //   return callback(null, result);
    // });
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function getOwnFollowing({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }

  const user = Users.findOne({ userName: userName });

  if (user != null) {
    var fNodeList = [];
    var fullName;
    var userProfilePicture;
    const userFollowing = await Following.findOne({ userName: userName });

    //console.log(userFollowing)

    if (userFollowing != null) {
      var currUser;
      for (var i = 0; i < userFollowing.following.length; i++) {
        currUser = await Users.findOne({
          userName: userFollowing.following[i],
        });
        fullName = currUser.fullName;
        userProfilePicture = currUser.userProfilePicture;
        fNodeList.push(
          new fNode(currUser.userName, fullName, userProfilePicture)
        );
      }

      // await Following.find({ userName: userName }).then((result) => {
      //   return callback(null, result);
      // });

      return callback(null, fNodeList);
    } else {
      return callback({ message: "user does not exist" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function getOwnFollowRequests({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }

  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    var fNodeList = [];
    var fullName;
    var userProfilePicture;
    const userRequests = await FollowRequests.findOne({ userName: userName });

    //console.log(userFollowing)
    if (userRequests != null) {
      var currUser;
      for (var i = 0; i < userRequests.requests.length; i++) {
        currUser = await Users.findOne({ userName: userRequests.requests[i] });
        fullName = currUser.fullName;
        userProfilePicture = currUser.userProfilePicture;
        fNodeList.push(
          new fNode(currUser.userName, fullName, userProfilePicture)
        );
      }

      return callback(null, fNodeList);

      // await FollowRequests.find({ userName: userName }).then((result) => {
      //   return callback(null, result);
      // });
    } else {
      return callback({ message: "user does not exist" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

// async function getOtherProfileDetails({ userName, friendUserName }, callback) {
//   if (!userName) {
//     return callback({ message: "invalid input" });
//   }

//   if (!friendUserName) {
//     return callback({ message: "invalid input" });
//   }

//   const user = await Users.findOne({ userName: userName });
//   const friend = await Users.findOne({ userName: friendUserName });

//   if (user != null && friend != null) {
//     const isAlreadyFollowing = await Following.findOne({
//       userName: userName,
//       following: friendUserName,
//     });

//     if (isAlreadyFollowing != null) {
//       await Users.findOne({ userName: friendUserName }).then((result) => {
//         return callback(null, result);
//       });
//     } else {
//       return callback({
//         message:
//           "you cannot view this profile details as you do not follow them",
//       });
//     }
//   } else {
//     return callback({ message: "one of the users does not exist" });
//   }
//   //see if you are following the guy who's posts you are trying to view
// }

async function getOtherProfileDetails({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }
  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    const following = await Following.findOne({ userName: userName });
    const followers = await Followers.findOne({ userName: userName });

    const followingCount = following.following.length;
    const followerCount = followers.followers.length;

    return callback(null, { followingCount, followerCount });
  } else {
    return callback({ message: "one of the users does not exist" });
  }
  //see if you are following the guy who's posts you are trying to view
}

async function getChallengeDetails({ challengeID }, callback) {
  if (!challengeID) {
    return callback({ message: "invalid input" });
  }

  if (challengeID.length != 24) {
    return callback({
      message: "Invalid ID => does not follow MongoDB format for _id",
    });
  }

  const challenge = await Challenges.findById({ _id: challengeID });

  if (challenge != null) {
    await Challenges.find({ _id: challengeID }).then((result) => {
      return callback(null, result);
    });
  } else {
    return callback({ message: "This challenge does not exist" });
  }
}

async function getAllChallenges(params, callback) {
  var challengeNodeList = [];

  const allChallenges = await Challenges.find();

  //console.log(allChallenges.length);

  var allChallengeIDs = [];
  var challengeImage;

  if (!params.userName) {
    return callback({ message: "invalid input" });
  }

  const user = await Users.findOne({ userName: params.userName });

  if (user != null) {
    if (user.userType === "ADMIN") {
      for (var i = 0; i < allChallenges.length; i++) {
        var thisChallengeID = allChallenges[i]._id;
        allChallengeIDs.push(thisChallengeID);
      }
      for (var i = 0; i < allChallenges.length; i++) {
        var challenge = await Challenges.findById({ _id: allChallengeIDs[i] });
        if (!challenge) {
          //console.log("Nahi Mila ");
        } else {
          /// console.log("Mil Gaya ");
          var trophie = await Trophies.findById({ _id: challenge.trophieID });
          if (!trophie) {
            //  console.log("Nahi Mila ");
          } else {
            challengeImage = trophie.badgeUrl;
            console.log(challengeImage);

            challengeNodeList.push(
              new challengeNode(challenge, challengeImage)
            );
          }
        }
      }

      return callback(null, challengeNodeList);
    } else {
      return callback({ message: "unauthorised access" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function getAllUsers(params, callback) {
  var fNodeList = [];
  var fullName;
  var userProfilePicture;
  var userName;
  //var currUser;

  if (!params.userName) {
    return callback({ message: "invalid input - userName not specified" });
  }

  const user = await Users.findOne({ userName: params.userName });

  if (user != null) {
    if (user.userType === "ADMIN") {
      const allUsers = await Users.find();

      if (allUsers.length > 0) {
        for (var i = 0; i < allUsers.length; i++) {
          fullName = allUsers[i].fullName;
          userProfilePicture = allUsers[i].userProfilePicture;
          userName = allUsers[i].userName;

          fNodeList.push(new fNode(userName, fullName, userProfilePicture));
        }

        return callback(null, fNodeList);
      } else {
        return callback({
          message:
            "No users have signed up for this application as of right now",
        });
      }
    } else {
      return callback({ message: "Unauthorised access" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function getUsersLength(params, callback) {
  if (!params.userName) {
    return callback({ message: "invalid input - no userName specified" });
  }

  const user = await Users.findOne({ userName: params.userName });

  if (user != null) {
    if (user.userType === "ADMIN") {
      const allUsers = await Users.find();

      return callback(null, allUsers.length);
    } else {
      return callback({ message: "unauthorised accesss" });
    }
  } else {
    return callback({ message: "User does not exist" });
  }
}

async function getMyChallenges({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }
  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    var myChallengeNodeList = [];
    var myChallengeIDs = [];
    const mychallenges = await MyChallenges.findOne({ userName: userName });
    //console.log(mychallenges.challengesAccepted.length);

    for (var i = 0; i < mychallenges.challengesAccepted.length; i++) {
      var thisChallengeID = mychallenges.challengesAccepted[i].challengeID;
      myChallengeIDs.push(thisChallengeID);
    }

    for (var i = 0; i < mychallenges.challengesAccepted.length; i++) {
      var challenge = await Challenges.findById({ _id: myChallengeIDs[i] });
      if (challenge != null) {
        var trophie = await Trophies.findById({ _id: challenge.trophieID });
        if (trophie != null) {
          challengeImage = trophie.badgeUrl;
          myChallengeNodeList.push(
            new myChallengeNode(
              mychallenges.challengesAccepted[i],
              challenge,
              trophie
            )
          );
        } else {
        }
      } else {
      }
    }

    return callback(null, myChallengeNodeList);
    console.log(myChallengeIDs);

    await MyChallenges.findOne({
      userName: userName,
    })
      .then((result) => {
        return callback(null, result);
      })
      .catch((error) => {
        return callback(error);
      });
  } else {
    return callback({
      message: "User does not exist.",
    });
  }
}

async function getUniqueChallenges({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }
  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    var myChallengeIDs = [];
    var allChallengeIDs = [];
    var challengeNodeList = [];
    var challengeImage;
    //var myChallengeNodeList = [];

    const mychallenges = await MyChallenges.findOne({ userName: userName });

    // console.log("My Challenge IDs");
    for (var i = 0; i < mychallenges.challengesAccepted.length; i++) {
      var thisChallengeID = mychallenges.challengesAccepted[i].challengeID;

      var challID = await Challenges.findById({ _id: thisChallengeID });

      
      myChallengeIDs.push(challID._id);
      //  console.log(myChallengeIDs[i]);
    }

    // console.log("ALL Challenge IDs");
    const allChallenges = await Challenges.find();
    for (var i = 0; i < allChallenges.length; i++) {
      var ChallengeID = allChallenges[i]._id;
      allChallengeIDs.push(ChallengeID);
      //  console.log(allChallengeIDs[i]);
    }

    for (var i = 0; i < allChallengeIDs.length; i++) {
      var common = false;
      // var compA = myChallengeIDs[i];
      for (var j = 0; j < myChallengeIDs.length; j++) {
        var compB = allChallengeIDs[j];
        //console.log(myChallengeIDs[i] == allChallengeIDs[j]);
        //console.log(compA == compB);
        if (allChallengeIDs[i].equals(myChallengeIDs[j])) {
          common = true;
          // console.log("I am here");
          break;
        }
      }
      if (common == false) {
        console.log(allChallengeIDs[i]);
        var challenge = await Challenges.findById({ _id: allChallengeIDs[i] });
        // console.log(challenge)
        if (challenge != null) {
          // console.log("XYZ")
          //var searchTrophieID = mongoose.Types.ObjectID(challenge.trophieID)
          // console.log(challenge.trophieID);
          //var searchTrophieID = ObjectID(challenge.trophieID)
          
          if (challenge.status === 'active') {
            var trophie = await Trophies.findById({ _id: challenge.trophieID });
          if (trophie != null) {
            challengeImage = trophie.badgeUrl;
            console.log(challengeImage);

            challengeNodeList.push(
              new challengeNode(challenge, challengeImage)
            );
          }
          }
          
        }
      }
    }

    return callback(null, challengeNodeList);

    // console.log(myChallengeIDs)
  }
}

async function getFriendStatus({ fromUserName, toCheckUserName }, callback) {
  if (!fromUserName) {
    return callback({ message: "invalid input, fromUserName field is empty" });
  }

  if (!toCheckUserName) {
    return callback({
      message: "invalid input, toCheckUserName field is empty",
    });
  }

  if (fromUserName === toCheckUserName) {
    return callback(null, "3 - its the same user");
  }

  const user1 = await Users.findOne({ userName: fromUserName });
  const user2 = await Users.findOne({ userName: toCheckUserName });

  if (user1 != null && user2 != null) {
    const isFollowing = await Following.findOne({
      userName: fromUserName,
      following: toCheckUserName,
    });
    if (isFollowing != null) {
      return callback(null, "2 - You are followning this user");
    } else {
      const hasAlreadySentRequest = await FollowRequests.findOne({
        userName: toCheckUserName,
        requests: fromUserName,
      });
      if (hasAlreadySentRequest != null) {
        return callback(null, "1 - You have sent this user a friend reqeuest");
      } else {
        return callback(null, "0 - You do not follow this user");
      }
    }
  } else {
    return callback({ message: "one of the two users does not exist" });
  }
}

async function getFriendPosts({ userName, friendName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }
  if (!friendName) {
    return callback({ message: "invalid input" });
  }

  const user1 = await Users.findOne({ userName: userName });
  const user2 = await Users.findOne({ userName: friendName });

  if (user1 != null && user2 != null) {
    const isFollowing = await Following.findOne({
      userName: userName,
      following: friendName,
    });
    if (isFollowing != null) {
      //console.log(isFollowing)
      if (
        (await Posts.find({
          userName: friendName,
        }).count()) > 0
      ) {
        var postNodeList = [];
        var currPost;
        var userProfilePicture;
        var challengeName;
        var challengeImage;
        var tempChallenge;
        var tempChallengeID;

        var tempTrophie;
        var tempTrophieID;

        userProfilePicture = user2.userProfilePicture;

        const allPosts = await Posts.find({
          userName: friendName,
          isPrivated: false,
        }).sort({
          dateAdded: "desc",
        });

        for (var i = 0; i < allPosts.length; i++) {
          currPost = allPosts[i];
          tempChallengeID = allPosts[i].challengeID;
          tempChallenge = await Challenges.findById({ _id: tempChallengeID });

          tempTrophieID = tempChallenge.trophieID;
          challengeName = tempChallenge.challengeName;

          tempTrophie = await Trophies.findById({ _id: tempTrophieID });

          challengeImage = tempTrophie.badgeUrl;

          postNodeList.push(
            new postNode(
              currPost,
              userProfilePicture,
              challengeName,
              challengeImage
            )
          );
        }

        return callback(null, postNodeList);
      } else {
        return callback({ message: " this user has not made any posts" });
      }
    } else {
      return callback({
        message:
          "Cannot view posts, this guy is not you friend i.e; you are not followng this account",
      });
    }
  } else {
    return callback({ message: "One of the two users does not exist" });
  }
}

async function getTrophie({ trophieID }, callback) {
  if (!trophieID) {
    return callback({ message: "invalid input" });
  }

  if (trophieID.length != 24) {
    return callback({
      message: "Invalid ID => does not follow MongoDB format for _id",
    });
  }

  const trophie = await Trophies.findById({ _id: trophieID });

  if (trophie != null) {
    if (
      (await Trophies.find({
        _id: trophieID,
      }).count()) > 0
    ) {
      return callback(null, trophie);
    } else {
      return callback({ message: "trophie does not exist" });
    }
  } else {
    return callback({ message: "trophie does not exist" });
  }
}

async function changeTrophieBadge(
  { trophieID, newBadgeURL, userName },
  callback
) {
  if (!newBadgeURL) {
    return callback({ message: "invalid input => url missing" });
  }

  if (!trophieID) {
    return callback({ message: "invalid input => no trophie ID specified" });
  }

  if (!userName) {
    return callback({ message: "invalid input => username not specified" });
  }

  if (trophieID.length != 24) {
    return callback({
      message: "Invalid ID => does not follow MongoDB format for _id",
    });
  }

  const trophie = await Trophies.findById({ _id: trophieID });

  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    if (user.userType === "ADMIN") {
      if (trophie != null) {
        if (
          (await Trophies.find({
            _id: trophieID,
          }).count()) > 0
        ) {
          await Trophies.findByIdAndUpdate(
            {
              _id: trophieID,
            },
            {
              badgeUrl: newBadgeURL,
            }
          )
            .then((result) => {
              return callback(null, result);
            })
            .catch((error) => {
              return callback(error);
            });
        } else {
          return callback({ message: "trophie does not exist" });
        }
      } else {
        return callback({ message: "trophie does not exist" });
      }
    } else {
      return callback({ message: "unauthorised access" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

// async function getUserFeed({ userName }, callback) {
//   if (!userName) {
//     return callback({ message: "invalid input" });
//   }
//   const user = await Users.findOne({ userName: userName });

//   if (user != null) {
//     var postList = [];
//     var usersList = [];

//     const myFollowing = await Following.findOne({ userName: userName });

//     for (var i = 0; i < myFollowing.following.length; i++) {
//       usersList.push(myFollowing.following[i]);
//     }
//     usersList.push(userName);

//     for (var i = 0; i < usersList.length; i++) {

//       var posts = await Posts.find({
//         userName: usersList[i],
//         isPrivated: false,
//       }).sort({ dateAdded: "desc" });

//       // if(await await Posts.find({
//       //   userName: usersList[i],
//       //   isPrivated: false,
//       // }).count()>0) {
//       //   postList.push(await Posts.find)
//       // }

//       if(posts.length >0) {
//         postList.push(posts);
//       }
//       //console.log(posts[1].length)
//       // for(var i =0; i<posts.length; i++) {
//       //   for(var j=0; j< posts[i].length; j++) {

//       //   }
//       // }
//     }

//     // var finalList = [];
//     // console.log(postList.length);
//     // console.log('ABCD')
//     // for( var i =0; i <postList.length; i++) {
//     //   console.log(postList[i].length)
//     //   for( var j =0; j <postList[i].length; j++) {

//     //   }
//     // }

//     return callback(null, postList);
//     return callback(null, finalList);

//   } else {
//     return callback({ message: "user does not exist" });
//   }
// }

async function getUserFeed({ userName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input" });
  }
  const user = await Users.findOne({ userName: userName });

  if (user != null) {
    //var postList = [];
    var usersList = [];
    //var singlePost;

    var postNodeList = [];
    var currPost;
    var userProfilePicture;
    var challengeName;
    var challengeImage;
    var tempChallenge;
    var tempChallengeID;

    var allPosts;

    var tempTrophie;
    var tempTrophieID;

    const myFollowing = await Following.findOne({ userName: userName });

    for (var i = 0; i < myFollowing.following.length; i++) {
      usersList.push(myFollowing.following[i]);
    }
    usersList.push(userName);

    for (var i = 0; i < usersList.length; i++) {
      allPosts = await Posts.find({
        userName: usersList[i],
        isPrivated: false,
      }).sort({ dateAdded: "desc" });

      for (var j = 0; j < allPosts.length; j++) {
        currPost = allPosts[j];

        tempChallengeID = allPosts[j].challengeID;
        tempChallenge = await Challenges.findById({ _id: tempChallengeID });

        tempTrophieID = tempChallenge.trophieID;
        challengeName = tempChallenge.challengeName;

        tempTrophie = await Trophies.findById({ _id: tempTrophieID });

        challengeImage = tempTrophie.badgeUrl;

        var testUser = await Users.findOne({ userName: allPosts[j].userName });

        userProfilePicture = testUser.userProfilePicture;

        postNodeList.push(
          new postNode(
            currPost,
            userProfilePicture,
            challengeName,
            challengeImage
          )
        );
      }
    }

    // var orderedPostList;

    // orderedPostList = postNodeList.sort((a, b) => {
    //   if (a.dateAdded.getTime() > b.dateAdded.getTime()) {
    //     return 1;
    //   } else if (a.dateAdded.getTime() < b.dateAdded.getTime()) {
    //     return -1;
    //   } else {
    //     return 0;
    //   }
    // });

    var returnPostNodeList = [];

    returnPostNodeList = shuffle(postNodeList);

    return callback(null, returnPostNodeList);
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function toggleUserStatus({ userName, newStatus, adminName }, callback) {
  if (!userName) {
    return callback({ message: "invalid input - userName field is empty" });
  }
  if (!newStatus) {
    return callback({ message: "invalid input - status field not entered" });
  }

  if (!adminName) {
    return callback({ message: "invalid input - adminName not specified" });
  }

  const admin = await Users.findOne({ userName: adminName });

  if (admin != null) {
    if (admin.userType === "ADMIN") {
      if (
        newStatus === "inactive" ||
        newStatus === "active" ||
        newStatus === "deleted"
      ) {
        const user = await Users.findOne({ userName: userName });
        if (user != null) {
          await Users.findOneAndUpdate(
            {
              userName: userName,
            },
            {
              status: newStatus,
            }
          )
            .then((success) => {
              return callback(null, success);
            })
            .catch((error) => {
              return error;
            });
        } else {
          return callback({ message: "user does not exist" });
        }
      } else {
        return callback({ message: "invalid status specified" });
      }
    } else {
      return callback({ message: "unauthorised access" });
    }
  } else {
    return callback({ message: "user does not exist" });
  }
}

async function removeFollower({ userName, userNameToRemove }, callback) {
  if (!userName) {
    return callback({ message: "invalid input - userName field is empty" });
  }
  if (!userNameToRemove) {
    return callback({
      message: "invalid input - userNameToRemove field is empty",
    });
  }

  const user1 = await Users.findOne({ userName: userName });
  const user2 = await Users.findOne({ userName: userNameToRemove });

  if (user1 != null && user2 != null) {
    if (
      (await Followers.find({
        userName: userName,
        followers: userNameToRemove,
      }).count()) > 0
    ) {
      await Followers.findOneAndUpdate(
        {
          userName: userName,
        },
        {
          $pull: {
            followers: userNameToRemove,
          },
        }
      ).then(async (resultA) => {
        await Following.findOneAndUpdate(
          {
            userName: userNameToRemove,
          },
          {
            $pull: {
              following: userName,
            },
          }
        ).then((resultB) => {
          return callback(null, resultB);
        });
      });
    } else {
      return callback({ message: "this user does not follow you" });
    }
  } else {
    return callback({ message: "one of the two users does not exist" });
  }
}

async function unfollowUser({ userName, userNameToUnfollow }, callback) {
  if (!userName) {
    return callback({ message: "invalid input - userName field is empty" });
  }
  if (!userNameToUnfollow) {
    return callback({
      message: "invalid input - userNameToUnfollow field is empty",
    });
  }

  const user1 = await Users.findOne({ userName: userName });
  const user2 = await Users.findOne({ userName: userNameToUnfollow });

  if (user1 != null && user2 != null) {
    if (
      (await Following.find({
        userName: userName,
        following: userNameToUnfollow,
      }).count()) > 0
    ) {
      await Following.findOneAndUpdate(
        {
          userName: userName,
        },
        {
          $pull: {
            following: userNameToUnfollow,
          },
        }
      ).then(async (resultA) => {
        await Followers.findOneAndUpdate(
          {
            userName: userNameToUnfollow,
          },
          {
            $pull: {
              followers: userName,
            },
          }
        ).then((resultB) => {
          return callback(null, resultB);
        });
      });
    } else {
      return callback({ message: "You do not follow this user" });
    }
  } else {
    return callback({ message: "one of the two users does not exist" });
  }
}

async function searchUsers({ query }, callback) {
  if (!query) {
    return callback({ message: "invalid input - query field is empty" });
  }

  var fNodeList = [];
  var fullName;
  var userProfilePicture;
  var userName;

  var searchedUsers = await Users.find({
    $or: [
      { userName: { $regex: "^" + "(?i)" + query } },
      { fullName: { $regex: "^" + "(?i)" + query } },
    ],
  });

  if (searchedUsers.length > 0) {
    for (var i = 0; i < searchedUsers.length; i++) {
      fullName = searchedUsers[i].fullName;
      userProfilePicture = searchedUsers[i].userProfilePicture;
      userName = searchedUsers[i].userName;

      fNodeList.push(new fNode(userName, fullName, userProfilePicture));
    }

    return callback(null, fNodeList);
  } else {
    // console.log("i am here")
    var searchedUsers2 = await Users.find({
      $or: [
        { userName: { $regex: "(?i)" + query } },
        { fullName: { $regex: "(?i)" + query } },
      ],
    });

    if (searchedUsers2.length > 0) {
      for (var i = 0; i < searchedUsers2.length; i++) {
        fullName = searchedUsers2[i].fullName;
        userProfilePicture = searchedUsers2[i].userProfilePicture;
        userName = searchedUsers2[i].userName;

        fNodeList.push(new fNode(userName, fullName, userProfilePicture));
      }

      return callback(null, fNodeList);
    } else {
      return callback({
        message: "Oopsie, looks like there's no one with that name",
      });

      //return callback(null, "Oopsie, looks like there's no one with that name");
    }
  }
}

async function searchChallenges({ query }, callback) {
  if (!query) {
    return callback({ message: "invalid input - query field is empty" });
  }

  var fNodeList = [];
  var fullName;
  var userProfilePicture;
  var userName;

  var searchedUsers = await Challenges.find({
    $or: [
      { userName: { $regex: "^" + query } },
      { fullName: { $regex: "^" + query } },
    ],
  });

  if (searchedUsers.length > 0) {
    for (var i = 0; i < searchedUsers.length; i++) {
      fullName = searchedUsers[i].fullName;
      userProfilePicture = searchedUsers[i].userProfilePicture;
      userName = searchedUsers[i].userName;

      fNodeList.push(new fNode(userName, fullName, userProfilePicture));
    }

    return callback(null, fNodeList);
  } else {
    // console.log("i am here")
    var searchedUsers2 = await Challenges.find({
      $or: [{ userName: { $regex: query } }, { fullName: { $regex: query } }],
    });

    if (searchedUsers2.length > 0) {
      for (var i = 0; i < searchedUsers2.length; i++) {
        fullName = searchedUsers2[i].fullName;
        userProfilePicture = searchedUsers2[i].userProfilePicture;
        userName = searchedUsers2[i].userName;

        fNodeList.push(new fNode(userName, fullName, userProfilePicture));
      }

      return callback(null, fNodeList);
    } else {
      return callback(null, "Oopsie, looks like there's no one with that name");
    }
  }
}

module.exports = {
  login,
  register,
  updatePassword,
  updatePrivateStatus,
  updateProfilePicture,
  updateProfileBio,
  sendFollowRequest,
  deleteFollowRequest,
  acceptFollowRequest,
  uploadPost,
  togglePostPrivacy,
  deletePost,
  likeToggle,
  likePost,
  unLikePost,
  commentOnPost,
  deleteComment,
  addChallenge,
  toggleChallengeStatus,
  acceptChallenge,
  voteWin,
  getOwnProfile,
  getOwnPosts,
  getOwnFollowers,
  getOwnFollowing,
  getOwnFollowRequests,
  getOtherProfileDetails,
  getChallengeDetails,
  getAllChallenges,
  getMyChallenges,
  getFriendPosts,
  getTrophie,
  changeTrophieBadge,
  getUserFeed,
  getUniqueChallenges,
  getFriendStatus,
  toggleUserStatus,
  removeFollower,
  unfollowUser,
  getAllUsers,
  getUsersLength,
  searchUsers,
};
