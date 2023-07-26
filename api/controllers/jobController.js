import JobModel from "../models/jobModel.js";

export const createJob = async (req, res) => {
    console.log(`data send : ${JSON.stringify(req.body)}`)
    try{
        const {jobName, imageUrl} = req.body;
        const userId = req.headers.userId;
        console.log(`le userId : ${userId}`)
        const newJob = new JobModel({userId, jobName, imageUrl});
        const job = await newJob.save();
        res.status(200).json({job});
    } catch (error){
        res.status(500).json({message: error.message});
    }
}