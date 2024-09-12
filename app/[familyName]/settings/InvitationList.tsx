'use client'

import { useState } from 'react';
import { acceptInvite, declineInvite } from './actions';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";

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
    return <p className="text-center text-gray-500">
      We couldn&apos;t find any invitations.
    </p>;
  }

  return (
    <div className="space-y-2">
      {pendingInvites.map((invite) => (
        <Card key={invite.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-sm font-semibold">Invitation to {invite.family.name}</h3>
                <p className="text-xs text-gray-500">You&apos;ve been invited as {invite.role}</p>
              </div>
              <div className="flex space-x-2 sm:ml-4">
                <Button
                  onClick={() => handleAcceptInvite(invite.id)}
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleDeclineInvite(invite.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}