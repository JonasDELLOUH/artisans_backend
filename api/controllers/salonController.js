import SalonModel from "../models/salonModel.js";
import JobModel from "../models/jobModel.js";
import mongoose from "mongoose";
import {verifyToken} from "../middlewares/authMiddleware.js";
import {uploadImage} from "../middlewares/storageMiddleware.js";

export const createSalon = async (req, res, session) => {
    console.log("creatingSalon");
    // Extraire les données nécessaires de req.body
    const userId = session.userId;
    const { jobId, salonName, lat, long, imageUrl } = req.body;

    // Vérifier si jobId existe
    const job = await JobModel.findById(jobId).session(session);
    if (!job) {
        throw new Error("ID du job invalide.");
    }

    // Créer le salon en utilisant la session
    const newSalon = new SalonModel({
        jobId,
        salonName,
        lat,
        long,
        imageUrl,
    });

    return await newSalon.save({ session });
};

export const createSalonWithTransaction = async (req, res) => {
    console.log(req.body);
    console.log(`tout : ${JSON.stringify(req.body)}`);
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Vérifier le token
        await verifyToken(req, res, session);

        // Télécharger l'image et ajouter le lien dans req.body.imageUrl
        await uploadImage("imageUrl")(req, res, session);

        // Créer le salon en utilisant la transaction
        const salon = await createSalon(req, res, session);

        await session.commitTransaction();

        return res.status(200).json({ salon });
    } catch (error) {
        await session.abortTransaction();
        return res.status(409).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};