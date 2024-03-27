import dotenv from 'dotenv'
import connectDB from "./db/connectDB.js";
import { app } from './app.js';

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{app.listen(process.env.PORT || 8090, ()=>{
    console.log('Serever is running')
})})
.catch((error)=>{console.error("mongoDB connection failed, server Down "+ error)})