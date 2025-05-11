import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validation/add-friend";
import { getServerSession } from "next-auth";
import { ZodError,z } from "zod";

export async function POST(req:Request){
    try {
        const body = await req.json();
        const {email:emailToAdd} = addFriendValidator.parse(body.email);

        const idToAdd = await fetchRedis('get',`user:email:${emailToAdd}`) as string

        if(!idToAdd){
            return new Response('This person Does not exists',{status:400} )
        }

        const session = await getServerSession(authOptions);

        if(!session){
            return new Response('Unauthorized',{status:401})
        }

        if(idToAdd===session.user.id){
            return new Response("You can not add yourself as a friend",{status:400});
        }

        //Check User existence in Redis db
        const isAlreadyExists = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_request`,session.user.id) as 0|1

        if(isAlreadyExists){
            return new Response("Already added user",{status:400});
        }

        //Check User existence in Redis db
        const isAlreadyFriend = await fetchRedis('sismember', `user:${session.user.id}:friends`,idToAdd) as 0|1

        if(isAlreadyFriend){
            return new Response("Already friends with the user",{status:400});
        }

        //Send  friend request
        db.sadd(`user:${idToAdd}:incoming_friend_request`,session.user.id)

        return new Response('OK')

    } catch (error) {
        if(error instanceof z.ZodError){
            return new Response('Invalid request Payload',{status:422});
        }

        return new Response("Invalid Request",{status:400})
    }
}