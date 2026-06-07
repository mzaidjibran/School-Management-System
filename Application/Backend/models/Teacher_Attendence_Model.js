import mongoose from 'mongoose';

const teacherAttendanceSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
        required: true
    },
    checkIn: {
        type: String
    },
    checkOut: {
        type: String
    },
    remarks: {
        type: String
    },
}, {
    timestamps: true
});

// Ek teacher ka ek din mein sirf ek record
teacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export default mongoose.model('TeacherAttendance', teacherAttendanceSchema);