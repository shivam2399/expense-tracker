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
            type: DataTypes.ENUM(
                'Food',
                'Travel',
                'Shopping',
                'Others'
            ),
            allowNull: false,
        }
    },
    {
        timestamps: true
    }
)

module.exports = Expense;
