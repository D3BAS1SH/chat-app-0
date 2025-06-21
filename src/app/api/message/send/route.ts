import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Message, messageValidator } from '@/lib/validation/message';
import { getServerSession } from 'next-auth';
import { NextResponse, NextRequest } from 'next/server'
import {nanoid} from "nanoid";

export async function POST(request: NextRequest) {
    try {
        const { text, chatId } = await request.json();
        const session = await getServerSession(authOptions);

        if(!session){
            return new Response('Unauthorized',{status:401});
        }

        const [userId1, userId2] = chatId.split('--');

        if(session.user.id !== userId1 && session.user.id !== userId2){
            return new Response('Unauthorized',{status:401});
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1;

        const friendList = await fetchRedis('smembers',`user:${session.user.id}:friends`) as string[]
        const isFreind = friendList.includes(friendId);

        if(!isFreind){
            return new Response('Unauthorized',{status:401});
        }

        const sender = await fetchRedis('get',`user:${session.user.id}`) as string
        const parsedSender = JSON.parse(sender) as User;

        const timestamp = Date.now();

        const messageData: Message = {
            id:nanoid(),
            senderId:session.user.id,
            text,
            timestamp
        }
        const message = messageValidator.parse(messageData)

        await db.zadd(`chat:${chatId}:messages`,{
            score:timestamp,
            member:JSON.stringify(message)
        })

        return new Response('OK',{status:200})
    } catch (error) {
        console.log('Error at --------- +++++++++ ::::: ');
        console.error(error);

        if(error instanceof Error){
            return new Response(error.message,{status:500});
        }

        return NextResponse.json({message:'Something Went Wrong during --------- +++++++++.',error:error},{status:500});
    }
}