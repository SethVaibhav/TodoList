const express = require("express");
const bodyParser=require("body-parser");
const app = express();
const path=require("path");
const _=require("lodash");

const mongoose=require("mongoose");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // ejs need
app.use('/',express.static(path.join(__dirname,'public')));

// connecting to mongodb atlas online server
mongoose.connect("mongodb+srv://admin-vs:Test0904@cluster0.ajch5.mongodb.net/TodoList",{ useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false});

// connectiong to mongodb in local host-----------mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema=mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({name:"Buy food"});
const item2=new Item({name:"Cook food"});
const item3=new Item({name:"Eat food"});
const defaultitems=[item1,item2,item3];

/*
Item.insertMany(itemarr,function(err){
if(err) console.log(err);
else console.log("success");
});
*/



app.get('/', (req, res) => {
  Item.find({},function(err,defaultitemss){
  // to avoid duplicate element to get stored in db  
  if(defaultitemss.length===0){
    Item.insertMany(defaultitems,function(err){
      if(err) console.log(err);
      
      });
      res.redirect("/");
  }
  else res.render("list", {listTitle: "Today",Newitems:defaultitemss}); // passing documents of mongodb to ejs or website
  });
   

});

const listSchema={
name:String,
items:[itemSchema],
};
const List=mongoose.model("List",listSchema);

app.get("/:customlistName",function(req,res){
  const customlistName=_.capitalize(req.params.customlistName);

List.findOne({name:customlistName},function(err,foundList){

  if(!err){
   if(foundList==null){
    const list=new List({
      name:customlistName,
      items:defaultitems,
    });
    list.save();
    res.redirect("/"+ customlistName);
   }
   else {
    res.render("list", {listTitle:foundList.name,Newitems:foundList.items});
    
    
   }
 }
  });
 

});

// we use if statement here because inside ejs the form post="/" so it calls app.post("/") and item get stored in items of / and print in / form
app.post("/",function(req,res){
 // in the post req we save the data in database and then we redirect the home page to show its result 
const itemName=req.body.NewItem;
const listName=req.body.list;    // for getting the name of list from app.js to add elements in customlist todolist
const item4=new Item({
  name:itemName,
});

if(listName=="Today"){
item4.save();
res.redirect("/");
}

else {
// for adding elemnts in customlist route and then redirect it

List.findOne({name:listName},function(err,foundList){
foundList.items.push(item4);
foundList.save();   // update the items array in List model
res.redirect("/"+listName);  
});
}
});

app.post("/delete",function(req,res){
const checkbox=req.body.checkbox;
const listName=req.body.ListName;

if(listName==="Today"){
Item.findByIdAndRemove(checkbox,function(err){  
  if(err) console.log(err);                        // it will get the id of checkbox elementa nd then remove it from data base.
  else console.log("success");
});
res.redirect("/");
}
// for delete items in custom list
else{
List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkbox}}},function(err,foundList){
if(!err) res.redirect("/"+listName);
});
}
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);