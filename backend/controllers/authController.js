const User = require("../models/User");
const bcrypt = require("bcryptjs");


// ================= REGISTER =================

exports.register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check if user already exists

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash Password

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User

        const user = await User.create({

            name,
            email,
            password: hashedPassword,

        });

        res.status(201).json({

            success: true,
            message: "Registration Successful",
            user,

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


// ================= LOGIN =================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check email

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "User not registered",
            });

        }

        // Compare Password

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Invalid Password",
            });

        }

        res.status(200).json({

            success: true,
            message: "Login Successful",

            user: {

                id: user._id,
                name: user.name,
                email: user.email,

            },

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message,

        });

    }

};