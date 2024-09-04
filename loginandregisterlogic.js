const express = require('express');
const mongoose = require('mongoose');
const connectiontoDB = require('./connectiontoDB');
connectiontoDB();

const app = express();
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

const userSchema = mongoose.Schema({
  fullname: String,
  username: String,
  email: String,
  password: String,
  cnfpassword: String,
});

const User = mongoose.model('User', userSchema);

const loginandregisterlogic = () => {
  app.post('/saveuser', async (req, res) => {
    const { fullname, username, email, password, cnfpassword } = req.body;
    
    try {
      // Check if username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      
      if (existingUser) {
        if (existingUser.username === username) {
          return res.send(`
            <script>
              alert('We already have a user with the same username. Please choose another username.');
              window.location.href = "/";
            </script>
          `);
        }
        if (existingUser.email === email) {
          return res.send(`
            <script>
              alert('We already have a user with the same email. Please choose another email.');
              window.location.href = "/";
            </script>
          `);
        }
      }
      
      // Check if passwords match
      if (password !== cnfpassword) {
        return res.send(`
          <script>
            alert("Passwords don't match. Please try again.");
            window.location.href = "/";
          </script>
        `);
      }
      
      // If no issues, create the new user
      const newUser = new User({ fullname, username, email, password });
      await newUser.save();
      
      return res.send(`
        <script>
          alert("User registered successfully!");
          window.location.href = "/";
        </script>
      `);
      
    } catch (err) {
      console.log(err);
      return res.send(`
        <script>
          alert("Internal Server Error. Please try again later.");
          window.location.href = "/";
        </script>
      `);
    }
  });
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
      // Find user by username
      const user = await User.findOne({ username });
      
      if (!user) {
        return res.send(`
          <script>
            alert("User does not exist with the given credentials");
            window.location.href = "/login";
          </script>
        `);
      }
      
      // Check if the password matches
      if (user.password === password) {
        return res.send(`
          <script>
            alert("You are logged in");
            window.location.href = "/";
          </script>
        `);
      } else {
        return res.send(`
          <script>
            alert("Invalid password");
            window.location.href = "/login";
          </script>
        `);
      }
    } catch (error) {
      console.error(error);
      return res.send(`
        <script>
          alert("An error occurred. Please try again later.");
          window.location.href = "/login";
        </script>
      `);
    }
  });
};

loginandregisterlogic();
