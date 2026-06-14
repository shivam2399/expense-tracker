const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define(
    'Expense',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('expense', 'income'),
            defaultValue: 'expense',
            allowNull: false
        }
    },
    {
        timestamps: true
    }
)

module.exports = Expense;
