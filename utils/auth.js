module.exports = (req, res, next) => {
    if(req.session.userId) {
        next();
    } else {
        return res.status(400).redirect('login');
    }
}