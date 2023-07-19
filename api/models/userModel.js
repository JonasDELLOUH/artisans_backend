import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstname: {
            type: String,
            required: false,
        },
        lastname: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false
        },
        hasSalon: {
            type: Boolean,
            default: false,
        },
    }
);

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;