import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/user.model';
import { addUser } from './login.action';

export const initialState: Readonly<User> = { username: '', token: sessionStorage.getItem('token')||'' , displayname:sessionStorage.getItem('username')||'' , role:sessionStorage.getItem('role')|| '' };

export const loginReducer = createReducer(
  initialState,
  on(addUser, (state, { payload }) => {
    return payload;
  })
);
