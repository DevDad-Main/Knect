import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./db/mongooseDB.js";

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});

connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    }),
  )
  .catch((err) => {
    console.log(`MongoDB Connection Error`, err);
  });
