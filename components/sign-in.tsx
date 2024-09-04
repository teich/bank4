import { signIn, signOut, auth } from "@/auth"
 
export default async function SignIn() {
    const session = await auth()

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