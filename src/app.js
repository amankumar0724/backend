import express from 'express'
import cors from 'cors'
import  cookieParser from 'cookie-parser'

const app = express();

app.use(cors({//should be used after creating the app(*acts as middleware)
    origin:process.env.CORS_ORIGIN,
    credentials:true//optional
}));

// to accept data in json: use the following
app.use(express.json({limit:"16kb"}));
// to accept data from url(eg: https://hitesh+choudhary&fdsl?=....): this is done by url encoder
app.use(express.urlencoded({extended:true,limit:"16kb"}));//parameter are optional
// to store the received  image/file/favicon in our server itself in a folder (like in public)
app.use(express.static("public"))

// to parse the cookies
app.use(cookieParser())




export {app};