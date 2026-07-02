import express from "express";
import { protect } from "../middleware/Auth_Middleware.js";
import { getAllBranches, createBranch, deleteBranch } from "../controllers/Branch_Controller.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getAllBranches)
  .post(createBranch);

router.route("/:id")
  .delete(deleteBranch);

export default router;
