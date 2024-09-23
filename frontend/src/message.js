import { 
  createElementClass, 
  openPopup, 
  clearChild, 
  isoConvertor, 
  fetchPost, 
  fetchGet,
  fileToDataUrl,
  fetchDelete,
  openFormPopup,
  fetchPut,
  closePopup,
  handleOfflineMode,
  createLoading
} from './helpers.js';
import { viewUserProfile } from './user.js';

// keep track of a number of messages displayed in a channel
let numMessage = 0;

// building a skeleton message block
const buildMockMessage = () => {
  const li = createElementClass('li', 'd-flex justify-content-between mb-3');
  const cardWrapper = createElementClass('div', 'card w-100 mx-3');
  const body = createElementClass('div', 'card-body');
  const leftWrapper = createElementClass('div', 'd-flex gap-2');
  const head = createElementClass(
    'div', 
    'card-header d-flex justify-content-between px-3 py-2'
  );
  const img = createElementClass(
    'img', 
    'rounded-circle d-flex align-self-start'
  );

  leftWrapper.appendChild(createLoading());
  img.setAttribute('src', './assets/user-icon.png');
  img.setAttribute('width', '35');
  body.appendChild(createLoading());
  head.appendChild(leftWrapper);
  li.appendChild(img);
  cardWrapper.appendChild(head);
  cardWrapper.appendChild(body);
  li.appendChild(cardWrapper);

  return li;
}

// open an error modal for editing messages
const editError = (text) => {
  closePopup('edit-message-popup');
  openPopup(
    'Error', 
    text
  );
}

// update new message with an image
const editImageMsg = (
  imageData,
  path, 
  inputMessage, 
  bodyP, 
  img, 
  editTime
) => {
  if (
    imageData == img.getAttribute('src') && 
    inputMessage.value == bodyP.innerText
  ) {
    editError('Cannot edit the same content (text and image) to a message');
  } else {
    fetchPut(path, { 
      message: inputMessage.value, 
      image: imageData,
    })
    .then((data) => {
      closePopup('edit-message-popup');
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        img.setAttribute('src', imageData);
        img.style.display = 'block';
        bodyP.innerText = inputMessage.value;
        editTime.innerText = 'last modified ' + isoConvertor(new Date());
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  }
}

// update new message without a new image
const editTextMsg = (path, inputMessage, putImage, bodyP, img, editTime) => {
  fetchPut(path, { 
    message: inputMessage.value,
    image: putImage,
  })
  .then((data) => {
    closePopup('edit-message-popup');
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      bodyP.innerText = inputMessage.value;
      if (putImage) {
        img.setAttribute('src', putImage);
        img.style.display = 'block';
      } else {
        img.setAttribute('src', './assets/image-input.png');
        img.style.display = 'none';
      }
      editTime.innerText = 'last modified ' + isoConvertor(new Date());
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// edting a message with conditions according to the spec
export const editMessage = (editTime, bodyP, img, message) => {
  const inputMessage = document.getElementById('edit-message-message');
  const inputImage = document.getElementById('edit-message-image-input');
  const path = `/message/${localStorage.getItem('channelId')}/${message.id}`;
  const submitWrapper = document.getElementById('edit-message-submit');
  const showEditImage = document.getElementById('edit-message-image');

  submitWrapper.firstChild.innerText = 'Updating...';
  submitWrapper.firstChild.disabled = true;
  inputImage.disabled = true;
  inputMessage.disabled = true;

  if (
    !/\S/.test(inputMessage.value) && 
    showEditImage.getAttribute('src') == './assets/image-input.png'
  ) {
    editError(
      'Edit message cannot be empty or contain only whitespace text without an image'
    );
  } else if (inputImage.files[0]) {
    try {
      fileToDataUrl(inputImage.files[0])
      .then((imageData) => {
        editImageMsg(imageData, path, inputMessage, bodyP, img, editTime);
      });
    } catch (e) {
      closePopup('edit-message-popup');
      editError('Error', 'Provided file is not a png, jpg or jpeg image');
    }
  } else {
    if (
      (
        img.getAttribute('src') == './assets/image-input.png' && 
        inputMessage.value == bodyP.innerText &&
        showEditImage.getAttribute('src') == './assets/image-input.png'
      ) ||
      (
        img.getAttribute('src') != './assets/image-input.png' && 
        inputMessage.value == bodyP.innerText &&
        showEditImage.getAttribute('src') != './assets/image-input.png'
      )
    ) {
      editError('Cannot edit the same content (text and image) to a message');
    } else if (showEditImage.getAttribute('src') == './assets/image-input.png') {
      editTextMsg(path, inputMessage, '', bodyP, img, editTime);
    } else {
      editTextMsg(
        path, 
        inputMessage, 
        inputImage.getAttribute('src'), 
        bodyP, 
        img, 
        editTime
      );
    }
  }
}

// open a form modal for editing a message
const openEditMessage = (editTime, bodyP, img, message) => {
  const inputMessage = document.getElementById('edit-message-message');
  const inputImage = document.getElementById('edit-message-image-input');
  const showImage = document.getElementById('edit-message-image');
  const closeBtn = document.getElementById('close-edit-message-image');
  const submitWrapper = document.getElementById('edit-message-submit');
  const submitBtn = createElementClass(
    'button', 
    'btn btn-primary btn-block mt-4'
  );

  if (
    img.getAttribute('src') && 
    img.getAttribute('src') != './assets/image-input.png'
  ) {
    showImage.setAttribute('src', img.getAttribute('src'));
    closeBtn.style.display = 'block';
  } else {
    showImage.setAttribute('src', './assets/image-input.png');
    closeBtn.style.display = 'none';
  }

  clearChild('edit-message-submit');
  inputMessage.value = bodyP.innerText;
  submitBtn.innerText = 'Update message';
  submitBtn.addEventListener('click', () => {
    handleOfflineMode(() => {
      editMessage(editTime, bodyP, img, message);
    });
  });
  submitWrapper.appendChild(submitBtn);
  inputImage.disabled = false;
  inputMessage.disabled = false;
  inputImage.value = '';
  openFormPopup('edit-message-popup');
}

// react/unreact a message
const toggleReactMessage = (react, message) => {
  const reacted = react.firstChild.className.includes('btn-primary');
  const channelId = localStorage.getItem('channelId');
  const body = {
    react: react.firstChild.innerText,
  }
  let num = parseInt(react.lastChild.innerText);

  if (reacted) {
    fetchPost(`/message/unreact/${channelId}/${message.id}`, body)
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        num--;
        react.lastChild.innerText = num;
        if (num == 0) {
          react.lastChild.style.display = 'none';
        } else {
          react.lastChild.style.display = 'block';
          react.lastChild.style.color = 'black';
        }
        react.firstChild.setAttribute('class', 'btn px-2');
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  } else {
    fetchPost(`/message/react/${channelId}/${message.id}`, body)
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        num++;
        react.lastChild.innerText = num;
        if (num == 0) {
          react.lastChild.style.display = 'none';
        } else {
          react.lastChild.style.display = 'block';
          react.lastChild.style.color = 'white';
        }
        react.firstChild.setAttribute('class', 'btn btn-primary px-2');
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  }
}

// deleting a message
const deleteMessage = (element, message) => {
  fetchDelete(`/message/${localStorage.getItem('channelId')}/${message.id}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      openPopup('Success', 'Delete message');
      document.getElementById('message-list').removeChild(element);
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// pin/unpin a message
const togglePin = (pin, message) => {
  const pinned = pin.className.includes('fill');
  const channelId = localStorage.getItem('channelId');

  if (pinned) {
    fetchPost(`/message/unpin/${channelId}/${message.id}`, '')
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        pin.setAttribute('class', 'bi bi-pin-angle');
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  } else {
    fetchPost(`/message/pin/${channelId}/${message.id}`, '')
    .then((data) => {
      if (data.error) {
        openPopup('Error', data.error);
      } else {
        pin.setAttribute('class', 'bi bi-pin-angle-fill');
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
  }
}

// getting all messages in a channel
const loadAllMsg = (index, allMsg) => {
  return fetchGet(`/message/${localStorage.getItem('channelId')}?start=${index}`)
    .then((data) => {
      if (data.error) {
        return openPopup('Error', data.error);
      } else {
        const combinedMsg = [...allMsg, ...data.messages];

        if (data.messages.length == 25) {
          return loadAllMsg(index + 25, combinedMsg);
        }

        return combinedMsg;
      }
    })
    .catch(() => {
      alert('Cannot interact with backend');
    });
}

// open a photo modal displaying all photos in a channel in order
const loadGallery = (img, id) => {
  const slider = document.getElementById('photo-slider');
  const activeDiv = createElementClass('div', 'carousel-item active');
  const activeImg = createElementClass('img', 'd-block w-100');
  const title = document.getElementById('gallery-title');

  clearChild('photo-slider');
  title.innerText = 'Loading...'
  activeDiv.appendChild(activeImg);
  slider.appendChild(activeDiv);
  activeImg.setAttribute('src', './assets/image-input.png');
  openFormPopup('photo-message-popup');
  
  loadAllMsg(0, []).then((messages) => {
    clearChild('photo-slider');
    title.innerText = 'Gallery';

    messages.filter(message => message.image).forEach(message => {
      if (message.id != id) {
        const otherDiv = createElementClass('div', 'carousel-item');
        const otherImg = createElementClass('img', 'd-block w-100');
        otherDiv.appendChild(otherImg);
        slider.appendChild(otherDiv);
        otherImg.setAttribute('src', message.image);
      } else {
        activeDiv.appendChild(activeImg);
        slider.appendChild(activeDiv);
        activeImg.setAttribute('src', img.getAttribute('src'));
      }
    });
  });
}

// adding react emoji into a message block
const addEmojiReact = (reactWrapper, message) => {
  const allReact = [
    '❤',
    '🤣',
    '🤔',
  ];

  allReact.forEach((emoji) => {
    const react = createElementClass('button', 'btn px-2');
    const reactContainer = createElementClass(
      'div', 
      'position-relative d-flex justify-content-center align-content-center'
    );
    const reactCounter = createElementClass(
      'div', 
      'position-absolute bottom-0 end-0'
    );
    let countReact = 0;

    react.innerText = emoji;
    reactCounter.setAttribute('role', 'button');
    reactContainer.appendChild(react);
    reactContainer.appendChild(reactCounter);
    reactWrapper.appendChild(reactContainer);

    message.reacts.forEach(messageReact => {
      if (
        messageReact.react == emoji &&
        messageReact.user == localStorage.getItem('userId')
      ) {
        reactCounter.style.color = 'white';
        react.setAttribute('class', 'btn btn-primary px-2');
      }

      if (messageReact.react == emoji) {
        countReact++;
      }
    });

    reactCounter.innerText = countReact;
    if (countReact == 0) {
      reactCounter.style.display = 'none';
    } else {
      reactCounter.style.display = 'block';
    }

    reactContainer.addEventListener('click', () => {
      handleOfflineMode(() => {
        toggleReactMessage(reactContainer, message);
      });
    })
  });
}

// adding a pin button + edit/delete for sender in a message block
const addPinBinEdit = (rightWrapper, editTime, bodyP, img, message, li) => {
  const pinBtn = createElementClass('button', 'btn px-2');
  const binBtn = pinBtn.cloneNode(false);
  const editBtn = pinBtn.cloneNode(false);
  const pin = createElementClass('i', 'bi bi-pin-angle');
  const bin = createElementClass('i', 'bi bi-trash3');
  const edit = createElementClass('i', 'bi bi bi-pencil');

  pinBtn.appendChild(pin);
  binBtn.appendChild(bin);
  editBtn.appendChild(edit);
  rightWrapper.appendChild(pinBtn);

  pinBtn.addEventListener('click', () => {
    handleOfflineMode(() => {
      togglePin(pin, message);
    });
  });

  if (message.sender == localStorage.getItem('userId')) {
    rightWrapper.insertBefore(binBtn, rightWrapper.firstChild);
    binBtn.addEventListener('click', () => {
      handleOfflineMode(() => {
        deleteMessage(li, message);
      });
    });

    rightWrapper.insertBefore(editBtn, rightWrapper.firstChild);
    editBtn.addEventListener('click', () => {
      handleOfflineMode(() => {
        openEditMessage(editTime, bodyP, img, message);
      });
    })
  }

  if (message.pinned) {
    pin.setAttribute('class', 'bi bi-pin-angle-fill');
  }
}

// get a name and user profile of a sender of a message
const getSenderName = (message, headP, icon) => {
  fetchGet(`/user/${message.sender}`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      if (data.name.length > 7) {
        headP.innerText = data.name.slice(0, 7) + '..';
      } else {
        headP.innerText = data.name;
      }

      if (data.image) {
        icon.setAttribute('src', data.image);
      }
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// building a message block
const buildMessage = (message) => {
  const li = createElementClass('li', 'd-flex justify-content-between mb-3');
  const cardWrapper = createElementClass('div', 'card w-100 mx-3');
  const body = createElementClass('div', 'card-body gap-3');
  const headP = createElementClass('p', 'small fw-bold mb-0');
  const leftWrapper = createElementClass('div', 'd-flex gap-1');
  const rightWrapper = leftWrapper.cloneNode(false);
  const bodyP = createElementClass('p', 'small mb-0 text-break');
  const icon = createElementClass('img', 'rounded-circle align-self-start');
  const img = createElementClass('img', 'align-self-center img-thumbnail');
  const nameBtn = createElementClass('button', 'btn px-1');
  const reactWrapper = createElementClass('div', 'd-flex gap-1');
  const headTime = createElementClass(
    'p', 
    'small text-muted mb-0 align-self-center'
  );
  const head = createElementClass(
    'div', 
    'card-header d-flex justify-content-between p-1'
  );
  const foot = createElementClass(
    'div', 
    'card-header d-flex justify-content-between p-1 gap-2'
  );
  const editTime = createElementClass(
    'p', 
    'small text-muted mb-0 align-self-center me-1'
  );
  
  leftWrapper.appendChild(nameBtn);
  leftWrapper.appendChild(headTime);
  nameBtn.appendChild(headP);
  headP.innerText = 'Loading...';
  bodyP.innerText = message.message;
  headTime.innerText = isoConvertor(message.sentAt);
  icon.setAttribute('role', 'button');
  icon.setAttribute('src', './assets/user-icon.png');
  icon.setAttribute('width', '35');
  icon.setAttribute('height', '35');
  body.appendChild(bodyP);
  img.setAttribute('width', '50');
  img.setAttribute('src', './assets/image-input.png');
  img.setAttribute('role', 'button');
  img.style.display = 'none';
  body.appendChild(img);
  addPinBinEdit(rightWrapper, editTime, bodyP, img, message, li);
  head.appendChild(leftWrapper);
  head.appendChild(rightWrapper);
  li.appendChild(icon);
  cardWrapper.appendChild(head);
  cardWrapper.appendChild(body);
  cardWrapper.appendChild(foot);
  li.appendChild(cardWrapper);
  addEmojiReact(reactWrapper, message);
  foot.appendChild(reactWrapper);
  foot.appendChild(editTime);
  getSenderName(message, headP, icon);

  img.addEventListener('click', () => {
    handleOfflineMode(() => {
      loadGallery(img, message.id);
    });
  });

  nameBtn.addEventListener('click', () => {
    handleOfflineMode(() => {
      viewUserProfile(message.sender);
    });
  });

  icon.addEventListener('click', () => {
    handleOfflineMode(() => {
      viewUserProfile(message.sender);
    });
  });

  if (message.image) {
    img.setAttribute('src', message.image);  
    img.style.display = 'block';
  }

  if (message.editedAt) {
    editTime.innerText = 'last modified ' + isoConvertor(message.editedAt);
  }

  return li;
}

// fetch messsages and display them in order
export const renderMessage = (id) => {
  const list = document.getElementById('message-list');
  
  numMessage = 0;
  document.getElementById('message-input').disabled = false;
  document.getElementById('message-submit-btn').disabled = false;
  document.getElementById('message-image-input').disabled = false;
  list.insertBefore(buildMockMessage(), list.firstChild);

  fetchGet(`/message/${id}?start=0`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {      
      clearChild('message-list');

      localStorage.setItem('channelMessages', JSON.stringify(data.messages));
      data.messages.slice(0, 10).forEach(message => {
        numMessage++;
        list.insertBefore(buildMessage(message), list.firstChild);

        document.getElementById('channel-body').scrollTo({
          top: 100000,
          behavior: 'smooth',
        });
      });
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

// load more messages
export const getMoreMessage = () => {
  const list = document.getElementById('message-list');
  
  list.insertBefore(buildMockMessage(), list.firstChild);

  fetchGet(`/message/${localStorage.getItem('channelId')}?start=${numMessage}`)
  .then((data) => {
    if (data.error) {
      list.removeChild(list.firstChild);
      openPopup('Error', data.error);
    } else {
      list.removeChild(list.firstChild);

      data.messages.slice(0, 5).forEach(message => {
        list.insertBefore(buildMessage(message), list.firstChild);
        numMessage++;

        document.getElementById('channel-body').scrollTo({
          top: 650,
          behavior: 'smooth',
        });
      });
    }
  })
  .catch(() => {
    list.removeChild(list.firstChild);
    alert('Cannot interact with backend');
  });
}

// push new message
export const appendRecentMessage = (id) => {
  fetchGet(`/message/${id}?start=0`)
  .then((data) => {
    if (data.error) {
      openPopup('Error', data.error);
    } else {
      const list = document.getElementById('message-list');
      
      for (let i = 0; i < data.messages.length; i++) {
        if (data.messages[i].sender == localStorage.getItem('userId')) {
          list.removeChild(list.lastChild);
          list.appendChild(buildMessage(data.messages[i]));
          numMessage++;
          break;
        }
      }

      document.getElementById('channel-body').scrollTo({
        top: 1000000,
        behavior: 'smooth',
      });
    }
  })
  .catch(() => {
    alert('Cannot interact with backend');
  });
}

export const clearMessageForm = () => {
  document.getElementById('message-image-input').value = '';
  document.getElementById('message-input').value = '';
  document.getElementById('input-image')
    .setAttribute('src', './assets/image-input.png');
  document.getElementById('close-input-image').style.display = 'none';
}

// post new message and clear input form
const postMessage = (body) => {
  const list = document.getElementById('message-list');
  const channelId = localStorage.getItem('channelId');

  clearMessageForm();
  list.appendChild(buildMockMessage());

  document.getElementById('channel-body').scrollTo({
    top: 100000,
    behavior: 'smooth',
  });

  fetchPost(`/message/${channelId}`, body)
  .then((data) => {
    if (data.error) {
      list.removeChild(list.lastChild);
      openPopup('Error', data.error);
    } else {
      appendRecentMessage(channelId);
    }
  })
  .catch(() => {
    list.removeChild(list.lastChild);
    alert('Cannot interact with backend');
  });
}

// send a new message with conditions according to spec
export const sendMessage = () => {
  const message = document.getElementById('message-input').value;
  const imageInput = document.getElementById('message-image-input');
  let body;

  if (!((message && /\S/.test(message)) || imageInput.files[0])) {
    openPopup(
      'Error', 
      'Please enter your message (cannot be all whitespace)'
    );
  } else if (imageInput.files[0]) {
    try {
      fileToDataUrl(imageInput.files[0])
      .then(data => {
        body = {
          message: message,
          image: data,
        }
        postMessage(body);
      });
    } catch (e) {
      openPopup('Error', 'Provided file is not a png, jpg or jpeg image');
    }
  } else {
    body = {
      message: message,
      image: '',
    }
    postMessage(body);
  }
}

// display only pinned messages
const renderPinMessage = () => {
  const list = document.getElementById('message-list');
  numMessage = 0;

  clearChild('message-list');
  list.insertBefore(buildMockMessage(), list.firstChild);

  loadAllMsg(0, []).then((messages) => {
    clearChild('message-list');

    messages.filter(message => message.pinned).forEach((message) => {
      list.insertBefore(buildMessage(message), list.firstChild);

      document.getElementById('channel-body').scrollTo({
        top: 100000,
        behavior: 'smooth',
      });
    });
  });
}

// toggle a view pinned messages button
export const toggleViewPinMessage = () => {
  const viewPinMessageBtn = document.getElementById('view-pin-message-btn');
  const message = document.getElementById('message-input');
  const btn = document.getElementById('message-submit-btn');
  const image = document.getElementById('message-image-input');

  if (viewPinMessageBtn.className.includes('btn-primary')) {
    renderMessage(localStorage.getItem('channelId'));
    viewPinMessageBtn.setAttribute(
      'class', 
      'btn d-flex align-items-center gap-2'
    );
  } else {
    renderPinMessage();
    message.disabled = true;
    btn.disabled = true;
    image.disabled = true;
    viewPinMessageBtn.setAttribute(
      'class', 
      'btn d-flex align-items-center gap-2 text-white btn-primary'
    );
  }
}
