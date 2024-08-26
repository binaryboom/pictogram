import mongoose from "mongoose";
// Ye2p8nItFfLunKg7
const connectDB=async()=>{
    try{
      await mongoose.connect(process.env.MongoURI);
      console.log('db connected')
    }
    catch(e){
        console.log(e)
    }
}

export default connectDB;