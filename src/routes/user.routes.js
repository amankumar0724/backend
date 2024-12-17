import {Router} from 'express';
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verifyJWT,changeCurrentPassword)
router.route('/get-current-user').post(verifyJWT,getCurrentUser)
router.route('/update-account-details').post(verifyJWT,updateAccountDetails)
router.route('/update-user-avatar').post(updateUserAvatar)//not working
router.route('/update-user-cover-image').post(updateUserCoverImage)//not working



export default router;