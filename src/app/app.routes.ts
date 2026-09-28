import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'chats', pathMatch: 'full' },
  {
    path: 'chats',
    loadComponent: () => import('./features/chat-list/chats-page').then((m) => m.ChatsPage),
  },
  {
    path: 'archived',
    loadComponent: () =>
      import('./features/chat-list/archived-page').then((m) => m.ArchivedPage),
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
  {
    path: 'settings/chats',
    loadComponent: () =>
      import('./features/settings/chats-settings-page').then((m) => m.ChatsSettingsPage),
  },
  {
    path: 'settings/chats/font-size',
    loadComponent: () =>
      import('./features/settings/font-size-page').then((m) => m.FontSizePage),
  },
  {
    path: 'settings/notifications',
    loadComponent: () =>
      import('./features/settings/notifications-page').then((m) => m.NotificationsPage),
  },
  {
    path: 'settings/data-storage',
    loadComponent: () =>
      import('./features/settings/data-storage-page').then((m) => m.DataStoragePage),
  },
  {
    path: 'settings/profile',
    loadComponent: () => import('./features/settings/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'contact/:id',
    loadComponent: () =>
      import('./features/contact-info/contact-page').then((m) => m.ContactPage),
  },
  {
    path: 'contact/:id/edit',
    loadComponent: () =>
      import('./features/contact-info/edit-contact-page').then((m) => m.EditContactPage),
  },
  {
    path: 'contacts',
    loadComponent: () => import('./features/contacts/contacts-page').then((m) => m.ContactsPage),
  },
  {
    path: 'new-group',
    loadComponent: () =>
      import('./features/new-group/new-group-page').then((m) => m.NewGroupPage),
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  { path: '**', redirectTo: 'chats' },
];