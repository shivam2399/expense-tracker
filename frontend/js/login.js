const form = document.querySelector('.login-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Login failed');
            return;
        }

        localStorage.setItem(
          "userId",
          data.user.id
        );

        alert(data.message);
        form.reset();
        window.location.href = "../pages/dashboard.html";
    } catch (error) {
        console.log(error);
        alert('Unable to connect to server');
    }
})
