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
    path: 'broadcasts',
    loadComponent: () =>
      import('./features/chat-list/broadcasts-page').then((m) => m.BroadcastsPage),
  },
  {
    path: 'calls',
    loadComponent: () => import('./features/calls/calls-page').then((m) => m.CallsPage),
  },
  {
    // F-045: contact picker for `+ new call`.
    path: 'calls/new',
    loadComponent: () =>
      import('./features/calls/call-picker-page').then((m) => m.CallPickerPage),
  },
  {
    // F-045: the in-call screen. `?from=` is the validated return origin.
    path: 'calls/active',
    loadComponent: () =>
      import('./features/calls/in-call-page').then((m) => m.InCallPage),
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
    // F-057 FR-001: pushed sub-screen of /settings/account. Chrome PROVISIONAL -
    // no node exists for it in the design file.
    path: 'settings/account/security',
    loadComponent: () =>
      import('./features/settings/security-page').then((m) => m.SecurityPage),
  },
  {
    // F-057 FR-002.
    path: 'settings/account/two-step',
    loadComponent: () =>
      import('./features/settings/two-step-page').then((m) => m.TwoStepPage),
  },
  {
    // F-057 FR-003.
    path: 'settings/account/change-number',
    loadComponent: () =>
      import('./features/settings/change-number-page').then((m) => m.ChangeNumberPage),
  },
  {
    // F-057 FR-004/FR-008.
    path: 'settings/account/delete',
    loadComponent: () =>
      import('./features/settings/delete-account-page').then((m) => m.DeleteAccountPage),
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
    path: 'settings/chats/wallpaper',
    loadComponent: () =>
      import('./features/settings/wallpaper-page').then((m) => m.WallpaperPage),
  },
  {
    path: 'settings/chats/keyboard',
    loadComponent: () =>
      import('./features/settings/keyboard-page').then((m) => m.KeyboardPage),
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
    path: 'contact/:id/media',
    loadComponent: () =>
      import('./features/contact-info/media-page').then((m) => m.MediaPage),
  },
  {
    // F-048: shared-Groups sub-screen. Chrome is PROVISIONAL - no node exists
    // for it in the design file.
    path: 'contact/:id/groups',
    loadComponent: () =>
      import('./features/contact-info/groups-page').then((m) => m.GroupsPage),
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