const pool = require("../db");

exports.bulkUpdatePenalties = async (req, res) => {
  const updates = req.body; // [{id, paid}, ...]
  if (!Array.isArray(updates)) {
    return res
      .status(400)
      .json({ error: "A kérésnek tömböt kell tartalmaznia." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const results = [];
    for (const { id, paid } of updates) {
      // Konvertáljuk az id-t integerre
      const penaltyId = parseInt(id, 10);

      let result;
      if (paid === true || paid === "true") {
        result = await client.query(
          `UPDATE penalties SET paid=TRUE, paid_at=NOW() WHERE id=$1 RETURNING *`,
          [penaltyId],
        );
      } else if (paid === false || paid === "false") {
        result = await client.query(
          `UPDATE penalties SET paid=FALSE, paid_at=NULL WHERE id=$1 RETURNING *`,
          [penaltyId],
        );
      } else {
        throw new Error(`Hibás paid érték: ${paid}`);
      }

      if (!result.rows[0]) {
        throw new Error(`Nincs ilyen büntetés id-val: ${penaltyId}`);
      }
      results.push(result.rows[0]);
    }
    await client.query("COMMIT");
    res.json(results);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.getPenalties = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT penalties.id, players.name, penalties.description, penalties.amount, penalties.paid, penalties.paid_at FROM penalties LEFT JOIN players ON penalties.player_id = players.id",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPenaltyById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT penalties.*, players.name as name
       FROM penalties
       LEFT JOIN players ON penalties.player_id = players.id
       WHERE penalties.id = $1`,
      [id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPenalty = async (req, res) => {
  const { player_name, description, amount } = req.body;

  try {
    const playerResult = await pool.query(
      "SELECT id FROM players WHERE name = $1",
      [player_name],
    );

    const result = await pool.query(
      "INSERT INTO penalties (player_id, description, amount, paid, paid_at) VALUES ($1,$2,$3,FALSE,NULL) RETURNING *",
      [playerResult.rows[0].id, description, amount],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePenalty = async (req, res) => {
  const { id } = req.params;
  const { name, description, amount } = req.body;

  try {
    let playerId = null;
    if (name) {
      const playerResult = await pool.query(
        "SELECT id FROM players WHERE name = $1",
        [name],
      );
      if (!playerResult.rows[0]) {
        return res
          .status(400)
          .json({ error: "Nincs ilyen játékos névvel: " + name });
      }
      playerId = playerResult.rows[0].id;
    }

    const fields = [];
    const values = [];
    let idx = 1;
    if (playerId !== null) {
      fields.push(`player_id = $${idx++}`);
      values.push(playerId);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (amount !== undefined) {
      fields.push(`amount = $${idx++}`);
      values.push(amount);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nincs frissítendő mező." });
    }

    values.push(id);
    const query = `UPDATE penalties SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePaidPenalty = async (req, res) => {
  const { id } = req.params;
  const { paid } = req.body;

  try {
    let result;
    if (paid === true || paid === "true") {
      result = await pool.query(
        `UPDATE penalties 
         SET paid=$1, paid_at=NOW()
         WHERE id=$2
         RETURNING *`,
        [paid, id],
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePenalty = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM penalties WHERE id=$1", [id]);

    res.json({ message: "Büntetés törölve!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
