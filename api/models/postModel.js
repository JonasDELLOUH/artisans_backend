import mongoose from "mongoose";

const PostSchema = mongoose.Schema({
    salonId: {type: String, required: true},
    imageUrl: {type: String},
    content: {type: String},
},
{timestamps: true}
);

const PostModel = mongoose.model("Posts", PostSchema);
export default PostModel;