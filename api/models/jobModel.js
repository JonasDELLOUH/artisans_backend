import mongoose from "mongoose";

const JobSchema = mongoose.Schema(
    {
        userId: mongoose.Schema.Types.ObjectId,
        imageUrl: {type: String},
        jobName: {type: String, required: true},
    },
);
const JobModel = mongoose.model("Jobs", JobSchema);
export default JobModel;