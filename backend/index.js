import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import connectDB from './utils/db.js'
import userRoute from './routes/user.route.js'
import postRoute from './routes/post.route.js'
import messageRoute from './routes/message.route.js'
import { app,server } from './socket/socket.js'

dotenv.config({})

const PORT=process.env.PORT || 8000;


// const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));

const corsOptions={
    origin:[`http://localhost:5173`, `http://192.168.1.45:5173`],
    // origin:'http://localhost:5173',
    credentials:true
}
app.use(cors(corsOptions));

app.use('/api/v1/user',userRoute)
app.use('/api/v1/post',postRoute)
app.use('/api/v1/message',messageRoute)


server.listen(PORT,'0.0.0.0',()=>{
    connectDB()
    console.log(`app running on ${PORT}`);
})
// app.listen(PORT,'0.0.0.0',()=>{
//     connectDB()
//     console.log(`app running on ${PORT}`);
// })

app.get('/',(req,res)=>{
    res.status(200).json({
        sucesss:true,message:'app is working fine'
    })
})