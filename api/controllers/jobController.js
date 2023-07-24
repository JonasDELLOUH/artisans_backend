import JobModel from "../models/jobModel.js";

export const createJob = async (req, res) => {
    try{
        const {jobName, imageUrl, userId} = req.body;
        const newJob = new JobModel(userId, jobName, imageUrl);
        const job = await newJob.save();
        res.status(200).json({job});
    } catch (error){
        res.status(500).json({message: error.message});
    }
}