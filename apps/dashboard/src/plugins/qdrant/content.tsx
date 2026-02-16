/**
 * Qdrant Plugin Content
 * All Qdrant-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Database, Search, Brain } from 'lucide-react';
import type { PluginContent } from '../registry';

export const qdrantContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Semantic Memory with Vector Search',
  description:
    'Store and retrieve information using semantic similarity powered by Qdrant vector database and automatic embeddings.',

  features: [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Semantic Storage',
      description:
        'Store any text with automatic vector embedding generation. Attach metadata for structured retrieval alongside semantic search.',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Similarity Search',
      description:
        'Find stored information using natural language queries. Results ranked by semantic similarity, not just keyword matching.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Vector Database',
      description:
        'Powered by Qdrant — a high-performance open-source vector database. Collections auto-created on first use.',
    },
  ],

  setupSteps: [
    {
      title: 'Set up Qdrant',
      description:
        'Deploy Qdrant locally (Docker) or use Qdrant Cloud. Get your URL and optionally an API key.',
    },
  ],

  demoCode: `> Store a code snippet about authentication

Stored: "JWT authentication middleware that validates tokens
and extracts user claims from the Authorization header."

> Find information about user login

Found 2 results:
1. "JWT authentication middleware that validates tokens
   and extracts user claims from the Authorization header."
   (similarity: 0.89)

2. "User session management with Redis-backed token store
   and automatic expiry after 30 minutes of inactivity."
   (similarity: 0.76)`,

  externalDocUrl: 'https://qdrant.tech/documentation/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Set up a Qdrant instance (local or cloud)',
    'Add a connection with your URL and collection name',
    'Copy the generated API key',
    'Store and search information with semantic AI!',
  ],

  emptyConnectionCTA: 'Add your first Qdrant connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Qdrant credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Qdrant URL:</strong> Your Qdrant server URL (e.g., http://localhost:6333 or Qdrant Cloud URL)
        </li>
        <li>
          <strong className="text-foreground">API Key:</strong> (Optional) Required for Qdrant Cloud or secured instances
        </li>
        <li>
          <strong className="text-foreground">Collection Name:</strong> The collection to store/search in (auto-created if missing)
        </li>
        <li>
          <strong className="text-foreground">Embedding Model:</strong> (Optional) Defaults to sentence-transformers/all-MiniLM-L6-v2
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Store this meeting summary for later reference',
    'Find information about database optimization',
    'Store code snippet with metadata about its purpose',
    'Search for anything related to authentication',
  ],

  mcpConfigName: 'qdrant',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Qdrant',
      icon: <Database className="h-5 w-5" />,
      items: [
        {
          question: 'What do I need to get started?',
          answer: (
            <div className="space-y-2">
              <p>You need a <strong>Qdrant instance</strong>:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Local</strong>: <code className="bg-muted px-1 rounded">docker run -p 6333:6333 qdrant/qdrant</code></li>
                <li><strong>Cloud</strong>: Sign up at <strong>cloud.qdrant.io</strong> for a managed instance</li>
              </ol>
              <p className="mt-2">Then provide the URL, collection name, and optionally an API key.</p>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>2 tools for semantic memory:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>qd_store</strong> — Store text with automatic vector embeddings + optional metadata</li>
                <li><strong>qd_find</strong> — Semantic similarity search using natural language queries</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What embedding model is used?',
          answer: (
            <div className="space-y-2">
              <p>By default, <code className="bg-muted px-1 rounded">sentence-transformers/all-MiniLM-L6-v2</code> via FastEmbed. You can override this with any supported model in the Embedding Model field.</p>
            </div>
          ),
        },
      ],
    },
  ],
};
