const { User, Expense } = require('../models');
const sequelize = require('../config/db');

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: [
                'id',
                'name',
                [
                    sequelize.fn(
                        'COALESCE',
                        sequelize.fn('SUM', sequelize.col('Expenses.amount')),
                        0
                    ),
                    'totalExpense'
                ]
            ],
            include: [{
                model: Expense,
                attributes: [] // Keep results lightweight (exclude individual expense fields)
            }],
            group: ['User.id'],
            order: [[sequelize.literal('totalExpense'), 'DESC']]
        });

        res.status(200).json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard optimized error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};