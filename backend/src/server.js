require("dotenv").config();

const express = require('express');
const cors = require('cors');

const sequelize = require('./config/db');
require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/premium', require('./routes/premiumRoutes'));

sequelize
   .sync()
   .then(async () => {
    console.log('Database connected and synced');
    
    // // Self-healing database check: Recalculate totalExpense to fix negative or desynced historical values
    // try {
    //     const { User, Expense } = require('./models');
    //     const users = await User.findAll();
    //     for (let user of users) {
    //         const total = await Expense.sum('amount', { where: { userId: user.id } }) || 0;
    //         user.totalExpense = total;
    //         await user.save();
    //     }
    //     console.log('User totalExpense columns successfully recalculated and synced');
    // } catch (err) {
    //     console.error('Error self-healing totalExpense:', err);
    // }

    app.listen(process.env.PORT, () => {
        console.log(
        `Server running on port ${process.env.PORT}`
      );
    });
   })
   .catch((err) => {
    console.log('Error connecting to the database:', err);
   })
