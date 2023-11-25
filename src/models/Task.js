const mongoose = require('mongoose');


const taskSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    tag: {
        type: String,
        required: true,
        enum: ["Dev", "QA", "Administrator", "UX/UI"]
    },
    status: {
        type: Boolean,
        default: false,
    },
    deadline: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    comments: {
        type: Array,
        trim: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High"],
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    completed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;