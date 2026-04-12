const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const playersRoutes = require("./routes/players");
const pointsRoutes = require("./routes/points");

app.use("/players", playersRoutes);
app.use("/points", pointsRoutes);

app.get("/", (req, res) => {
  res.send("API működik");
});

app.listen(3000, () => {
  console.log("Server fut a http://localhost:3000 porton");
});
