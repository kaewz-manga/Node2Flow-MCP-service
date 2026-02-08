/**
 * Gemini RAG Plugin Content
 * All Gemini RAG-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Database, Upload, Search } from 'lucide-react';
import type { PluginContent } from '../registry';

export const geminiRagContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'RAG-Powered Search with Gemini',
  description:
    'Upload documents, build knowledge stores, and query them with AI using Google Gemini File Search.',

  features: [
    {
      icon: <Database className="h-6 w-6" />,
      title: 'File Search Stores',
      description:
        'Create and manage knowledge bases. Organize your documents into searchable stores.',
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: 'Document Upload',
      description:
        'Upload text, PDFs, and other documents directly or import from the Gemini Files API.',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'RAG Query',
      description:
        'Ask natural language questions grounded in your documents. Get AI answers with source citations.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Gemini',
      description:
        'Add your Gemini API key from Google AI Studio. Your key is encrypted and securely stored.',
    },
  ],

  demoCode: `> Create a knowledge base and upload my docs

Created store "Product Docs" (fileSearchStores/abc123)

Uploaded 3 documents:
- API Reference (text/markdown, 45KB)
- User Guide (application/pdf, 1.2MB)
- FAQ (text/plain, 12KB)

> What authentication methods does our API support?

Based on your documents, your API supports 3 auth methods:
1. API Key (Bearer token)
2. OAuth 2.0 (Authorization Code flow)
3. HMAC signatures (for webhooks)

Sources: API Reference (Section 3.2), User Guide (Chapter 5)`,

  externalDocUrl: 'https://ai.google.dev/gemini-api/docs/file-search',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your Gemini API key from Google AI Studio',
    'Add a connection with your API key',
    'Copy the generated Service API key',
    'Start managing stores and querying documents!',
  ],

  emptyConnectionCTA: 'Add your first Gemini RAG connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Gemini API key:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My RAG Store")
        </li>
        <li>
          <strong className="text-foreground">API Key:</strong> Your Gemini API key from{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List my RAG stores',
    'Create a new store called "Product Docs"',
    'Upload this text to my store',
    'Query my documents about authentication',
  ],

  mcpConfigName: 'gemini-rag',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Workflow: Stores, Documents, Queries</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">1. Create Store</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">gemini_create_store</code> to create a
              knowledge base for your documents.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">2. Upload Documents</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">gemini_upload_to_store</code> for text/PDF or{' '}
              <code className="bg-muted px-1 rounded">gemini_import_file_to_store</code> for large files.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">3. Query with RAG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">gemini_rag_query</code> to ask questions and
              get AI answers grounded in your documents.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Supported File Types</h2>
        <p className="text-muted-foreground mb-3">
          Gemini File Search supports various document formats:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Text formats</span>
            <p className="text-sm text-muted-foreground mt-1">
              text/plain, text/markdown, text/html, text/csv
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Document formats</span>
            <p className="text-sm text-muted-foreground mt-1">
              application/pdf, application/json
            </p>
          </div>
        </div>
      </section>
    </>
  ),

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Gemini RAG',
      icon: <Search className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a Gemini API key?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Sign in with your Google account</li>
              <li>Click <strong>Create API Key</strong></li>
              <li>Copy the generated key</li>
            </ol>
          ),
        },
        {
          question: 'Is my API key secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your API key is <strong>encrypted with AES-256-GCM</strong> before storage
                </li>
                <li>We only decrypt when proxying requests to the Gemini API</li>
                <li>API keys can be regenerated anytime from Google AI Studio</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What is a File Search Store?',
          answer: (
            <div className="space-y-2">
              <p>
                A File Search Store is a knowledge base that holds your documents for RAG queries.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create stores to organize documents by topic or project</li>
                <li>Upload text, PDFs, and other supported formats</li>
                <li>Query across one or multiple stores simultaneously</li>
                <li>Documents are automatically chunked and indexed for search</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Gemini models can I use for RAG queries?',
          answer: (
            <div className="space-y-2">
              <p>The following models support File Search grounding:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>gemini-2.5-flash-lite</strong> (default) - Fast and cost-effective
                </li>
                <li>
                  <strong>gemini-2.5-flash</strong> - Balanced speed and quality
                </li>
                <li>
                  <strong>gemini-2.5-pro</strong> - Highest quality answers
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Use the <code className="bg-muted px-1 rounded">model</code> parameter in{' '}
                <code className="bg-muted px-1 rounded">gemini_rag_query</code> to choose.
              </p>
            </div>
          ),
        },
      ],
    },
  ],
};
