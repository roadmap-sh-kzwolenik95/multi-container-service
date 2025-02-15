const express = require("express");

const app = express();
const port = 80;

const auth = basicAuth({
  users: {
    [process.env.USERNAME]: process.env.PASSWORD,
  },
  challenge: true,
});

app.get("/todos", (req, res) => {
  res.send("Todos!");
});

app.post("/todos", (req, res) => {
  const postData = req.body;
  console.log("Received POST data:", postData);
  res.send("Data received successfully");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on ${port}`);
});
