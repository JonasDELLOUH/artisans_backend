import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";

//routes
import AuthRoute from './routes/authRoute.js';
import salonRoute from "./routes/salonRoute.js";
import jobRoute from "./routes/jobRoute.js";
import postRoute from "./routes/postRoute.js";
import storyRoute from "./routes/storyRoute.js"; 

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))
// app.use(bodyParser.json({limit: "30mb", extended: true}));
// app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use(helmet());

// to serve images inside public folder
app.use(express.static('public'));
app.use('/files', express.static('public/files'));

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