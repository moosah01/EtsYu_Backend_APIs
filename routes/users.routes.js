const userController = require('../controllers/users.controllers')

const express = require('express');
const app = express();

const router = express.Router();

// router.('/register', (req,res) => {
//     res.send("You have succesfully tested the router \nHello I am Way #1");
// });

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/updatePassword", userController.updatePassword);
router.post("/updateProfilePicture", userController.updateProfilePicture);
router.post("/updatePrivateStatus", userController.updatePrivateStatus);
router.post("/updateProfileBio", userController.updateProfileBio);
router.post("/sendFollowRequest", userController.sendFollowRequest);
router.post("/deleteFollowRequest", userController.deleteFollowRequest);
router.post("/acceptFollowRequest", userController.acceptFollowRequest);
router.post("/uploadPost", userController.uploadPost);
router.post("/togglePostPrivacy", userController.togglePostPrivacy);
router.post("/deletePost", userController.deletePost);
router.post("/likeToggle", userController.likeToggle);
router.post("/likePost", userController.likePost);
router.post("/unLikePost", userController.unLikePost);
router.post("/commentOnPost", userController.commentOnPost);
router.post("/deleteComment", userController.deleteComment);
router.post("/addChallenge", userController.addChallenge);
router.post("/toggleChallengeStatus", userController.toggleChallengeStatus);
router.post("/acceptChallenge", userController.acceptChallenge);
router.post("/voteWin", userController.voteWin);
router.post("/voteLose", userController.voteLose);



//get because retrieving info
//router.get("/getUserProfile", userController.userProfile);
router.get("/getOwnProfile", userController.getOwnProfile);
router.get("/getOwnPosts", userController.getOwnPosts);
router.get("/getOwnFollowers", userController.getOwnFollowers);
router.get("/getOwnFollowing", userController.getOwnFollowing);
router.get("/getOwnFollowRequests", userController.getOwnFollowRequests);
router.get("/getOtherProfileDetails", userController.getOtherProfileDetails);
router.get("/getChallengeDetails", userController.getChallengeDetails);





module.exports = router;
