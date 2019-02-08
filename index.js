const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./data/dbConfig')
const server = express();

server.use(express.json());
server.use(cors());

server.post('/api/register', (req,res)=>{
    const creds = req.body;  
    const hash = bcrypt.hashSync(creds.password, 14);
    
    creds.password = hash;

    db('users').insert(creds).then(ids =>{
        res.status(201).json(ids);
    }).catch(err=> json(err));
})

server.post('/api/login', (req,res)=>{
    const creds = req.body;
    db('users').where({ username: creds.username }).first().then(user =>{
        if(user && bcrypt.compare(creds.password, user.password)){
            res.status(201).json({message:'welcome'});
        }else{
            res.status(401).json({message:'you shall not pass!!'});
        }
    }).catch(err=> res.json(err))  
})

server.get('/api/users', (req,res) =>{
    db('users')
        .select('id', 'username', 'password')
        .then(users =>{
            res.json(users);
        })
        .catch(err=> res.send(err))
})


server.listen(3000, ()=> console.log('\nrunning on port 3000\n'));