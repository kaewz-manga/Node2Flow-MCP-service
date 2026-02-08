import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, ChevronDown, Search, HelpCircle, Zap as Lightning, Shield, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth, Card, CardContent, CardHeader, CardTitle, Button, Input, Separator, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@node2flow/dashboard-core';

import { plugins } from '../plugins/registry';






interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const productNames = plugins.map(p => p.name).join(', ');
const mcpConfigName = plugins[0]?.content.mcpConfigName || plugins[0]?.id || 'service';

const genericCategories: FAQCategory[] = [
  {
    name: 'Getting Started',
    icon: <Lightning className="h-5 w-5" />,
    items: [
      {
        question: 'What is Node2Flow?',
        answer: (
          <div className="space-y-2">
            <p>
              Node2Flow is a hosted service that allows AI assistants (like Claude, Cursor, or other MCP-compatible clients)
              to interact with your tools and services{productNames ? ` including ${productNames}` : ''}.
            </p>
            <p>
              MCP (Model Context Protocol) is a standard protocol that enables AI assistants to use external tools and services.
              Our service acts as a bridge between your AI assistant and your connected services.
            </p>
          </div>
        ),
      },
      {
        question: 'How do I get started?',
        answer: (
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Create an account</strong> - Sign up with email or OAuth (GitHub/Google)</li>
            <li><strong>Add a connection</strong> - Connect your service instance with its URL and API key</li>
            <li><strong>Generate an API key</strong> - Create an API key for your MCP client</li>
            <li><strong>Configure your MCP client</strong> - Add the MCP server URL and API key to Claude Desktop, Cursor, etc.</li>
          </ol>
        ),
      },
      {
        question: 'What MCP clients are supported?',
        answer: (
          <div className="space-y-2">
            <p>Any MCP-compatible client should work, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Claude Desktop</strong> - Anthropic's official desktop app</li>
              <li><strong>Cursor</strong> - AI-powered code editor</li>
              <li><strong>Continue</strong> - Open-source AI coding assistant</li>
              <li><strong>Custom clients</strong> - Any app implementing the MCP protocol</li>
            </ul>
          </div>
        ),
      },
      {
        question: 'How do I configure Claude Desktop?',
        answer: (
          <div className="space-y-3">
            <p>Add this to your Claude Desktop configuration file:</p>
            <pre className="bg-black rounded-lg p-3 text-sm text-green-400 overflow-x-auto">
{`{
  "mcpServers": {
    "${mcpConfigName}": {
      "url": "https://mcp.node2flow.net/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}
            </pre>
            <p className="text-sm text-muted-foreground">
              Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> with your actual API key from the Connections page.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    name: 'API Keys & Authentication',
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        question: 'What is the difference between connection API keys and service API keys?',
        answer: (
          <div className="space-y-2">
            <p>There are two types of API keys:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Connection API key</strong> - Generated in your connected service (e.g., n8n). Used to authenticate
                our service with your instance. Stored encrypted.
              </li>
              <li>
                <strong>Service API key (n2f_...)</strong> - Generated in our dashboard. Used to authenticate
                your MCP client with our service. Stored as a hash.
              </li>
            </ul>
          </div>
        ),
      },
      {
        question: 'I lost my API key. Can you recover it?',
        answer: 'No, we cannot recover API keys. For security, we only store a hash of the key, not the actual key. You\'ll need to generate a new API key and update your MCP client configuration.',
      },
      {
        question: 'How do I revoke an API key?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Go to <strong>Dashboard → Connections</strong></li>
            <li>Find the connection with the API key</li>
            <li>Click the <strong>trash icon</strong> next to the key</li>
            <li>Confirm the revocation (requires 2FA if enabled)</li>
          </ol>
        ),
      },
      {
        question: 'What is two-factor authentication (2FA)?',
        answer: (
          <div className="space-y-2">
            <p>
              2FA adds an extra layer of security by requiring a time-based code from an authenticator app
              (like Google Authenticator, Authy, or 1Password) in addition to your password.
            </p>
            <p>
              When enabled, sensitive actions like deleting connections, revoking API keys, or changing
              your password will require you to enter a 2FA code.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    name: 'Billing & Plans',
    icon: <CreditCard className="h-5 w-5" />,
    items: [
      {
        question: 'What are the plan limits?',
        answer: (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Daily Limit</TableHead>
                  <TableHead>Rate Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Free</TableCell>
                  <TableCell>$0/month</TableCell>
                  <TableCell>100 req/day</TableCell>
                  <TableCell>50 req/min</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pro</TableCell>
                  <TableCell>$19/month</TableCell>
                  <TableCell>5,000 req/day</TableCell>
                  <TableCell>100 req/min</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enterprise</TableCell>
                  <TableCell>Custom</TableCell>
                  <TableCell>Unlimited</TableCell>
                  <TableCell>Custom</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ),
      },
      {
        question: 'What happens if I exceed my daily limit?',
        answer: 'Once you reach your daily limit, API requests will return a 429 (Too Many Requests) error until the limit resets at midnight UTC. You can upgrade your plan anytime for higher limits.',
      },
      {
        question: 'How do I upgrade or downgrade my plan?',
        answer: (
          <div className="space-y-2">
            <p><strong>To upgrade:</strong> Go to Dashboard → Settings → Billing and select a new plan. Upgrades take effect immediately with prorated billing.</p>
            <p><strong>To downgrade:</strong> Same process, but downgrades take effect at the start of your next billing cycle.</p>
          </div>
        ),
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We do not offer refunds for partial months. However, you can cancel your subscription at any time, and you\'ll continue to have access until the end of your current billing period.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards via Stripe, including Visa, Mastercard, American Express, and Discover. We also support some regional payment methods depending on your location.',
      },
    ],
  },
  {
    name: 'Troubleshooting',
    icon: <AlertTriangle className="h-5 w-5" />,
    items: [
      {
        question: 'MCP client shows "connection refused" error',
        answer: (
          <div className="space-y-2">
            <p>Check the following:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verify the MCP server URL is correct: <code className="bg-muted px-1 rounded">https://mcp.node2flow.net/mcp</code></li>
              <li>Ensure your API key starts with <code className="bg-muted px-1 rounded">n2f_</code></li>
              <li>Check that the API key hasn't been revoked</li>
              <li>Make sure the Authorization header format is correct: <code className="bg-muted px-1 rounded">Bearer n2f_...</code></li>
            </ul>
          </div>
        ),
      },
      {
        question: 'I\'m getting "unauthorized" errors',
        answer: (
          <div className="space-y-2">
            <p>This usually means:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The API key is invalid or has been revoked</li>
              <li>The API key doesn't have access to the requested connection</li>
              <li>The Authorization header is missing or malformed</li>
            </ul>
            <p>Try generating a new API key and updating your MCP client configuration.</p>
          </div>
        ),
      },
      {
        question: 'Tools are not returning results',
        answer: (
          <div className="space-y-2">
            <p>If tool calls return empty or error results:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verify your connection status is "active" in the dashboard</li>
              <li>Check that your connection's API key has the required permissions</li>
              <li>Ensure the service URL is correct and accessible</li>
              <li>Try refreshing or re-adding the connection</li>
            </ul>
          </div>
        ),
      },
      {
        question: 'How do I report a bug?',
        answer: (
          <div className="space-y-2">
            <p>You can report bugs through:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@node2flow.net" className="text-primary hover:underline">
                  support@node2flow.net
                </a>
              </li>
              <li>
                <strong>GitHub Issues:</strong> If you have access to our repository
              </li>
            </ul>
            <p>Please include: steps to reproduce, expected vs actual behavior, and any error messages.</p>
          </div>
        ),
      },
    ],
  },
];

// Merge generic categories with plugin-specific categories
const pluginCategories: FAQCategory[] = plugins.flatMap(p => p.content.faqCategories);
const faqData: FAQCategory[] = [...genericCategories, ...pluginCategories];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="hover:shadow-md transition-all">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left h-auto hover:bg-muted"
      >
        <span className="font-medium text-foreground pr-4">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>
      {isOpen && (
        <CardContent className="pt-0 text-muted-foreground">
          {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
        </CardContent>
      )}
    </Card>
  );
}

export default function FAQ() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Filter FAQ items based on search query
  const filteredCategories = faqData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof item.answer === 'string' &&
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((category) => category.items.length > 0);

  const content = (
    <>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find answers to common questions about Node2Flow. Can't find what you're looking for?{' '}
            <a href="mailto:support@node2flow.net" className="text-primary hover:underline">
              Contact support
            </a>
            .
          </p>
        </div>

        <Separator />

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>

        {/* FAQ Categories */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <section key={category.name}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-primary">{category.icon}</div>
                  <h2 className="text-xl font-semibold text-foreground">{category.name}</h2>
                </div>
                <div className="space-y-3">
                  {category.items.map((item, index) => {
                    const key = `${category.name}-${index}`;
                    return (
                      <FAQAccordion
                        key={key}
                        item={item}
                        isOpen={openItems.has(key)}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
            <Button variant="link" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        )}

        {/* Still need help */}
        <Card className="mt-12 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-center">Still have questions?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <p className="text-muted-foreground mb-3">
              We're here to help. Reach out to our support team.
            </p>
            <Button asChild>
              <a href="mailto:support@node2flow.net">
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Footer navigation */}
        {!user && (
          <>
            <Separator className="mt-12" />
            <div className="mt-8 flex justify-between text-sm">
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          </>
        )}
    </>
  );

  if (user) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Node2Flow</span>
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {content}
      </main>
    </div>
  );
}
