const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const path = require("path");
const fs = require("fs");

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
//edit user route
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.redirect('/');
        }

        res.render("edit_users", {
            title: "Edit User",
            user: user
        });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// UPDATE USER ROUTE (MODERN + SAFE)
// update user route
router.post("/update/:id", upload, async (req, res) => {
    try {
        let new_image = req.body.old_image;

        if (req.file) {
            new_image = req.file.filename;

            if (req.body.old_image) {
                fs.unlinkSync(path.join(__dirname, "..", "uploads", req.body.old_image));
            }
        }

        await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        // ✅ SET MESSAGE
        req.session.message = {
            type: "success",
            message: "User updated successfully!",
        };

        // ✅ REDIRECT AFTER SETTING MESSAGE
        res.redirect("/");

    } catch (error) {
        console.error(error);
        res.status(500).send("Update failed");
    }
});

// delete user route
router.get('/delete/:id' ,(req, res) => {
    let id = req.params.id;
    User.findById(id, (err, result) => {
        if(result.image != ''){
            try{
                fs.unlinkSync('./uploads/'+result.image);
            }catch(err){
                console.log(err);
            }
        }
        if(err){
            res.json({ message: err.message });
        } else {
            req.session.message = {
                type:'info',
                message: 'User deleted successfully!'
            };
            res.redirect('/');
        }
    })
})


module.exports = router;

