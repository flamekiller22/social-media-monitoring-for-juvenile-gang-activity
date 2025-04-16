const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const postRoutes = require("./routes/postRoutes");

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://tester:Q5XddX0TEfNV3RHF@cluster0.zh91a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api", postRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
