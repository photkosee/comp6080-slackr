## More functionalities on milstones

### 2.2.2 Creating a new channel
- Channel name cannot be an empty string or only whitespace.

### 2.2.3 Viewing and editing channel details
- Cannot edit channel name into an empty string or only whitespace.
- Note that the privacy detail of a channel when viewing channel info is in the form of checkbox (I like it this way, if there's no blue tick then it is public).

### 2.3.1 Viewing channel messages
- Having a skeleton message while waiting for fetched data.

### 2.3.3 Sending messages
- Enable user to see the uploaded image before sending and be able to cancel it.
- Having a skeleton message while waiting for fetched data.

### 2.3.5 Editing messages
- Cannot edit a message into an empty message.
- Don't re-render the whole message body, but only update the specific message that has been edited/delete/pinned for better UX.

### 2.3.6 Reacting to messages
- Change background color when an authorized user reacted, and counting the number of users reating to that react.
- When no one has reacted, that reaction count is invisible, only be visible when the count is more than 0.

### 2.3.7 Pinning messages
- Fill color in the pin icon indicating the message is pinned when a user pins a message, the opposite otherwise.
- Do not allow user to send a new message while in a viewing pinned page

### 2.4.1 Inviting users to a channel
- Let the user know that it is loading if it's waiting for a fetched data, also disable the submit button.
- Not allowing a user to invite when all users are alreadt a member of the channel.
- Scrollable list in case there are many names.

### 2.4.2 Viewing and editing user's own profile
- Enable a user to see the uploaded profile before submiting.
- Having a skeleton user profile while the profile is pending.
- Note that I intentionally allowing user to put his same current email when editing (but I wouldn't pop an error and not passing that to backend, more work filtering/varidating with frontend itself) for better UX since I'm showing all current information when open the editing modal (again, for better UX). But if you want to test backend error popup for this case, you can try putting other users' email when editing.

### 2.5.2 Viewing photos in channels
- Displaying them in order https://edstem.org/au/courses/13869/discussion/1650479

### 2.6.1 Infinite Scroll
- Implemented in the way like any other messaging applicaitions for better UX (most recent message at the bottom and scroll up to load more old messages).

### 2.6.2 Push notifications
- Let the user know the content of the message, and from what channel
- Notification also working when a user join a new channel or leave (wouldn't get any more notification) without needing to refresh the page.

### 2.6.2 Push notifications
- Let the user know the content of the message, and from what channel

### 2.7.1 Offline access
- Use cached channel details to show channel details without backend connection when clicking an info button.

### 2.7.2 Fragment based URL routing
- Popup an error for an invalid id

## Extra functionalities
- Good looking UI
- Logout
- Having skeleton element, disable buttons and messages indicating when loading or updating information for most of the features
- Having modals as a popup to indicate when a user succesfully/fail and confirm to do anything
- Scrollable side nav bar when having many channels
- Allow user to set a 1 minute alarm that'll alert after 1 minute
- Extra validation (cannot have an empty names/email or containing only whitespace)
- Offlinemode: If you change to offline when inspecting, interacting with anything will popup a spectific error modal for offline access (this is what I did as an offline access but it was not meant to work like I implemented using navigator.onLine to check internet connection, so I'll leave it as a bonus feature).
- Hybrid message (allowing a message to have both image and text). Can't edit the same text and image (same content) into a message and cannot edit an message to be empty (no text or image).
- clear form's inputs for something that shouldn't hold old informations like create a new channel form. But display old information on such forms as edit messages or edit user/channel details when open the forms for better UX.

## Sidenote for 2.7.1 Offline access
 Interacting on the browser without backend connection will popup an error, but it's going to take sometime after each interaction since it needs to wait to catch an error on fetching data. The error could stack up if you keep interacting, which is why I use an alert rather than an error popup, the screen would be freezed with multiple modal stacking up. Can still see the channel's details by clicking the info button using data cached in localStorage.