import multer from "multer";
import path from "path";
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
    return (req, res, session) => {
        return new Promise((resolve, reject) => {
            upload.single(imageAttribute)(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    reject(new Error("Une erreur (MulterError) s'est produite lors du téléchargement de l'image."));
                } else if (err) {
                    reject(new Error("Une erreur s'est produite lors du traitement de l'image."));
                }

                // Si aucune erreur, ajouter l'URL de l'image dans l'attribut spécifié de la requête
                if (req.file) {
                    req.body[imageAttribute] = '/files/' + req.file.filename;
                }
                resolve(); // Résoudre la promesse lorsque tout est bon
            });
        });
    };
}
export function uploadImages(imageAttributes) {
    return (req, res, next) => {
        upload.array(imageAttributes)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Gérer les erreurs Multer
                return res.status(400).json({error: 'Une erreur s\'est produite lors du téléchargement des images.'});
            } else if (err) {
                // Gérer d'autres erreurs
                return res.status(500).json({error: 'Une erreur s\'est produite lors du traitement des images.'});
            }

            // Si aucune erreur, ajouter les URLs des images dans les attributs spécifiés de la requête
            if (req.files) {
                req.body = {...req.body}; // Clonez req.body pour éviter de modifier l'objet d'origine

                imageAttributes.forEach((attribute, index) => {
                    if (req.files[index]) {
                        req.body[attribute] = '/files/' + req.files[index].filename;
                    }
                });
            }
            next();
        });
    };
}
