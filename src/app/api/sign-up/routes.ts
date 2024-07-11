import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { boolean, string } from "zod";

export async function POST(request:Request){
    await dbConnect();
    try{
      const {username,email,password} = await request.json();
      const existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerified:true
      })
      if(existingUserVerifiedByUsername){
        return Response.json({
         success:false,
         message:"Username is already taken"
        },{status:400})
      }
      const existingUserByEmail =await UserModel.findOne({email})
      const verifyCode = Math.floor(100000+Math.random()*900000).toString();
      if(existingUserByEmail){
        if(existingUserByEmail.isVerified){
            return Response.json({
                success:false,
                message:"User already exists with this email"
            },{status:400})
        }
        else {
            const hashedPassword = await bcrypt.hash(password,10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now()*360000);
            await existingUserByEmail.save();
        }
      }else{
        const hashedPassword = await bcrypt.hash(password,10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours()+1);
        const newUser = new UserModel({
            username,
            email, 
            password:hashedPassword,
            verifyCode,
            verifyCodeExpiry:expiryDate,
            isVerified:false,
            isAcceptingMessage:true,
            messages:[],
        })
        await newUser.save();
      }

      //send verification email
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode,
      )
      if(!emailResponse){
        return Response.json({
         success:false,
         message:"Username is already taken",
        }, {status:500});
      }
      return Response.json({
        success:true,
        message:"User registered successfully",
      },{status:201})
    }catch(error){
        console.error('Error registering user',error)
        return Response.json({
            success:false,
            message:"Error registering user",
        })
    }
}