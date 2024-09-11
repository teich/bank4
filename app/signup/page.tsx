import { UsernameForm } from './UsernameForm'

export default async function SignupPage() {
  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      <UsernameForm />
    </div>
  )
}