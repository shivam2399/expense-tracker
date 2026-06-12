const form = document.querySelector('#expense-form');
const expensesList = document.querySelector('#expense-list');

const loadExpenses = async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/expenses/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to load expenses');
            return;
        }

        if (!data.expenses.length) {
            expensesList.innerHTML = '<p class="empty-state">No expenses yet. Add your first one above.</p>';
            return;
        }

        expensesList.innerHTML = '';

        data.expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';

            const expenseLeft = document.createElement('div');
            expenseLeft.className = 'expense-left';

            const description = document.createElement('h3');
            description.textContent = expense.description;

            const createdAt = document.createElement('p');
            createdAt.textContent = new Date(expense.createdAt).toLocaleDateString();

            const expenseRight = document.createElement('div');
            expenseRight.className = 'expense-right';

            const amount = document.createElement('p');
            amount.className = 'amount';
            amount.textContent = `Rs. ${Number(expense.amount).toFixed(2)}`;

            const category = document.createElement('p');
            category.className = 'category';
            category.textContent = expense.category;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-expense';
            deleteButton.type = 'button';
            deleteButton.dataset.id = expense.id;
            deleteButton.textContent = 'Delete';

            expenseLeft.append(description, createdAt);
            expenseRight.append(amount, category);
            expenseItem.append(expenseLeft, expenseRight, deleteButton);
            expensesList.appendChild(expenseItem);
        });
    } catch (error) {
        console.log(error);
        alert('Unable to connect to server');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.querySelector('#amount').value.trim();
    const description = document.querySelector('#description').value.trim();
    const category = document.querySelector('#category').value.trim();
    const userId = localStorage.getItem('userId');

    if (!amount || !description || !category || !userId) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/expenses/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                description,
                category,
                userId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to add expense');
            return;
        }

        form.reset();
        await loadExpenses();
    } catch (error) {
        console.log(error);
        alert('Unable to connect to server');
    }
});

expensesList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.delete-expense');

    if (!deleteButton) {
        return;
    }

    const expenseId = deleteButton.dataset.id;
    const userId = localStorage.getItem('userId');

    if (!expenseId || !userId) {
        alert('Unable to delete expense');
        return;
    }

    try {
        deleteButton.disabled = true;
        deleteButton.textContent = 'Deleting...';

        const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to delete expense');
            deleteButton.disabled = false;
            deleteButton.textContent = 'Delete';
            return;
        }

        await loadExpenses();
    } catch (error) {
        console.log(error);
        alert('Unable to connect to server');
        deleteButton.disabled = false;
        deleteButton.textContent = 'Delete';
    }
});

const showLeaderboard = async () => {
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardList = document.getElementById('leaderboard-list');

    if (!leaderboardSection || !leaderboardList) return;

    try {
        const response = await fetch('http://localhost:5000/api/premium/leaderboard');
        const data = await response.json();

        if (response.ok && data.success) {
            leaderboardSection.style.display = 'block';

            const fragment = document.createDocumentFragment();
            data.leaderboard.forEach((user, index) => {
                const row = document.createElement('div');
                row.className = 'leaderboard-row';

                if (index === 0) row.classList.add('rank-first');
                else if (index === 1) row.classList.add('rank-second');
                else if (index === 2) row.classList.add('rank-third');

                row.innerHTML = `
                    <span class="rank-num">${index + 1}</span>
                    <span class="rank-name">${user.name}</span>
                    <span class="rank-amount">Rs. ${Number(user.totalExpense).toFixed(2)}</span>
                `;
                fragment.appendChild(row);
            });

            leaderboardList.innerHTML = '';
            leaderboardList.appendChild(fragment);
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
};

const checkPremiumStatus = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`http://localhost:5000/api/auth/user/${userId}`);
        const data = await response.json();

        if (response.ok && data.success && data.user.isPremiumUser) {
            const renderBtn = document.getElementById("renderBtn");
            if (renderBtn) {
                const premiumBadge = document.createElement("span");
                premiumBadge.className = "premium-badge";
                premiumBadge.textContent = "You are a premium user";
                renderBtn.parentNode.replaceChild(premiumBadge, renderBtn);
            }
            
            const leaderboardBtn = document.getElementById("leaderboardBtn");
            if (leaderboardBtn) {
                leaderboardBtn.style.display = "inline-flex";
                leaderboardBtn.addEventListener("click", () => {
                    const leaderboardSection = document.getElementById("leaderboard-section");
                    if (leaderboardSection) {
                        if (leaderboardSection.style.display === "none") {
                            showLeaderboard();
                            leaderboardBtn.textContent = "Hide Leaderboard";
                        } else {
                            leaderboardSection.style.display = "none";
                            leaderboardBtn.textContent = "Show Leaderboard";
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error checking premium status:', error);
    }
};

loadExpenses();
checkPremiumStatus();
