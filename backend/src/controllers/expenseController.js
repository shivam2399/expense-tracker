const Expense = require('../models/Expense');
const User = require('../models/User');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

const addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            amount,
            description,
            category,
            userId,
            type // 'expense' or 'income'
        } = req.body;

        const txType = type || 'expense';

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
            userId,
            type: txType
        }, { transaction: t })

        // Increment the user's pre-computed totalExpense column ONLY for expenses
        if (txType === 'expense') {
            await User.increment('totalExpense', { by: amount, where: { id: userId }, transaction: t });
        }

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
        const { filter } = req.query;

        let whereClause = { userId };

        if (filter === 'daily') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            whereClause.createdAt = { [Op.gte]: startOfDay };
        } else if (filter === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            whereClause.createdAt = { [Op.gte]: oneWeekAgo };
        } else if (filter === 'monthly') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            whereClause.createdAt = { [Op.gte]: oneMonthAgo };
        }

        const expenses = await Expense.findAll({
            where: whereClause,
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

        // 1. Find the expense first to get its amount and type
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
        const txType = expense.type;

        // 2. Safely destroy the expense record
        await expense.destroy({ transaction: t });

        // 3. Atomically decrement the user's pre-computed totalExpense column ONLY if it was an expense
        if (txType === 'expense') {
            await User.decrement('totalExpense', { by: amount, where: { id: userId }, transaction: t });

            // Safeguard: Ensure totalExpense never falls below 0
            const user = await User.findByPk(userId, { transaction: t });
            if (user && Number(user.totalExpense) < 0) {
                user.totalExpense = 0;
                await user.save({ transaction: t });
            }
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