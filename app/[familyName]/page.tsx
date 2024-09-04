export default function Page({ params }: { params: { familyName: string } }) {
    return <div>Family Name: {params.familyName}</div>
  }