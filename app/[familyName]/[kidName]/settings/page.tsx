export default function Page({ params }: { params: { familyName: string, kidName: string } }) {
    return <div>Settings Page for: {params.familyName} /  {params.kidName}</div>
  }