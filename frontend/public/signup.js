document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const status = document.getElementById('signupStatus');

  if (!email || !password) {
    status.textContent = 'Please enter both gmail address and password.';
    return;
  }
  if (!email.endsWith('@gmail.com')) {
    status.textContent = 'Please use a valid gmail address.';
    return;
  }
  const user = { email, password };
  localStorage.setItem('ai-study-pal-user', JSON.stringify(user));
  status.style.color = '#22c55e';
  status.textContent = 'Registration successful! You can now log in.';
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
});
