import cloudinary from "../Config/cloudinary.js";

/**
 * Faz upload de arquivo para Cloudinary
 * @param {Buffer} fileBuffer Arquivo em buffer (do multer)
 * @param {"image"|"video"} resourceType Tipo do arquivo
 * @param {Object} options Opções adicionais (folder, public_id, etc)
 * @returns {Promise<Object>} Resultado do Cloudinary
 */
export async function uploadFile(fileBuffer, resourceType = "image", options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Remove arquivo do Cloudinary pelo public_id
 * @param {string} publicId
 * @param {"image"|"video"} resourceType
 * @returns {Promise<Object>}
 */
export async function deleteFile(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (err) {
    throw new Error("Erro ao deletar arquivo do Cloudinary: " + err.message);
  }
}
