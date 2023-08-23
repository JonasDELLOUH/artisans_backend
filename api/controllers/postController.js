import SalonModel from "../models/salonModel.js";
import PostModel from "../models/postModel.js";


export const createPost = async (req, res) => {
    try {
        const { salonId, imageUrl, content } = req.body;
        const userId = req.headers.userId; // Récupère l'ID de l'utilisateur depuis le header

        const salon = await SalonModel.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: "ID du salon invalide." });
        }

        // Vérifie si l'utilisateur est le propriétaire du salon
        if (salon.userId.toString() !== userId) {
            return res.status(403).json({ message: "Accès non autorisé au salon." });
        }

        // Vérifie si au moins l'une des données (imageUrl ou content) est présente
        if (!imageUrl && !content) {
            return res.status(400).json({ message: "L'image ou le contenu du post est requis." });
        }

        const newPost = new PostModel({
            salonId,
            imageUrl,
            content,
        });

        const post = await newPost.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



export const getPosts = async (req, res) => {
    try {
        const { lat, long, limit = 10, skip = 0 } = req.query;

        const limitNumber = parseInt(limit, 10);
        const skipNumber = parseInt(skip, 10);

        const aggregationPipeline = [
            {
                $lookup: {
                    from: "Salons",
                    localField: "salonId",
                    foreignField: "_id",
                    as: "salon"
                },
            },
            //{
            //    $unwind: "$salon",
            //},
            {
                $project: {
                    _id: 1,
                    salonId: 1,
                    imageUrl: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    distance: {
                        $cond: {
                            if: { $and: [lat, long] },
                            then: {
                                $add: [
                                    { $pow: [{ $subtract: ["$salon.lat", parseFloat(lat)] }, 2] },
                                    { $pow: [{ $subtract: ["$salon.long", parseFloat(long)] }, 2] },
                                ],
                            },
                            else: null,
                        },
                    },
                },
            },
            { $sort: { distance: 1 } },
            { $skip: skipNumber },
            { $limit: limitNumber },
        ];        

        const posts = await PostModel.aggregate(aggregationPipeline);
        const count = posts.length;

        res.status(200).json({
            posts,
            limit: limitNumber,
            skip: skipNumber,
            count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
