const debug = require('debug')('uptask:taskCtrl')
const mongoose = require('mongoose');
const Project = require('../models/Project.js');
const Template = require('../models/Template.js');

exports.addTemplate = async (req, res) => {
    const { project } = req.body;

    try {
        const projectExists = await Project.findById(project);

        if (!projectExists) {
            const error = new Error("The project does not exit");
            return res.status(404).json({ msg: error.message });
        }

        if (projectExists.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to add templates to this project");
            return res.status(401).json({ msg: error.message });
        }

        const template = await Template.create(req.body);

        projectExists.templates.push(template._id);
        await projectExists.save();

        return res.json(template);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.getTemplate = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const template = await Template.findById(id).populate('project');

        if (!template) {
            const error = new Error("Template not found");
            return res.status(404).json({ msg: error.message });
        }

        if (template.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to view this template");
            return res.status(401).json({ msg: error.message });
        }

        res.json(template);

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.updateTemplate = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const template = await Template.findById(id).populate('project');

        if (!template) {
            const error = new Error("Template not found");
            return res.status(404).json({ msg: error.message });
        }

        if (template.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to view this template");
            return res.status(401).json({ msg: error.message });
        }

        template.name = req.body.name || template.name;
        template.description = req.body.description || template.description;
        template.priority = req.body.priority || template.priority;
        template.deadline = req.body.deadline || template.deadline;

        const updatedTemplate = await template.save();
        res.json(updatedTemplate);

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}

exports.deleteTemplate = async (req, res) => {
    const { id } = req.params;

    const idValid = mongoose.Types.ObjectId.isValid(id);

    if (!idValid)
        return res.status(400).json({ msg: 'Invalid project id' });

    try {
        const template = await Template.findById(id).populate('project');

        if (!template) {
            const error = new Error("Template not found");
            return res.status(404).json({ msg: error.message });
        }

        if (template.project.creator.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized to view this template");
            return res.status(401).json({ msg: error.message });
        }

        await Promise.allSettled([await template.deleteOne(), await Project.updateOne({ _id: template.project }, { $pull: { templates: template._id } })]);

        return res.json({ msg: 'template deleted successfully' });

    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
}