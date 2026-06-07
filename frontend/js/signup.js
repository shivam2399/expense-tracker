const form = document.querySelector('.signup-form');

form.addEventListener('submit',  async (e) => {
  e.preventDefault();
  
  const name = document.querySelector('#name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value.trim();
  const confirmPassword = document.querySelector('#confirmPassword').value.trim();

  if(!name || !email || !password || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }

  if(password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  if(password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Signup failed');
      return;
    }

    alert(data.message);
    form.reset();
  } catch (error) {
    console.log(error);
    alert('Unable to connect to server');
  }
})
