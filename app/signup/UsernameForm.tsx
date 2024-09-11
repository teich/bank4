'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useActionState } from '@/lib/hooks/useActionState'
import { checkUsername, submitUsername } from './actions'

const usernameSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 
    'Username must be 3-20 characters and can only contain letters, numbers, and underscores')
})

type FormData = z.infer<typeof usernameSchema>

export function UsernameForm() {
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(usernameSchema)
  })

  const username = watch('username')

  const [checkState, checkAction] = useActionState(checkUsername)
  const [submitState, submitAction] = useActionState(submitUsername)

  const onSubmit = async (data: FormData) => {
    const result = await submitAction(data.username)
    if (result.success) {
      router.push('/')
    }
  }

  const handleUsernameChange = async (value: string) => {
    if (value.length >= 3) {
      const result = await checkAction(value)
      setIsAvailable(result.available)
    } else {
      setIsAvailable(null)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('username')}
          placeholder="Enter username"
          onChange={(e) => handleUsernameChange(e.target.value)}
        />
        {errors.username && (
          <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
        )}
        {isAvailable !== null && (
          <p className={`text-sm mt-1 ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
            {isAvailable ? 'Username is available' : 'Username is not available'}
          </p>
        )}
      </div>
      <Button type="submit" disabled={!isAvailable || submitState.loading}>
        {submitState.loading ? 'Submitting...' : 'Create Username'}
      </Button>
      {submitState.error && (
        <p className="text-sm text-red-500 mt-1">{submitState.error}</p>
      )}
    </form>
  )
}