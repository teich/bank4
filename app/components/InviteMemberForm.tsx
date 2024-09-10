import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteMemberForm({ familyName }: { familyName: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CHILD');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { email, role, familyName };
    try {
      const response = await fetch('/api/invite-family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invite');
      }

      // Clear form and refresh page
      setEmail('');
      setRole('CHILD');
      router.refresh();
    } catch (error) {
      console.error('Error sending invite:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="CHILD">Child</option>
        <option value="PARENT">Parent</option>
      </select>
      <button type="submit">Send Invite</button>
    </form>
  );
}