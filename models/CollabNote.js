const mongoose = require('mongoose');
const { Schema } = mongoose;

const CollabNoteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, default: "" },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    invites: [{ type: String }], // invited emails
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('collabnote', CollabNoteSchema);
