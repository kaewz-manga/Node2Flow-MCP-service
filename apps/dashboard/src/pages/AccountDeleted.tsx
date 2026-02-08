import { Link } from 'react-router-dom';
import { Zap, UserX, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AccountDeleted() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center mb-6">
            <div className="bg-red-900/30 p-4 rounded-xl">
              <UserX className="h-12 w-12 text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Account Deleted
          </h1>
          <p className="text-muted-foreground mt-3">
            Your account has been permanently deleted. All data, connections, and API keys have been removed.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Previous data cannot be recovered.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/register" className="inline-flex items-center justify-center gap-2">
              Register New Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Link
            to="/"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <Separator />
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span>n8n MCP SaaS</span>
        </div>
      </div>
    </div>
  );
}
