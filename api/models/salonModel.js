import mongoose from "mongoose";

const salonSchema = mongoose.Schema({
        userId: mongoose.Schema.Types.ObjectId,
        jobId: mongoose.Schema.Types.ObjectId,
        salonName: {type: String, required: true},
        lat: {type: Number},
        long: {type: Number},
        imageUrl: {type: String},
        address: {type: String},
        nbrStar: {type: Number},
    },
    {timestamps: true}
);

const SalonModel = mongoose.model("Salons", salonSchema);
export default SalonModel;