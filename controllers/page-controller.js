exports.serveRegisterEmail = (req, res, next) => { 
    let message = req.flash('message');
    let status = req.flash('status');

    if(message.length !== 0 && status.length !== 0) {
        return res.status(status[0]).render('register', { message : message[0]});
    }
   return res.status(200).render('register', {message : null});
};

exports.serveLogin = (req, res, next) => {
     let message = req.flash('message');
     let status = req.flash('status');

     if(message.length !== 0 && status.length !== 0) {
         return res.status(status[0]).render('login', { message : message[0]});
     }
    return res.status(200).render('login', {message : null});
};