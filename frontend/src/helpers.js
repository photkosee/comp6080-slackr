import { BACKEND_PORT } from './config.js';

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export const fileToDataUrl = (file) => {
  const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }
  
  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve,reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

// closing a modal with a given id
export const closePopup = (name) => {
  bootstrap.Modal.getInstance(document.getElementById(name)).hide();
  window.location.hash = '';
}

// open a modal with given title and detail
export const openPopup = (title, detail) => {
  const popup = new bootstrap.Modal(document.getElementById('popup'));
  const popup_title = document.getElementById('popup-title');
  const popup_detail = document.getElementById('popup-detail');

  if (title) {
    popup_title.textContent = title;
  }

  popup_detail.textContent = detail;
  popup.show();
}

// open a modal with a given id
export const openFormPopup = (name) => {
  new bootstrap.Modal(document.getElementById(name)).show();
}

// clear all children element of an element with a given id
export const clearChild = (parentName) => {
  const list = document.getElementById(parentName);
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

// fetching a POST method for non authentication with a given path and body
export const fetchPostNonAuth = (path, body) => {
  if (body) {
    return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then((response) => response.json());
  }

  return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
  })
  .then((response) => response.json());
}

// fetching a POST method for authentication with a given path and body
export const fetchPost = (path, body) => {
  if (body) {
    return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    })
    .then((response) => response.json());
  }

  return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  })
  .then((response) => response.json());
}

// fetching a GET method for authentication with a given path
export const fetchGet = (path) => {
  return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  })
  .then((response) => response.json());
}

// fetching a PUT method for authentication with a given path and a body
export const fetchPut = (path, body) => {
  return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  })
  .then((response) => response.json());
}

// fetching a DELETE method for authentication with a given path
export const fetchDelete = (path) => {
  return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  })
  .then((response) => response.json());
}

// fetching a GET method for authentication with a given path
// with no offline popup
export const fetchGetNoOffline = (path) => {
  return fetch(`http://localhost:${BACKEND_PORT}${path}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  })
  .then((response) => response.json());
}

// showing a page and hide the others
export const showPage = (name) => {
  for (const page of document.querySelectorAll('.page-block')) {
    page.style.display = 'none';
  }

  document.getElementById(`page-${name}`).style.display = 'block';
  if (name === 'dashboard') {
    document.getElementById(`page-${name}`).style.display = 'flex';
  }
}

// creating an element with given tag and class
export const createElementClass = (tagName, className) => {
  const e = document.createElement(tagName);
  e.setAttribute('class', className);

  return e;
}

// convert iso into a date object in a DD/MM/YY HH/MM format
export const isoConvertor = (iso) => {
  const time = new Date(iso);
  const date = time.getDate().toString().padStart(2, '0');
  const month = time.getMonth().toString().padStart(2, '0');
  const year = time.getFullYear();
  const hour = time.getHours();
  const min = time.getMinutes().toString().padStart(2, '0');

  return `${date}/${month}/${year} ${hour}:${min}`
}

// create a loading spinner element
export const createLoading = () => {
  const load = createElementClass('div', 'spinner-border');
  load.setAttribute('role', 'status');

  return load;
}

// popup an error modal for any interaction during offline access
export const handleOfflineMode = (callback) => {
  if (!navigator.onLine) {
    openPopup('Offline', 'Cannot interact without internet connection');
  } else {
    callback();
  }
}
