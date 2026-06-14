const form = document.querySelector('#expense-form');
const expensesList = document.querySelector('#expense-list');

let currentFilter = 'all';
let currentExpenses = [];
let currentPage = 1;
let totalPages = 1;
let currentPageLimit = parseInt(localStorage.getItem('expensePageLimit'), 10) || 10;

const renderPaginationControls = () => {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;

    if (totalPages <= 1 && currentExpenses.length === 0) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await loadExpenses();
        }
    });

    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', async () => {
        if (currentPage < totalPages) {
            currentPage++;
            await loadExpenses();
        }
    });

    const limitSelectorGroup = document.createElement('div');
    limitSelectorGroup.className = 'limit-selector-group';

    const limitLabel = document.createElement('label');
    limitLabel.setAttribute('for', 'page-limit-select');
    limitLabel.textContent = 'Show ';

    const limitSelect = document.createElement('select');
    limitSelect.id = 'page-limit-select';
    limitSelect.className = 'page-limit-select';

    const limitOptions = [5, 10, 20, 30, 40];
    limitOptions.forEach(optVal => {
        const option = document.createElement('option');
        option.value = optVal;
        option.textContent = optVal;
        if (optVal === currentPageLimit) {
            option.selected = true;
        }
        limitSelect.appendChild(option);
    });

    limitSelect.addEventListener('change', async (e) => {
        const newLimit = parseInt(e.target.value, 10);
        currentPageLimit = newLimit;
        localStorage.setItem('expensePageLimit', newLimit);
        currentPage = 1;
        await loadExpenses();
    });

    const limitSuffix = document.createElement('span');
    limitSuffix.textContent = ' per page';

    limitSelectorGroup.append(limitLabel, limitSelect, limitSuffix);

    paginationContainer.append(prevBtn, pageInfo, nextBtn, limitSelectorGroup);
};

const downloadCSV = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        let url = `http://localhost:5000/api/expenses/${userId}?download=true`;
        if (currentFilter && currentFilter !== 'all') {
            url += `&filter=${currentFilter}`;
        }
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || 'Unable to download report');
            return;
        }

        const allExpenses = data.expenses || [];
        if (!allExpenses.length) {
            alert('No data available to download');
            return;
        }

        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (Rs.)'];
        const rows = allExpenses.map(expense => [
            new Date(expense.createdAt).toLocaleDateString(),
            expense.type.toUpperCase(),
            expense.category,
            expense.description,
            Number(expense.amount).toFixed(2)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', downloadUrl);
        link.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        alert('Failed to connect to server');
    }
};

const updateCategoryOptions = (type) => {
    const categorySelect = document.querySelector('#category');
    if (!categorySelect) return;

    const currentValue = categorySelect.value;
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    const categories = type === 'income' 
        ? ['Salary', 'Freelance', 'Investment', 'Others']
        : ['Food', 'Travel', 'Shopping', 'Others'];

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });

    if (categories.includes(currentValue)) {
        categorySelect.value = currentValue;
    }
};

const loadExpenses = async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        let queryParams = [`page=${currentPage}`, `limit=${currentPageLimit}`];
        if (currentFilter && currentFilter !== 'all') {
            queryParams.push(`filter=${currentFilter}`);
        }
        const url = `http://localhost:5000/api/expenses/${userId}?${queryParams.join('&')}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to load expenses');
            return;
        }

        currentExpenses = data.expenses || [];
        totalPages = data.totalPages || 1;

        if (!currentExpenses.length && currentPage > 1) {
            currentPage = totalPages;
            await loadExpenses();
            return;
        }

        if (!currentExpenses.length) {
            expensesList.innerHTML = '<p class="empty-state">No expenses yet. Add your first one above.</p>';
            renderPaginationControls();
            return;
        }

        expensesList.innerHTML = '';

        currentExpenses.forEach(expense => {
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
            if (expense.type === 'income') {
                amount.textContent = `+ Rs. ${Number(expense.amount).toFixed(2)}`;
                amount.classList.add('income-amount');
            } else {
                amount.textContent = `- Rs. ${Number(expense.amount).toFixed(2)}`;
                amount.classList.add('expense-amount');
            }

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

        renderPaginationControls();
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
    const type = document.querySelector('#type') ? document.querySelector('#type').value : 'expense';
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
                userId,
                type
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to add expense');
            return;
        }

        form.reset();
        updateCategoryOptions('expense');
        currentPage = 1;
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

            // --- PREMIUM USER SPECIFIC UI SETUP ---
            const typeField = document.getElementById("typeField");
            if (typeField) {
                typeField.style.display = "block";
            }
            const expenseForm = document.getElementById("expense-form");
            if (expenseForm) {
                expenseForm.classList.add("premium-form");
            }

            const premiumReportsBar = document.getElementById("premiumReportsBar");
            if (premiumReportsBar) {
                premiumReportsBar.style.display = "flex";
            }
            const filterGroup = document.querySelector(".filter-group");
            if (filterGroup) {
                filterGroup.style.display = "flex";
            }

            const downloadBtn = document.getElementById("downloadBtn");
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.textContent = "Download Report";
                downloadBtn.replaceWith(downloadBtn.cloneNode(true));
                const newDownloadBtn = document.getElementById("downloadBtn");
                newDownloadBtn.addEventListener("click", downloadCSV);
            }

            const filterButtons = document.querySelectorAll(".filter-btn");
            filterButtons.forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    filterButtons.forEach(b => b.classList.remove("active"));
                    e.target.classList.add("active");
                    currentFilter = e.target.dataset.filter;
                    currentPage = 1;
                    await loadExpenses();
                });
            });
        } else {
            // Standard User Configuration
            const premiumReportsBar = document.getElementById("premiumReportsBar");
            if (premiumReportsBar) {
                premiumReportsBar.style.display = "flex";
            }
            const filterGroup = document.querySelector(".filter-group");
            if (filterGroup) {
                filterGroup.style.display = "none";
            }
            const downloadBtn = document.getElementById("downloadBtn");
            if (downloadBtn) {
                downloadBtn.disabled = true;
                downloadBtn.textContent = "Download (Premium Only)";
            }
        }
    } catch (error) {
        console.error('Error checking premium status:', error);
    }
};

const typeSelector = document.querySelector('#type');
if (typeSelector) {
    typeSelector.addEventListener('change', (e) => {
        updateCategoryOptions(e.target.value);
    });
}

updateCategoryOptions('expense');
loadExpenses();
checkPremiumStatus();
