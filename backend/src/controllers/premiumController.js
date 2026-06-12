const { User, Expense } = require('../models');

exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name']
        });

        const leaderboard = [];

        for (let user of users) {
            const expenses = await Expense.findAll({
                where: { userId: user.id },
                attributes: ['amount']
            });

            const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

            leaderboard.push({
                id: user.id,
                name: user.name,
                totalExpense: totalExpense
            });
        }

        // Sort in memory (descending order)
        leaderboard.sort((a, b) => b.totalExpense - a.totalExpense);

        res.status(200).json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard brute force error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
