
import { Hono } from "hono";
import {sign} from 'hono/jwt';
import { createPrismaClient } from "../db";

export const userRouter = new Hono<{
    Bindings: {
      //whatever variables you are using in your app, place them in binding
      DATABASE_URL: string;
      JWT_SECRET: string;
    },
    Variables: {
        userId: any;
        username: any;
    }
}>();



userRouter.post('/signup', async(c) =>{
    const body = await c.req.json();
    const prisma = createPrismaClient(c.env.DATABASE_URL);
      try{
        const user = await prisma.user.create({
          data:{
            username: body.username,
            password: body.password,
            email: body.email
          }
        })

        //jwt authentication with jwt secret
        const jwt = await sign ({
          id: user.id,
          username: user.username,
        }, c.env.JWT_SECRET)

      return c.text(jwt);
  
      }catch(e){

        const user = await prisma.user.findFirst({
          where: {
              username: body.username,
              password: body.password
          }
      })

      if(user){
        c.status(409);
        return c.text('user already exists');
      }

        c.status(411);
        return c.text('invalid activity')
      }

})

userRouter.post('/signin', async (c) => {
  const body = await c.req.json();
  const prisma = createPrismaClient(c.env.DATABASE_URL);
  try {
      // Find the user in the database
      const user = await prisma.user.findFirst({
          where:{ 
            AND: [
              { username: body.username},
              { password: body.password}
          ]
          }
      });

      if (!user) {
          c.status(403);
          return c.json({
              message: 'incorrect password or username'
          });
      }


      // Generate JWT token
      const jwt = await sign({
          id: user.id,
          username: user.username
      }, c.env.JWT_SECRET);

      // Return the token
      return c.json({
          token: jwt,
          message: 'Signin successful'
      });

  } catch (e) {
      console.error("Error in /signin route:", e);
      c.status(500);
      return c.json({
          message: 'Internal server error'
      });
  }
});




