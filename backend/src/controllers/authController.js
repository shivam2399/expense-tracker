const User = require('../models/User');

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })
        }
        
        const existingUser = await User.findOne({
            where: {email}
        })

        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        const user = await User.create({
            name,
            email,
            password,
        }) 
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        })
} catch (error) {
    console.log(error);
    res.status(500).json({
        success: false,
        message: 'Server Error'
    })
  }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })
        }

        const user = await User.findOne({
            where: {email}
        });

        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'User does not exist'
            })
        }
        if(user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

module.exports = {
    signup,
    login
}
