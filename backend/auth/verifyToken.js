import jwt from "jsonwebtoken";
import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";

export const authenticate = async (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken || !authToken.startsWith("Bearer")){
        return res
        .status(401)
        .json({success: false, message: "No token, authorization denied"});
    }
    try{
        const token = authToken.split(" ")[1];

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        req.userId = decoded.id
        req.role = decoded.role
        next();
    }catch(err){
        if(err.name =='TokenExpiredError'){
            return res.status(401).json({message: "Token is expired"});
        }
        return res.status(401).json({success: false,message: "Invalid token"});
    }
};

export const restrict = roles => async (req,res, next) => {
    const userId = req.userId;

    let user;

    const viewer = await User.findById(userId);
    const admin = await Admin.findById(userId);

    if(viewer){
        user = viewer;
    }
    if(admin){
        user = admin;
    }
    if(!roles.includes(user.role)){
        return res
        .status(401)
        .json({success: false, message: "You're not authorized"});
    }
    next();

}