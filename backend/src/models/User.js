const { DataTypes } = require('sequelize');;
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isPremiumUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    totalExpense: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }  
},
{
    timestamps: true,
}
);

module.exports = User;