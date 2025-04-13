const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  // Salt rounds: 10 adalah nilai yang umum digunakan, semakin tinggi semakin aman tapi juga semakin lambat
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

module.exports = { hashPassword };