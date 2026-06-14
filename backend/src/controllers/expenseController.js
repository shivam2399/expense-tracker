const Expense = require('../models/Expense');
const User = require('../models/User');
const sequelize = require('../config/db');

const addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            amount,
            description,
            category,
            userId
        } = req.body;

        if(!amount || !description || !category || !userId) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
            await t.rollback();
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
        }, { transaction: t })

        await User.increment('totalExpense', { by: amount, where: { id: userId }, transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            expense
        })
    } catch (error) {
        await t.rollback();
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
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!id || !userId) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Expense id and user id are required'
            })
        }

        const expense = await Expense.findOne({
            where: { id, userId },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            })
        }

        const amount = expense.amount;
        await expense.destroy({ transaction: t });
        await User.decrement('totalExpense', { by: amount, where: { id: userId }, transaction: t });

        const user = await User.findByPk(userId, { transaction: t });
        if (user && Number(user.totalExpense) < 0) {
            user.totalExpense = 0;
            await user.save({ transaction: t });
        }

        await t.commit();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        })
    } catch (error) {
        await t.rollback();
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