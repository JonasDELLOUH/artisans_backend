import JobModel from "../models/jobModel.js";
import * as fs from "fs";

export const createJob = async (req, res) => {
    console.log(`data send : ${JSON.stringify(req.body)}`)
    try {
        const {jobName, imageUrl} = req.body;
        const userId = req.headers.userId;
        console.log(`le userId : ${userId}`)
        const newJob = new JobModel({userId, jobName, imageUrl});
        const job = await newJob.save();
        res.status(200).json({job});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getAllJobs = async (req, res) => {
    try {
        const {limit, skip} = req.query;

        const limitNumber = parseInt(limit, 10);
        const skipNumber = parseInt(skip, 10);

        const jobs = await JobModel.find().limit(limitNumber).skip(skipNumber);
        const jobsWithoutUserId = jobs.map((job) => ({
            _id: job._id,
            imageUrl: job.imageUrl,
            jobName: job.jobName,
            __v: job.__v,
        }));
        res.status(200).json(jobsWithoutUserId);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export async function updateJob(req, res) {
    try {
        const jobId = req.params.id;
        const {jobName, imageUrl} = req.body;

        // Récupérez le job existant par son ID
        const existingJob = await JobModel.findById(jobId);

        if (!existingJob) {
            return res.status(404).json({message: "Job non trouvé."});
        }

        // Vérifiez si une nouvelle image a été envoyée avec la mise à jour du job
        if (imageUrl && imageUrl !== existingJob.imageUrl) {
            // Supprimez l'ancienne image du dossier public/files
            const imagePath = `public${existingJob.imageUrl}`;
            fs.unlinkSync(imagePath);
        }

        existingJob.jobName = jobName;
        existingJob.imageUrl = imageUrl;
        await existingJob.save();

        res.status(200).json({message: "Job mis à jour avec succès."});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}