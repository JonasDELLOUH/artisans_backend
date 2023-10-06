import SalonModel from "../models/salonModel.js";
import JobModel from "../models/jobModel.js";
import UserModel from "../models/userModel.js";

export const createSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const { jobId, name, lat, long, imageUrl, address, email, phone, desc, whatsappNumber } = req.body;
        const totalStar = 25;

        // Vérifier si l'utilisateur a déjà un salon
        const existingSalon = await SalonModel.findOne({ userId });
        if (existingSalon) {
            return res.status(409).json({ message: "Vous avez déjà un salon enregistré." });
        }

        const oldSalon = await SalonModel.findOne({ name });

        if (oldSalon) return res.status(400).json({ message: "Il existe déjà un salon du même nom" });

        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "ID du job invalide." });
        }

        const newSalon = new SalonModel({
            userId,
            jobId,
            name,
            lat,
            long,
            imageUrl,
            address,
            email,
            phone,
            whatsappNumber,
            totalStar,
            desc
        });

        const salon = await newSalon.save();

        // Mettre à jour hasSalon de l'utilisateur
        const user = await UserModel.findOne({ _id: userId });
        if (user) {
            user.hasSalon = true;
            await user.save();
        }

        return res.status(200).json({ salon });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};


export const updateSalon = async (req, res) => {
    try {
        const salonId = req.params.id;
        const { jobId, name, lat, long, imageUrl, address, email, phone, whatsappNumber, desc } = req.body;
        const userId = req.headers.userId;

        const salon = await SalonModel.findById(salonId);

        if (!salon) {
            return res.status(404).json({ message: "Salon non trouvé." });
        }

        // Vérifiez si un autre salon avec le même nom existe, à l'exception du salon actuel
        const existingSalon = await SalonModel.findOne({
            name,
            _id: { $ne: salon._id } // Exclut le salon actuel
        });

        if (existingSalon) {
            return res.status(400).json({ message: "Il existe déjà un salon avec le même nom." });
        }

        if (userId != salon.userId) {
            return res.status(403).json({ message: "Vous n'avez pas la permission de modifier ce salon." });
        }

        const updatedSalon = await SalonModel.findByIdAndUpdate(
            salonId,
            {
                jobId,
                name,
                lat,
                long,
                desc,
                imageUrl,
                address,
                email,
                phone,
                whatsappNumber
            },
            { new: true }
        );

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
                    desc: 1,
                    long: 1,
                    imageUrl: 1,
                    address: 1,
                    email: 1,
                    phone: 1,
                    whatsappNumber: 1,
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

export const verifyLikeStatus = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const salonId = req.params.id;

        const salon = await SalonModel.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: "Salon non trouvé." });
        }

        const userLiked = salon.likedBy.includes(userId);
        console.log(userLiked);

        if (userLiked) {
            res.status(200).json({ isLiked: true });
        } else {

            res.status(200).json({ isLiked: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const likeSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const salonId = req.params.id;

        const salon = await SalonModel.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: "Salon non trouvé." });
        }

        const userLiked = salon.likedBy.includes(userId);
        console.log(userLiked);

        if (userLiked) {
            // Utilisateur a déjà liké, donc disliké
            salon.totalStar -= 1;
            salon.likedBy.pull(userId);

            await salon.save();
            res.status(200).json({ message: "dislike réussie.", isLiked: false });
        } else {
            // Utilisateur n'a pas encore liké, donc liké
            salon.totalStar += 1;
            salon.likedBy.push(userId);

            await salon.save();

            res.status(200).json({ message: "like réussie.", isLiked: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUserSalon = async (req, res) => {
    const userId = req.headers.userId; // Récupérer l'ID de l'utilisateur à partir du jeton vérifié

    try {
        const salon = await SalonModel.findOne({ userId }); // Rechercher le salon correspondant à l'ID de l'utilisateur

        if (salon) {
            // Si un salon est trouvé, renvoyer un objet avec un booléen true et les informations du salon
            return res.status(200).json({ hasSalon: true, salon });
        } else {
            // Si aucun salon n'est trouvé, renvoyer un objet avec un booléen false
            return res.status(200).json({ hasSalon: false });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
