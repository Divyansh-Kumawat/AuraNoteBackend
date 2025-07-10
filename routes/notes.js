const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
//52
// ROUTE 1: Get all the notes: GET "api/notes/fetchallnotes"
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    } 
});
//52
// ROUTE 2: Add a new note using POST: POST "api/notes/addnote"
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // If there are validation errors, return 400 Bad Request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        }); 

        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// ROUTE 3: Update a existing note: PUT "api/notes/update/id". Login required
router.put('/update/:id', fetchuser, async (req, res) => {
  
        const { title, description, tag } = req.body;

        // If there are validation errors, return 400 Bad Request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newNote={};
        if(title){newNote.title= title};
        if(description){newNote.description=description};
        if(tag){newNote.tag=tag};

        //Find the note to be updated and update it 
        let note=await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}

        if(note.user.toString()!== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({note});
});


// ROUTE 4: deleting a existing note: DELETE "api/notes/delete". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  
        const { title, description, tag } = req.body;

        // find the  note to be delete and delete it
        try{
            let note=await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}

        //allow deletion only if user owns this note
        if(note.user.toString()!== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success": "Note has been deleted",note:note});

        }catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
       

        
});

module.exports = router;
