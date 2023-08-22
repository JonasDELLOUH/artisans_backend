import SalonModel from "../models/salonModel";


export const createPost = async (req, res) => {
    try {
        const { salonId, imageUrl, content } = req.body;

        const salon = await SalonModel.findById(jobId);
        if (!salon) {
            return res.status(404).json({ message: "ID du salon invalide." });
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
        const posts = await PostModel.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}