'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { deleteFamilyMember } from './actions';
import Link from 'next/link';

interface FamilyMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  link: string;
  username: string; // Add username to the interface
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
    <ul className="space-y-4">
      {familyMembers.map(member => (
        <li key={member.id} className="flex items-center justify-between">
          <div>
            <Link href={member.link} className="text-blue-600 hover:underline">
              {member.name} ({member.username})
            </Link>
            <span className="text-sm text-gray-500 ml-2">({member.role.toLowerCase()})</span>
          </div>
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