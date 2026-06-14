const User = require('../models/User');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist'
            });
        }

        
        const brevoApiKey = process.env.BREVO_API_KEY
        const senderEmail = process.env.SENDER_EMAIL;

        if (!brevoApiKey) {
            console.warn('Warning: BREVO_API_KEY is not defined in environment variables.');
            return res.status(500).json({
                success: false,
                message: 'Email service configuration error'
            });
        }

        const emailData = {
            sender: {
                name: "Expense Tracker",
                email: senderEmail || "no-reply@expensetracker.com"
            },
            to: [
                {
                    email: email,
                    name: user.name
                }
            ],
            subject: "Reset Your Password - Expense Tracker",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                    <h2 style="color: #2563eb;">Expense Tracker Password Reset</h2>
                    <p>Hello ${user.name},</p>
                    <p>We received a request to reset your password. You can reset your password using the link below:</p>
                    <p style="margin: 20px 0;">
                        <a href="http://localhost:5000/password/reset/${user.id}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API Error:', data);
            return res.status(500).json({
                success: false,
                message: 'Failed to send email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email.'
        });
    } catch (error) {
        console.error('Forgot password controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
