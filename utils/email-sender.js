const nodemailer = require('nodemailer');

exports.sendEmail = (reciever) => {
    let transporter = nodemailer.createTransport({
        host : "smtp.gmail.com",
        port : 465,
        secure : true,

        auth : {
            user : 'youremailhere',
            pass : 'yourpasswordhere'
            }
    });
    transporter.sendMail({

                    from : 'Register CodingFuel',
                    to : reciever,
                    subject : 'Confirm email for registration',
                    text : 'Ti-am trimis un mail bossule',
                    html : `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <!-- Latest compiled and minified CSS -->
                    <link rel="stylesheet" 				href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
                    
                    <!-- jQuery library -->
                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
                    
                    <!-- Latest compiled JavaScript -->
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
                    </head>
                    <body>
                    
                    <h1 class="text-center text-info">We are glad that you have chosen us</h1>
                    <p class="text-center text-info">To proceed with registration please access the link below</p>
                    <hr>
                       <div class="border border-light p-3 mb-4">
                    
                            <div class="text-center">
                              <button type="button" class="btn btn-lg btn-warning" href= "#">Register</button>
                         </div>
                    
                      </div>
                    <hr>
                    <p class="text-left text-info">&nbsp Thank you,</p>
                    <p class="text-left text-info">&nbsp Team Codingfuel.</p>
                    </body>
                    </html>
                    
                    `  
        
                })
                .then(succss => {
                    console.log(succss);
                })    
                .catch(error => {
                    console.log(error);
                })
};