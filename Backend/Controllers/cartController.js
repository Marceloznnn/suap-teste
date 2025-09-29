import { addCartItem, getCartItems, updateCartItem, deleteCartItem } from "../Models/cartModel.js";

// Adicionar item
export async function addToCart(req, res) {
  try {
    const session_id = req.headers["x-session-id"];
    const { product_id, quantity } = req.body;

    if (!session_id) return res.status(400).json({ error: "Session ID é obrigatório" });
    if (!product_id) return res.status(400).json({ error: "Produto é obrigatório" });

    await addCartItem(session_id, product_id, quantity || 1);
    res.status(201).json({ message: "Item adicionado ao carrinho" });
  } catch (err) {
    console.error("Erro ao adicionar ao carrinho:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Listar itens
export async function listCart(req, res) {
  try {
    const session_id = req.headers["x-session-id"];
    if (!session_id) return res.status(400).json({ error: "Session ID é obrigatório" });

    const items = await getCartItems(session_id);
    res.json(items);
  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Atualizar quantidade
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    await updateCartItem(id, quantity);
    res.json({ message: "Quantidade atualizada" });
  } catch (err) {
    console.error("Erro ao atualizar item:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Remover item
export async function removeItem(req, res) {
  try {
    const { id } = req.params;
    await deleteCartItem(id);
    res.json({ message: "Item removido do carrinho" });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
