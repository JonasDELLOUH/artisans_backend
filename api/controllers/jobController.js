import JobModel from "../models/jobModel.js";
import * as fs from "fs";
import {verifyToken} from "../middlewares/authMiddleware.js";
import mongoose from "mongoose";
import {uploadImage} from "../middlewares/storageMiddleware.js";

export const createJob = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Vérifier le token
        await verifyToken(req, res, session);

        // Télécharger l'image et ajouter le lien dans req.body.imageUrl
        await uploadImage("imageUrl")(req, res, session);

        // Continuer avec le reste de la fonction
        const { jobName, imageUrl } = req.body;
        const userId = req.headers.userId;
        console.log(`le userId : ${userId}`);
        const newJob = new JobModel({ userId, jobName, imageUrl });
        const job = await newJob.save();
        res.status(200).json({ job });

        // Valider la transaction
        await session.commitTransaction();
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        // Terminer la session
        await session.endSession();
    }
};
export const getAllJobs = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Vérifier le token
        await verifyToken(req, res, session);

        // Continuer avec le reste de la fonction
        const { limit, skip } = req.query;
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

        // Valider la transaction
        await session.commitTransaction();
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        // Terminer la session
        await session.endSession();
    }
};

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

export async function searchJob(req, res){

}