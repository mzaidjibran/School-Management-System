import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // admin ka reference hai (kis ne banaya) — teacher ka apna login nahi
    },
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    cnic: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    joiningDate: { type: Date, required: true },
    qualification: { type: String },
    specialization: { type: String },
    university: { type: String },
    passingYear: { type: String },
    experience: { type: String },
    subject: { type: String },
    assignedClasses: [{
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        subject: { type: String }
    }],
    salary: { type: Number, default: 0 },
    employmentStatus: { type: String, enum: ['Permanent', 'Contract', 'Probation', 'Part-time'] },
    status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
    address: { type: String },
    city: { type: String },
    notes: { type: String },
    emergencyContact: {
        name: { type: String },
        phone: { type: String }
    },
    profileImage: { type: String },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null,
    },
    schoolSection: {
        type: String,
        enum: ['girls', 'boys'],
        default: null,
    },
}, { timestamps: true });

teacherSchema.index({ employeeId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Teacher', teacherSchema);