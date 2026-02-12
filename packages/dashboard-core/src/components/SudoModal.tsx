import { useState, useEffect } from 'react';
import { Shield, Smartphone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

interface SudoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loading: boolean;
  error: string | null;
  onVerifyTOTP: (code: string) => Promise<boolean>;
  clearError: () => void;
}

type Step = 'verify' | 'success';

export default function SudoModal({
  open,
  onClose,
  onSuccess,
  loading,
  error,
  onVerifyTOTP,
  clearError,
}: SudoModalProps) {
  const [step, setStep] = useState<Step>('verify');
  const [otpValue, setOtpValue] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('verify');
      setOtpValue('');
      clearError();
    }
  }, [open, clearError]);

  const handleOtpComplete = async (value: string) => {
    const success = await onVerifyTOTP(value);
    if (success) {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setOtpValue('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Security Verification</DialogTitle>
              <DialogDescription>
                Verify your identity to continue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step: Verify */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Enter the 6-digit code from your authenticator app</span>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
                onComplete={handleOtpComplete}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Open Google Authenticator, Authy, or your preferred authenticator app
            </p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="bg-green-900/30 p-3 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-foreground font-medium">Verification Successful</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sudo mode active for 15 minutes
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
