export default function Page({ params }: { params: { familyName: string, kidName: string } }) {
    return <div>Family Name: {params.familyName}, Kid Name: {params.kidName}</div>
  }