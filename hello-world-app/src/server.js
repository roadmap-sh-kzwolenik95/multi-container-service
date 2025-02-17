const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 80;
const mongoUrl = process.env.MONGO_URL;

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Todo = new mongoose.model("Todo", todoSchema);

mongoose
  .connect(`${mongoUrl}todos`, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  });

app.use(express.json());

app.get("/todos", (req, res) => {
  Todo.find()
    .then((doc) => {
      console.log("Listed:", doc);
      res.status(200).json(doc);
    })
    .catch((err) => {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to list todos" });
    });
});

app.post("/todos", (req, res) => {
  const postData = req.body;
  console.log("Received POST data:", postData);

  Todo.create(postData)
    .then((doc) => {
      console.log("Created:", doc);
      res.status(201).json(doc);
    })
    .catch((err) => {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to create todo" });
    });
});

app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  Todo.findById(id)
    .then((doc) => {
      if (!doc) {
        res.status(404).json({ error: "Todo not found" });
      } else {
        console.log("Todo:", doc);
        res.status(200).json(doc);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to get todo" });
    });
});

app.put("/todos/:id", (req, res) => {
  const id = req.params.id;
  const putData = req.body;

  Todo.findByIdAndUpdate(id, putData, {
    new: true,
    runValidators: true,
  })
    .then((doc) => {
      if (!doc) {
        res.status(404).json({ error: "Todo not found" });
      } else {
        console.log("Updated:", doc);
        res.status(200).json(doc);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to update todo" });
    });
});

app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  Todo.findByIdAndDelete(id)
    .then((doc) => {
      if (!doc) {
        res.status(404).json({ error: "Todo not found" });
      } else {
        console.log("Deleted:", doc);
        res.status(204).end();
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      res.status(500).json({ error: "Failed to delete todo" });
    });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on ${port}`);
});
