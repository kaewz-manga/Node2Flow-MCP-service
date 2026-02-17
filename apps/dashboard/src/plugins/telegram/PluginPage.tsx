import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const MessageTools = lazy(() => import('./MessageTools'));
const ChatManagement = lazy(() => import('./ChatManagement'));
const WebhookSettings = lazy(() => import('./WebhookSettings'));

export default function TelegramPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'messages', label: 'Messages', component: MessageTools },
        { id: 'chats', label: 'Chats', component: ChatManagement },
        { id: 'webhooks', label: 'Webhooks', component: WebhookSettings },
      ]}
    />
  );
}
