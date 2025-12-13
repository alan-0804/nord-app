const express = require('express');
const router = express.Router();
const User = require('../models/users'); 
const multer = require('multer');
const path = require("path");

// image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,path.join(__dirname,"..","uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({ storage }).single("image");

// ✅ ADD USER (MODERN MONGOOSE)
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : "", 
        });

        await user.save(); 

        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message, type: 'danger' });
    }
});

router.get("/", (req, res) => {
    User.find().exec((err, users) =>{
        if(err){
            res.json({message: err.message });
        } else {
            res.render('index',{
                title: 'Home Page',
                users: users 
            })
        }
    })
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add User" });
});

module.exports = router;
