import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext(null);
const AuthDispatchContext = createContext(null);

const initialState = { token: null, user: null, status: 'idle', error: null };

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, status: 'authenticating', error: null };
    case 'LOGIN_SUCCESS':
      return { token: action.token, user: action.user, status: 'authenticated', error: null };
    case 'LOGIN_ERROR':
      return { token: null, user: null, status: 'error', error: action.error };
    case 'LOGOUT':
      return { ...initialState };
    default:
      throw Error('Unknown auth action: ' + action.type);
  }
}

// Reads any previously stored session so a page refresh doesn't bounce an
// authenticated user back to /login. A lazy useReducer initializer (rather
// than a mount effect) means this runs before the first render, avoiding a
// flash-redirect to /login while an effect would still be pending.
function hydrateFromStorage() {
  const token = localStorage.getItem('auth_token');
  const rawUser = localStorage.getItem('auth_user');
  if (!token || !rawUser) return initialState;
  try {
    return { token, user: JSON.parse(rawUser), status: 'authenticated', error: null };
  } catch {
    return initialState;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, hydrateFromStorage);
  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthDispatch() {
  return useContext(AuthDispatchContext);
}

export function useHasRole(roleName) {
  const { user } = useAuth();
  return Boolean(user?.roles?.includes(roleName));
}

export function useHasPermission(permissionName) {
  const { user } = useAuth();
  return Boolean(user?.permissions?.includes(permissionName));
}
