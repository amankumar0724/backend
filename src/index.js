// require('dotenv').config({path:'./env'})
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import connectDB from './db/index.js'
import { app } from './app.js'
import dotenv from 'dotenv'
dotenv.config({
    path: './env'
})
// first technique to connect to database: fir make function in db folder and then import here
connectDB()
.then(() => {
    app.on("error",(error) => {
        console.log("ERROR IN RUNNING APP",error);
        throw error
    })
    app.listen(process.env.PORT || 3000,() => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    })
})
.catch((err) => {
    console.log("MONGODB CONNECTION ERROR", err);
})










// second technique to connect to database
/*
import express from 'express'
const app = express()
;(async () => {
        try {
            // console.log("connected")
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("error",(error) => {
                console.log("error",error)
                throw error
            })
            app.listen(process.env.PORT,() => {
                console.log(`App listening at port ${process.env.PORT}`)
            })
        } catch (error) {
            console.error("ERROR",error)
            throw error
        }
    }
)()
*/