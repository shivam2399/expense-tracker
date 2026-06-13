const { User } = require('../models');

exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch only user ID, name, and pre-computed totalExpense directly, sorted from highest to lowest
        const leaderboard = await User.findAll({
            attributes: ['id', 'name', 'totalExpense'],
            order: [['totalExpense', 'DESC']]
        });

        res.status(200).json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};