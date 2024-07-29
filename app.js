const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + '/Date.js');
const _ = require("lodash");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://ahmadalik883:OAdgPVELU0OjIlmm@cluster0.z9igter.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Default items to be inserted
const item1 = { name: "Welcome to your todolist!" };
const item2 = { name: "Hit the + button to add a new item." };
const item3 = { name: "<-- Hit this to delete an item" };
const default_items = [item1, item2, item3];

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

async function getItems(collection_list) {
  const items_db = client.db('toDoList').collection(collection_list);
  let items = await items_db.find().toArray();

  if (items.length === 0) {
    await items_db.insertMany(default_items);
    items = default_items;
  }

  return items;
}

async function insertItem(item, collection_list) {
  const items_db = client.db('toDoList').collection(collection_list);
  await items_db.insertOne({ name: item });
}

async function deleteItem(item_id, collection_list) {
  const items_db = client.db('toDoList').collection(collection_list);
  await items_db.deleteOne({ _id: new ObjectId(item_id) });
}

app.get("/", async (req, res) => {
  const items = await getItems("Today");
  res.render("list", { list: "Today", ListItems: items });
});

app.get("/:customName", async (req, res) => {
  const list = _.capitalize(req.params.customName);
  const items = await getItems(list);
  res.render("list", { list: list, ListItems: items });
});

app.post("/", async (req, res) => {
  const list = req.body.list;
  const item = req.body.newItem;
  await insertItem(item, list);
  res.redirect(list === "Today" ? '/' : '/' + list);
});

app.post("/delete", async (req, res) => {
  await deleteItem(req.body.delete_item, req.body.list);
  res.redirect(req.body.list === "Today" ? '/' : '/' + req.body.list);
});

app.listen(process.env.PORT || 3000, async () => {
  await connectToMongoDB();
  console.log("Server is listening on port 3000");
});
