const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const config = require('../Config/config.js');
const User = require('../_models/user.model');
const bcrypt = require('bcryptjs');

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
 
  
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   
  //jwtFromRequest:ExtractJwt.fromAuthHeaderWithScheme('Authorization'),
  //jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.JWT_SECRET
}, async (payload, done) => {
  try {
    // Find the user specified in token
// const user = await User.findById(payload.sub);
   

const user = await User.findOne({_id:payload.sub});
   
    // If user doesn't exists, handle it
    if (!user) {
      console.log('from Jwt passport user not found'); 

      return done(null, false);
    }
    console.log('from Jwt passport'+user); 
    // Otherwise, return the user
    //req.user = user;
    return done(null, user);
  } catch(error) {
   return done(error, false);
  }
}));

//Google OAuth Strategy
passport.use('google-token', new GooglePlusTokenStrategy({
  clientID: config.oauth.google.clientID,
  clientSecret: config.oauth.google.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Should have full user profile over here
    console.log('profile', profile);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);

    const existingUser = await User.findOne({ "google.id": profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      method: 'google',
      email: profile.emails[0].value,
      fullname: profile.displayName
   
      ,
      google: {
        id: profile.id,
        // email: profile.emails[0].value
      }
    });

    await newUser.save();
    done(null, newUser);
  } catch(error) {
    done(error, false, error.message);
  }
}));

passport.use('facebook-token',new FacebookTokenStrategy({
  clientID: config.oauth.facebook.clientID,
  clientSecret: config.oauth.facebook.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('profile', profile);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    
    const existingUser = await User.findOne({ "facebook.id": profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      method: 'facebook',
      email: profile.emails[0].value,
      fullname: profile.displayName,
      facebook: {
        id: profile.id,
        // email: profile.emails[0].value
      }
    });

    await newUser.save();
    console.log(   `from the Passport ${newUser}`)
    done(null, newUser);
  } catch(error) {
    console.log(error);
    done(error, false, error.message);
  }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    // Find the user given the email
    const user = await User.findOne({  "email": email });
console.log('from passport'+user)    
    // If not, handle it
    if (!user) {
      return done(null, false);
    }

    // Check if the password is correct
    // const isMatch = await user.isValidPassword(password);
     const passwordMatch= bcrypt.compareSync(password, user.local.password);
     if (!passwordMatch) {
      return done(null, false);
    }
    done(null, user);

    // if (user && bcrypt.compareSync(password, user.local.password)) {
    // //  return the user
    // done(null, user);
    // }else {
    //   return done(null, false);
    
  
  
    
     } 
     catch(error) 
     {
    done(error, false);
  }
}));
module.exports = passport;
