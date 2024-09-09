"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InviteMemberForm({ familyName }: { familyName: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/invite-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, familyName }),
      });

      if (response.ok) {
        alert('Invite sent successfully');
        setEmail('');
        setRole('');
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('An error occurred while sending the invite');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleInvite}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <Input 
          type="email" 
          id="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address" 
          className="mt-1" 
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Parent">PARENT</SelectItem>
            <SelectItem value="Child">CHILD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Invite Member</Button>
    </form>
  );
}