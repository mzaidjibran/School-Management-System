import mongoose from 'mongoose';

const teacherLeaveSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['sick', 'casual', 'emergency', 'unpaid'],
        required: true
    },
    fromDate: {
        type: Date,
        required: true

    },
    toDate: {
        type: Date,
        required: true

    },
    totalDays: {
        type: Number

    },
    reason: {
        type: String,
        required: true

    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    remarks: {
        type: String

    },
}, {
    timestamps: true

});

export default mongoose.model('TeacherLeave', teacherLeaveSchema);