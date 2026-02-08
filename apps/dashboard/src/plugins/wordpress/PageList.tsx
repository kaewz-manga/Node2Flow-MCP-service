import { Layout, FileText, PenTool, Eye, Lightbulb } from 'lucide-react';
import { useConnection, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Separator } from '@node2flow/dashboard-core';

export default function PageList() {
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
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage WordPress pages via MCP tools <Badge variant="secondary" className="ml-1">5 tools</Badge>
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
                <Layout className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">List Pages</CardTitle>
            </div>
            <CardDescription>Browse all pages with filters for status and parent hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "List all my WordPress pages"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <PenTool className="h-4 w-4 text-emerald-500" />
              </div>
              <CardTitle className="text-base">Create & Edit</CardTitle>
            </div>
            <CardDescription>Build new pages with custom templates, parent pages, and content</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Create a new About Us page"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Eye className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base">View Details</CardTitle>
            </div>
            <CardDescription>Inspect page content, template, slug, and revision history</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Show me the content of my Contact page"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <FileText className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">Delete Pages</CardTitle>
            </div>
            <CardDescription>Move pages to trash or permanently remove them from your site</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Delete page #456"
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
