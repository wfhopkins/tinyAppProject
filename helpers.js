// Functions for TinyApp
//
// Search users by email function
const getUserByEmail = function(email, users) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return null;
};

//Function used to generate unique 6 char userID
function generateRandomString() {
  let newID = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = characters.length;
  for (let i = 0; i < 6; i++) {
    newID += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return newID;
}

//return the urls associated with a user id
function urlsForUser(userID) {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}



module.exports = { getUserByEmail, generateRandomString, urlsForUser };


// Formula to create a random alphanum from lowercase + nums (2, 5) makes 3 digits, (2, 8) makes 6 etc
// const id = Math.random().toString(36).substring(2, 5);