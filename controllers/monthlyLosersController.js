const pool = require("../db");

// GET all monthly losers
exports.getMonthlyLosers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM monthly_losers");
    const losers = result.rows;

    for (const loser of losers) {
      if (loser.players && Array.isArray(loser.players)) {
        loser.players = await Promise.all(
          loser.players.map(async (p) => {
            const playerRes = await pool.query(
              "SELECT name FROM players WHERE id = $1",
              [p.player_id]
            );
            return {
              ...p,
              name: playerRes.rows[0] ? playerRes.rows[0].name : null,
            };
          })
        );
      }
    }

    res.json(losers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET one monthly loser by id
exports.getMonthlyLoserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM monthly_losers WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Nem található ilyen monthly_loser." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE monthly loser
exports.addMonthlyLoser = async (req, res) => {
  const { month, year, description, players } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO monthly_losers ( month, year, description, players) VALUES ($1, $2, $3, $4::jsonb) RETURNING *",
      [month, year, description, JSON.stringify(players)],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE monthly loser
exports.updateMonthlyLoser = async (req, res) => {
  const { id } = req.params;
  const { players, month, year, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE monthly_losers SET players=$1, month=$2, year=$3, description=$4 WHERE id=$5 RETURNING *",
      [JSON.stringify(players), month, year, description, id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Nem található ilyen monthly_loser." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE monthly loser
exports.deleteMonthlyLoser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM monthly_losers WHERE id=$1", [id]);
    res.json({ message: "Monthly loser törölve!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
