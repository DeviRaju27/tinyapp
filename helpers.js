const getUserByEmail = (email, database) => {
  for (const user in database) {
    const userFromDb = database[user];

    if (userFromDb.email === email) {
      return userFromDb;
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  const userUrls = {};
  for (let item in database) {
    if (database[item].userID === id) {
      userUrls[item] = database[item];
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail , urlsForUser }