const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const CollabNote = require('../models/CollabNote');
const User = require('../models/User');

// Create a new collab note and invite a collaborator
router.post('/create', fetchuser, async (req, res) => {
    const { title, email } = req.body;
    try {
        const collaborator = await User.findOne({ email });
        if (!collaborator) {
            return res.status(404).json({ error: "User does not exist" });
        }
        const note = new CollabNote({
            title,
            collaborators: [req.user.id, collaborator._id],
            invites: [],
            createdBy: req.user.id
        });
        await note.save();
        // You can send a notification/invite here (for demo, just return success)
        res.json({ success: true, note });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get collab notes for the logged-in user
router.get('/mynotes', fetchuser, async (req, res) => {
    try {
        const notes = await CollabNote.find({ collaborators: req.user.id });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Edit collab note (title, content, tag)
router.put('/edit/:id', fetchuser, async (req, res) => {
    const { title, content, tag } = req.body;
    try {
        let note = await CollabNote.findById(req.params.id);
        if (!note) return res.status(404).json({ error: "Note not found" });
        if (!note.collaborators.includes(req.user.id)) return res.status(401).json({ error: "Not allowed" });

        if (title) note.title = title;
        if (content) note.content = content;
        if (tag) note.tag = tag;
        await note.save();
        res.json({ success: true, note });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete collab note
router.delete('/delete/:id', fetchuser, async (req, res) => {
    try {
        let note = await CollabNote.findById(req.params.id);
        if (!note) return res.status(404).json({ error: "Note not found" });
        if (!note.collaborators.includes(req.user.id)) return res.status(401).json({ error: "Not allowed" });

        await CollabNote.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Real-time update endpoint is handled by websockets

module.exports = router;
