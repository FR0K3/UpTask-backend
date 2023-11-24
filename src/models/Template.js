const mongoose = require('mongoose');


const taskSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    taskName: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    priority: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High"],
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    }
}, {
    timestamps: true,
});

const Task = mongoose.model('Template', taskSchema);
module.exports = Task;