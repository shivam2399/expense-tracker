const express = require('express');

const {
    addExpense,
    getExpenses,
    deleteExpense
} = require('../controllers/expenseController');

const router = express.Router()

router.post('/', addExpense);
router.post('/add', addExpense);
router.get('/:userId', getExpenses);
router.delete('/:id', deleteExpense);

module.exports = router;
