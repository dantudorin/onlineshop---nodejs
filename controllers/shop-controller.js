exports.getHomePage = (req, res, next) => {
    return res.status(200).render('home', {path : '/home'})
}