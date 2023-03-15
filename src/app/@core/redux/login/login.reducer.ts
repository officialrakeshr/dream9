import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/user.model';
import { addPushMessage, addUser } from './login.action';

export const initialState: Readonly<User> = { username: '', token: sessionStorage.getItem('token')||'' , displayname:sessionStorage.getItem('username')||'' , role:sessionStorage.getItem('role')|| '' ,pushmessages:'' };
export const initialStatePushMsg:string ='';
export const loginReducer = createReducer(
  initialState,
  on(addUser, (state, { payload }) => {
    return payload;
  }),
);

export const pushMessage = createReducer(
  initialStatePushMsg,
  on(addPushMessage, (state, { payload }) => {
    return payload;
  }),
);
