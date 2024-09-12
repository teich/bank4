'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Invite } from '@prisma/client';
import { CheckCircle, XCircle, Users } from 'lucide-react';

interface InvitationPromptProps {
  invite: Invite & { family: { name: string } };
  user: { id: string; email: string; name?: string | null };
}

export default function InvitationPrompt({ invite, user }: InvitationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.id, userId: user.id }),
      });

      if (response.ok) {
        router.push(`/${invite.family.name}`);
      } else {
        throw new Error('Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/decline-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.id }),
      });

      if (response.ok) {
        router.push('/create-family');
      } else {
        throw new Error('Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-auto mt-10 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Family Invitation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-center mb-4">
          You&apos;ve been invited to join a family.
        </p>
        <p className="text-center mb-4">
          Click &ldquo;Accept&rdquo; to join or &ldquo;Decline&rdquo; to refuse.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button
          onClick={handleAccept}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Accept
        </Button>
        <Button
          onClick={handleDecline}
          variant="outline"
          disabled={isLoading}
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          <XCircle className="w-5 h-5 mr-2" />
          Decline
        </Button>
      </CardFooter>
    </Card>
  );
}