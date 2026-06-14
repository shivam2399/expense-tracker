const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, ForgotPasswordRequest } = require('../models');

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

        // Generate UUID using uuid library
        const requestId = crypto.randomUUID();

        // Create ForgotPasswordRequest record
        await ForgotPasswordRequest.create({
            id: requestId,
            userId: user.id,
            isActive: true
        });

        // Brevo (Sendinblue) API Integration
        const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
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
                        <a href="http://localhost:5000/password/resetpassword/${requestId}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
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

// Serve the reset password HTML form
exports.resetPasswordForm = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if forgot password request exists and is active
        const request = await ForgotPasswordRequest.findOne({ where: { id } });

        if (!request || !request.isActive) {
            return res.status(400).send(`
                <html>
                <head>
                    <title>Reset Password Link Expired</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8fafc; margin: 0; }
                        .card { padding: 30px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 400px; }
                        h2 { color: #ef4444; margin: 0 0 10px 0; }
                        p { color: #64748b; line-height: 1.5; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>Link Expired or Invalid</h2>
                        <p>This password reset link is invalid or has already been used. Please request a new one.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Return the HTML form
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reset Password</title>
                <style>
                    :root {
                        --primary-color: #2563eb;
                        --primary-hover: #1d4ed8;
                        --text-dark: #1e293b;
                        --text-light: #64748b;
                        --border-color: #dbeafe;
                        --background: #f8fafc;
                    }
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        background: var(--background);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                    }
                    .auth-card {
                        width: 100%;
                        max-width: 400px;
                        padding: 30px;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                        box-sizing: border-box;
                    }
                    h2 {
                        margin: 0 0 10px 0;
                        color: var(--text-dark);
                    }
                    p {
                        color: var(--text-light);
                        margin: 0 0 20px 0;
                        font-size: 0.95rem;
                        line-height: 1.5;
                    }
                    input {
                        width: 100%;
                        min-height: 46px;
                        padding: 0 12px;
                        margin-bottom: 20px;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        box-sizing: border-box;
                        outline: none;
                        font-size: 1rem;
                        transition: 0.3s;
                    }
                    input:focus {
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                    }
                    button {
                        width: 100%;
                        min-height: 46px;
                        border: 0;
                        border-radius: 8px;
                        background: var(--primary-color);
                        color: white;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;
                        transition: 0.3s;
                    }
                    button:hover {
                        background: var(--primary-hover);
                    }
                </style>
            </head>
            <body>
                <div class="auth-card">
                    <h2>Reset Password</h2>
                    <p>Enter your new password below to update your account.</p>
                    <form id="resetForm">
                        <input type="password" id="newPassword" placeholder="Enter New Password" required minlength="6">
                        <button type="submit">Update Password</button>
                    </form>
                </div>

                <script>
                    document.getElementById('resetForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const password = document.getElementById('newPassword').value;
                        const submitBtn = e.target.querySelector('button');

                        try {
                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Updating...';

                            const response = await fetch('/password/updatepassword/${id}', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ password })
                            });

                            const data = await response.json();

                            if (response.ok && data.success) {
                                alert('Password updated successfully! You can now close this tab and log in.');
                                document.getElementById('newPassword').disabled = true;
                                submitBtn.textContent = 'Password Updated';
                            } else {
                                alert(data.message || 'Failed to update password');
                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Update Password';
                            }
                        } catch (error) {
                            console.error(error);
                            alert('Connection error. Failed to update password.');
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Update Password';
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Reset password form error:', error);
        res.status(500).send('Server Error');
    }
};

// Process the password update in database
exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find and check request
        const request = await ForgotPasswordRequest.findOne({ where: { id } });

        if (!request || !request.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This reset request is invalid or has expired'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the User's password
        await User.update(
            { password: hashedPassword },
            { where: { id: request.userId } }
        );

        // Deactivate the request
        request.isActive = false;
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Password successfully updated'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
