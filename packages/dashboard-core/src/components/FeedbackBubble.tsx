import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { submitFeedback } from '../lib/api';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const categories = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Feedback' },
  { value: 'question', label: 'Question' },
];

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }
    setError('');
    setSubmitting(true);

    const res = await submitFeedback(category, message);
    setSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setMessage('');
      setCategory('general');
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } else {
      setError(res.error?.message || 'Failed to submit feedback');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setError('');
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle className="h-10 w-10 text-green-400" />
            <p className="text-foreground font-medium">Thank you!</p>
            <p className="text-muted-foreground text-sm">Your feedback has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{message.length}/2000</p>
              </div>
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || message.length < 10}
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                {submitting ? 'Sending...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
