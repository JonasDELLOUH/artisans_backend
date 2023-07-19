import UserModel from "../models/user_model";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export const registerUser = async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPass;

    const newUser = new UserModel(req.body);
    const {username} = req.body

    try {
        const oldUser = await UserModel.findOne({username});

        if (oldUser) return res.status(400).json({message: "User already exist"});

        //changed
        const user = await newUser.save();
        console.log(user)
        const token = jwt.sign({username: user.username, id: user._id}, process.env.JWTKEY,
            {expiresIn: "1h"})
        res.status(200).json({user, token});
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
}