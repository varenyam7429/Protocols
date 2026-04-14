import Student from "../Models/StudentModel.js";
let SaveStudent = async(req,res) =>{
let result = await Student.create(req.body);
res.send({Sucess:true,result})
}
let GetStudent = async(req,res) =>{
    let result = await Student.find();
    res.send({Sucess:true,result})
}
let GetStudentById = async(req,res) =>{
    let id = req.params.id
    let result = await Student.find({_id : id})
    res.send({Sucess:true,result: result[0]})
}
let UpdateStudent = async(req,res) =>{
    let id = req.params.id
    let result = await Student.updateMany({_id:id},(req.body));
    res.send({Sucess:true,result})
}
let DeleteStudent = async(req,res) =>{
    let id = req.params.id
    let result = await Student.deleteMany({_id:id})
    res.send({Sucess:true,result})
}
export {SaveStudent,GetStudent,GetStudentById,UpdateStudent,DeleteStudent}