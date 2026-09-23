import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'chats', pathMatch: 'full' },
  {
    path: 'chats',
    loadComponent: () => import('./features/chat-list/chats-page').then((m) => m.ChatsPage),
  },
  { path: '**', redirectTo: 'chats' },
];