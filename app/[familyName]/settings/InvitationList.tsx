'use client'

import { useState } from 'react';
import { acceptInvite, declineInvite } from './actions';

interface Invite {
  id: string;
  role: string;
  family: { name: string };
}

interface InvitationListProps {
  invites: Invite[];
}

export default function InvitationList({ invites }: InvitationListProps) {
  const [pendingInvites, setPendingInvites] = useState(invites);

  const handleAcceptInvite = async (inviteId: string) => {
    const result = await acceptInvite(inviteId);
    if (result.success) {
      setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
    } else {
      console.error('Failed to accept invite:', result.message);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    const result = await declineInvite(inviteId);
    if (result.success) {
      setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
    } else {
      console.error('Failed to decline invite:', result.message);
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