import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useAuth,
  useSudoContext,
  clearToken,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@node2flow/dashboard-core';

import {
  changePassword,
  deleteAccount,
  forceDeleteAccount,
  updateSessionDuration,
  setupTOTP,
  enableTOTP,
  disableTOTP,
  getTOTPStatus,
  exportUserData,
  recoverAccount,
  type TOTPSetupData,
} from '../lib/platform-api';
import {
  Mail,
  Shield,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  Smartphone,
  QrCode,
  Copy,
  CheckCircle,
  Download,
  FileJson,
  FileSpreadsheet,
  RotateCcw,
  Lock,
  LogOut,
} from 'lucide-react';

const ApiKeysTab = lazy(() => import('./ApiKeys'));

const SESSION_OPTIONS = [
  { value: '3600', label: '1 hour' },
  { value: '86400', label: '24 hours' },
  { value: '604800', label: '7 days' },
  { value: '2592000', label: '30 days' },
];

const OAUTH_LOGOS: Record<string, string> = {
  google: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
  github: 'https://cdn.simpleicons.org/github/white',
};

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { withSudo, totpEnabled: contextTotpEnabled } = useSudoContext();
  const [searchParams] = useSearchParams();
  const defaultTab = useMemo(() => searchParams.get('tab') || 'profile', []);

  // TOTP state
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<TOTPSetupData | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpSuccess, setTotpSuccess] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Session duration state
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Data export state
  const [exportLoading, setExportLoading] = useState<'json' | 'csv' | null>(null);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  // Account recovery state
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverError, setRecoverError] = useState('');

  // Force delete state
  const [showForceDelete, setShowForceDelete] = useState(false);
  const [forceDeletePassword, setForceDeletePassword] = useState('');
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [forceDeleteError, setForceDeleteError] = useState('');

  const isOAuthUser = !!user?.oauth_provider;
  const isPendingDeletion = user?.status === 'pending_deletion';
  const scheduledDeletionAt = (user as any)?.scheduled_deletion_at;

  useEffect(() => { loadTOTPStatus(); }, []);
  useEffect(() => { setTotpEnabled(contextTotpEnabled); }, [contextTotpEnabled]);

  const loadTOTPStatus = async () => {
    const res = await getTOTPStatus();
    if (res.success && res.data) setTotpEnabled(res.data.enabled);
  };

  const handleSetupTOTP = async () => {
    setTotpLoading(true); setTotpError('');
    const res = await setupTOTP();
    setTotpLoading(false);
    if (res.success && res.data) setTotpSetupData(res.data);
    else setTotpError(res.error?.message || 'Failed to start TOTP setup');
  };

  const handleEnableTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) { setTotpError('Please enter a 6-digit code'); return; }
    setTotpLoading(true); setTotpError('');
    const res = await enableTOTP(totpCode);
    setTotpLoading(false);
    if (res.success) {
      setTotpSuccess('Two-factor authentication enabled successfully!');
      setTotpSetupData(null); setTotpCode(''); setTotpEnabled(true);
      setTimeout(() => setTotpSuccess(''), 3000);
    } else setTotpError(res.error?.message || 'Invalid code. Please try again.');
  };

  const handleDisableTOTP = async () => {
    if (disableCode.length !== 6) { setTotpError('Please enter a 6-digit code'); return; }
    setTotpLoading(true); setTotpError('');
    const res = await disableTOTP(disableCode);
    setTotpLoading(false);
    if (res.success) {
      setTotpSuccess('Two-factor authentication disabled');
      setTotpEnabled(false); setShowDisableConfirm(false); setDisableCode('');
      setTimeout(() => setTotpSuccess(''), 3000);
    } else setTotpError(res.error?.message || 'Failed to disable TOTP');
  };

  const handleCopySecret = () => {
    if (totpSetupData?.secret) {
      navigator.clipboard.writeText(totpSetupData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleSessionDurationChange = async (value: string) => {
    const seconds = Number(value);
    setSessionError(''); setSessionSuccess(false); setSessionLoading(true);
    const res = await updateSessionDuration(seconds);
    setSessionLoading(false);
    if (res.success) {
      setSessionSuccess(true); await refreshUser();
      setTimeout(() => setSessionSuccess(false), 2000);
    } else setSessionError(res.error?.message || 'Failed to update session duration');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError('');
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }
    await withSudo(async () => {
      setPasswordLoading(true);
      const res = await changePassword(currentPassword, newPassword);
      setPasswordLoading(false);
      if (res.success) {
        setPasswordSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(false); }, 2000);
      } else setPasswordError(res.error?.message || 'Failed to change password');
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') return;
    setDeleteError(''); setDeleteLoading(true);
    await withSudo(async () => {
      const res = isOAuthUser
        ? await deleteAccount(undefined, true)
        : await deleteAccount(undefined, true);
      setDeleteLoading(false);
      if (res.success) { setShowDeleteConfirm(false); await refreshUser(); }
      else setDeleteError(res.error?.message || 'Failed to delete account');
    });
  };

  const handleForceDelete = async () => {
    setForceDeleteError(''); setForceDeleteLoading(true);
    await withSudo(async () => {
      const res = isOAuthUser
        ? await forceDeleteAccount(undefined, true)
        : await forceDeleteAccount(forceDeletePassword, undefined);
      setForceDeleteLoading(false);
      if (res.success) { clearToken(); window.location.href = '/account-deleted'; }
      else setForceDeleteError(res.error?.message || 'Failed to delete account');
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExportLoading(format); setExportError(''); setExportSuccess('');
    try {
      const blob = await exportUserData(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `n8n-mcp-export-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setExportSuccess(`Data exported as ${format.toUpperCase()} successfully!`);
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (err) { setExportError(err instanceof Error ? err.message : 'Failed to export data'); }
    finally { setExportLoading(null); }
  };

  const handleRecoverAccount = async () => {
    setRecoverLoading(true); setRecoverError('');
    try {
      const res = await recoverAccount();
      if (res.success) await refreshUser();
      else setRecoverError(res.error?.message || 'Failed to recover account');
    } catch (err) { setRecoverError(err instanceof Error ? err.message : 'Failed to recover account'); }
    finally { setRecoverLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Account Recovery Banner */}
      {isPendingDeletion && scheduledDeletionAt && (
        <Alert variant="warning">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <h3 className="font-semibold">Account Scheduled for Deletion</h3>
            <p className="text-sm mt-1">
              Your account is scheduled to be permanently deleted on{' '}
              <strong>{new Date(scheduledDeletionAt).toLocaleDateString()}</strong>.
            </p>
            {recoverError && <p className="text-red-400 text-sm mt-2">{recoverError}</p>}
            <div className="flex gap-3 mt-3">
              <Button size="sm" onClick={handleRecoverAccount} disabled={recoverLoading}>
                {recoverLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Recovering...</> : <><RotateCcw className="h-4 w-4" /> Cancel Deletion</>}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowForceDelete(true)}>
                <Trash2 className="h-4 w-4" /> Force Delete Now
              </Button>
            </div>

            {showForceDelete && (
              <Card className="mt-4 border-red-700">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-red-300">This will <strong>permanently delete</strong> your account immediately.</p>
                  {forceDeleteError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{forceDeleteError}</AlertDescription></Alert>}
                  {!isOAuthUser && (
                    <div className="space-y-2"><Label className="text-red-300">Enter your password to confirm</Label><Input type="password" placeholder="Your password" value={forceDeletePassword} onChange={(e) => setForceDeletePassword(e.target.value)} /></div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => { setShowForceDelete(false); setForceDeletePassword(''); setForceDeleteError(''); }}>Cancel</Button>
                    <Button variant="destructive" onClick={handleForceDelete} disabled={forceDeleteLoading || (!isOAuthUser && !forceDeletePassword)}>
                      {forceDeleteLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Permanently Delete Account'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList variant="line">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile">
          <Card>
            <CardContent className="p-0">
              <ItemGroup>
                <Item>
                  <ItemMedia variant="icon">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Email</ItemTitle>
                    <ItemDescription>{user?.email}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge variant="success" className="capitalize font-bold">{user?.status}</Badge>
                  </ItemActions>
                </Item>
                <ItemSeparator />
                <Item>
                  <ItemMedia variant="icon">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Plan</ItemTitle>
                    <ItemDescription>Current subscription plan</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge variant="success" className="capitalize font-bold">{user?.plan}</Badge>
                  </ItemActions>
                </Item>
                {isOAuthUser && (
                  <>
                    <ItemSeparator />
                    <Item>
                      <ItemMedia variant="icon">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Login Method</ItemTitle>
                        <ItemDescription>Authenticated via {user?.oauth_provider}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        {user?.oauth_provider && OAUTH_LOGOS[user.oauth_provider] ? (
                          <img src={OAUTH_LOGOS[user.oauth_provider]} alt={user.oauth_provider} className="h-5 w-5" />
                        ) : (
                          <Badge variant="secondary" className="capitalize">{user?.oauth_provider}</Badge>
                        )}
                      </ItemActions>
                    </Item>
                  </>
                )}
              </ItemGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security Tab ── */}
        <TabsContent value="security">
          <Card>
            <CardContent className="p-0">
              {totpSuccess && <Alert variant="success" className="mx-4 mt-4"><CheckCircle className="h-4 w-4" /><AlertDescription>{totpSuccess}</AlertDescription></Alert>}
              {totpError && <Alert variant="destructive" className="mx-4 mt-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{totpError}</AlertDescription></Alert>}

              <ItemGroup>
                {/* 2FA */}
                <Item>
                  <ItemMedia variant="icon">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      Two-Factor Authentication
                      {totpEnabled && <Badge variant="success" className="ml-1">Enabled</Badge>}
                    </ItemTitle>
                    <ItemDescription>Add an extra layer of security using an authenticator app</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Switch
                      checked={totpEnabled}
                      onCheckedChange={(checked) => { if (checked) handleSetupTOTP(); else setShowDisableConfirm(true); }}
                      disabled={totpLoading}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </ItemActions>
                </Item>

                {/* 2FA Setup Flow */}
                {!totpEnabled && totpSetupData && (
                  <div className="px-4 pb-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="text-center">
                          <div className="bg-white p-4 rounded-lg inline-block mb-3">
                            <img src={totpSetupData.qr_code_url} alt="TOTP QR Code" className="w-48 h-48" />
                          </div>
                          <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app</p>
                        </div>
                        <div>
                          <Label>Or enter this code manually:</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 bg-black px-3 py-2 rounded font-mono text-sm text-foreground break-all">{totpSetupData.secret}</code>
                            <Button variant="secondary" size="icon" onClick={handleCopySecret}>
                              {secretCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <form onSubmit={handleEnableTOTP} className="space-y-3">
                          <Label>Enter the 6-digit code from your app:</Label>
                          <div className="flex justify-center">
                            <InputOTP maxLength={6} value={totpCode} onChange={setTotpCode}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <Button type="submit" className="w-full" disabled={totpLoading || totpCode.length !== 6}>
                            {totpLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : <><Check className="h-4 w-4" /> Verify & Enable</>}
                          </Button>
                        </form>
                        <Button variant="link" className="text-muted-foreground" onClick={() => { setTotpSetupData(null); setTotpCode(''); setTotpError(''); }}>Cancel setup</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 2FA Disable Confirm */}
                {totpEnabled && showDisableConfirm && (
                  <div className="px-4 pb-4">
                    <Card className="border-red-700">
                      <CardContent className="p-4 space-y-4">
                        <p className="text-sm text-red-300">Enter your 2FA code to confirm disabling two-factor authentication.</p>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={disableCode} onChange={setDisableCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => { setShowDisableConfirm(false); setDisableCode(''); setTotpError(''); }}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDisableTOTP} disabled={totpLoading || disableCode.length !== 6}>
                            {totpLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Disabling...</> : 'Disable 2FA'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <ItemSeparator />

                {/* Password */}
                <Item>
                  <ItemMedia variant="icon">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Password</ItemTitle>
                    <ItemDescription>
                      {isOAuthUser
                        ? `Managed by ${user?.oauth_provider}`
                        : 'Change your password to keep your account secure'
                      }
                    </ItemDescription>
                  </ItemContent>
                  {!isOAuthUser && (
                    <ItemActions>
                      <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>Change</Button>
                    </ItemActions>
                  )}
                </Item>
                <ItemSeparator />

                {/* Session Duration */}
                <Item>
                  <ItemMedia variant="icon">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      Session Duration
                      {sessionSuccess && <Check className="h-3.5 w-3.5 text-green-400" />}
                    </ItemTitle>
                    <ItemDescription>
                      {sessionError || 'How long you stay logged in before needing to sign in again'}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <div className="flex items-center gap-2">
                      <Select value={String(user?.session_duration_seconds || 86400)} onValueChange={handleSessionDurationChange} disabled={sessionLoading}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SESSION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sessionLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                  </ItemActions>
                </Item>
                <ItemSeparator />

                {/* Sign Out */}
                <Item>
                  <ItemMedia variant="icon">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Active Sessions</ItemTitle>
                    <ItemDescription>Sign out of all sessions on all devices</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button variant="destructive" size="sm" onClick={logout}>Sign Out</Button>
                  </ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── API Keys Tab ── */}
        <TabsContent value="api-keys">
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <ApiKeysTab />
          </Suspense>
        </TabsContent>

        {/* ── Data Tab ── */}
        <TabsContent value="data">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Export Your Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {exportSuccess && <Alert variant="success" className="mx-4 mt-4"><CheckCircle className="h-4 w-4" /><AlertDescription>{exportSuccess}</AlertDescription></Alert>}
              {exportError && <Alert variant="destructive" className="mx-4 mt-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{exportError}</AlertDescription></Alert>}
              <ItemGroup>
                <Item>
                  <ItemMedia variant="icon">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>JSON Export</ItemTitle>
                    <ItemDescription>Download a full copy of your data (GDPR compliant)</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button variant="outline" size="sm" onClick={() => handleExport('json')} disabled={exportLoading !== null}>
                      {exportLoading === 'json' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Download className="h-4 w-4" /> Export</>}
                    </Button>
                  </ItemActions>
                </Item>
                <ItemSeparator />
                <Item>
                  <ItemMedia variant="icon">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>CSV Export</ItemTitle>
                    <ItemDescription>Download usage logs as a spreadsheet</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={exportLoading !== null}>
                      {exportLoading === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Download className="h-4 w-4" /> Export</>}
                    </Button>
                  </ItemActions>
                </Item>
              </ItemGroup>
              <p className="text-xs text-muted-foreground px-4 pb-4">Encrypted credentials and API key secrets are not included for security.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Danger Zone Tab ── */}
        <TabsContent value="danger">
          <Card className="border-red-900/50">
            <CardContent className="p-0">
              <ItemGroup>
                <Item>
                  <ItemMedia variant="icon">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="text-red-400">Delete Account</ItemTitle>
                    <ItemDescription>Permanently delete your account and all associated data</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {!showDeleteConfirm ? (
                      <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                    ) : null}
                  </ItemActions>
                </Item>
              </ItemGroup>

              {showDeleteConfirm && (
                <div className="px-4 pb-4">
                  <Card className="border-red-700">
                    <CardContent className="p-4 space-y-4">
                      <p className="text-sm text-red-300">Are you sure? All your data, connections, and API keys will be permanently deleted.</p>
                      {deleteError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{deleteError}</AlertDescription></Alert>}
                      <div className="space-y-2"><Label className="text-red-300">Type <span className="font-mono font-bold">delete</span> to confirm</Label><Input placeholder="delete" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} /></div>
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading || deleteConfirmText.toLowerCase() !== 'delete'}>
                          {deleteLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : 'Yes, Delete My Account'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordModal} onOpenChange={(open) => { if (!open) { setShowPasswordModal(false); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          {passwordSuccess ? (
            <div className="text-center py-4">
              <div className="bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Password Updated!</h3>
              <p className="text-muted-foreground mt-1">Your password has been changed successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{passwordError}</AlertDescription></Alert>}
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} /><p className="text-xs text-muted-foreground">Must be at least 8 characters</p></div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowPasswordModal(false); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={passwordLoading}>
                  {passwordLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
