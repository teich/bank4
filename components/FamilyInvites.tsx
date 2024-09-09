'use client'

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaTrash } from 'react-icons/fa'; // Make sure to install react-icons if you haven't

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdBy: {
    name: string | null;
    email: string;
  };
  createdAt: Date;
}

interface FamilyInvitesProps {
  invites: Invite[];
}

export default function FamilyInvites({ invites: initialInvites }: FamilyInvitesProps) {
  const [invites, setInvites] = useState(initialInvites);

  const handleDeleteInvite = async (inviteId: string) => {
    const response = await fetch('/api/delete-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteId }),
    });

    if (response.ok) {
      setInvites(invites.map(invite => 
        invite.id === inviteId ? { ...invite, status: 'DELETED' } : invite
      ));
    } else {
      console.error('Failed to delete invite');
    }
  };

  const visibleInvites = invites.filter(invite => invite.status !== 'DELETED');

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Family Invites</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Invited At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleInvites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>{invite.email}</TableCell>
              <TableCell>{invite.role}</TableCell>
              <TableCell>{invite.status}</TableCell>
              <TableCell>{invite.createdBy.name || invite.createdBy.email}</TableCell>
              <TableCell>{new Date(invite.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                {invite.status === 'PENDING' && (
                  <button onClick={() => handleDeleteInvite(invite.id)} className="text-red-500">
                    <FaTrash />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}