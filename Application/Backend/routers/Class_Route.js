import express from "express";
import {
  createClass,
  getAllClasses,
  getSingleClass,
  updateClass,
  deleteClass,
} from "../controllers/Class_Controller.js";

const router = express.Router();

// Class routes
// NOTE: Authentication abhi temporarily hata di hai (login flow abhi
// implement nahi hua). Jab wapis apply karni ho to upar
// `import { protect, authorize } from "../middleware/Auth_Middleware.js";`
// dobara add kar dena aur har route mein protect/authorize wapis lagana,
// jaise pehle tha.

router.post("/", createClass);            // POST   /api/classes
router.get("/", getAllClasses);           // GET    /api/classes
router.get("/:id", getSingleClass);       // GET    /api/classes/:id
router.put("/:id", updateClass);          // PUT    /api/classes/:id
router.delete("/:id", deleteClass);       // DELETE /api/classes/:id

export default router;