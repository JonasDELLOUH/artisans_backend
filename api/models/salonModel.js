import mongoose from "mongoose";

const salonSchema = mongoose.Schema({
        userId: {type: String, required: true},
        salonName: {type: String, required: true},
        lat: {type: Number},
        long: {type: Number},
        imageUrl: {type: String},
    },
    {timestamps: true}
);

const SalonModel = mongoose.model("Salons", salonSchema);
export default SalonModel;