const pool = require("../db");

exports.bulkUpdatePoints = async (req, res) => {
  const updates = req.body; // [{id, pointCount}, ...]
  if (!Array.isArray(updates)) {
    return res
      .status(400)
      .json({ error: "A kérésnek tömböt kell tartalmaznia." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const results = [];
    for (const { id, pointCount } of updates) {
      const result = await client.query(
        "UPDATE points SET amount = amount + $1, all_points = all_points + $1 WHERE id = $2 RETURNING *",
        [pointCount, id],
      );
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

exports.getPointsById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT amount FROM points WHERE id = $1", [
      id,
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPointsById = async (req, res) => {
  const { id } = req.params;
  const { pointCount } = req.body;

  try {
    const result = await pool.query(
      "UPDATE points SET amount= amount + $1, all_points = all_points + $2 where id=$3 RETURNING *",
      [pointCount, pointCount, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetAllPoints = async (req, res) => {
  try {
    await pool.query("UPDATE points SET amount = 0");
    res.json({ message: "Minden játékos pontja lenullázva." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
