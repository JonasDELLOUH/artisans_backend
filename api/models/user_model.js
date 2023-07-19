const mongoose = require("mongoose")

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
            required: true,
        },
        lastname: {
            type: String,
            required: true,
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