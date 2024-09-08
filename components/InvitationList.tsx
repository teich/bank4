'use client'

import { useState } from 'react';

interface Invite {
  id: string;
  family: {
    name: string;
  };
  role: string;
}

interface InvitationListProps {
  invites: Invite[];
}

export default function InvitationList({ invites }: InvitationListProps) {
  const [pendingInvites, setPendingInvites] = useState(invites);

  const handleAcceptInvite = async (inviteId: string) => {
    const response = await fetch(`/api/accept-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteId }),
    });
    if (response.ok) {
      setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
    } else {
      console.error('Failed to accept invite');
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    const response = await fetch(`/api/decline-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteId }),
    });
    if (response.ok) {
      setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
    } else {
      console.error('Failed to decline invite');
    }
  };

  if (pendingInvites.length === 0) {
    return <p>No pending invitations.</p>;
  }

  return (
    <ul>
      {pendingInvites.map((invite) => (
        <li key={invite.id}>
          Invitation to join {invite.family.name} as {invite.role}
          <button
            onClick={() => handleAcceptInvite(invite.id)}
            className="ml-2"
          >
            Accept
          </button>
          <button
            onClick={() => handleDeclineInvite(invite.id)}
            className="ml-2"
          >
            Decline
          </button>
        </li>
      ))}
    </ul>
  );
}