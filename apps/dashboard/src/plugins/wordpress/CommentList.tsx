import { MessageSquare, CheckCircle, XCircle, Reply, Lightbulb } from 'lucide-react';
import { useConnection, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Separator } from '@node2flow/dashboard-core';

export default function CommentList() {
  const { activeConnection } = useConnection();

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
          <h1 className="text-2xl font-bold text-foreground">Comments</h1>
          <p className="text-muted-foreground mt-1">
            Manage WordPress comments via MCP tools <Badge variant="secondary" className="ml-1">5 tools</Badge>
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
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Browse Comments</CardTitle>
            </div>
            <CardDescription>List comments filtered by post, status, or author</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Show me pending comments on my blog"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <CardTitle className="text-base">Approve Comments</CardTitle>
            </div>
            <CardDescription>Approve pending comments individually or in bulk</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Approve all comments on post #5"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Reply className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base">Reply to Comments</CardTitle>
            </div>
            <CardDescription>Create replies and engage with your audience directly</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Reply to comment #42 with a thank you"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <XCircle className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">Delete Spam</CardTitle>
            </div>
            <CardDescription>Remove spam and unwanted comments to keep discussions clean</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Delete spam comments"
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
