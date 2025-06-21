import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);
        if(!session){
            return new NextResponse('Unauthorized',{status:401});
        }
        const { id:idToDeny } = z.object({id: z.string()}).parse(body);

        await db.srem(`user:${session.user.id}:incoming_friend_requests`,idToDeny);

        return NextResponse.json({
            message:"Denied friend request success"
        },{
            status:200
        })
    } catch (error) {
        console.log('Error at dening friend request ::::: ');
        console.error(error);
        if(error instanceof z.ZodError){
            return NextResponse.json({message:"Invalid request payload"},{status:422})
        }
        return NextResponse.json({message:'Something Went Wrong during dening friend request.',error:error},{status:500});
    }
}