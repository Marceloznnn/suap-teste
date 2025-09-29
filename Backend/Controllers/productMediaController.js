import { addMedia, getMediaByProduct, deleteMedia, getPrimaryMedia } from "../Models/productMediaModel.js";
import { uploadFile } from "../Services/cloudinaryService.js";

// Upload de mídia para Cloudinary
export async function uploadMedia(req, res) {
  try {
    const { product_id, type, is_primary, is_secondary } = req.body;

    if (!req.file) return res.status(400).json({ error: "Arquivo obrigatório" });
    if (!product_id || !type) return res.status(400).json({ error: "Campos obrigatórios: product_id, type" });
    if (!["image","video"].includes(type)) return res.status(400).json({ error: "Tipo inválido. Use 'image' ou 'video'" });

    const uploaded = await uploadFile(req.file.buffer, type);

    const mediaId = await addMedia(product_id, uploaded.secure_url, type, is_primary || 0, is_secondary || 0);

    res.status(201).json({ message: "Mídia adicionada", id: mediaId, url: uploaded.secure_url });
  } catch (err) {
    console.error("Erro ao adicionar mídia:", err);
    res.status(500).json({ error: "Erro interno do servidor", details: err.message });
  }
}

// Listar todas as mídias de um produto
export async function listMedia(req, res) {
  try {
    const { product_id } = req.params;
    const media = await getMediaByProduct(product_id);
    res.json(media);
  } catch (err) {
    console.error("Erro ao listar mídias:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Retornar apenas a imagem principal de um produto
export async function primaryMedia(req, res) {
  try {
    const { product_id } = req.params;
    const media = await getPrimaryMedia(product_id);
    if (!media) return res.status(404).json({ error: "Imagem principal não encontrada" });
    res.json(media);
  } catch (err) {
    console.error("Erro ao buscar imagem principal:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Deletar mídia
export async function removeMedia(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteMedia(id);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Mídia não encontrada" });
    res.json({ message: "Mídia deletada" });
  } catch (err) {
    console.error("Erro ao deletar mídia:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
