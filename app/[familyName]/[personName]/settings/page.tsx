export default function Page({ params }: { params: { familyName: string, personName: string } }) {
    return <div>Settings Page for: {params.familyName} /  {params.personName}</div>
  }