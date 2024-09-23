import { login, logout, register } from './auth.js';
import { 
  createChannel,
  listChannel, 
  openChannelInfo,
  renderChannel 
} from './channel.js';
import { 
  getMoreMessage,
  sendMessage, 
  toggleViewPinMessage 
} from './message.js';
import { 
  closePopup,
  showPage, 
  openFormPopup,
  fileToDataUrl,
  fetchGet,
  openPopup,
  handleOfflineMode
} from './helpers.js';
import { editUserProfile, 
  inviteUser, 
  openEditUserProfile, 
  viewUserProfile 
} from './user.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const sendMessageForm = document.getElementById('send-message-form');
const editUserForm = document.getElementById('edit-user-form');
const newChannelForm = document.getElementById('new-channel-form');
const registerDirect = document.getElementById('register-direct');
const loginDirect = document.getElementById('login-direct');
const popup_x = document.getElementById('popup-x');
const popupClose = document.getElementById('popup-close');
const logoutBtn = document.getElementById('logout-btn');
const newChannelBtn = document.getElementById('new-channel-btn');
const editUserBtn = document.getElementById('edit-user-btn');
const homeBtn = document.getElementById('home-btn');
const navbar = document.getElementById('navbar');
const toggleNavbarBtn = document.getElementById('toggle-navbar');
const arrowIcon = document.getElementById('toggle-navbar-arrow');
const messageImageInput = document.getElementById('message-image-input');
const editMessageImageInput = document.getElementById('edit-message-image-input');
const editUserImageInput = document.getElementById('edit-user-image-input');
const inputImage = document.getElementById('input-image');
const editMessageImage = document.getElementById('edit-message-image');
const editUserImage = document.getElementById('edit-user-image');
const closeInputImage = document.getElementById('close-input-image');
const closeEditMessageImage = document.getElementById('close-edit-message-image');
const viewPinMessageBtn = document.getElementById('view-pin-message-btn');
const inviteBtn = document.getElementById('invite-user-submit-btn');
const setAlarmBtn = document.getElementById('set-alarm-btn');
const channelBlock = document.getElementById('channel-block');
const togglePassword = document.getElementById('edit-user-toggle-password');
const eye = document.getElementById('eye');
const channelBody = document.getElementById('channel-body');
const editUserPassword = document.getElementById('edit-user-password');
const channelInfoBtn  = document.getElementById('channel-info-btn');
const newChannelNameInput = document.getElementById('new-channel-name');
const newChannelDesInput = document.getElementById('new-channel-des');
const newChannelCheckInput = document.getElementById('new-channel-private');
const localStorageToken = localStorage.getItem('token');
let globalToken = null;
const allPopup = [
  'new-channel',
  'edit-channel',
  'leave-channel',
  'join-channel',
  'edit-user',
  'edit-message',
  'profile-user',
  'invite-user',
  'photo-message',
  'see-channel'
];

// get token
if (localStorageToken !== null) {
  globalToken = localStorageToken;
}

// take user to a dashboard page if there is a token, 
// take him to a register page otherwise
if (globalToken === null) {
  showPage('register');
} else {
  showPage('dashboard');
  handleOfflineMode(() => {
    listChannel();
  });
}

// add an event to close a modal to each of the modals
allPopup.forEach((name) => {
  document.getElementById(`${name}-popup-x`)
    .addEventListener('click', () => {
      closePopup(`${name}-popup`);
    });
})

// login when submiting a login form
loginForm.addEventListener('submit', login);

// register when submiting a login form
registerForm.addEventListener('submit', register);

// add a new channel when submiting a new channel form
newChannelForm.addEventListener('submit', createChannel);

// edit user profile when submitting an edit user profile form
editUserForm.addEventListener('submit', editUserProfile);

// direct a user to a register page when click a register direct button
registerDirect.addEventListener('click', () => {
  showPage('register');
});

// direct a user to a login page when click a login direct button
loginDirect.addEventListener('click', () => {
  showPage('login');
});

// open an edit user profile form when clicking an edit user button
editUserBtn.addEventListener('click', () => {
  handleOfflineMode(() => {
    openEditUserProfile();
  });
});

// close a popup when an x button is clicked
popup_x.addEventListener('click', () => {
  closePopup('popup');
});

// close a popup when a close button is clicked
popupClose.addEventListener('click', () => {
  closePopup('popup');
});

// logout a user when a logout button is clicked
logoutBtn.addEventListener('click', () => {
  handleOfflineMode(() => {
    logout();
  });
});

// open a adding a new channel form when clicking an add channel button
newChannelBtn.addEventListener('click', () => {
  handleOfflineMode(() => {
    newChannelNameInput.value = '';
    newChannelDesInput.value = '';
    newChannelCheckInput.checked = false;
    openFormPopup('new-channel-popup');
  });
});

// send a message when a message form is submited
sendMessageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleOfflineMode(() => {
    sendMessage();
  });
});

// display an image that a user upload before sending a message
messageImageInput.addEventListener('change', () => {
  if (messageImageInput.files[0] !== '') {
    closeInputImage.style.display = 'block';
    try {
      fileToDataUrl(messageImageInput.files[0])
      .then(data => {
        inputImage.setAttribute('src', data);
      });
    } catch (e) {
      messageImageInput.value = '';
      inputImage.setAttribute('src', './assets/image-input.png');
      closeInputImage.style.display = 'none';
      openPopup('Error', 'Provided file is not a png, jpg or jpeg image');
    }
  }
});

// allow user to cancel out his uploaded message image
closeInputImage.addEventListener('click', () => {
  messageImageInput.value = '';
  inputImage.setAttribute('src', './assets/image-input.png');
  closeInputImage.style.display = 'none';
});

// display an image that a user upload before updating a message
editMessageImageInput.addEventListener('change', () => {
  if (editMessageImageInput.files[0] !== '') {
    closeEditMessageImage.style.display = 'block';
    try {
      fileToDataUrl(editMessageImageInput.files[0])
      .then(data => {
        editMessageImage.setAttribute('src', data);
      });
    } catch (e) {
      closePopup('edit-message-popup');
      openPopup('Error', 'Provided file is not a png, jpg or jpeg image');
    }
  }
});

// allow user to cancel out his uploaded message image when editing
closeEditMessageImage.addEventListener('click', () => {
  editMessageImageInput.value = '';
  editMessageImage.setAttribute('src', './assets/image-input.png');
  closeEditMessageImage.style.display = 'none';
});

// display an image that a user upload before updating an user profile
editUserImageInput.addEventListener('change', () => {
  editUserImage.setAttribute('src', './assets/user-icon.png');
  if (editUserImageInput.files[0] !== '') {
    try {
      fileToDataUrl(editUserImageInput.files[0])
      .then(data => {
        editUserImage.setAttribute('src', data);
      });
    } catch (e) {
      closePopup('edit-user-popup');
      openPopup('Error', 'Provided file is not a png, jpg or jpeg image');
    }
  }
});

// show and hide side navbar
toggleNavbarBtn.addEventListener('click', () => {
  if (arrowIcon.className.includes('left')) {
    navbar.style.display = 'none';
    toggleNavbarBtn.style.marginLeft = '0';
    arrowIcon.setAttribute('class', 'bi bi-caret-right');
  } else {
    navbar.style.display = 'block';
    toggleNavbarBtn.style.marginLeft = '250px';
    arrowIcon.setAttribute('class', 'bi bi-caret-left');
  }
});

// toggle between displaying pinned and normal messages
viewPinMessageBtn.addEventListener('click', () => {
  fetchGet('/user')
  .then(() => {
    handleOfflineMode(() => {
      toggleViewPinMessage();
    });
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
});

// route to a page according to a given url
window.addEventListener('hashchange', () => {
  const url = location.hash;

  if ((new RegExp('^#channel=')).test(url)) {
    fetchGet('/channel')
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        let checkId = false;

        data.channels.forEach((channel) => {
          if (channel.id == url.substring(9)) {
            renderChannel(channel);
            checkId = true;
          }
        });

        if (!checkId) {
          openPopup('Error', 'Invalid channel ID');
        }
      }
    });
  } else if (url == '#profile') {
    viewUserProfile(localStorage.getItem('userId'));
  } else if ((new RegExp('^#profile=')).test(url)) {
    viewUserProfile(url.substring(9));
  }
});

// clear single channel page when clicking
homeBtn.addEventListener('click', () => {
  fetchGet('/user')
  .then(() => {
    handleOfflineMode(() => {
      if (channelBlock.style.display == 'none') {
        channelBlock.style.display = 'block';
      } else {
        channelBlock.style.display = 'none';
      }
    });
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
});

// show and hide a password
togglePassword.addEventListener('click', () => {
  if (eye.className.includes('slash')) {
    editUserPassword.type = 'password';
    eye.setAttribute('class', 'bi bi-eye');
  } else {
    editUserPassword.type = 'text';
    eye.setAttribute('class', 'bi bi-eye-slash')
  }
});

// invite an user to a channel
inviteBtn.addEventListener('click', inviteUser);

// load more old messages when scroll to the top most of the messages
channelBody.addEventListener('scroll', () => {
  const { scrollTop } = channelBody;

  if (!viewPinMessageBtn.className.includes('btn-primary')) {
    if (scrollTop == 0) {
      handleOfflineMode(() => {
        getMoreMessage();
      });
    }
  }
});

// set an alarm that would be triggered in a minute
setAlarmBtn.addEventListener('click', () => {
  fetchGet('/user')
  .then(() => {
    handleOfflineMode(() => {
      openPopup('Success', 'There will be a notice in 1 minute!');
      setTimeout(
        () => {
          openPopup('Alert', 'This is a 1 minute alarm!');
        },
        60000
      );
    });
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
});

// see channel details when clicking a channel info button
channelInfoBtn.addEventListener('click', () => {
  handleOfflineMode(() => {
    openChannelInfo();
  });
});
