import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config({})

cloudinary.config({
    cloud_name: process.env.CloudName, 
    api_key:process.env.APIkey, 
    api_secret: process.env.APIsecret
})

export default cloudinary;