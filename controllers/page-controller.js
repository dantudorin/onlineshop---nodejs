exports.serveRegisterEmail = (req, res, next) => { 
    let error = req.flash('error');
    let status = req.flash('status');

    if(error.length !== 0 && status.length !== 0) {
        return res.status(status[0]).render('register', {error : error});
    }

   return res.status(200).render('register', {error : null});
};

exports.serveLogin = (req, res, next) => {
     let message = req.flash('message');
     let status = req.flash('status');
     let error = req.flash('error');
     
     if(error.length !== 0 && status.length !== 0) {
         return res.status(status[0]).render('login', {error : error[0], message : null});
     }
     
     if(message.length !== 0 && status.length !== 0) {
         return res.status(status[0]).render('login', {error : null, message : message[0]});
     }

    return res.status(200).render('login', {message : null, error : null});
};

exports.serveForgotPassword = (req, res, next) => {
    let message = req.flash('message');
    let status = req.flash('status');
    let error = req.flash('error');
    
    if(error.length !== 0 && status.length !== 0) {
        return res.status(status[0]).render('reset-password', {error : error[0], message : null});
    }
    
    if(message.length !== 0 && status.length !== 0) {
        return res.status(status[0]).render('reset-password', {error : null, message : message[0]});
    }

    return res.status(200).render('reset-password', {error : null, message : null});
}
