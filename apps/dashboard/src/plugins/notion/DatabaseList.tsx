import { Database, Search, Filter, Table, Lightbulb } from 'lucide-react';
import { usePluginConnection, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Separator } from '@node2flow/dashboard-core';

export default function DatabaseList() {
  const activeConnection = usePluginConnection('notion');

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
          <h1 className="text-2xl font-bold text-foreground">Databases & Data Sources</h1>
          <p className="text-muted-foreground mt-1">
            Browse and query your Notion databases <Badge variant="secondary" className="ml-1">5 tools</Badge>
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
                <Search className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Search Databases</CardTitle>
            </div>
            <CardDescription>Find databases across your entire Notion workspace by name or content</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Search for databases in my workspace"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Filter className="h-4 w-4 text-emerald-500" />
              </div>
              <CardTitle className="text-base">Query with Filters</CardTitle>
            </div>
            <CardDescription>Query databases with filters, sorts, and pagination for precise results</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Query my Tasks database where status is In Progress"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Table className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base">Create Entries</CardTitle>
            </div>
            <CardDescription>Add new rows to any database with typed properties and relations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "Create a new entry in my CRM database"
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Database className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">Data Sources</CardTitle>
            </div>
            <CardDescription>Access the new Data Sources API for advanced database operations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
              "List data sources in my workspace"
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
