import SalonModel from "../models/salonModel.js";
import JobModel from "../models/jobModel.js";

export const createSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const {jobId, salonName, lat, long, imageUrl} = req.body;

        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "ID du job invalide." });
        }

        const newSalon = new SalonModel({jobId, salonName, lat, long, imageUrl});
        const salon = await newSalon.save();
        return res.status(200).json({salon});

    } catch (error){
        res.status(409).json({ message: error.message });
    }
}