import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/PBHS";

const teacherSchema = new mongoose.Schema({
  name: String,
  employeeId: String,
  experience: String,
  email: String
}, { strict: false });

const Teacher = mongoose.model("Teacher", teacherSchema);

async function main() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB:", mongoUri);
  const teachers = await Teacher.find({});
  console.log("Total Teachers:", teachers.length);
  teachers.forEach(t => {
    console.log(`ID: ${t.employeeId}, Name: ${t.name}, Experience: ${t.experience}, Raw:`, t.toObject());
  });
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
