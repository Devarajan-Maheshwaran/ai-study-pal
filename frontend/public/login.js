document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const status = document.getElementById('loginStatus');

  const userStr = localStorage.getItem('ai-study-pal-user');
  if (!userStr) {
    status.textContent = 'No user registered. Please sign up first.';
    return;
  }
  const user = JSON.parse(userStr);
  if (email === user.email && password === user.password) {
    status.style.color = '#22c55e';
    status.textContent = 'Login successful! Redirecting...';
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  } else {
    status.textContent = 'Invalid gmail address or password.';
  }
});
