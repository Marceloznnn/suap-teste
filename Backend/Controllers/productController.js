import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../Models/productModel.js";

// Função para gerar SKU aleatório de 8 dígitos numéricos
function generateSKU() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Criar produto
export async function addProduct(req, res) {
  try {
    const { name, description, price, stock, metadata } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "Campos obrigatórios: name, price" });
    }

    const sku_code = generateSKU(); // gera SKU automaticamente

    const productId = await createProduct({ sku_code, name, description, price, stock, metadata });

    res.status(201).json({ message: "Produto criado com sucesso", id: productId, sku_code });
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Listar todos os produtos
export async function listProducts(req, res) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Buscar produto por ID
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(product);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Atualizar produto
export async function editProduct(req, res) {
  try {
    const { id } = req.params;

    // Previne alteração do SKU
    if (req.body.sku_code) delete req.body.sku_code;

    const result = await updateProduct(id, req.body);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Produto não encontrado" });

    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Deletar produto
export async function removeProduct(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteProduct(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Produto não encontrado" });

    res.json({ message: "Produto deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar produto:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
