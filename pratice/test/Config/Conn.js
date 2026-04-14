import mongoose from "mongoose";
mongoose
.connect("mongodb+srv://varenyamsharma814_db_user:Bf2bWrlp9usIuxyg@cluster0.6kpmfz3.mongodb.net/?appName=Cluster0")
.then(()=>{
    console.log("CONNECTED");
})
.catch(err=>{
    console.log("NOT CONNECTED",err);
})
export default mongoose