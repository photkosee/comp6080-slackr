import { fetchGet, fetchGetNoOffline } from './helpers.js';

// creating a notice
const notice = (channelName, msg) => {
  const notification = new Notification(
    `Slackr: New message in ${channelName}`,
    {
      body: msg,
    }
  );
}

// check permission then send a notice
const sendNotice = (channelName, msg) => {
  if (Notification.permission == 'granted') {
    notice(channelName, msg);
  } else {
    Notification.requestPermission().then(permission => {
      if (permission == 'granted') {
        notice(channelName, msg);
      }
    });
  }
}

// check if a message is old
const isOldMsg = (data, id) => {
  if (data) {
    data.messages.forEach((message) => {
      if (message.id == id) {
        return true;
      }
    });
  }

  return false;
}

// check if there is a message
const checkMsg = (data) => {
  return (data.messages[0] != undefined) && (data.messages[0].id != undefined);
}

// check if a message is from authorized user
const checkSender = (data) => {
  return data.messages[0].sender == localStorage.getItem('userId');
}

// check if it's an image or message
const checkImg = (data, channelName) => {
  if (data.messages[0].message) {
    sendNotice(channelName, data.messages[0].message);
  } else {
    sendNotice(channelName, 'new image message');
  }
}

// create a poll closure for fetching data to check whether there is a new message
export const createPoll = (channelId, channelName) => {
  let preData = null;
  let poller = null;

  const fetchData = () => {
    if (navigator.onLine) {
      fetchGetNoOffline(`/message/${channelId}?start=0`)
      .then((data) => {
        if (!data.error) {
          if (
              (
                !preData && 
                checkMsg(data) &&
                !checkSender(data)
              ) ||
              (
                checkMsg(preData) &&
                checkMsg(data) &&
                data.messages[0].id != preData.messages[0].id &&
                !isOldMsg(preData, data.messages[0].id) &&
                !checkSender(data)
              )
          ) {
            checkImg(data, channelName);
          }
          preData = data;
        } else {
          clearInterval(poller);
        }
      })
      .catch(() => {
        clearInterval(poller);
      });
    }
  }

  return {
    init() {
      fetchGet(`/message/${channelId}?start=0`)
      .then((data) => {
        if (!data.error) {
          preData = data;
        }
      });
    },
  
    polling() {
      poller = setInterval(fetchData, 2000);
    },

    stop() {
      clearInterval(poller);
    },
  };
}