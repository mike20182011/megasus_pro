import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EscaneoComponent } from './components/escaneo/escaneo';
import { authGuard } from './guards/auth-guard';
import { HistorialComponent } from './components/historial/historial.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'escanear', 
    component: EscaneoComponent, 
    canActivate: [authGuard] 
  },
  { 
  path: 'historial', 
  component: HistorialComponent, 
  canActivate: [authGuard] 
},
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];