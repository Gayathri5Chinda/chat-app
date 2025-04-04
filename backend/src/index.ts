import {  MessageRouter } from './routes/message';
import { userRouter } from './routes/user';
import { cors } from 'hono/cors';
import { Hono } from "hono";


const app = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    };
  }>();


app.use('/*',cors());
app.route("/api/v1/user", userRouter);
app.route("/api/v1/message", MessageRouter);




export default app

/*app.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
      return c.text('Expected WebSocket', 426);
  }

  const [client, server] = Object.values(new WebSocketPair());
  server.accept();

  server.addEventListener('message', (event) => {
      console.log('Message received:', event.data);
      server.send(`Echo: ${event.data}`);
  });

  return new Response(null, { status: 101, webSocket: client });
});
*/

