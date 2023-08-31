import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import path from 'path';
import fs from 'fs';
import url from 'url';

//routes
import AuthRoute from './routes/authRoute.js';
import salonRoute from "./routes/salonRoute.js";
import jobRoute from "./routes/jobRoute.js";
import postRoute from "./routes/postRoute.js";
import storyRoute from "./routes/storyRoute.js"; 

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use(helmet());

// to serve images inside public folder
app.use(express.static('public'));
app.use('/files', express.static('public/files'));

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/files/videos/*', (req, res) => {
    console.log("aaa")
    const filePath = path.join(__dirname, 'public', req.url);
    res.sendFile(filePath);
  });
  


dotenv.config();
const PORT = process.env.PORT;
const CONNECTION = process.env.MONGODB_CONNECTION;

mongoose
    .connect(CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`Listening at Port ${PORT}`)))
    .catch((error) => console.log(`${error} did not connect`));

app.use('/auth', AuthRoute);
app.use("/salon", salonRoute);
app.use("/job", jobRoute);
app.use("/post", postRoute);
app.use("/story", storyRoute);