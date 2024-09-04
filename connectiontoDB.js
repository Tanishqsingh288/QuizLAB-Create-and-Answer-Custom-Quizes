const mongoose=require('mongoose');

const connectiontoDB=()=>{

    mongoose.connect("mongodb://127.0.0.1:27017/CBT").then(()=>{
        console.log("connected to DB");
    }).catch((err)=>{
    });
}

module.exports=connectiontoDB;