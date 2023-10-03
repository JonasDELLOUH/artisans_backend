// controllers/user.js
import UserModel from '../models/userModel.js';
import bcrypt from "bcrypt";

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.headers.userId;

    try {
        // Récupérez l'utilisateur par son ID
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérifiez si l'ancien mot de passe est correct
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ message: "Mot de passe actuel incorrect." });
        }

        // Hachez et enregistrez le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;

        // Enregistrez l'utilisateur mis à jour
        await user.save();

        return res.status(200).json({ message: "Mot de passe modifié avec succès." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.headers.userId;

        const { username, email, phone } = req.body;

        const existingUser = await UserModel.findOne({
            $and: [{ _id: { $ne: userId } }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { username, email, phone },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({ updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const  verifyUserNameExist = async (req, res) => {
    try{
        const { username} = req.body;
        const existingUser = await UserModel.findOne({username});
        if (existingUser) {
            return res.status(200).json({ exist: true});
        } else{
            return res.status(200).json({ exist: false});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
