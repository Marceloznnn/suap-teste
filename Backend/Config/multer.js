import multer from "multer";

// Armazenamento em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
