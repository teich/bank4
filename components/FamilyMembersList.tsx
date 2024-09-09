'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface FamilyMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  currentUserEmail: string;
  isParent: boolean;
}

export default function FamilyMembersList({ members, currentUserEmail, isParent }: FamilyMembersListProps) {
  const [familyMembers, setFamilyMembers] = useState(members);

  const handleDeleteMember = async (memberId: string) => {
    const response = await fetch('/api/delete-family-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberId }),
    });

    if (response.ok) {
      setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
    } else {
      console.error('Failed to delete family member');
    }
  };

  return (
    <ul>
      {familyMembers.map(member => (
        <li key={member.id} className="mb-2">
          <p><strong>Name:</strong> {member.name}</p>
          <p><strong>Email:</strong> {member.email}</p>
          <p><strong>Role:</strong> {member.role}</p>
          {isParent && member.email !== currentUserEmail && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleDeleteMember(member.id)}
            >
              Delete
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}