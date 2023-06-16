// Functions for TinyApp
//
// Search users by email function 
const getUserByEmail = function(email, users) {
  for (const userID in users) {
    if(users[userID].email === email) {
      return userID;
    }
  }
  return null;
}


module.exports = { getUserByEmail };
