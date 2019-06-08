/* Entry point for server */

const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const https_opt = {
  key: fs.readFileSync(__dirname + `/certs/key.pem`),
  cert: fs.readFileSync(__dirname + `/certs/cert.pem`)
};
const https = require('https').Server(https_opt, app);
const body_parser = require('body-parser');
const session = require('express-session');
const sk_io = require('socket.io')(https);
const usr_auth = require('./auth_processor');
const port_num = 8000;

let auth_users_array = [];
let logged_user = {
  auth: false,
  socket_id: "",
  usr_email: "<email@email.com>",
  f_name: "Unknown",
  l_name: "Unknown"
};

let current_usr_email;

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.use(session({
  secret: 'coolness',
  saveUninitialized: true,
  resave: false
}));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/login');
});
app.post('/login', (req, res) => {

  // Call usr_auth module to handle auth: method returns an object
  logged_user = usr_auth.authenticate(req.body.email_input, req.body.password_input);

  if (logged_user.auth) {

    // Push logged_user into an array
    auth_users_array.push(logged_user);

    // Dump auth. user data into the session
    req.session.email = logged_user.usr_email;
    
    //Get email of current logged-in user from session
    current_usr_email = req.session.email;
    res.redirect('/chat');
  }
  else {
    
    // Handle error login here (send res with error)
    res.status(401).send();
  }
});
app.get('/login', (req, res) => {

  if (req.session.email) {
    res.redirect('/chat');
  }
  else {
    res.sendFile(path.join(__dirname + '/views/login/index.html'));
  }
});
app.get('/chat', (req, res) => {

  if (req.session.email) {
    current_usr_email = req.session.email;
    
    // Send the index file for the /chat route
    res.sendFile(path.join(__dirname + '/views/chat/index.html'));
  }
  else {
    res.redirect('/login');
  }
});

app.post('/chat', (req, res) => {

  // Get email from session before destroying the session
  let wtfe = req.session.email;

  req.session.destroy((error) => {
    if (!error) {

      // Delete user who is disconnecting from the user array
      for (let j = 0; j < auth_users_array.length; j++) {

        if (auth_users_array[j].usr_email == wtfe) {
          auth_users_array.splice(j, 1);
        }
      }

      res.redirect("/login");

    } else {
      console.log(error);
    }
  });
});

https.listen(port_num, () => {
  console.log(`listening on port: ${port_num}`);
});

https.on('error', (err) => {
  console.log(`Can't connect to port: ${port_num} because: ${err}`);
});

/******************************* socket-io ***********************************/

sk_io.on('connection', (socket) => {

  let usr_name;
  
  // Loop through all connected user array and check who is sending the msg
  for (let i = 0; i < auth_users_array.length; i++) {
    if (auth_users_array[i].usr_email == current_usr_email) {
      usr_name = auth_users_array[i].f_name + " " + auth_users_array[i].l_name;
    }
  }
  // If user is unauthenticated force-redirect to login - this is useful when 
  // the server has been restarted and the user is on the chat page
  if (logged_user.auth == false) {

    // Emit redirect
    socket.to('chat').emit('force_redirect');
    socket.emit('force_redirect');
  }
  else {
    
    // Add socket to a room
    socket.join('chat', (err) => {
      if (err) {
        console.log(err);
      }
      else {

        // Emit a 'login' message to others and to self
        socket.to('chat').emit('login', (auth_users_array));
        socket.emit('login', auth_users_array);
      }
    });
  }
  
  // Chat message sending
  socket.on('msg', (data) => {
    let time = new Date();
    let formatted_time = time.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric', hour12: true
    });

    // Emit to room
    socket.to('chat').emit('msg', {
      "date_stamp": formatted_time,
      "name": usr_name,
      "text_msg": data
    });

    // Emit to self
    socket.emit('msg', {
      "date_stamp": formatted_time,
      "name": usr_name,
      "text_msg": data
    });
  });
  
  socket.on('disconnect', (reason) => {
    socket.disconnect(true);

    socket.to('chat').emit('logout', auth_users_array);
    socket.emit('logout', auth_users_array);
  });
});

/*****************************************************************************/