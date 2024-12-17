import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt, { hash } from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true//to make any field searchable : do index as true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true//to make any field searchable : do index as true
    },
    fullName: {
        type: String,
        required: true,
        trim:true,
        index: true
    },
    avatar: {
        type: String,//cloudinary url
        required:true
    },
    coverImage: {
        type:String
    },
    watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type:String,
        required: [true,'Password is required']
    },
    refreshToken: {
        type: String
    } 

},{timestamps: true});

userSchema.pre("save",async function (next) {//encryption is time taking so => async
    if(!this.isModified("password"))return next();
    this.password = await bcrypt.hash(this.password,10);//or use bcrypt.hash without importing {hash}
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)//this method returns TRUE or FALSE
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            //payload
            _id: this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {//refresh token keeps on refreshing so we have less things in its payload
    return jwt.sign(
        {
            //payload
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model('User', userSchema);