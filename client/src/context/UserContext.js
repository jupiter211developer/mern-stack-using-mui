import React from "react";
import axios from 'axios'
import config from '../config'

var UserStateContext = React.createContext()
var UserDispatchContext = React.createContext()

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true, user: action.user }
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false, user: null }
    case "USER_INFO_SUCCESS":
      return { ...state, isAuthenticated: true, user: action.user }
    case "USER_INFO_FAIED":
      return { ...state, isAuthenticated: false, user: null }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function UserProvider({ children }) {
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!localStorage.getItem("id_token"),
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut, registerUser, loadUserInfo };

// ###########################################################

function loginUser(dispatch, email, password, history, setIsLoading, setError, sendNotification) {
  setError(false);
  setIsLoading(true);

  axios
    .post(`${config.apiUrl}/api/auth/login`, { email, password })
    .then(res => {
      localStorage.setItem('id_token', res.data.token)
      setIsLoading(false)
      setError(null)

      sendNotification({
        type: 'message',
        message: 'Successfully logined!',
        variant: 'contained',
        color: 'success'
      }, {
        type: 'success'
      })

      setTimeout(() => {
        dispatch({ type: 'LOGIN_SUCCESS', user: res.data.user })
      }, 2000)
    })
    .catch(err => {
      err.response && sendNotification({
          type: 'message',
          message: err.response.data.msg,
          variant: 'contained',
          color: 'secondary',
      }, {
        type: 'error'
      })
      setError(true)
      setIsLoading(false)
    })

  // if (!!login && !!password) {
  //   setTimeout(() => {
  //     localStorage.setItem('id_token', 1)
  //     setError(null)
  //     setIsLoading(false)
  //     dispatch({ type: 'LOGIN_SUCCESS' })

  //     // history.push('/app/dashboard')
  //   }, 2000);
  // } else {
  //   dispatch({ type: "LOGIN_FAILURE" })
  //   setError(true)
  //   setIsLoading(false)
  // }
}

function registerUser(dispatch, history, name, email, password, setIsLoading, setError, sendNotification) {
  setError(false)
  setIsLoading(true)

  axios
    .post(`${config.apiUrl}/api/auth/register`, { name, email, password })
    .then(res => {
      localStorage.setItem('id_token', res.data.token)
      setIsLoading(false)
      setError(null)

      sendNotification({
        type: 'message',
        message: 'Successfully registered!',
        variant: 'contained',
        color: 'success'
      }, {
        type: 'success'
      })

      setTimeout(() => {
        dispatch({ type: 'LOGIN_SUCCESS', user: res.data.user })
        // history.push('/app/dashboard')
      }, 2000)
    })
    .catch(err => {
      err.response && sendNotification({
          type: 'message',
          message: err.response.data.msg,
          variant: 'contained',
          color: 'secondary',
      }, {
        type: 'error'
      })
      setError(true)
      setIsLoading(false)
    });
}

function signOut(dispatch, history) {
  localStorage.removeItem("id_token")
  dispatch({ type: "SIGN_OUT_SUCCESS" })
  history.push("/login")
}

function loadUserInfo(dispatch) {
  if (!localStorage.getItem('id_token')) {
    return
  }
  
  axios
    .get(`${config.apiUrl}/api/auth/user`, {
      headers: {
        'x-auth-token': localStorage.getItem('id_token')
      }
    })
    .then(res => {
      dispatch({ type: 'USER_INFO_SUCCESS', user: res.data })
    })
    .catch(err => {
      dispatch({ type: 'USER_INFO_FAIED' })
    })
}