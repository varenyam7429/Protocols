import { SaveStudent,GetStudent,GetStudentById,UpdateStudent,DeleteStudent } from "../Controllers/StudentController.js";
import express from 'express';
const routes = express.Router()
routes.post("/",SaveStudent)
routes.get("/",GetStudent)
routes.get("/:id",GetStudentById)
routes.put("/:id",UpdateStudent)
routes.delete("/:id",DeleteStudent)
export default routes 