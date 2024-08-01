import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

export const addUser = createAction(
  '[Login Page] Add User',
  props<{ payload: User }>()
);

export const addPushMessage = createAction(
  '[App] addPushMessage',
  props<{ payload: any }>()
);
