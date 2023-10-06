import SalonModel from "../models/salonModel.js";
import PostModel from "../models/postModel.js";
import mongoose from "mongoose";


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
        const { lat, long, limit = 10, skip = 0, salonId } = req.query;

        const limitNumber = parseInt(limit, 10);
        const skipNumber = parseInt(skip, 10);

        let aggregationPipeline = [
            {
                $lookup: {
                    from: "Salons",
                    localField: "salonId",
                    foreignField: "_id",
                    as: "salon",
                },
            },
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
                                    { $pow: [{ $subtract: [{ $arrayElemAt: ["$salon.lat", 0] }, parseFloat(lat)] }, 2] },
                                    { $pow: [{ $subtract: [{ $arrayElemAt: ["$salon.long", 0] }, parseFloat(long)] }, 2] },
                                ],
                            },
                            else: null,
                        },
                    },
                },

            },
            { $sort: { distance: 1 } },
            { $sort: { createdAt: -1 } },
            { $skip: skipNumber },
            { $limit: limitNumber },
        ];

        if (salonId) {
            console.log("yess")
            aggregationPipeline = [
                ...aggregationPipeline,
                {
                    $match: {
                        "salonId": salonId
                    }
                }
            ];
        }

        const posts = await PostModel.aggregate(aggregationPipeline);

        // Parcourir les posts et ajouter les champs du salon
        for (const post of posts) {
            const salon = await SalonModel.findById(post.salonId);
            post.salon = {
                _id: salon._id,
                name: salon.name,
                imageUrl: salon.imageUrl,
                userId: salon.userId,
                jobId: salon.jobId,
                lat: salon.lat,
                desc: salon.desc,
                long: salon.long,
                address: salon.address,
                email: salon.email,
                phone: salon.phone,
                whatsappNumber: salon.whatsappNumber,
            };
        }

        res.status(200).json({
            posts,
            limit: limitNumber,
            skip: skipNumber,
            //count: posts.length,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


