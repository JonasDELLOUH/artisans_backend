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
        },
        lastname: {
            type: String,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        hasSalon: {
            type: Boolean,
            default: false,
        },
    }
);

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;