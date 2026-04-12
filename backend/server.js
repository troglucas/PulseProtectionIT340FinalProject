const express = require('express');
const mongoose = require('mongoose'); /*MangoDB server*/
const app = express();




/* For the MangoDB server*/


const DB_IP = 'ip add here '; 
const DB_NAME = 'dp name';

mongoose.connect(`mongodb://${DB_IP}:27017/${DB_NAME}`)
  .then(() => console.log('Connected to Database VM successfully'))
  .catch(err => console.error('Database connection failed:', err));


app.get('/', (req, res) => { 
       res.send('Hello World from MEAN Stack!');
    }); 

app.listen(port, () => { 
       console.log(`Server running on port ${port}`);
    });

