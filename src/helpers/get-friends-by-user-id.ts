import { fetchRedis } from "./redis"

export const getFriendsbyUserId = async (userId: string) => {
    //retrieve friends for current user
    const friendsIds = await fetchRedis('sismember',`user:${userId}:friends`) as string[]

    const friends = await Promise.all(
        friendsIds.map(async(friendId)=>{
            const friend = await fetchRedis('get',`user:${friendId}`) as string
            const parsedFriend = JSON.parse(friend) as User
            return parsedFriend
        })
    )
    return friends
}