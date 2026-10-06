import { createSelector } from '@ngrx/store';
import { AppState } from '../../app.module';

export const selectAuth = (state: AppState) => state.auth;

export const getToken = createSelector(
  selectAuth,
  (auth) => auth
);
