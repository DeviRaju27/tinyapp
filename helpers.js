const getUserByEmail = (email, database) => {
  for (const user in database) {
    const userFromDb = database[user];

    if (userFromDb.email === email) {
      return userFromDb;
    }
  }
  return undefined;
};

module.exports = { getUserByEmail }