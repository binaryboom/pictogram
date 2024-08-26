import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getDataUri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';


const register=async (req,res) => {
    try{
        let {username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(401).json({
                success:false,
                message:'Some details are missing !!'
            })
        }

        const user= await User.findOne({email}) 
        if(user){
            return res.status(401).json({
                success:false,
                message:'User already registered !!'
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        await User.create({
            username,
            email,
            password:hashedPassword
        })
        return res.status(201).json({
            success:true,
            message:'Account created sucessfully !!'
        })
    }
    catch(e){
        console.log(e)
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const login =async (req,res) => {
    try {
        let {email,password}=req.body;
        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:'Some details are missing !!'
            })
        }
        const user= await User.findOne({email})
        .populate('posts')
        .select('-password')
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User does not exist !!'
            })
        }
        const isPasswordMatched=await bcrypt.compare(password,user.password);
        if(!isPasswordMatched){
            return res.status(401).json({
                success:false,
                message:'Incorrect Password !!'
            })
        }
    //    let { password:pw, ...userData } = user._doc;
        // user={
        //     userId:user._id,
        //     username:user.username,
        //     email:user.email,
        //     bio:user.bio,
        //     profilePicture:user.profilePicture,
        //     followers:user.followers,
        //     following:user.following,
        //     posts:user.posts
        // }
        const token=jwt.sign({userId:user._id},process.env.SecretKey,{expiresIn:'1d'});
        return res.cookie('token',token,{httpOnly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
            success:true,
            message:`Welcome Back ${user.username} !!`,
            user
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
    
}

const logout=async (req,res) => {
    try {
        return res.cookie('token','',{maxAge:0}).json({
            success: true,
            message: 'Logged out successfully !!'
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getProfile= async (req,res) => {
    try {
        let userId=req.params.id;
        let user= await User.findById(userId).select('-password');
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User does not exist !!'
            })
        }
        return res.status(200).json({
            success: true,
            user
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const editProfile= async (req,res) => {
    try {
        let userId=req.id;
        let {bio,gender}=req.body;
        const profilePicture=req.file;
        let cloudResp;
        let user= await User.findById(userId).select('-password');
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User does not exist !!'
            })
        }
        if(profilePicture){
            const fileUri=getDataUri(profilePicture);
            cloudResp=await cloudinary.uploader.upload(fileUri)
            user.profilePicture=cloudResp.secure_url;
        }
        if(bio) user.bio=bio;
        if(gender) user.gender=gender;

        await user.save()
        return res.status(200).json({
            success: true,
            message:'Profile updated !!',
            user
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getSuggestedUsers= async (req,res) => {
    try {
        const suggestedUsers= await User.find({_id:{$ne:req.id}}).select('-password').limit(5)
        if(!suggestedUsers){
            return res.status(401).json({
                success: false,
                message: 'No suggested users !!'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Users found !!',
            user:suggestedUsers
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const followUnfollow=async (req,res) => {
    try {
        const mainUserId=req.id;
        const otherUserId=req.params.id;
        
        if(mainUserId=== otherUserId){
            return res.status(400).json({
                success: false,
                message: 'You cannot follow/unfollow yourself !!'
            });
        }

       const mainUser=await User.findById(mainUserId);
       const otherUser=await User.findById(otherUserId);

       if(!mainUser || !otherUser){
           return res.status(400).json({
               success: false,
               message: 'User not found !!'
           });
       }

       const isFollowing=mainUser.following.includes(otherUserId);
       if(isFollowing){
        // do unfollow
        await Promise.all([
            User.findByIdAndUpdate(mainUserId,{$pull:{following:otherUserId}}),
            User.findByIdAndUpdate(otherUserId,{$pull:{followers:mainUserId}})
        ])
        return res.status(200).json({
            success:true,
            message:'User unfollowed !!'
        })
    }else{
        // do follow
        await Promise.all([
            User.findByIdAndUpdate(mainUserId,{$push:{following:otherUserId}}),
            User.findByIdAndUpdate(otherUserId,{$push:{followers:mainUserId}})
        ])
        return res.status(200).json({
            success:true,
            message:'User followed !!'
        })
    }
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
                
    }
}

const userController = {
    register,
    login,
    logout,
    getProfile,
    editProfile,
    getSuggestedUsers,
    followUnfollow
};

export default userController;