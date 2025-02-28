const express = require('express');
const { sendOTP, verifyOTP, register, login, getAuthUser, getUsers, getUserDetails} = require('../controllers/authController');
const { getImage } = require('../controllers/fileController');
const upload = require("../config/multerConfig");
const router = express.Router();

router.post('/register-email', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register',upload.single("file"), register);
router.post('/login', login);
router.post('/login-email', sendOTP);
router.post('/authUser', getAuthUser)
router.get('/users', getUsers)
router.get('/usersDetails/:userId', getUserDetails)
router.get("/file/:filename", getImage);
// router.post('/upload', upload.single("file"), uploadFile)

module.exports = router;
