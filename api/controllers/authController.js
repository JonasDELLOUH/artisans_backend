import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
            {expiresIn: "10h"})
        res.status(200).json({user, token});
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
};

 export const loginUser = async (req, res) => {
     console.log(`Données reçues : ${JSON.stringify(req.body)}`)
    const {username, password} = req.body;
    try {
        const user = await UserModel.findOne({username: username});

        if (user) {
            const validity = await bcrypt.compare(password, user.password);

            if (!validity) {
                res.status(400).json("Wrong password");
            } else {
                const token = jwt.sign({username: user.username, id: user._id},
                    process.env.JWTKEY, {expiresIn: "10h"}
                );
                res.status(200).json({user, token});
            }
        } else{
            res.status(404).json("User not found");
        }

    } catch (err) {
        res.status(500).json(err);
    }
};