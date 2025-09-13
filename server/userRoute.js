import express from "express";

import {Register,sendOTP,FriendRequest,VerifyOtp,AcceptedUser,AcceptRequest,isLogin,deleteDp,FetchAllMessage,sendLoginOTP,VerifyLoginOtp,editAbout,sendFpOTP, countContactsByMobile, fetch, fetchId, delContact, fetchYou, addNewContact,editContact, fetchDp , fetchOtherDp, fetchHistory, ResetPassword, fetchalluser, SentRequestUser, SentRequestAllUser, CancelRequest, ReceivedRequestUser, CallList, FetchCallList, fetchCallUsername, checkContact} from "./userController.js";

const router = express.Router();
router.post("/register",Register);
router.post("/sendOTP",sendOTP);
router.post("/sendFpOTP",sendFpOTP);
router.post("/verifyOTP",VerifyOtp);
router.post("/login",isLogin);
router.post("/loginOTP",sendLoginOTP);
router.post("/verifyloginOTP",VerifyLoginOtp);
router.post("/reset",ResetPassword);
router.post("/addNewContact",addNewContact);
router.post("/fetch",fetch);
router.post("/fetchYou",fetchYou);
router.post("/contact/:id",fetchId);
router.delete("/delete/:id",delContact);
router.post("/updateContact",editContact);

router.post("/fetchDp",fetchDp);
router.post("/fetchOtherDp",fetchOtherDp);
router.post("/editAbout",editAbout);
router.post("/deleteDp",deleteDp);
router.post("/friendrequest",FriendRequest);
router.post("/fetchHistory",fetchHistory);
router.post("/sentrequestuser",SentRequestUser);
router.post("/checkcontact",checkContact);
router.post("/receivedrequestuser",ReceivedRequestUser);
router.post("/accepteduser",AcceptedUser);
router.post("/sentrequestalluser",SentRequestAllUser);
router.post("/fetchallusers",fetchalluser);
router.delete("/cancelrequest",CancelRequest);
router.put("/acceptrequest", AcceptRequest);
// router.post("/fetchfrienduser",fetchFriendUser);
router.post("/countContactsByMobile",countContactsByMobile);

router.post("/fetchAllMessage",FetchAllMessage);

router.post("/callList",CallList);
router.post("/fetchCallList",FetchCallList);
router.post("/fetchCallUsername",fetchCallUsername);
// router.post("/user/:id",fetchUserId);
export default router;