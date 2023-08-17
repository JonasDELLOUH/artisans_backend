import SalonModel from "../models/salonModel.js";
import JobModel from "../models/jobModel.js";
import mongoose from "mongoose";

export const createSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const {jobId, name, lat, long, imageUrl, address, email, phone} = req.body;
        const totalStar = 25;

        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "ID du job invalide." });
        }

        const newSalon = new SalonModel({userId, jobId, name, lat, long, imageUrl, address, email, phone, totalStar});
        const salon = await newSalon.save();
        return res.status(200).json({salon});

    } catch (error){
        res.status(409).json({ message: error.message });
    }
}


export const getAllSalon = async(req, res) => {
    try{
        const {limit, skip} = req.query;

        const limitNumber = parseInt(limit, 10);
        const skipNumber = parseInt(skip, 10);

        const salons = await SalonModel.find().limit(limitNumber).skip(skipNumber);
        res.status(200).json(salons);

    } catch (error){
        res.status(409).json({ message: error.message });
    }
}

export const getNearestSalon = async (req, res) => {
    try {
        const { lat, long, limit = 10, skip = 0 } = req.body;
    
        const limitNumber = parseInt(limit, 10);
        const skipNumber = parseInt(skip, 10);
    
        const salons = await SalonModel.aggregate([
            {
                $project: {
                    userId: 1,
                    jobId: 1,
                    name: 1,
                    lat: 1,
                    long: 1,
                    imageUrl: 1,
                    address: 1,
                    nbrStar: 1,
                    totalStar: 1,
                    email: 1,
                    phone: 1,
                    distance: {
                        $add: [
                            { $pow: [{ $subtract: ['$lat', lat] }, 2] },
                            { $pow: [{ $subtract: ['$long', long] }, 2] },
                        ]
                        ,
                    },
                },
            },
            { $sort: { distance: 1 } },
            { $limit: limitNumber },
            { $skip: skipNumber },
        ]);
    
        res.status(200).json(salons);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }    
};
