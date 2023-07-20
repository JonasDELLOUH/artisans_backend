import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWTKEY;

export const verifyToken = async (req, res, next) => {
    try{
        let token = req.header("Authorization");
        console.log("le token :" + token);
        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.slice(7, token.length).trimStart();
            }
            const decoded = jwt.verify(token, secret);
            console.log(decoded)
            req.body.userId = decoded?.id;
        }else{
            return res.status(403).send("Access Denied");
        }
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}