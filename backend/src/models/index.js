const User = require('./User');
const Expense = require('./Expense');
const Payment = require('./paymentModel');

User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    Expense,
    Payment
};
