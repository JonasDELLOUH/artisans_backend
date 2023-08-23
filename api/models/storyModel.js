import mongoose from "mongoose";

const StorySchema = mongoose.Schema({
    salonId: {type: String, required: true},
    videoUrl: {type: String},
    content: {type: String},
},
{timestamps: true}
);

const StoryModel = mongoose.model("Stories", StorySchema);
export default StoryModel;