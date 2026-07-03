import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/PBHS";

const teacherSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    employeeId: String,
    name: String,
    email: String,
    phone: String,
    joiningDate: Date,
    experience: String
}, { strict: false });

const Teacher = mongoose.model("TeacherTest", teacherSchema, "teachers");

async function main() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const testEmail = `test_${Date.now()}@teacher.com`;
  const t = await Teacher.create({
    userId: new mongoose.Types.ObjectId(),
    employeeId: `TEST_${Date.now()}`,
    name: "Test Teacher",
    email: testEmail,
    phone: "123456",
    joiningDate: new Date(),
    experience: "5"
  });

  console.log("Created Teacher with Experience:", t.experience, t.toObject());
  
  // Clean up
  await Teacher.deleteOne({ _id: t._id });
  console.log("Cleaned up test teacher");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
