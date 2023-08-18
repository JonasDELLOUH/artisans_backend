import SalonModel from "../models/salonModel.js";
import JobModel from "../models/jobModel.js";

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


export const updateSalon = async (req, res) => {
    try {
        const salonId = req.params.id;
        const { jobId, name, lat, long, imageUrl, address, email, phone } = req.body;

        const updatedSalon = await SalonModel.findByIdAndUpdate(
            salonId,
            {
                jobId,
                name,
                lat,
                long,
                imageUrl,
                address,
                email,
                phone,
            },
            { new: true }
        );

        if (!updatedSalon) {
            return res.status(404).json({ message: "Salon non trouvé." });
        }

        return res.status(200).json({ updatedSalon });

    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};


export const getAllSalon = async (req, res) => {
    try {
        const { lat, long, limit = 10, skip = 0, jobId, name } = req.body;
    
        const limitNumber = parseInt(limit, 10);
        const skipNumber = parseInt(skip, 10);

        const query = {
            lat: { $exists: true },
            long: { $exists: true },
        };

        if (jobId) {
            query.jobId = jobId;
        }

        if (name && name.trim() !== '') {
            query.name = { $regex: name, $options: 'i' };
        }

        const salons = await SalonModel.aggregate([
            {
                $match: query,
            },
            {
                $project: {
                    userId: 1,
                    jobId: 1,
                    name: 1,
                    lat: 1,
                    long: 1,
                    imageUrl: 1,
                    address: 1,
                    email: 1,
                    phone: 1,
                    distance: {
                        $add: [
                            { $pow: [{ $subtract: ['$lat', lat] }, 2] },
                            { $pow: [{ $subtract: ['$long', long] }, 2] },
                        ],
                    },
                    totalStar: 1,
                },
            },
            {
                $sort: { distance: 1 },
            },
            {
                $limit: limitNumber,
            },
            {
                $skip: skipNumber,
            },
            {
                $addFields: {
                    nbrStar: {
                        $ceil: {
                            $divide: [
                                { $multiply: ['$totalStar', 5] },
                                { $sum: '$totalStar' },
                            ],
                        },
                    },
                },
            },
        ]);

        const allSalons = await SalonModel.find();
        
        const totalStarsSum = allSalons.reduce((sum, salon) => sum + salon.totalStar, 0);
        const totalSalons = allSalons.length;
        const averageTotalStars = totalStarsSum / totalSalons;

        for (const salon of salons) {
            salon.nbrStar = Math.ceil((salon.totalStar * 5) / averageTotalStars);
        }

        const count = await SalonModel.countDocuments(query);
    
        res.status(200).json({
            count,
            skip: skipNumber,
            limit: limitNumber,
            salons,
        });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }    
};

export const likeSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const salonId = req.params.id;

        const salon = await SalonModel.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: "Salon non trouvé." });
        }

        const userLiked = salon.likedBy.includes(userId);

        if (userLiked) {
            // Utilisateur a déjà liké, donc disliké
            salon.nbrStar -= 1;
            salon.likedBy.pull(userId);
        } else {
            // Utilisateur n'a pas encore liké, donc liké
            salon.nbrStar += 1;
            salon.likedBy.push(userId);
        }

        await salon.save();
        
        res.status(200).json({ message: "Opération de like/dislike réussie." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

