const pool = require("../db");

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
      "UPDATE points SET amount= amount + $1 where id=$2 RETURNING *",
      [pointCount, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
