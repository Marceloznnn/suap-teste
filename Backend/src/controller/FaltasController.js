import pool from "../config/db.js";

class FaltasController {
  // 🔹 Listar todas as faltas com dados do aluno e da aula
  static async listar(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          f.id,
          f.aluno_id,
          f.aula_id,
          a.nome AS aluno,
          a.matricula,
          a.foto,
          au.data AS data_aula,
          au.quantidade_aulas,
          f.quantidade_faltas
        FROM faltas f
        INNER JOIN alunos a ON a.id = f.aluno_id
        INNER JOIN aulas au ON au.id = f.aula_id
        ORDER BY au.data DESC, a.nome ASC
      `);
      return res.json(rows);
    } catch (error) {
      console.error("Erro ao listar faltas:", error);
      return res.status(500).json({ message: "Erro ao listar faltas." });
    }
  }

  // 🔹 Registrar ou atualizar uma falta
  static async registrar(req, res) {
    const { aluno_id, aula_id, quantidade_faltas } = req.body;

    if (!aluno_id || !aula_id || quantidade_faltas < 0 || quantidade_faltas > 2) {
      return res.status(400).json({
        message: "Dados inválidos. Verifique o aluno, aula e quantidade de faltas.",
      });
    }

    try {
      // Verifica se já existe registro
      const [existe] = await pool.query(
        "SELECT id FROM faltas WHERE aluno_id = ? AND aula_id = ?",
        [aluno_id, aula_id]
      );

      if (existe.length > 0) {
        // Atualiza registro existente
        await pool.query(
          "UPDATE faltas SET quantidade_faltas = ? WHERE aluno_id = ? AND aula_id = ?",
          [quantidade_faltas, aluno_id, aula_id]
        );
      } else {
        // Insere novo registro
        await pool.query(
          "INSERT INTO faltas (aluno_id, aula_id, quantidade_faltas) VALUES (?, ?, ?)",
          [aluno_id, aula_id, quantidade_faltas]
        );
      }

      // Retorna total atualizado
      const [total] = await pool.query(
        "SELECT SUM(quantidade_faltas) AS total_faltas FROM faltas WHERE aluno_id = ?",
        [aluno_id]
      );

      return res.status(200).json({
        message: "Falta registrada com sucesso.",
        total_faltas: total[0].total_faltas || 0,
      });
    } catch (error) {
      console.error("Erro ao registrar falta:", error);
      return res.status(500).json({ message: "Erro interno ao registrar falta." });
    }
  }

  // 🔹 Obter totais de faltas por aluno
  static async totalFaltas(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT aluno_id, SUM(quantidade_faltas) AS total_faltas
        FROM faltas
        GROUP BY aluno_id
      `);
      return res.json(rows);
    } catch (error) {
      console.error("Erro ao calcular total de faltas:", error);
      return res.status(500).json({ message: "Erro ao calcular total de faltas." });
    }
  }
}

export default FaltasController;
