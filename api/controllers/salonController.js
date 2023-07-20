import SalonModel from "../models/salonModel.js";

export const createSalon = async (req, res) => {
    try {
        const {userId, salonName, lat, long, imageUrl} = req.body;
        const newSalon = new SalonModel(req.body);
    } catch (error){
        res.status(409).json({ message: error.message });
    }
}