import pool from "../config/db.js";

class AulasController {
  // 🔹 Listar todas as aulas
  static async listar(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT id, data, quantidade_aulas
        FROM aulas
        ORDER BY data DESC
      `);
      return res.json(rows);
    } catch (error) {
      console.error("Erro ao listar aulas:", error);
      return res.status(500).json({ message: "Erro ao listar aulas." });
    }
  }

  // 🔹 Criar nova aula
  static async criar(req, res) {
    const { data, quantidade_aulas } = req.body;

    if (!data) {
      return res.status(400).json({ message: "A data da aula é obrigatória." });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO aulas (data, quantidade_aulas) VALUES (?, ?)",
        [data, quantidade_aulas || 1]
      );

      return res.status(201).json({
        message: "Aula criada com sucesso.",
        aula: {
          id: result.insertId,
          data,
          quantidade_aulas: quantidade_aulas || 1,
        },
      });
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      return res.status(500).json({ message: "Erro ao criar aula." });
    }
  }

  // 🔹 Atualizar aula
  static async atualizar(req, res) {
    const { id } = req.params;
    const { data, quantidade_aulas } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID da aula é obrigatório." });
    }

    try {
      const [result] = await pool.query(
        "UPDATE aulas SET data = ?, quantidade_aulas = ? WHERE id = ?",
        [data, quantidade_aulas, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Aula não encontrada." });
      }

      return res.json({ message: "Aula atualizada com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      return res.status(500).json({ message: "Erro ao atualizar aula." });
    }
  }

  // 🔹 Deletar aula
  static async deletar(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID da aula é obrigatório." });
    }

    try {
      const [result] = await pool.query("DELETE FROM aulas WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Aula não encontrada." });
      }

      return res.json({ message: "Aula deletada com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
      return res.status(500).json({ message: "Erro ao deletar aula." });
    }
  }
}

export default AulasController;
