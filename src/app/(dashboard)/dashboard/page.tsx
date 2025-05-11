import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { FC } from 'react'

const page= async ({}) => {
  const session = await getServerSession(authOptions);
  return <div>
    <Button>Submit</Button>
    <pre>{JSON.stringify(session)}</pre>
  </div>
}

export default page