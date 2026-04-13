const pool = require("../db");

exports.getPlayers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT players.id, players.name, points.amount FROM players LEFT JOIN points ON players.id = points.player_id",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*exports.getPlayerById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      "SELECT * FROM players WHERE id = $1",
      [id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}*/

exports.addPlayer = async (req, res) => {
  const { name, position, birth_date, photo } = req.body

  try {
    const result = await pool.query(
      "INSERT INTO players (name, position, birth_date, photo) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, position, birth_date, photo]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/*exports.updatePlayer = async (req, res) => {
  const { id } = req.params
  const { name, position, birth_date, photo } = req.body

  try {
    const result = await pool.query(
      `UPDATE players 
       SET name=$1, position=$2, birth_date=$3, photo=$4
       WHERE id=$5
       RETURNING *`,
      [name, position, birth_date, photo, id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}*/

exports.deletePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM players WHERE id=$1", [id]);

    res.json({ message: "Játékos törölve!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
