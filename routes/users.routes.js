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
router.post("/toggleUserStatus", userController.toggleUserStatus);
router.post("/removeFollower", userController.removeFollower);
router.post("/unfollowUser", userController.unfollowUser);




//get because retrieving info
//router.get("/getUserProfile", userController.userProfile);
router.post("/getOwnProfile", userController.getOwnProfile);
router.post("/getOwnPosts", userController.getOwnPosts);
router.post("/getOwnFollowers", userController.getOwnFollowers);
router.post("/getOwnFollowing", userController.getOwnFollowing);
router.post("/getOwnFollowRequests", userController.getOwnFollowRequests);
router.post("/getOtherProfileDetails", userController.getOtherProfileDetails);
router.post("/getChallengeDetails", userController.getChallengeDetails);
router.post("/getMyChallenges", userController.getMyChallenges);
router.post("/getFriendPosts", userController.getFriendPosts);
router.post("/getTrophie", userController.getTrophie);
router.post("/changeTrophieBadge", userController.changeTrophieBadge);
router.post("/getUserFeed", userController.getUserFeed);
router.post("/getUniqueChallenges", userController.getUniqueChallenges)
router.post("/getFriendStatus", userController.getFriendStatus);



router.get("/getAllChallenges", userController.getAllChallenges)



module.exports = router;
