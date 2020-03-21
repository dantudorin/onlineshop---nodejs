exports.serveRegisterEmail = (req, res, next) => {
    res.status(200).render('register', {message : null});
};