const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const path = require("path");

/* =======================
   IMAGE UPLOAD (MULTER)
======================= */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const upload = multer({ storage }).single("image");

/* =======================
   ADD USER
======================= */
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : ""
        });

        await user.save(); // ✅ no callback

        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding user");
    }
});

/* =======================
   HOME PAGE (FETCH USERS)
======================= */
router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // ✅ async/await

        res.render('index', {
            title: 'Home Page',
            users: users,
            message: req.session.message
        });

        req.session.message = null; // clear message
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching users");
    }
});

/* =======================
   ADD USER PAGE
======================= */
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add User" });
});

module.exports = router;

