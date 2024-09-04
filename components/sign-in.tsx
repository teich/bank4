import { signIn, signOut } from "@/auth"
import { auth } from "@/auth"
 
export default async function SignIn() {
    const session = await auth()

    console.log('Full session object:', JSON.stringify(session, null, 2));

    if (!session?.user) {
        return (
            <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
            >
            <button type="submit">Signin with Google</button>
            </form>
        );
    } else {
        return (
            <form
            action={async () => {
                "use server"
                await signOut()
            }}
            >
            <button type="submit">Sign Out</button> - {session.user?.name}
            </form>
        );
    }
}