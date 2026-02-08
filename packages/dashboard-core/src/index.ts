// @node2flow/dashboard-core
// Shared React components, contexts, hooks, pages, and API layer

// API Layer
export {
  configureApi,
  getApiConfig,
  platformRequest,
  gatewayRequest,
  getToken,
  setToken,
  clearToken,
  isAuthenticated,
  login,
  register,
  logout,
  getProfile,
  getOAuthProviders,
  getOAuthUrl,
  handleOAuthToken,
  getConnections,
  getSudoStatus,
  verifySudoTOTP,
  submitFeedback,
} from './lib/api';

export type {
  ApiConfig,
  ApiResponse,
  User,
  Connection,
  OAuthProvider,
  SudoStatus,
} from './lib/api';

// Contexts
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { SudoProvider, useSudoContext } from './contexts/SudoContext';
export { ConnectionProvider, useConnection } from './contexts/ConnectionContext';

// Components
export { default as Layout } from './components/Layout';
export type { DashboardPlugin, SidebarItem } from './components/Layout';
export { default as AdminLayout } from './components/AdminLayout';
export { default as AdminRoute } from './components/AdminRoute';
export { default as SudoModal } from './components/SudoModal';
export { default as FeedbackBubble } from './components/FeedbackBubble';

// UI Components
export { Button, buttonVariants } from './components/ui/button';
export type { ButtonProps } from './components/ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Badge, badgeVariants } from './components/ui/badge';
export type { BadgeProps } from './components/ui/badge';
export { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/ui/dialog';
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from './components/ui/select';
export { Separator } from './components/ui/separator';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';
export { Skeleton } from './components/ui/skeleton';
export { Textarea } from './components/ui/textarea';
export { Progress } from './components/ui/progress';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/ui/table';
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './components/ui/sheet';
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/ui/collapsible';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from './components/ui/dropdown-menu';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './components/ui/popover';
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './components/ui/input-otp';
export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldContent } from './components/ui/field';
export { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, InputGroupText } from './components/ui/input-group';

// Hooks
export { useSudo } from './hooks/useSudo';

// Pages
export { default as LoginPage } from './pages/Login';
export { default as RegisterPage } from './pages/Register';
