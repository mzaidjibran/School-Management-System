import mongoose from 'mongoose';

const teacherSalarySchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    month: {
        type: Number,
        required: true

    }, // 1-12
    year: {
        type: Number,
        required: true

    },
    basicSalary: {
        type: Number,
        required: true

    },
    allowances: {
        type: Number,
        default: 0

    },
    deductions: {
        type: Number,
        default: 0

    },
    netSalary: {
        type: Number

    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'

    },
    paidDate: {
        type: Date

    },
    remarks: {
        type: String

    },
}, {
    timestamps: true

});

teacherSalarySchema.index({ teacherId: 1, month: 1, year: 1 }, { unique: true });

// Net salary auto calculate
teacherSalarySchema.pre('save', function (next) {
    this.netSalary = this.basicSalary + this.allowances - this.deductions;
    next();
});

export default mongoose.model('TeacherSalary', teacherSalarySchema);