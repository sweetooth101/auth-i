const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const db = require('./data/dbConfig')
const server = express();


const sessionConfig = {
     secret: 'something-brings-a-monster.?', // defaults to connect.sid
     name: 'sweetooth',
     httpOnly: true,//js cant touch
     resave: false,
     saveUnintialized: false,//laws
     cookie:{
         secure: false,//prod = true dev= false
         maxAge: 1000 * 60 * 1, //24 * 60 * 60 * 1000  24 hours
     },
 };
server.use(session(sessionConfig))
server.use(express.json());
server.use(cors());

server.post('/api/register', (req,res)=>{
    const creds = req.body;  
    const hash = bcrypt.hashSync(creds.password, 14);
    
    creds.password = hash; 

    db('users').insert(creds).then(ids =>{
        const id = ids[0]
        req.session.username = id;
        res.status(201).json({newUserId: id});
    }).catch(err=> json(err));
})

server.post('/api/login', (req,res)=>{
    const creds = req.body;
    db('users').where({ username: creds.username }).first().then(user =>{
        if(user && bcrypt.compare(creds.password, user.password)){
            req.session.UserId = user.id;
            res.status(201).json({message:`welcome ${user.username}`});
        }else{
            res.status(401).json({message:'you shall not pass!!'});
        }
    }).catch(err=> res.json(err))  
})




server.get('/api/users', protected, (req,res) =>{
        db('users')
            .select('id', 'username', 'password')
            .then(users =>{
                res.json(users);
        })
        .catch(err=> res.send(err));
});


server.get('/api/logout', (req, res) =>{
    if(req.session){
        req.session.destroy(err=>{
            if(err){
                res.send("You can't leave")
            } else {
                res.send('good bye')
            }
        })
    }
})

//middleware for protection

function protected(req, res, next){
    if (req.session && req.session.username){
        next()
    } else {
        res.status(401).json({ message: 'You shall not pass, not authenticated.'})
    }
}

server.listen(3000, ()=> console.log('\nrunning on port 3000\n'));