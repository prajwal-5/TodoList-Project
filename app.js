//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prajwal:Test123@cluster0.aebet.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true })

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema); 

const item1 = new Item({
  name: "Welcome to todo list"
});

const item2 = new Item({
  name: "Hit + to add a new task"
});

const item3 = new Item({
  name: "<-- hit this to delete"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) =>{
        if(err){console.log(err);}
        else{console.log("items inserted successfully");}
        res.redirect("/");
      });
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems}); 
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listaName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listaName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listaName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listaName);
    });
  }
});

app.get("/:para", function(req,res){
  const listName = _.capitalize(req.params.para);

  List.findOne({name: listName}, (err, foundList)=>{
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      }else{
        //show existing
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", (req, res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, (err)=>{
      if(err){console.log(err);}
      else{
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList)=>{
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

let port = process.env.PORT;
if(port == NULL || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on successfully");
});
