import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './../services/user.service';

import { UserRole } from './../models/user.model';

export const authGuard = (role: UserRole) => {
  return async () => {
    const router = inject(Router);
    const userService = inject(UserService);

    const isLogged = userService.isUserLogged();

    if (!isLogged) {
      return router.navigate([ '/' ]);
    }

    const user = userService.user();

    if (!user) {
      const responseStatus = await userService.setUserFromDatabase();

      if (responseStatus !== 200) {
        return router.navigate([ '/' ]);
      }
    }

    if (role === UserRole.End_User) {
      return true;
    }

    if (role === UserRole.Admin && (userService.isUserAdmin() || userService.isUserMasterAdmin())) {
      return true;
    }

    if (role === UserRole.Master_Admin && userService.isUserMasterAdmin()) {
      return true;
    }

    return router.navigate([ '/dashboard' ]);
  }
}
