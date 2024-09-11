export default function Page({ params }: { params: { familyName: string, userName: string } }) {
    return <div>Family Name: {params.familyName}, Person Name: {params.userName}</div>
  }