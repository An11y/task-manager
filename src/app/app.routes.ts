import { Routes } from '@angular/router';
import { TasksPageComponent } from './pages/tasks-page/tasks-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: 'tasks', component: TasksPageComponent },
  { path: '**', redirectTo: 'tasks' },
];
