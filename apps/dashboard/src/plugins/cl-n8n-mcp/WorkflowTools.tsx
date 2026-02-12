import { useState } from 'react';
import { toast } from 'sonner';
import { validateMcpWorkflow, autofixMcpWorkflow, testMcpWorkflow } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Input, Textarea, Badge, Separator, Alert, AlertDescription,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  Loader2, AlertCircle, CheckCircle, Wrench, Play, ShieldCheck, AlertTriangle,
} from 'lucide-react';

export default function WorkflowTools() {
  const activeConnection = usePluginConnection('cl-n8n-mcp');
  const connectionId = activeConnection?.id;

  // Validate
  const [validateJson, setValidateJson] = useState('');
  const [validating, setValidating] = useState(false);
  const [validateResult, setValidateResult] = useState<any>(null);

  // Auto-fix
  const [fixWorkflowId, setFixWorkflowId] = useState('');
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);

  // Test
  const [testWorkflowId, setTestWorkflowId] = useState('');
  const [testDataJson, setTestDataJson] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  async function handleValidate() {
    if (!connectionId || !validateJson.trim()) return;
    setValidating(true);
    setValidateResult(null);
    try {
      const workflow = JSON.parse(validateJson);
      const res = await validateMcpWorkflow(connectionId, workflow);
      if (res.success && res.data) {
        setValidateResult(res.data);
      } else {
        toast.error(res.error?.message || 'Validation failed');
      }
    } catch {
      toast.error('Invalid JSON. Please check your workflow JSON.');
    }
    setValidating(false);
  }

  async function handleAutofix() {
    if (!connectionId || !fixWorkflowId.trim()) return;
    setFixing(true);
    setFixResult(null);
    const res = await autofixMcpWorkflow(connectionId, fixWorkflowId.trim(), true);
    if (res.success && res.data) {
      setFixResult(res.data);
      toast.success('Auto-fix complete');
    } else {
      toast.error(res.error?.message || 'Auto-fix failed');
    }
    setFixing(false);
  }

  async function handleTest() {
    if (!connectionId || !testWorkflowId.trim()) return;
    setTesting(true);
    setTestResult(null);
    let data: Record<string, unknown> | undefined;
    if (testDataJson.trim()) {
      try {
        data = JSON.parse(testDataJson);
      } catch {
        toast.error('Invalid test data JSON');
        setTesting(false);
        return;
      }
    }
    const res = await testMcpWorkflow(connectionId, testWorkflowId.trim(), data);
    if (res.success && res.data) {
      setTestResult(res.data);
    } else {
      toast.error(res.error?.message || 'Test failed');
    }
    setTesting(false);
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workflow Tools</h1>
        <p className="text-muted-foreground mt-1">Validate, auto-fix, and test n8n workflows</p>
      </div>

      <Separator />

      {/* Validate Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Validate Workflow</CardTitle>
              <CardDescription>Paste workflow JSON to check for configuration errors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder='Paste workflow JSON here...\n{\n  "name": "My Workflow",\n  "nodes": [...],\n  "connections": {...}\n}'
            value={validateJson}
            onChange={(e) => setValidateJson(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <Button onClick={handleValidate} disabled={validating || !validateJson.trim()}>
            {validating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />} Validate
          </Button>

          {validateResult && (
            <div className="space-y-2">
              {validateResult.valid !== undefined && (
                <Alert variant={validateResult.valid ? 'default' : 'destructive'}>
                  {validateResult.valid ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertDescription>
                    {validateResult.valid ? 'Workflow is valid' : `Found ${validateResult.errors?.length || 0} error(s)`}
                  </AlertDescription>
                </Alert>
              )}
              <JsonViewer data={validateResult} title="Validation Result" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-fix Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Wrench className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base">Auto-Fix Workflow</CardTitle>
              <CardDescription>Automatically detect and fix errors in a workflow by ID</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Workflow ID (e.g., abc123)"
            value={fixWorkflowId}
            onChange={(e) => setFixWorkflowId(e.target.value)}
          />
          <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleAutofix} disabled={fixing || !fixWorkflowId.trim()}>
            {fixing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wrench className="h-4 w-4 mr-2" />} Auto-Fix
          </Button>

          {fixResult && <JsonViewer data={fixResult} title="Auto-Fix Result" />}
        </CardContent>
      </Card>

      {/* Test Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Play className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-base">Test Workflow</CardTitle>
              <CardDescription>Execute a workflow and inspect the results</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Workflow ID (e.g., abc123)"
            value={testWorkflowId}
            onChange={(e) => setTestWorkflowId(e.target.value)}
          />
          <Textarea
            placeholder='Test data JSON (optional)\n{\n  "key": "value"\n}'
            value={testDataJson}
            onChange={(e) => setTestDataJson(e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
          <Button onClick={handleTest} disabled={testing || !testWorkflowId.trim()}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />} Test
          </Button>

          {testResult && <JsonViewer data={testResult} title="Test Result" />}
        </CardContent>
      </Card>
    </div>
  );
}
