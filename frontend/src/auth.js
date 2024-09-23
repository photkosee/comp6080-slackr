import { allPoll, listChannel } from './channel.js';
import { 
  fetchPost, 
  fetchPostNonAuth, 
  openPopup, 
  showPage 
} from './helpers.js';

console.log('test');

// login event
export const login = (event) => {
  const body = {
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value,
  }

  event.preventDefault();
  fetchPostNonAuth('/auth/login', body)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      localStorage.setItem('email', body.email);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      showPage('dashboard');
      listChannel();
      document.getElementById('channel-block').style.display = 'none';
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// register event
export const register = (event) => {
  const registerPassword = document.getElementById('register-password').value;
  const registerConfirm = document.getElementById('register-confirm').value;
  const registerName = document.getElementById('register-name').value;
  const body = {
    email: document.getElementById('register-email').value,
    password: registerPassword,
    name: registerName,
  }
  
  event.preventDefault();
  if (!/\S/.test(registerName)) {
    openPopup('Error', 'User name cannot be only whitespace');
    return;
  }

  if (registerPassword !== registerConfirm) {
    openPopup('Error', 'Passwords don\'t match');
    return;
  }
  
  fetchPostNonAuth('/auth/register', body)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      openPopup('Success', 'User register');
      showPage('login');
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// logout event
export const logout = () => {
  fetchPost('/auth/logout', '')
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      allPoll.forEach(poll => poll.stop());
      localStorage.clear();
      showPage('login');
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}
