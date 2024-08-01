import { createSelector, createFeatureSelector } from '@ngrx/store';
import { User } from '../../models/user.model';

export const selectLoginUser = createFeatureSelector<Readonly<User>>('login');
export const selectPushMessage = createFeatureSelector<Readonly<any>>('push');

export const selectUser = createSelector(selectLoginUser, (user) => {
  return user;
});

export const selectMsg = createSelector(selectPushMessage, (msg) => {
  return msg;
});