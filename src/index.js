const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {generateLocation} = require('./utils/messages')
const {addUser,getUser,removeUser,getUsersInRoom} = require('./utils/users')

const port = process.env.PORT || 3000

const server = app.listen(port,() =>{
  console.log(`Server is turned on ${port}!`)
})

socketio.listen(server);
const io = socketio(server)


app.use(express.static(path.join(__dirname, '../public')))
app.set('view engine' ,'html')


io.on('connection',(socket) => {
  console.log('New websocket connection')

  socket.on('Join',({username,room},callback) =>{
    //add
    const {error,user} = addUser({id: socket.id,username,room})

    if(error)
    return callback(error)

    socket.join(user.room)
    socket.emit('message',generateMessage('Admin','Welcome'))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username}  has joined`))
    io.to(user.room).emit('roomData',{
      room:user.room,
      users: getUsersInRoom(user.room)
    })
    callback()
  })


  socket.on('sendMessage', (message,callback) =>{
   
    const filter = new Filter()
    
    if(filter.isProfane(message))
    return callback('Profanity will not be entertained da bois')


    const user = getUser(socket.id)

     io.to(user.room).emit('message',generateMessage(user.username,message))
    callback('Message has been delivered!')
     
  })

  socket.on('disconnect', () =>{
    //remove
    const user = removeUser(socket.id)

    if(user)
    {
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
      io.to(user.room).emit('roomData',{
        room:user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  socket.on('sendLocation', (latitude,longitude,callback) =>{
    const user = getUser(socket.id)
    callback('Location Shared !')
    const url = "https://google.com/maps?q="+latitude+","+longitude
    io.to(user.room).emit('locationMessage',generateLocation(user.username,url))
  })
})


app.get('',(req,res) =>{
    res.render('index.html')
  })


