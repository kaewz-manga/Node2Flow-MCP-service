import { Users } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';
import { Card, CardContent } from '@/components/ui/card';

export default function UserList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a LINE Bot connection first to manage users and groups.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users & Groups</h1>
        <p className="text-muted-foreground mt-1">View LINE user profiles and group information via MCP tools</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to manage users</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"Get profile for user U1234"</em> or{' '}
            <em className="text-foreground">"List group members in group C5678"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
