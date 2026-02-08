import { useState } from 'react';
import { MessageSquarePlus, X, CheckCircle, Loader2 } from 'lucide-react';
import { submitFeedback } from '../lib/api';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const categories = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Feedback' },
  { value: 'question', label: 'Question' },
];

export default function FeedbackBubble() {
  const [open, setOpen] = useState(false);
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
        setOpen(false);
      }, 2000);
    } else {
      setError(res.error?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Popover open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) { setError(''); setSuccess(false); } }}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            {open ? <X className="h-6 w-6" /> : <MessageSquarePlus className="h-6 w-6" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-0">
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3">
              <CheckCircle className="h-10 w-10 text-green-400" />
              <p className="text-foreground font-medium">Thank you!</p>
              <p className="text-muted-foreground text-sm">Your feedback has been submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Send Feedback</h3>
              </div>
              <div className="p-4 space-y-3">
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
              <div className="px-4 py-3 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || message.length < 10}
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  {submitting ? 'Sending...' : 'Submit'}
                </Button>
              </div>
            </form>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
