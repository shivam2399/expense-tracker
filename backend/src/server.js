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

sequelize
   .sync()
   .then(() => {
    console.log('Database connected and synced');
    app.listen(process.env.PORT, () => {
        console.log(
        `Server running on port ${process.env.PORT}`
      );
    });
   })
   .catch((err) => {
    console.log('Error connecting to the database:', err);
   })
