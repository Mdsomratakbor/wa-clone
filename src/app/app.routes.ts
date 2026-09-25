import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'chats', pathMatch: 'full' },
  {
    path: 'chats',
    loadComponent: () => import('./features/chat-list/chats-page').then((m) => m.ChatsPage),
  },
  {
    path: 'calls',
    loadComponent: () => import('./features/calls/calls-page').then((m) => m.CallsPage),
  },
  {
    path: 'camera',
    loadComponent: () => import('./features/camera/camera-page').then((m) => m.CameraPage),
  },
  {
    path: 'status',
    loadComponent: () => import('./features/status/status-page').then((m) => m.StatusPage),
  },
  {
    path: 'status/compose',
    loadComponent: () =>
      import('./features/status/compose-page').then((m) => m.ComposePage),
  },
  {
    path: 'chat/:id',
    loadComponent: () =>
      import('./features/chat-window/chat-window-page').then((m) => m.ChatWindowPage),
  },
  {
    path: 'starred-messages',
    loadComponent: () =>
      import('./features/starred-messages/starred-page').then((m) => m.StarredPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-page').then((m) => m.SettingsPage),
  },
  {
    path: 'settings/account',
    loadComponent: () => import('./features/settings/account-page').then((m) => m.AccountPage),
  },
  { path: '**', redirectTo: 'chats' },
];