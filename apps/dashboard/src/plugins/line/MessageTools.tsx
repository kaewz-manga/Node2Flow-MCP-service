import { Send, Users, Megaphone, MessageSquare, Lightbulb } from 'lucide-react';
import { usePluginConnection, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Separator } from '@node2flow/dashboard-core';

export default function MessageTools() {
  const activeConnection = usePluginConnection('line');

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-sm text-muted-foreground">Select a connection from the sidebar to continue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Message Tools</h1>
          <p className="text-muted-foreground mt-1">
            Send and manage LINE messages <Badge variant="secondary" className="ml-1">5 tools</Badge>
          </p>
        </div>
      </div>

      <Separator />

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Push Messages</CardTitle>
            </div>
            <CardDescription>Send text, images, or stickers directly to a specific user</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Send a text message to user U1234"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Megaphone className="h-4 w-4 text-emerald-500" />
              </div>
              <CardTitle className="text-base">Broadcast</CardTitle>
            </div>
            <CardDescription>Send messages to all followers at once with a single command</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Broadcast a message to all followers"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base">Flex Messages</CardTitle>
            </div>
            <CardDescription>Create rich interactive messages with buttons, carousels, and layouts</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Send a flex message with buttons"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">Multicast</CardTitle>
            </div>
            <CardDescription>Send the same message to multiple users simultaneously</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Send a promo to users U1234, U5678"
            </code>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-t from-emerald-500/5 to-card border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            How to use
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">
          <p>Use these tools through your MCP-compatible AI assistant. Simply describe what you want to do in natural language.</p>
        </CardContent>
      </Card>
    </div>
  );
}
