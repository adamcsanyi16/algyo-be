const pool = require("../db");

exports.getPenalties = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT penalties.id, players.name, penalties.description, penalties.amount, penalties.paid, penalties.created_at FROM penalties LEFT JOIN players ON penalties.player_id = players.id",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*exports.getPenaltyById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      "SELECT * FROM penalties WHERE id = $1",
      [id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}*/

exports.addPenalty = async (req, res) => {
  const { player_name,description, amount, paid } = req.body

  try {
    const playerResult = await pool.query(
      "SELECT id FROM players WHERE name = $1",
      [player_name]
    );

    const result = await pool.query(
      "INSERT INTO penalties (player_id, description, amount, paid) VALUES ($1,$2,$3,$4) RETURNING *",
      [playerResult.rows[0].id, description, amount, paid]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/*exports.updatePenalty = async (req, res) => {
  const { id } = req.params
  const { description, amount, paid } = req.body

  try {
    const result = await pool.query(
      `UPDATE penalties 
       SET description=$1, amount=$2, paid=$3
       WHERE id=$4
       RETURNING *`,
      [description, amount, paid, id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}*/

exports.deletePenalty = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM penalties WHERE id=$1", [id]);

    res.json({ message: "Büntetés törölve!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
