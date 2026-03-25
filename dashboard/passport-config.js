const localStrategy = require('passport-local').Strategy;

module.exports = function (Passport, db, bcrypt, sessionStore) {
Passport.serializeUser((user, done) => {
done(null, user.email);
});

Passport.deserializeUser(async (email, done) => {  
    try {  
        const user = await db.get(email);  
        done(null, user);  
    } catch (err) {  
        done(err, null);  
    }  
});  

Passport.use(new localStrategy({  
    usernameField: "email",         
    passwordField: "password",  
    passReqToCallback: true  
}, async function (req, email, password, done) {  
    try {  
        const user = await db.get(email);  
        if (!user)  
            return done(null, false, { message: "Email không tồn tại" });  

        const isMatch = await bcrypt.compare(password, user.password);  
        if (!isMatch)  
            return done(null, false, { message: "Địa chỉ email hoặc mật khẩu không đúng" });  

        const remember = req.body.remember || req.body.remember_me;  
          
        if (remember) {  
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;  
            req.session.cookie.expires = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));  
        } else {  
            req.session.cookie.maxAge = null;  
            req.session.cookie.expires = null;  
        }  

        return done(null, user);  
    } catch (err) {  
        return done(err);  
    }  
}));

};
