import { listChannel } from './channel.js';
import { closePopup, 
  fetchGet,
  fetchPut,
  openFormPopup, 
  openPopup, 
  fileToDataUrl, 
  clearChild,
  fetchPost
} from './helpers.js';

// getting user details
export const viewUserProfile = (id) => {
  const image = document.getElementById('profile-image');
  const name = document.getElementById('profile-user-name');
  const bio = document.getElementById('profile-user-bio');
  const email = document.getElementById('profile-user-email');

  image.setAttribute('src', './assets/user-icon.png');
  name.value = 'Loading';
  bio.value = 'Loading';
  email.value = 'Loading';

  fetchGet(`/user/${id}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      openFormPopup('profile-user-popup');
      name.value = data.name;
      bio.value = data.bio;
      email.value = data.email;
      if (data.image) {
        image.setAttribute('src', data.image);
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// open an edit user profile form
export const openEditUserProfile = () => {
  const image = document.getElementById('edit-user-image');
  const imageInput = document.getElementById('edit-user-image-input');
  const name = document.getElementById('edit-user-name');
  const bio = document.getElementById('edit-user-bio');
  const email = document.getElementById('edit-user-email');
  const password = document.getElementById('edit-user-password');
  const togglePassword = document.getElementById('eye');

  password.type = 'password';
  password.value = '';
  imageInput.value = '';
  togglePassword.setAttribute('class', 'bi bi-eye');
  image.setAttribute('src', './assets/user-icon.png');
  name.value = 'Loading';
  bio.value = 'Loading';
  email.value = 'Loading';

  fetchGet(`/user/${localStorage.getItem('userId')}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      openFormPopup('edit-user-popup');
      name.value = data.name;
      bio.value = data.bio;
      email.value = data.email;
      if (data.image) {
        image.setAttribute('src', data.image);
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// update user profile
const putProfile = (body, allInput) => {
  const btn = document.getElementById('edit-user-submit-btn');
  fetchPut('/user', body)
  .then((data) => {
    closePopup('edit-user-popup');
    if (data.error) {
      openPopup('Error', data.error);
      allInput.forEach(e => e.disabled = false);
      btn.innerText = 'Update detail';
    } else {
      openPopup('Success', 'User update profile');
      listChannel();
      document.getElementById('channel-block').style.display = 'none';
      allInput.forEach(e => e.disabled = false);
      btn.innerText = 'Update detail';
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// get all input for updating an user profile from a form
export const editUserProfile = (event) => {
  const image = document.getElementById('edit-user-image-input');
  const name = document.getElementById('edit-user-name');
  const bio = document.getElementById('edit-user-bio');
  const email = document.getElementById('edit-user-email');
  const password = document.getElementById('edit-user-password');
  const btn = document.getElementById('edit-user-submit-btn');
  const allInput = [image, name, bio, email, password, btn];
  const body = {};

  event.preventDefault();

  if (!/\S/.test(name.value)) {
    closePopup('edit-user-popup');
    openPopup('Error', 'User name cannot be only whitespace');
    return;
  }

  btn.innerText = 'Updating...';
  allInput.forEach(e => e.disabled = true);

  if (name.value) body['name'] = name.value;
  if (bio.value) body['bio'] = bio.value;
  if (password.value) body['password'] = password.value;

  if (
    email.value && email.value != localStorage.getItem('email')
  ) {
    body['email'] = email.value;
  }

  if (image.files[0]) {
    try {
      fileToDataUrl(image.files[0])
      .then(data => {
        body['image'] = data;
        putProfile(body, allInput);
      });
    } catch (e) {
      closePopup('edit-user-popup');
      openPopup('Error', 'Provided file is not a png, jpg or jpeg image');
      allInput.forEach(element => element.disabled = false);
      btn.innerText = 'Update detail';
    }
  } else {
    putProfile(body, allInput);
  }
}

// sort a list of users after fetch all datas
const sortUserList = (notJoin, btn, selectBox) => {
  Promise.all(
    notJoin.map((user) => {
      return fetchGet(`/user/${user.id}`)
        .then((detail) => {
          return {user, detail};
        });
    })
  )
  .then((list) => {
    clearChild('multiselect');
    btn.disabled = false;
    btn.innerText = 'Invite';
    list.sort((a, b) => a.detail.name.localeCompare(b.detail.name))
      .forEach(e => {
        const op = document.createElement('option');

        op.setAttribute('value', e.user.id);
        op.innerText = e.detail.name;
        selectBox.appendChild(op);
      });
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// fetch a get method request to get a list of users
const fetchUserList = (channel, load, btn, selectBox) => {
  fetchGet('/user')
  .then((data) => {
    if (data.error) {
      closePopup('invite-user-popup');
      openPopup('Error', users.error);
    } else {
      const notJoin = data.users.filter((user) => {
        return !channel.members.includes(user.id);
      });

      if (notJoin.length == 0) {
        load.innerText = 'All members are  already in the channel';
        btn.innerText = 'Please close';
      } else {
        sortUserList(notJoin, btn, selectBox);
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// display a list of users
export const getUserList = () => {
  const selectBox = document.getElementById('multiselect');
  const btn = document.getElementById('invite-user-submit-btn');
  const load = document.createElement('option');

  clearChild('multiselect');
  load.innerText = 'Loading...';
  selectBox.appendChild(load);
  btn.disabled = true;
  btn.innerText = 'Loading...';

  fetchGet(`/channel/${localStorage.getItem('channelId')}`)
  .then((channel) => {
    if (channel.error) {
      openPopup('Error', channel.error);
    } else {
      fetchUserList(channel, load, btn, selectBox);
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// inviting all selected user to a channel
export const inviteUser = () => {
  const multiselect = document.getElementById('multiselect');
  let count = 0;

  closePopup('invite-user-popup');
  if (!multiselect.value) {
    openPopup('Error', 'No user selected');
  } else {
    multiselect.childNodes.forEach(() => {
      const body = {
        userId: parseInt(multiselect.options[count].value),
      };

      if (multiselect.options[count].selected) {
        fetchPost(`/channel/${localStorage.getItem('channelId')}/invite`, body)
        .then((data) => {
          if (data.error) {
            openPopup('Error', data.error);
          }
        })
        .catch(() => {
          alert('Cannot interact with backend');
        });
      }

      count++;
    });

    openPopup('Success', 'Invite users');
  }
}