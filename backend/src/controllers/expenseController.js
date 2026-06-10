const Expense = require('../models/Expense');

const addExpense = async (req, res) => {
    try {
        const {
            amount,
            description,
            category,
            userId
        } = req.body;

        if(!amount || !description || !category || !userId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            })
        }

        const expense = await Expense.create({
            amount,
            description,
            category,
            userId
        })

        res.status(201).json({
            success: true,
            expense
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

const getExpenses = async (req, res) => {
    try {
        const { userId } = req.params;

        const expenses = await Expense.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({
            success: true,
            expenses
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!id || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Expense id and user id are required'
            })
        }

        const deletedExpense = await Expense.destroy({
            where: {
                id,
                userId
            }
        })

        if (!deletedExpense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
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
    addExpense,
    getExpenses,
    deleteExpense
}
