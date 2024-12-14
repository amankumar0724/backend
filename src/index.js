// require('dotenv').config({path:'./env'})
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import connectDB from './db/index.js'
import dotenv from 'dotenv'
dotenv.config({
    path: './env'
})
// first technique to connect to database: fir make function in db folder and then import here
connectDB()










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