import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { id:idToAdd } = z.object({id: z.string()}).parse(body);
        const session = await getServerSession(authOptions);
        if(!session){
            return new NextResponse('Unauthorized',{status:401});
        }

        const isAlreadyFriends = await fetchRedis('sismember',`user:${session.user.id}:friends`,idToAdd)

        if(isAlreadyFriends){
            return NextResponse.json({error:"Already friends"},{status:400});
        }

        const hasFriendRequest = await fetchRedis('sismember',`user:${session.user.id}:incoming_friend_requests`,idToAdd)

        await db.sadd(`user:${session.user.id}:friends`,idToAdd);
        await db.sadd(`user:${idToAdd}:friends`,session.user.id);
        // await db.srem(`user:${idToAdd}:incoming_friend_requests`,session.user.id);
        await db.srem(`user:${session.user.id}:incoming_friend_requests`,idToAdd); 

        return NextResponse.json({
            message:"Friend Request Accepted"
        },{
            status:200
        })
    } catch (error) {
        console.log('Error at accepting friend request ::::: ');
        console.error(error);
        if(error instanceof z.ZodError){
            return NextResponse.json({message:"Invalid request payload"},{status:422})
        }
        return NextResponse.json({message:'Something Went Wrong during accepting friend request.',error:error},{status:500});
    }
}