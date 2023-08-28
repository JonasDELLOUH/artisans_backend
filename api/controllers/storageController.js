import multer from "multer";
import path from "path";
import mime from "mime-types";
// Configuration de Multer pour enregistrer les images dans le dossier 'public/files'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/files');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({storage});

export function uploadImage(imageAttribute) {
    return (req, res, next) => {
        console.log(`req in uploadImage : ${JSON.stringify(req.body)}`)
        try{
            upload.single(imageAttribute)(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    // Gérer les erreurs Multer
                    return res.status(400).json({error: 'Une erreur (MulterError) s\'est produite lors du téléchargement de l\'image.'});
                } else if (err) {
                    console.log(err);
                    // Gérer d'autres erreurs
                    return res.status(500).json({error: 'Une erreur s\'est produite lors du traitement de l\'image.'});
                }

                // Si aucune erreur, ajouter l'URL de l'image dans l'attribut spécifié de la requête
                if (req.file) {
                    req.body[imageAttribute] = '/files/' + req.file.filename;
                }
                next();
            });
        } catch (error){
            return res.status(500).json({ error: 'Une erreur s\'est produite lors du traitement de l\'image.' });
        }
    };
}

export function uploadVideo(mediaAttribute) {
    return (req, res, next) => {
        console.log(`req in uploadVideo : ${JSON.stringify(req.body)}`)
        try {
            upload.single(mediaAttribute)(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    // Gérer les erreurs Multer
                    return res.status(400).json({ error: 'Une erreur (MulterError) s\'est produite lors du téléchargement du média.' });
                } else if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Une erreur s\'est produite lors du traitement du média.' });
                }

                // Vérifier si le fichier téléchargé est une vidéo
                if (!req.file) {
                    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé.' });
                }

                const mimeType = mime.lookup(req.file.originalname);
                if (!mimeType.startsWith('video/')) {
                    return res.status(400).json({ error: 'Le fichier téléchargé doit être une vidéo.' });
                }

                // Si aucune erreur, ajouter l'URL du média dans l'attribut spécifié de la requête
                if (req.file) {
                    req.body[mediaAttribute] = '/files/' + req.file.filename;
                }
                next();
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Une erreur s\'est produite lors du traitement du média.' });
        }
    };
}
