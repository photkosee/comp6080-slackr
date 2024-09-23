import { clearMessageForm, renderMessage } from './message.js';
import { 
  openPopup, 
  closePopup, 
  clearChild, 
  showPage, 
  openFormPopup, 
  createElementClass, 
  isoConvertor, 
  fetchPost, 
  fetchGet, 
  fetchPut, 
  handleOfflineMode
} from './helpers.js';
import { getUserList } from './user.js';
import { createPoll } from './poll.js';

// a list of poll closure to check for a new message
export let allPoll = [];

// edit channel details event
const editChannel = (channel) => {
  const channelName = document.getElementById('edit-channel-name');
  const des = document.getElementById('edit-channel-des');

  channelName.value = 'Loading...';
  des.value = 'Loading...';

  fetchGet(`/channel/${channel.id}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      channelName.value = data.name;
      if (data.description) {
        des.value = data.description;
      } else {
        des.value = '';
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });

  openEditChannelPopup(channel);
}

// see channel info
export const openChannelInfo = () => {
  const channelCreator = document.getElementById('see-channel-creator');
  const channelName = document.getElementById('see-channel-name');
  const createdTime = document.getElementById('see-channel-time');
  const check = document.getElementById('see-channel-check');
  const des = document.getElementById('see-channel-des');
  const channel = JSON.parse(localStorage.getItem('specificChannelDetails'));
  const creatorDetails = JSON.parse(localStorage.getItem('channelCreator'));

  channelCreator.value = 'Loading...';
  channelName.value = 'Loading...';
  createdTime.value = 'Loading...';
  des.value = 'Loading...';

  fetchGet(`/user/${parseInt(channel.creator)}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      channelCreator.value = data.name;
    }
  })
  .catch(() => {
    channelCreator.value = creatorDetails.name;
  });

  fetchGet(`/channel/${localStorage.getItem('channelId')}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      createdTime.value = isoConvertor(data.createdAt);
      channelName.value = data.name;
      check.checked = data.private;
      if (data.description) {
        des.value = data.description;
      } else {
        des.value = '';
      }
    }
  })
  .catch(() => {
    createdTime.value = isoConvertor(channel.createdAt);
    channelName.value = channel.name;
    check.checked = channel.private;
    if (channel.description) {
      des.value = channel.description;
    } else {
      des.value = '';
    }
  });

  openFormPopup('see-channel-popup');
}

// check if a user is a member of a channel
const isMember = (channel) => {
  const userId = localStorage.getItem('userId');

  for (let id of channel.members) {
    if (id == userId) return true;
  }
  return false;
}

// fetch a put method request to update channel details
const fetchUpdateChannel = (channel, body, name) => {
  const channelName = document.getElementById('channel-name');

  fetchPut(`/channel/${channel.id}`, body)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      openPopup('Success', 'Edit channel detail');
      listChannel();
      channelName.innerText = name;
      if (channel.name.length > 9) {
        channelName.innerText = channel.name.slice(0, 9) + '..';
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// open the form for editing channel's details
const openEditChannelPopup = (channel) => {
  const wrapper = document.getElementById('edit-channel-submit');
  const btn = createElementClass('button', 'btn btn-primary btn-block mt-4');

  openFormPopup('edit-channel-popup');
  clearChild('edit-channel-submit');
  btn.innerText = 'Update detail';
  wrapper.appendChild(btn);
  btn.addEventListener('click', (event) => {
    const name = document.getElementById('edit-channel-name').value;
    const body = {
      name: name,
      description: document.getElementById('edit-channel-des').value,
    }
    
    closePopup('edit-channel-popup');
    event.preventDefault();
    if (/\S/.test(name)) {
      fetchUpdateChannel(channel, body, name);
    } else {
      openPopup('Error', 'Channel name cannot be only white space');
    }
  });
}

// make a post method request to leave a channel
const fetchLeave = (channel) => {
  fetchPost(`/channel/${channel.id}/leave`, '')
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      openPopup('Success', 'User leave channel');
      listChannel();
      document.getElementById('channel-block').style.display = 'none';
      localStorage.setItem('channelId', null);
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// leaving channel event
const leaveChannel = (channel) => {
  const wrapper = document.getElementById('leave-channel-submit');
  const btn = createElementClass('button', 'btn btn-danger');
  
  openFormPopup('leave-channel-popup');
  clearChild('leave-channel-submit');
  btn.innerText = 'Leave';
  wrapper.appendChild(btn);
  btn.addEventListener('click', () => {
    closePopup('leave-channel-popup');
    fetchLeave(channel);
  });
}

// render a button with channel details editing event
const addEditChannelBtn = (channel) => {
  const btnContianer = document.getElementById('channel-btn-container');
  const li1 = document.createElement('li');
  const editBtn = createElementClass(
    'button', 
    'dropdown-item btn d-flex align-items-center'
  );
  const editIcon = createElementClass('i', 'bi bi-gear me-2 my-auto');
  const editText = createElementClass('p', 'mb-0');

  editText.innerText = 'Edit details';
  editBtn.appendChild(editIcon);
  editBtn.appendChild(editText);
  li1.appendChild(editBtn);
  btnContianer.appendChild(li1);
  editBtn.addEventListener('click', () => {
    handleOfflineMode(() => {
      editChannel(channel);
    });
  });
}

// render a button with inviting users event
const addInviteChannelBtn = () => {
  const btnContianer = document.getElementById('channel-btn-container');
  const li1 = document.createElement('li');
  const inviteBtn = createElementClass(
    'button', 
    'dropdown-item btn d-flex align-items-center'
  );
  const inviteIcon = createElementClass('i', 'bi bi-person-plus me-2 my-auto');
  const inviteText = createElementClass('p', 'mb-0');

  inviteText.innerText = 'Invite users';
  inviteBtn.appendChild(inviteIcon);
  inviteBtn.appendChild(inviteText);
  li1.appendChild(inviteBtn);
  btnContianer.appendChild(li1);
  inviteBtn.addEventListener('click', () => {
    handleOfflineMode(() => {
      openFormPopup('invite-user-popup');
      getUserList();
    });
  });
}

// render a button with channel leaving event
const addLeaveChannelBtn = (channel) => {
  const btnContianer = document.getElementById('channel-btn-container');
  const li2 = document.createElement('li');
  const leaveText = createElementClass('p', 'mb-0');
  const leaveBtn = createElementClass(
    'button', 
    'dropdown-item btn d-flex align-items-center'
  );
  const leaveIcon = createElementClass(
    'i', 
    'bi bi-box-arrow-left me-2 my-auto'
  );

  leaveText.innerText = 'Leave channel';
  leaveBtn.appendChild(leaveIcon);
  leaveBtn.appendChild(leaveText);
  li2.appendChild(leaveBtn);
  btnContianer.appendChild(li2);
  leaveBtn.addEventListener('click', () => {
    handleOfflineMode(() => {
      leaveChannel(channel);
    });
  });
}

// joining channel event
const joinChannel = (channel) => {
  const wrapper = document.getElementById('join-channel-submit');
  const btn = createElementClass('button', 'btn btn-success');

  clearChild('join-channel-submit');
  openFormPopup('join-channel-popup');
  btn.innerText = 'Join';
  wrapper.appendChild(btn);
  btn.addEventListener('click', () => {
    closePopup('join-channel-popup');
    fetchPost(`/channel/${channel.id}/join`, '')
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        openPopup('Success', 'User join channel');
        renderChannel(channel);
        listChannel();
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  });
}

// render a channel page with message body
const updateRenderChannel = (channel, data) => {
  const li = document.createElement('li');
  const hr = document.createElement('hr');
  const channelName = document.getElementById('channel-name');

  if (channel.private) {
    document.getElementById('channel-lock').style.display = 'block';
  } else {
    document.getElementById('channel-lock').style.display = 'none';
  }
  
  clearChild('channel-btn-container');
  clearChild('channel-name');
  clearMessageForm();
  localStorage.setItem('channelId', channel.id);
  document.getElementById('channel-block').style.display = 'block';
  channelName.innerText = data.name;
  if (data.name.length > 9) {
    channelName.innerText = data.name.slice(0, 9) + '..';
  }
  addEditChannelBtn(channel);
  li.appendChild(hr);
  document.getElementById('channel-btn-container').appendChild(li);
  addInviteChannelBtn();
  document.getElementById('channel-btn-container')
  .appendChild(li.cloneNode(true));
  addLeaveChannelBtn(channel);
  renderMessage(channel.id);
  document.getElementById('view-pin-message-btn').setAttribute(
    'class', 
    'btn d-flex align-items-center gap-2'
  );
}

// save the details of channel's creator in localStorage for offline access
const setChannelCreator = (channel) => {
  fetchGet(`/user/${parseInt(channel.creator)}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      localStorage.setItem('channelCreator', JSON.stringify(data));
    }
  });
}

// fetch data from a specific channel before displaying
const fetchChannel = (channel) => {
  fetchGet(`/channel/${channel.id}`)
  .then((data) => {
    if (data.error) {
      localStorage.setItem('channelId', null);
      document.getElementById('channel-block').style.display = 'none';
      openPopup('Error', data.error);
    } else {
      updateRenderChannel(channel, data);
      localStorage.setItem('specificChannelDetails', JSON.stringify(data));
      setChannelCreator(channel);
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// an event fetching data from backend for rendering a channel page
export const renderChannel = (channel) => {
  handleOfflineMode(() => {
    fetchGet('/channel')
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        const currChannel = data.channels.filter(e => e.id == channel.id);
        if (isMember(currChannel[0])) {
          fetchChannel(channel);
        } else {
          document.getElementById('channel-block').style.display = 'none';
          joinChannel(channel);
        }
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  });
}

// adding a channel to a list with an event to display a channel page
const appendChannel = (channel) => {
  if (
    isMember(channel) ||
    !channel.private
  ) {
    const publicWrapper = document.getElementById('channel-list');
    const publicList = document.createElement('li');
    const privateWrapper = document.getElementById('private-channel-list');
    const privateList = document.createElement('li');
    const name = createElementClass('p', 'mb-0');
    const lock = createElementClass('i', 'bi bi-lock my-auto');
    const nonMember = createElementClass(
      'i', 
      'bi bi-box-arrow-in-right my-auto'
    );
    const btn = createElementClass(
      'button', 
      'w-100 d-flex btn align-items-center gap-1'
    );

    if (!isMember(channel)) {
      btn.appendChild(nonMember);
    }

    if (channel.private) {
      btn.appendChild(lock);
      privateList.appendChild(btn);
      privateWrapper.appendChild(privateList);
    } else {
      publicList.appendChild(btn);
      publicWrapper.appendChild(publicList);
    }

    name.innerText = channel.name;
    if (channel.name.length > 19) {
      name.innerText = channel.name.slice(0, 19) + '..';
    }

    btn.appendChild(name);
    btn.addEventListener('click', () => {
      document.getElementById('channel-block').style.display = 'block';

      handleOfflineMode(() => {
        renderChannel(channel);
      });
    });
  }

  if (isMember(channel)) {
    const poll = createPoll(channel.id, channel.name);
    poll.init();
    poll.polling();
    allPoll = [...allPoll, poll];
  }
}

// display user name and user profile on side navbar
const loadUserName = (userName, userIcon) => {
  fetchGet(`/user/${localStorage.getItem('userId')}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      userName.innerText = data.name;
      if (data.name.length > 15) {
        userName.innerText = data.name.slice(0, 15) + '..';
      }
      if (data.image) {
        userIcon.setAttribute('src', data.image);
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// listing all channels (that a user is a member) to a list
export const listChannel = () => {
  const userName = document.getElementById('user-name');
  const userIcon = document.getElementById('user-icon');
  allPoll.forEach(poll => poll.stop());
  allPoll = [];

  userName.innerText = 'Loading...';
  userIcon.setAttribute('src', './assets/user-icon.png');
  fetchGet('/channel')
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
      showPage('login');
    } else {
      loadUserName(userName, userIcon);
      clearChild('channel-list');
      clearChild('private-channel-list');
      (data.channels).forEach(channel => {
        appendChannel(channel);
      });
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// an event creating a new channel
export const createChannel = (event) => {
  const channelName = document.getElementById('new-channel-name').value;
  const body = {
    name: channelName,
    private: document.getElementById('new-channel-private').checked,
    description: document.getElementById('new-channel-des').value,
  }

  event.preventDefault();
  if (/\S/.test(channelName)) {
    fetchPost('/channel', body)
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        closePopup('new-channel-popup');
        openPopup('Success', 'Channel created');
        listChannel();
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  } else {
    closePopup('new-channel-popup');
    openPopup('Error', 'Channel name cannot be only white space');
  }
}
