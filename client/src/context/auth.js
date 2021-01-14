import React, { useReducer, createContext } from 'react';
import jwtDecode from 'jwt-decode';

const initialState = {
  user: null
};

// here we check for a token in localStorage
// if is old we remove token
// we then assign initialState.user = decodedToken;
if (localStorage.getItem('jwtToken')) {
  const decodedToken = jwtDecode(localStorage.getItem('jwtToken'));

  if (decodedToken.exp * 1000 < Date.now()) {
    localStorage.removeItem('jwtToken');
  } else {
    initialState.user = decodedToken;
  }
}

/*//// REACT CREATE CONTEXT  ////*/

const AuthContext = createContext({
  user: null,
  login: (userData) => {},
  logout: () => {}
});

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  // with the authprovider we destructure [state, dispatch] from useReducer(authReducer, initialState);
  const [state, dispatch] = useReducer(authReducer, initialState);
  // login function - sets item in localstorage 
  // dispatch ({ login with payload}) 
  function login(userData) {
    localStorage.setItem('jwtToken', userData.token);
    dispatch({
      type: 'LOGIN',
      payload: userData
    });
  }
  // logout function remove token
  // dispatch ({logout})
  function logout() {
    localStorage.removeItem('jwtToken');
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
      {...props}
    />
  );
}

export { AuthContext, AuthProvider };
