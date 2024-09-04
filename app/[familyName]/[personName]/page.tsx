export default function Page({ params }: { params: { familyName: string, personName: string } }) {
    return <div>Family Name: {params.familyName}, Person Name: {params.personName}</div>
  }