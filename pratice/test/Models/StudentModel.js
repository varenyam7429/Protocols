import mongoose from "../Config/Conn.js";
let StudentSchema = mongoose.Schema({
    name:String,
    age:Number,
    city:String
},{timestamps:true});
let Student = mongoose.model("Student",StudentSchema)
export default Student