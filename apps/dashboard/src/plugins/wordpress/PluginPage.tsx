import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const PostList = lazy(() => import('./PostList'));
const PageList = lazy(() => import('./PageList'));
const MediaList = lazy(() => import('./MediaList'));
const CommentList = lazy(() => import('./CommentList'));

export default function WordPressPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'posts', label: 'Posts', component: PostList },
        { id: 'pages', label: 'Pages', component: PageList },
        { id: 'media', label: 'Media', component: MediaList },
        { id: 'comments', label: 'Comments', component: CommentList },
      ]}
    />
  );
}
