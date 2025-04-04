
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createPrismaClient } from "../db";

export const MessageRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    },
    Variables: {
        userId: any;
        username: any;
    }
}>();

const activeConnections: Map<string, WebSocket> = new Map();

// Store active WebSocket connections
//const activeConnections: Map<string, WebSocket> = new Map();
// Replace the in-memory map with KV binding


MessageRouter.use("/*", async(c, next) => {
//middleware is the place where you extract the jwt token from user 
// and extract user id from it and pass it down to the route handler
    const authHeader = c.req.header('Authorization');
    if(!authHeader){
        c.status(403);
        return c.text('Unauthorized');
    }
    //verify if jwt is correct
    try {
        // Verify the JWT token
        const user = await verify(authHeader, c.env.JWT_SECRET);

        // Log the decoded payload
        console.log("Decoded JWT payload:", user);

        // Ensure userId and username are set
        if (!user.id || !user.username) {
            throw new Error("Invalid JWT payload: Missing userId or username");
        }

        c.set("userId", user.id);
        c.set("username", user.username);

        // Proceed to the next route
        await next();
    } catch (error) {
        console.error("JWT verification failed:", error);
        c.status(403);
        return c.json({ message: "You are not logged in" });
    }
     
});

MessageRouter.get('/main', async(c)=> {
    //get the user id
    const userId = c.get("userId");
    const prisma = createPrismaClient(c.env.DATABASE_URL);
      try{
        //db query
        const users = await prisma.user.findMany({
            select: {
                username: true
            },
            where: {
                id: {not: userId}
            }
        })
        console.log(userId);
        return c.json({
            users
        })

      }catch(e){
        c.status(411);
        return c.text('invalid activity')
      }
    });
    

MessageRouter.get('/getMessage', async(c) => {
        const userId = await c.get("userId");
        const userName = c.get("username");
        const prisma = createPrismaClient(c.env.DATABASE_URL);
        try{
            
            const messages = await prisma.message.findMany({
                where:{
                    OR: [
                        { senderId: userName},
                        { receiverId: userName}
                    ]
                  }
            })
    
            return c.json({
                messages
            })
    
        }catch(e){
            c.status(411);
            return c.text('invalid activity')
        }
})

MessageRouter.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected WebSocket', 426);
  }

  const userId = c.get("userId");
  const userName = c.get("username");
  const [client, server] = Object.values(new WebSocketPair());
  server.accept();
  
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  
  // Retrieve existing connection from KV
  if (activeConnections.has(userName)) {
    console.log(`User with userName: ${userName} is already connected. Closing the previous connection.`);
    const existingSocket = activeConnections.get(userName);
    existingSocket?.close();
  }

  // Store the WebSocket connection in KV
  activeConnections.set(userName, server);

  server.addEventListener('message', async (event) => {
    const { receiverId, content, receiver } = JSON.parse(event.data);

    if (!receiverId || !content) {
      console.error('Invalid message format:', event.data);
      server.send(JSON.stringify({error:'Invalid message format', type:'error'}));
      return;
    }

    // Save the message to the database
    try {
      // Create message in database
      await prisma.message.create({
        data: {
          senderId: userName,
          receiverId: receiver,
          text: content,
        },
      });

      // Send message to receiver
      const receiverSocket = activeConnections.get(receiver); // Replace with actual WebSocket retrieval logic
      if (!receiverSocket) {
        console.log(`Recipient with userId: ${receiverId} is not connected.`);
        server.send(JSON.stringify({ 
          error: `User ${receiverId} is not connected.`,
          type: 'error'
        }));
        return;
      }
      
      // Send message to receiver
      receiverSocket.send(JSON.stringify({
        senderId: userId,
        content: content,
        type: 'message'
      }));

    } catch (e) {
      console.error('Error saving message:', e);
      server.send(JSON.stringify({ 
        error: 'Failed to send message',
        type: 'error'
      }));
    }
  });

  server.addEventListener('close', async () => {
    console.log(`Connection closed for userId: ${userId}`);
    await activeConnections.delete(userName); // Remove connection from KV
    console.log("Active connections:", Array.from(activeConnections.keys()));
  });

  return new Response(null,{status: 101, webSocket: client});
});

