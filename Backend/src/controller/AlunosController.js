import pool from "../config/db.js";

class AlunosController {
  // Listar todos os alunos
  static async listar(req, res) {
    try {
      const [rows] = await pool.query("SELECT * FROM alunos");
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao listar alunos" });
    }
  }

  // Buscar aluno por ID
  static async buscar(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await pool.query("SELECT * FROM alunos WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ message: "Aluno não encontrado" });
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar aluno" });
    }
  }

  // Criar novo aluno
  static async criar(req, res) {
    const { nome, matricula, foto } = req.body;
    if (!nome || !matricula) return res.status(400).json({ message: "Nome e matrícula são obrigatórios" });

    try {
      const [result] = await pool.query(
        "INSERT INTO alunos (nome, matricula, foto) VALUES (?, ?, ?)",
        [nome, matricula, foto || null]
      );
      res.json({ message: "Aluno criado com sucesso", id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar aluno" });
    }
  }

  // Atualizar aluno
  static async atualizar(req, res) {
    const { id } = req.params;
    const { nome, matricula, foto } = req.body;

    try {
      await pool.query(
        "UPDATE alunos SET nome = ?, matricula = ?, foto = ? WHERE id = ?",
        [nome, matricula, foto, id]
      );
      res.json({ message: "Aluno atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar aluno" });
    }
  }

  // Deletar aluno
  static async deletar(req, res) {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM alunos WHERE id = ?", [id]);
      res.json({ message: "Aluno deletado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar aluno" });
    }
  }
}

export default AlunosController;
