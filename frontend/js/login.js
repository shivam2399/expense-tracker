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
});

// Toggle forgot password modal
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.getElementById('closeModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

if (forgotPasswordLink && forgotPasswordModal && closeModal && forgotPasswordForm) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
        forgotPasswordForm.reset();
    });

    // Close if clicked outside the content area
    window.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
            forgotPasswordForm.reset();
        }
    });

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();

        if (!email) {
            alert('Please enter your email');
            return;
        }

        try {
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const response = await axios.post('http://localhost:5000/password/forgotpassword', { email });

            alert(response.data.message || 'Reset link sent successfully!');
            forgotPasswordModal.style.display = 'none';
            forgotPasswordForm.reset();
        } catch (error) {
            console.error(error);
            const errMsg = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Failed to send reset link';
            alert(errMsg);
        } finally {
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
        }
    });
}
