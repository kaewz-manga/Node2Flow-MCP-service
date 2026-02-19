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
export { ConnectionProvider, useConnection, usePluginConnection } from './contexts/ConnectionContext';

// Components
export { default as Layout } from './components/Layout';
export type { DashboardPlugin, SidebarItem } from './components/Layout';
export { default as AdminLayout } from './components/AdminLayout';
export { default as AdminRoute } from './components/AdminRoute';
export { default as SudoModal } from './components/SudoModal';
export { default as FeedbackDialog } from './components/FeedbackBubble';
export { default as PluginTabs } from './components/PluginTabs';
export type { PluginTab, PluginTabsProps } from './components/PluginTabs';

// UI Components
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/ui/accordion';
export { Button, buttonVariants } from './components/ui/button';
export type { ButtonProps } from './components/ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from './components/ui/card';
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
export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldContent, FieldSet, FieldLegend, FieldTitle, FieldSeparator } from './components/ui/field';
export { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, InputGroupText } from './components/ui/input-group';
export { Toaster } from './components/ui/sonner';
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from './components/ui/alert-dialog';
export { Switch } from './components/ui/switch';
export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemSeparator, ItemHeader, ItemFooter } from './components/ui/item';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from './components/ui/empty';
export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from './components/ui/pagination';

// Hooks
export { useSudo } from './hooks/useSudo';
export { useIsMobile } from './hooks/use-mobile';

// Pages
export { default as LoginPage } from './pages/Login';
export { default as RegisterPage } from './pages/Register';
