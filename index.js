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

app.listen(PORT, () => console.log("Server is running on port: " + PORT))
module.exports = app;