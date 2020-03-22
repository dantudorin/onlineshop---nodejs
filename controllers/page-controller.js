exports.serveRegisterEmail = (req, res, next) => {
    res.status(200).render('register', {message : null});
};

exports.serveLogin = (req, res, next) => {
    res.status(200).render('login', {message : null});
};