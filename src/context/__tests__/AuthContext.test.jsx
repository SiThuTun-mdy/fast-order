import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth, useAuthDispatch, useHasRole, useHasPermission } from '../AuthContext';

function useAuthHarness() {
  const auth = useAuth();
  const dispatch = useAuthDispatch();
  const hasSysAdmin = useHasRole('SysAdmin');
  const hasUserManage = useHasPermission('user.manage');
  return { ...auth, dispatch, hasSysAdmin, hasUserManage };
}

function renderAuth() {
  return renderHook(() => useAuthHarness(), { wrapper: AuthProvider });
}

const testUser = { id: 'u1', username: 'sysadmin', restaurantId: 'r1', roles: ['SysAdmin'], permissions: ['user.manage'] };

beforeEach(() => {
  localStorage.clear();
});

describe('authReducer via AuthProvider', () => {
  it('starts idle with no user when localStorage is empty', () => {
    const { result } = renderAuth();

    expect(result.current.status).toBe('idle');
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('sets status to authenticating on LOGIN_START', () => {
    const { result } = renderAuth();

    act(() => result.current.dispatch({ type: 'LOGIN_START' }));

    expect(result.current.status).toBe('authenticating');
    expect(result.current.error).toBeNull();
  });

  it('stores token/user and marks authenticated on LOGIN_SUCCESS', () => {
    const { result } = renderAuth();

    act(() => result.current.dispatch({ type: 'LOGIN_SUCCESS', token: 'abc', user: testUser }));

    expect(result.current.status).toBe('authenticated');
    expect(result.current.token).toBe('abc');
    expect(result.current.user).toEqual(testUser);
  });

  it('sets an error and clears token/user on LOGIN_ERROR', () => {
    const { result } = renderAuth();
    act(() => result.current.dispatch({ type: 'LOGIN_SUCCESS', token: 'abc', user: testUser }));

    act(() => result.current.dispatch({ type: 'LOGIN_ERROR', error: 'Invalid username or password' }));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Invalid username or password');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('resets to the initial state on LOGOUT', () => {
    const { result } = renderAuth();
    act(() => result.current.dispatch({ type: 'LOGIN_SUCCESS', token: 'abc', user: testUser }));

    act(() => result.current.dispatch({ type: 'LOGOUT' }));

    expect(result.current.status).toBe('idle');
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('throws for an unrecognized action type', () => {
    const { result } = renderAuth();

    expect(() => act(() => result.current.dispatch({ type: 'NOT_A_REAL_ACTION' }))).toThrow(
      'Unknown auth action: NOT_A_REAL_ACTION'
    );
  });
});

describe('localStorage hydration', () => {
  it('restores an authenticated session from a pre-populated localStorage', () => {
    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem('auth_user', JSON.stringify(testUser));

    const { result } = renderAuth();

    expect(result.current.status).toBe('authenticated');
    expect(result.current.token).toBe('stored-token');
    expect(result.current.user).toEqual(testUser);
  });

  it('falls back to idle when localStorage has malformed user JSON', () => {
    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem('auth_user', 'not-json');

    const { result } = renderAuth();

    expect(result.current.status).toBe('idle');
  });
});

describe('useHasRole / useHasPermission', () => {
  it('reflect the current user roles/permissions', () => {
    const { result } = renderAuth();
    act(() => result.current.dispatch({ type: 'LOGIN_SUCCESS', token: 'abc', user: testUser }));

    expect(result.current.hasSysAdmin).toBe(true);
    expect(result.current.hasUserManage).toBe(true);
  });

  it('are false for an unauthenticated user', () => {
    const { result } = renderAuth();

    expect(result.current.hasSysAdmin).toBe(false);
    expect(result.current.hasUserManage).toBe(false);
  });
});
