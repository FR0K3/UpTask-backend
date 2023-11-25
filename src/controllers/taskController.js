const debug = require('debug')('uptask:taskCtrl')
const mongoose = require('mongoose');
const Project = require('../models/Project.js');
const Task = require('../models/Task.js');

exports.addTask = async (req, res) => {
    const { project } = req.body;

    try {
        const projectExists = await Project.findById(project);

        if (!projectExists) {
            const error = new Error("The project does not exit");
            return res.status(404).json({ msg: error.message });
        }

        if (projectExists.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to add tasks to this project");
            return res.status(401).json({ msg: error.message });
        }

        const task = await Task.create(req.body);

        projectExists.tasks.push(task._id);
        await projectExists.save();

        return res.json(task);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.getTask = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const task = await Task.findById(id).populate('project');

        if (!task) {
            const error = new Error("Task not found");
            return res.status(404).json({ msg: error.message });
        }

        if (task.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to view this task");
            return res.status(401).json({ msg: error.message });
        }

        res.json(task);

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.updateTask = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const task = await Task.findById(id).populate('project');

        if (!task) {
            const error = new Error("Task not found");
            return res.status(404).json({ msg: error.message });
        }

        if (task.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to view this task");
            return res.status(401).json({ msg: error.message });
        }

        task.name = req.body.name || task.name;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.deadline = req.body.deadline || task.deadline;
        task.tag = req.body.tag || task.tag;
        task.comments = req.body.comments || task.comments;

        const updatedTask = await task.save();
        res.json(updatedTask);

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const task = await Task.findById(id).populate('project');

        if (!task) {
            const error = new Error("Task not found");
            return res.status(404).json({ msg: error.message });
        }

        if (task.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to view this task");
            return res.status(401).json({ msg: error.message });
        }

        await Promise.allSettled([await task.deleteOne(), await Project.updateOne({ _id: task.project }, { $pull: { tasks: task._id } })]);

        return res.json({ msg: 'Task deleted successfully' });

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.changeStatus = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const task = await Task.findById(id).populate('project');

        if (!task) {
            const error = new Error("Task not found");
            return res.status(404).json({ msg: error.message });
        }

        if (task.project.creator.toString() !== req.user._id.toString() &&
            !task.project.collaborators.some(collaborator =>
                collaborator._id.toString() === req.user._id.toString()
            )
        ) {
            const error = new Error("Unauthorized to view this task");
            return res.status(401).json({ msg: error.message });
        }

        task.status = !task.status;
        task.completed = req.user._id;

        await task.save();

        const savedTask = await Task.findById(id).populate("project").populate("completed");

        return res.json(savedTask);

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}