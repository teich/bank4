export default function Page({ params }: { params: { familyName: string } }) {
    return <div>Settings for Family Name: {params.familyName}</div>
  }