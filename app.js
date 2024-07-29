const express = require("express");
const bodyParser = require("body-parser");
const date=require(__dirname+'/Date.js');
const _ = require("lodash")
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
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




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}




async function run(collection_list) {
  try {
    await client.connect();

    const items_db = client.db('toDoList').collection(collection_list);

    let items = await items_db.find().toArray();

    if (items.length === 0) {
      await items_db.insertMany(default_items);
      items= default_items;
    }
    
    return items;

  } finally {
    await client.close();
  }
}
// async function 



async function insertItem(item,collection_list) {
  try {
    await client.connect();

    const items_db = client.db('toDoList').collection(collection_list);

      await items_db.insertOne({name:item});

  } finally {
    await client.close();
  }
}

async function deleteItem(item_id,collection_list) {
  try {
    await client.connect();

    const items_db = client.db('toDoList').collection(collection_list);
      await items_db.deleteOne({_id: new ObjectId(item_id)});

  } finally {
    await client.close();
  }
}

app.get("/", async (req, res) => {
  //await run().catch(console.dir);
  const items= await run("Today").catch(console.dir);
  res.render("list", { list: "Today", ListItems: items});
});


app.get("/:customName", async(req,res)=>{
  const list=_.capitalize(req.params.customName);
  const items= await run(list).catch(console.dir);
  res.render("list", { list:list , ListItems: items});
})




app.post("/",async (req,res)=>{
  const list=req.body.list;
  const item=req.body.newItem;
  if(list=='Today'){
    await insertItem(item,"Today");
    res.redirect('/');
  }else{
    console.log(list);
    await insertItem(item,list);
    res.redirect('/'+list);
  }  
});


app.post("/delete", async (req,res)=>{
  console.log(req.body.delete_item);
  
  await deleteItem(req.body.delete_item,req.body.list);
  if(req.body.list=="Today"){
  res.redirect('/');
   }else{
     res.redirect('/'+req.body.list); 
   }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
