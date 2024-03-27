import mongoose from "mongoose";



const connectDB =async ()=>{
    try{
        const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        console.log(`\n Mongoose Connected to ${connectionInstance.connection.host}`)
    }catch (error){
        console.log('mongoDB connection error '+ error);
        process.exit(1);
    }
}


export default connectDB