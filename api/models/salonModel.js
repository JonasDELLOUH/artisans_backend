import mongoose from "mongoose";

const salonSchema = mongoose.Schema({
        userId: mongoose.Schema.Types.ObjectId,
        jobId: {type: String, required: true},
        name: {type: String, required: true},
        lat: {type: Number},
        long: {type: Number},
        imageUrl: {type: String},
        address: {type: String},
        nbrStar: {type: Number},
        totalStar: {type: Number},
        email: {type: String},
        phone: {type: String},
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {timestamps: true}
);

const SalonModel = mongoose.model("Salons", salonSchema);
export default SalonModel;