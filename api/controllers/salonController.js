import SalonModel from "../models/salonModel.js";
import JobModel from "../models/jobModel.js";
import UserModel from "../models/userModel.js";

export const createSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const {jobId, name, lat, long, imageUrl, address, email, phone, desc, whatsappNumber} = req.body;
        const totalStar = 25;

        // Vérifier si l'utilisateur a déjà un salon
        const existingSalon = await SalonModel.findOne({userId});
        if (existingSalon) {
            return res.status(409).json({message: "Vous avez déjà un salon enregistré."});
        }

        const oldSalon = await SalonModel.findOne({name});

        if (oldSalon) return res.status(400).json({message: "Il existe déjà un salon du même nom"});

        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({message: "ID du job invalide."});
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
        const user = await UserModel.findOne({_id: userId});
        if (user) {
            user.hasSalon = true;
            await user.save();
        }

        return res.status(200).json({salon});
    } catch (error) {
        res.status(409).json({message: error.message});
    }
};


export const updateSalon = async (req, res) => {
    try {
        const salonId = req.params.id;
        const {jobId, name, lat, long, imageUrl, address, email, phone, whatsappNumber, desc} = req.body;
        const userId = req.headers.userId;

        const salon = await SalonModel.findById(salonId);

        if (!salon) {
            return res.status(404).json({message: "Salon non trouvé."});
        }

        // Vérifiez si un autre salon avec le même nom existe, à l'exception du salon actuel
        const existingSalon = await SalonModel.findOne({
            name,
            _id: {$ne: salon._id} // Exclut le salon actuel
        });

        if (existingSalon) {
            return res.status(400).json({message: "Il existe déjà un salon avec le même nom."});
        }

        console.log(`userId : ${userId} \t \t salon.userId: ${salon.userId}`)

        if (userId != salon.userId) {
            return res.status(403).json({message: "Vous n'avez pas la permission de modifier ce salon."});
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
            {new: true}
        );

        return res.status(200).json({updatedSalon});

    } catch (error) {
        res.status(409).json({message: error.message});
    }
};


export const getAllSalon = async (req, res) => {
    try {
        const { lat, long, per_page = 2, page = 1, jobId, name } = req.query;

        const perPageNumber = parseInt(per_page, 10);
        const pageNumber = parseInt(page, 10);

        let matchQuery = {
            lat: { $exists: true },
            long: { $exists: true },
            ...(jobId && { jobId }), // Filtre jobId s'il est défini
            ...(name && { name: { $regex: new RegExp(name, 'i') } }) // Filtre name s'il est défini
        };

        let aggregationPipeline = [];

        if (lat && long) {
            matchQuery = {
                ...matchQuery,
                lat: { $exists: true },
                long: { $exists: true },
            };

            aggregationPipeline.push({
                $addFields: {
                    distance: {
                        $sqrt: {
                            $add: [
                                { $pow: [{ $subtract: ["$lat", parseFloat(lat)] }, 2] },
                                { $pow: [{ $subtract: ["$long", parseFloat(long)] }, 2] },
                            ],
                        },
                    },
                },
            });

            aggregationPipeline.push({ $sort: { distance: 1 } });
        }

        aggregationPipeline.push({ $sort: { createdAt: -1 } }); // Tri par les plus récents

        aggregationPipeline.push({ $match: matchQuery });

        const salons = await SalonModel.aggregate(aggregationPipeline);

        const totalStarsSum = salons.reduce((sum, salon) => sum + salon.totalStar, 0);
        const totalSalons = salons.length;
        const averageTotalStars = totalStarsSum / totalSalons;

        for (const salon of salons) {
            const calculatedNbrStar = Math.ceil((salon.totalStar * 5) / averageTotalStars);
            salon.nbrStar = calculatedNbrStar <= 5 ? calculatedNbrStar : 5;
        }

        const skipNumber = (pageNumber - 1) * perPageNumber;
        const paginatedSalons = salons.slice(skipNumber, skipNumber + perPageNumber);

        const hasPrev = pageNumber > 1;
        const hasNext = skipNumber + perPageNumber < salons.length;

        const data = {
            items: paginatedSalons,
            page: pageNumber,
            total_pages: Math.ceil(salons.length / perPageNumber),
            total_items: salons.length,
            has_prev: hasPrev,
            has_next: hasNext,
        };

        res.status(200).json({
            data,
            message: null,
            status: true,
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
            return res.status(404).json({message: "Salon non trouvé."});
        }

        const userLiked = salon.likedBy.includes(userId);
        console.log(userLiked);

        if (userLiked) {
            res.status(200).json({isLiked: true});
        } else {

            res.status(200).json({isLiked: false});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}


export const likeSalon = async (req, res) => {
    try {
        const userId = req.headers.userId;
        const salonId = req.params.id;

        const salon = await SalonModel.findById(salonId);
        if (!salon) {
            return res.status(404).json({message: "Salon non trouvé."});
        }

        const userLiked = salon.likedBy.includes(userId);
        console.log(userLiked);

        if (userLiked) {
            // Utilisateur a déjà liké, donc disliké
            salon.totalStar -= 1;
            salon.likedBy.pull(userId);

            await salon.save();
            res.status(200).json({message: "dislike réussie.", isLiked: false});
        } else {
            // Utilisateur n'a pas encore liké, donc liké
            salon.totalStar += 1;
            salon.likedBy.push(userId);

            await salon.save();

            res.status(200).json({message: "like réussie.", isLiked: true});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getUserSalon = async (req, res) => {
    const userId = req.headers.userId; // Récupérer l'ID de l'utilisateur à partir du jeton vérifié

    try {
        const salon = await SalonModel.findOne({userId}); // Rechercher le salon correspondant à l'ID de l'utilisateur

        if (salon) {
            // Si un salon est trouvé, renvoyer un objet avec un booléen true et les informations du salon
            return res.status(200).json({hasSalon: true, salon});
        } else {
            // Si aucun salon n'est trouvé, renvoyer un objet avec un booléen false
            return res.status(200).json({hasSalon: false});
        }
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};
