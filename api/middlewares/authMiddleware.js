import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWTKEY;

export const verifyToken = (req, res, session) => {
    return new Promise((resolve, reject) => {
        let token = req.header("Authorization");
        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.slice(7, token.length).trimStart();
            }
            try {
                const decoded = jwt.verify(token, secret);
                req.headers.userId = decoded?.id;
                resolve(); // Résoudre la promesse lorsque tout est bon
            } catch (error) {
                reject(new Error("Invalid token")); // Rejeter la promesse en cas d'erreur
            }
        } else {
            reject(new Error("Access Denied")); // Rejeter la promesse en cas d'absence de token
        }
    });
};