import { Server } from 'socket.io'
import express from 'express'
import http from 'http'

const app = express()
const server = new http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://process.env.URL'],
    methods: ['GET', 'POST']
  }
})
const userSocketMap = {}

export const getReceiverSocketId = (receiverId) => {
  // userSocketMap[receiverId]
  console.log(receiverId)
  const user = userSocketMap[receiverId];
  return user ? user.socketId : null;
}
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username;
  const profilePicture = socket.handshake.query.profilePicture;
  const isVerified = socket.handshake.query.isVerified;
  if (userId) {
    userSocketMap[userId] = {
      _id: userId,
      socketId: socket.id,
      username,
      profilePicture,
      isVerified,
      lastSeen: null
    };

    // userSocketMap[userId] = socket.id;
    console.log(`Connected \n UserId=${userId} \n SocketId=${socket.id}`)
  }

  io.emit('getOnlineUsers', Object.values(userSocketMap))

  socket.on('markMessagesAsSeen', async ({ otherUserId, mainUserId, message }) => {
    console.log('mm', otherUserId, mainUserId, message,message._id, 'mm')
    // await updateMessagesAsSeen(chatId, userId);
    const markMsgAsSeen = async () => {
      const apiUrl= process.env.URL;
      // const apiUrl = 'http://localhost:3000';
      let res;
      try {
        let req = await fetch(`${apiUrl}/api/v1/message/seen/${message._id}`, {
          method: 'POST',
          body: JSON.stringify({ mainUserId, otherUserId }),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });
        res = await req.json()
        console.log(res)

      } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
      }
      const receiverSocketId = getReceiverSocketId(otherUserId);
      if (receiverSocketId) {
        // const messageId = message._id
        socket.to(receiverSocketId).emit('singleMsgSeen', { otherUserId, mainUserId,message: message._id });
        console.log('emitted sms to',otherUserId,mainUserId,message._id)
      } else {
        console.log('Receiver socket not found');
      }
    }
    markMsgAsSeen()
    // console.log('single msg seen o',otherUserId)
    // console.log('single msg seen m',mainUserId)
    // console.log('single msg seen msg',messageId)
    // Emit to all users in the chat about the seen status
    // const receiverSocketId = getReceiverSocketId(otherUserId);
    // if (receiverSocketId) {
    //   socket.to(receiverSocketId).emit('singleMsgSeen', { otherUserId, mainUserId, messageId });
    // } else {
    //   console.log('Receiver socket not found');
    // }

    // io.to(getReceiverSocketId(otherUserId)).emit('singleMsgSeen', { otherUserId, mainUserId, messageId });
  });

  socket.on('disconnect', () => {
    if (userId) {
      // userSocketMap[userId].lastSeen = new Date()
      console.log(`Disconnected \n UserId=${userId} \n SocketId=${socket.id}`);

      const setLastSeen = async () => {
        const apiUrl= process.env.URL ;
        // const apiUrl = 'http://localhost:3000';
        let res;
        try {
          //   setLoading(true)
          let req = await fetch(`${apiUrl}/api/v1/user/setLastSeen`, {
            method: 'POST',
            body: JSON.stringify({ userId, lastSeen: new Date() }),
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
          });
          res = await req.text()
          console.log(res)

        } catch (error) {
          res = { success: false, message: 'Unable to connect with server' }
          console.log(error)
          //   showAlert(res)
        }

      }
      setLastSeen()

      // Optionally, emit the user's last seen status to clients
      // io.emit('userLastSeen');
      // io.emit('userLastSeen', {
      //     userId,
      //     lastSeen: userSocketMap[userId].lastSeen,
      // });

      delete userSocketMap[userId]
      console.log(`Disconnected \n UserId=${userId} \n SocketId=${socket.id}`)
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap))
  })
})

export { app, server, io };