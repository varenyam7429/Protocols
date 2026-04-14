import routes from "./StudentRoutes.js";
import express from 'express'
const AllRoutes = express.Router()

AllRoutes.use("/api/v1/student",routes);
export default AllRoutes