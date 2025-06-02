const path = require('path');

exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
};

exports.getPortfolioPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'visualiser.html'));
};
