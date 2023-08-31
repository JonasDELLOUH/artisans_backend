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

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoFileMap={
  'cdn':'videos/cdn.mp4',
  'generate-pass':'videos/generate-pass.mp4',
  'get-post':'videos/get-post.mp4',
}

app.get('/videos/:filename', (req, res)=>{
  const fileName = req.params.filename;
  console.log(`fileName : ${fileName}`)
  //const filePath = videoFileMap[fileName]
  const filePath = `public/files/${fileName}`;
  if(!filePath){
      return res.status(404).send('File not found')
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if(range){
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, {start, end});
      const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
      };
      res.writeHead(206, head);
      file.pipe(res);
  }
  else{
      const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4'
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res)
  }
})
  


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
