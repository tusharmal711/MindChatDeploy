import express from "express";

import {Register,sendOTP,VerifyOtp,isLogin,deleteDp,sendLoginOTP,VerifyLoginOtp,editAbout,sendFpOTP, countContactsByMobile, fetch, fetchId, delContact, fetchYou, addNewContact,editContact, fetchDp , fetchOtherDp, fetchHistory, ResetPassword, fetchalluser} from "./userController.js";

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
router.post("/fetchHistory",fetchHistory);

router.post("/fetchallusers",fetchalluser);

router.post("/countContactsByMobile",countContactsByMobile);






// router.post("/user/:id",fetchUserId);
export default router;