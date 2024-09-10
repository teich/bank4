'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { deleteFamilyMember } from './actions';

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
  familyId: string;
}

export default function FamilyMembersList({ members, currentUserEmail, isParent, familyId }: FamilyMembersListProps) {
  const [familyMembers, setFamilyMembers] = useState(members);

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this family member?')) {
      try {
        const result = await deleteFamilyMember(memberId, familyId);

        if (result.success) {
          setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
        } else {
          throw new Error(result.message || 'Failed to delete family member');
        }
      } catch (error) {
        console.error('Error deleting family member:', error);
        // Handle error (e.g., show error message to user)
      }
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