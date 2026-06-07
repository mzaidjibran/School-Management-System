import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        unique: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    dateOfBirth: {
        type: Date
    },
    joiningDate: {
        type: Date,
        required: true
    },
    qualification: {
        type: String
    },
    specialization: [{
        type: String
    }], // subjects
    assignedClasses: [{

        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        subject: { type: String }
    }],
    salary: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    },
    address: {
        type: String
    },
    profileImage: {
        type: String
    },
}, {
    timestamps: true

});

export default mongoose.model('Teacher', teacherSchema);