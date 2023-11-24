const mongoose = require('mongoose');
const debug = require('debug')('UpTask:prjCtrl');
const Project = require('../models/Project.js');
const Task = require('../models/Task.js');
const User = require('../models/User.js');

exports.getProjects = async (req, res) => {
    const projects = await Project.find({
        '$or': [
            { 'collaborators': { $in: req.user } },
            { 'creator': { $in: req.user } }
        ]
    });

    res.json(projects);
}

exports.createProject = async (req, res) => {
    const project = new Project(req.body);
    project.creator = req.user._id;

    try {
        const projectSaved = await project.save();
        res.json(projectSaved);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.getProject = async (req, res) => {
    const { id } = req.params;

    try {
        const idValid = mongoose.Types.ObjectId.isValid(id);

        if (!idValid)
            return res.status(400).json({ msg: 'Invalid project id' });

        const project = await Project.findById(id)
            .populate({ path: 'tasks', populate: { path: 'completed', select: "name" } })
            .populate({path:"templates"})
            .populate('collaborators', "name email");

        if (!project) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() !== req.user._id.toString()
            && !project.collaborators.some(collaborator =>
                collaborator._id.toString() === req.user._id.toString()
            )) {
            const error = new Error('Unauthorized project');
            return res.status(404).json({ msg: error.message });
        }

        // Get the tasks of the project
        return res.json(project);
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
}

exports.updateProject = async (req, res) => {
    const { id } = req.params;

    try {
        const idValid = mongoose.Types.ObjectId.isValid(id);

        if (!idValid)
            return res.status(400).json({ msg: 'Invalid project id' });

        const project = await Project.findById(id);

        if (!project) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized project');
            return res.status(404).json({ msg: error.message });
        }

        // Overwriting the project with the new data if exist
        project.name = req.body.name || project.name;
        project.description = req.body.description || project.description;
        project.deadline = req.body.deadline || project.deadline;
        project.client = req.body.client || project.client;
        project.state = req.body.state || project.state;

        const updatedProject = await project.save();
        return res.json(updatedProject);

    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
}

exports.deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const idValid = mongoose.Types.ObjectId.isValid(id);

        if (!idValid)
            return res.status(400).json({ msg: 'Invalid project id' });

        const project = await Project.findById(id);

        if (!project) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized project');
            return res.status(401).json({ msg: error.message });
        }

        console.log(project);

        await Task.deleteMany({ _id: project.tasks }); // Delete all the tasks related to the project
        await project.deleteOne(); // Delete the project

        return res.json({ msg: "Project deleted" });

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.searchCollaborator = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("-confirmed -createdAt -password -token -updatedAt -__v");

    if (!user) {
        const error = new Error('User not found');
        return res.status(404).json({ msg: error.message });
    }

    return res.json(user);

}

exports.addCollaborator = async (req, res) => {
    try {
        const idValid = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!idValid)
            return res.status(400).json({ msg: 'Invalid project id' });

        const project = await Project.findById(req.params.id);

        if (!project) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized action');
            return res.status(401).json({ msg: error.message });
        }

        const { email } = req.body;

        const user = await User.findOne({ email }).select("-confirmed -createdAt -password -token -updatedAt -__v");

        if (!user) {
            const error = new Error('User not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() === user._id.toString()) {
            const error = new Error('Action not available, you are the admin of this project');
            return res.status(401).json({ msg: error.message });
        }

        if (project.collaborators.includes(user._id)) {
            const error = new Error('This user is already in this project');
            return res.status(401).json({ msg: error.message });
        }

        project.collaborators.push(user._id);
        await project.save();
        return res.json({ msg: "The collaborator has been added successfully" })

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.deleteCollaborator = async (req, res) => {
    try {
        const idValid = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!idValid)
            return res.status(400).json({ msg: 'Invalid project id' });

        const project = await Project.findById(req.params.id);

        if (!project) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized action');
            return res.status(401).json({ msg: error.message });
        }

        const { id } = req.body;

        const user = await User.findOne({ id }).select("-confirmed -createdAt -password -token -updatedAt -__v");

        if (!user) {
            const error = new Error('User not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() === user._id.toString()) {
            const error = new Error('Action not available, you are the admin of this project');
            return res.status(401).json({ msg: error.message });
        }

        project.collaborators.pull(req.body.id);
        await project.save();
        return res.json({ msg: "The collaborator has been removed successfully" })

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const idValid = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!idValid)
            return res.status(400).json({ msg: 'Invalid project id' });

        const project = await Project.findById(req.params.id);

        if (!project) {
            const error = new Error('Project not found');
            return res.status(404).json({ msg: error.message });
        }

        if (project.creator.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized action');
            return res.status(401).json({ msg: error.message });
        }

        project.state = !project.state;

        await project.save();

        const savedProject = await Project.findById(req.params.id)
            .populate({ path: 'tasks', populate: { path: 'completed', select: "name" } })
            .populate('collaborators', "name email");

        return res.json(savedProject);

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

