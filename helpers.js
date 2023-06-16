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


module.exports = { getUserByEmail };


// Formula to create a random alphanum from lowercase + nums (2, 5) makes 3 digits, (2, 8) makes 6 etc
// const id = Math.random().toString(36).substring(2, 5);