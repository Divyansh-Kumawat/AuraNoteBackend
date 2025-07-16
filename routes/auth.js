const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = process.env.JWT_SECRET || "deekayisarapper";
//ROUTE 1
// Create a user using: POST "/api/auth/createuser"
router.post(
    '/createuser',
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    ],
    async (req, res) => {
        let success=false;
        //if there are errors, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        try {
            //check whether the user with this email exists already
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ error: "User with this email already exists" });
            }

            //generating salt(make it await because it returns the promise)
            const salt = await bcrypt.genSalt(10);
            //hashing the password and add the salt(await because it returns the promise)
            const secPass = await bcrypt.hash(req.body.password, salt);
            //create a new user
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email,
            });
            //instead of sending the direct user we first concatenate it with jwt token string and then send the user
            const data = { user: { id: user.id } };
            const authtoken = jwt.sign(data, JWT_SECRET);
            success=true;
            res.json({success, authtoken });

        }
        //catch errors
        catch (error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        }
    }
);

//ROUTE 2
// Authenticate a User using: POST "/api/auth/login"
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success=false;
    //if there are errors, return bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        //for finding the user
        let user = await User.findOne({ email });

        //if user not found
        if (!user) {
            console.log("User not found:", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        console.log("User found:", user);

        const passwordCompare = await bcrypt.compare(password, user.password);
        console.log("Password comparison result:", passwordCompare);

        if (!passwordCompare) {
            success=false;
            return res.status(400).json({success, error: "Invalid credentials" });
        }

        const data = { user: { id: user.id } };
        success=true;
        const authtoken = jwt.sign(data, JWT_SECRET);

        res.json({ success,authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


//ROUTE 3
//Get loggedin user details using: POST "/api/auth/getuser". Login required
//fetching details through auth token
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        userId = req.user.id;
        //fetching all details of the user expect password
        const user = await User.findById(userId).select("-password")
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;
