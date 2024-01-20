const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const path = require('path');

const app = express();
const PORT = '3001';
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

const db = mysql.createConnection({
    user: process.env.user,
    host: process.env.host,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
});

app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/" + "index.css");
  });

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/api/post', async (req, res) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM post", (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        res.send(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/post/category=:id', async (req, res) => {
    const categoryId = req.params.id;
  
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM post WHERE category_id = ?", [categoryId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
  
      res.send(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/api/category', async (req, res) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM category", (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        res.send(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/upload', async (req, res) => {
    // Handle the upload logic here
    console.log('Received a POST request to /api/upload');
    console.log(req.body);

    try {
        const postData = req.body; // Extract data from the request body
        const insertQuery = 'INSERT INTO post (post_title, post_desc, post_article, post_feedback, post_date, post_author, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)';

        // Execute the SQL query with the extracted data
        db.query(insertQuery, [postData.title, postData.description, postData.content,0, postData.date, postData.author, postData.category], (error, result) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('Data inserted successfully');
                res.status(200).json({ message: 'Upload successful' });
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/user/register', async (req, res) => {
    // Handle the upload logic here
    console.log('Received a POST request to /api/user/register');
    console.log(req.body);

    try {
        const userData = req.body; // Extract data from the request body
        const insertQuery = 'INSERT INTO user (username, password, email, birth, role) VALUES (?, ?, ?, ?, ?)';

        const hashedPassword = bcrypt.hashSync(userData.password, 10);
        db.query(insertQuery, [userData.username, hashedPassword, userData.email, userData.birth, userData.role], (error, result) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('Data inserted successfully');
                res.status(200).json({ message: 'Upload successful' });
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/user/login', async (req, res) => {
    console.log('Received a POST request to /api/user/login');
    console.log(req.body);

    try {
        const { username, password } = req.body;
        const user = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM user WHERE username = ?", [username], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });

        if (!user) {
            res.status(401).json({ message: 'Authentication failed. User not found.' });
            return;
        }

        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            res.status(401).json({ message: 'Authentication failed. Invalid password.' });
            return;
        }

        // If authentication is successful, include user data in the response
        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                birth: user.birth,
                role: user.role,
                // Include other relevant user information
            }
        });
        console.log('Authentication successful');

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => console.log("Server is running on port: " + PORT))
module.exports = app;