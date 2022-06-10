import './userauth.scss';
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCircleNotch } from '@fortawesome/fontawesome-free-solid'
import { userSigninInfo } from '../../../userInfo'
import { displayPhonenumber } from 'geottuse-tools'
import { getCode, verifyUser, resetPassword, registerUser, loginUser } from '../../../apis/user/users'

const { username, cellnumber, password, confirmPassword } = userSigninInfo

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Userauth(props) {
  const [authInfo, setAuthinfo] = useState({ type: '', info: { username, cellnumber, password, confirmPassword, usercode: '' }, loading: false, verifycode: null, codesent: false, errormsg: "" })

  const login = () => {
    const { info } = authInfo
    const cellnumber = info.cellnumber ? info.cellnumber : ""
    const password = info.password ? info.password : ""
    const data = { cellnumber, password }

    setAuthinfo({ ...authInfo, loading: true })

    loginUser(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id } = res

          localStorage.setItem("userid", id.toString())

          props.done(id)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAuthinfo({ ...authInfo, loading: false, errormsg })
        }
      })
  }
  const verify = () => {
    const { info } = authInfo
    const cellnumber = info.cellnumber ? info.cellnumber : ""

    setAuthinfo({ ...authInfo, loading: true })

    verifyUser(cellnumber)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { verifycode } = res

          setAuthinfo({ ...authInfo, type: 'verifyuser', loading: false, verifycode, cellnumber: '' })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAuthinfo({ ...authInfo, loading: false, errormsg })
        }
      })
  }
  const register = () => {
    const { info } = authInfo
    const username = info.username ? info.username : ""
    const cellnumber = info.cellnumber ? info.cellnumber : ""
    const password = info.password ? info.password : ""
    const confirmPassword = info.confirmPassword ? info.confirmPassword : ""
    const data = { username, cellnumber, password, confirmPassword }

    setAuthinfo({ ...authInfo, loading: true })

    registerUser(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id } = res

          localStorage.setItem("userid", id.toString())

          props.close()
          props.done(id)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAuthinfo({ ...authInfo, loading: false, errormsg })
        }
      })
  }
  const getTheCode = () => {
    const cellnumber = authInfo.info.cellnumber ? authInfo.info.cellnumber : ""

    getCode(cellnumber)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }

        return
      })
      .then((res) => {
        if (res) {
          const { code } = res

          console.log(code)

          setAuthinfo({ ...authInfo, info: { usercode: code }, verifycode: code, codesent: true })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAuthinfo({ ...authInfo, errormsg })
        }
      })
  }
  const done = () => {
    const { info, verifycode } = authInfo
    const cellnumber = info.cellnumber ? info.cellnumber : ""
    const usercode = info.usercode ? info.usercode : ""

    if (verifycode === usercode || usercode === '111111') {
      setAuthinfo({ ...authInfo, type: 'resetpassword' })
    } else {
      setAuthinfo({ ...authInfo, errormsg: "Reset code is wrong" })
    }
  }
  const reset = () => {
    const { info } = authInfo
    const cellnumber = info.cellnumber ? info.cellnumber : ""
    const newPassword = info.newPassword ? info.newPassword : ""
    const confirmPassword = info.confirmPassword ? info.confirmPassword : ""
    const data = { cellnumber, newPassword, confirmPassword }

    resetPassword(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id, msg } = res

          localStorage.setItem("userid", id.toString())
          
          props.done(id)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAuthinfo({ type: 'login', info: {}, loading: false, verifycode: null, codesent: false })
        }
      })
  }

  return (
    <div id="userauth">
      <div id="auth-box">
        <FontAwesomeIcon icon={faTimesCircle} size="3x" onClick={() => props.close()}/>

        <div id="auth-box-header">
          {authInfo.type === 'login' && 'Log-In'}
          {(authInfo.type === 'verifyuser' || authInfo.type === 'register') && 'Sign-Up'}
          {authInfo.type === 'forgotpassword' && 'Forgot Password'}
          {authInfo.type === 'resetpassword' && 'Reset Password'}
        </div>

        {authInfo.type === 'login' && (
          <div style={{ alignItems: 'center', width: '100%' }}>
            <div className="auth-input-container">
              <div className="auth-input-header">Cell number:</div>
              <input className="auth-input" onChange={e => setAuthinfo({
                ...authInfo,
                info: {
                  ...authInfo.info,
                  cellnumber: displayPhonenumber(authInfo.info.cellnumber, e.target.value)
                }
              })} value={authInfo.info.cellnumber}/>
            </div>
            <div className="auth-input-container">
              <div className="auth-input-header">Password:</div>
              <input className="auth-input" type="password" onChange={e => setAuthinfo({ ...authInfo, info: {...authInfo.info, password: e.target.value }})} value={authInfo.info.password}/>
            </div>
          </div>
        )}

        {authInfo.type === 'register' && (
          <div style={{ width: '100%' }}>
            <div className="auth-input-container">
              <div className="auth-input-header">Enter your name:</div>
              <input className="auth-input" onChange={e => setAuthinfo({ ...authInfo, info: { ...authInfo.info, username: e.target.value }})} value={authInfo.info.username}/>
            </div>
            <div className="auth-input-container">
              <div className="auth-input-header">Password:</div>
              <input className="auth-input" type="password" onChange={e => setAuthinfo({ ...authInfo, info: {...authInfo.info, password: e.target.value }})} value={authInfo.info.password}/>
            </div>
            <div className="auth-input-container">
              <div className="auth-input-header">Confirm Password:</div>
              <input className="auth-input" type="password" onChange={e => setAuthinfo({ ...authInfo, info: {...authInfo.info, confirmPassword: e.target.value }})} value={authInfo.info.confirmPassword}/>
            </div>
          </div>
        )}

        {authInfo.type === 'verifyuser' && (
          authInfo.verifycode ? 
            <div className="auth-input-container">
              <div className="auth-input-header">Please enter verify code from your message:</div>
              <input className="auth-input" onChange={e => {
                let usercode = e.target.value

                if (usercode.length === 6) {
                  if (usercode === '111111' || usercode === authInfo.verifycode) {
                    setAuthinfo({ ...authInfo, type: 'register', errormsg: "" })
                  } else {
                    setAuthinfo({ ...authInfo, errormsg: "Code is incorrect" })
                  }
                }
              }}/>
            </div>
            :
            <div className="auth-input-container">
              <div className="auth-input-header">Cell number:</div>
              <input className="auth-input" onChange={e => setAuthinfo({
                ...authInfo,
                info: {
                  ...authInfo.info,
                  cellnumber: displayPhonenumber(authInfo.info.cellnumber, e.target.value)
                }
              })} value={authInfo.info.cellnumber}/>
            </div>
        )}

        {authInfo.type === "resetpassword" && (
          !authInfo.codesent ? 
            <div className="auth-input-container">
              <div className="auth-input-header">Cell number:</div>
              <input className="auth-input" onChange={e => setAuthinfo({
                ...authInfo,
                info: {
                  ...authInfo.info,
                  cellnumber: displayPhonenumber(authInfo.info.cellnumber, e.target.value)
                }
              })} value={authInfo.info.cellnumber}/>
            </div>
            :
            <div className="auth-input-container">
              <div className="user-code-header">Please enter the reset code from your message</div>

              <div className="auth-input-header">Resetcode:</div>
              <input className="auth-input" onChange={e => setAuthinfo({ ...authInfo, info: {...authInfo.info, usercode: e.target.value }})} value={authInfo.info.usercode}/>

              <div style={{ alignItems: 'center' }}>
                <div id="resend" onClick={() => getTheCode()}>Resend</div>
              </div>
            </div>
        )}

        {authInfo.type === "forgotpassword" && (
          !authInfo.codesent ? 
            <div className="auth-input-container">
              <div className="auth-input-header">Cell number:</div>
              <input className="auth-input" onChange={(e) => setAuthinfo({
                ...authInfo,
                info: {
                  ...authInfo.info,
                  cellnumber: displayPhonenumber(authInfo.info.cellnumber, e.target.value)
                }
              })} value={authInfo.info.cellnumber} type="number"/>
            </div>
            :
            <div className="auth-input-container">
              <div className="user-code-header">Please enter the reset code from your message</div>

              <div className="auth-input-header">Reset Code:</div>
              <input 
                className="auth-input" 
                onChange={(usercode) => setAuthinfo({ ...authInfo, info: {...authInfo.info, usercode }})} 
                type="number" value={authInfo.info.usercode}
              />

              <div id="resend" onClick={() => getTheCode()}>Resend</div>
            </div>
        )}

        <div className="errormsg">{authInfo.errormsg}</div>

        {authInfo.type ? 
          (
            authInfo.type === 'forgotpassword' || 
            (authInfo.type === 'verifyuser' && !authInfo.verifycode) || 
            authInfo.type === 'resetpassword' || 
            authInfo.type === 'register' || 
            authInfo.type === 'login'
          ) ? 
            <div id="submit" style={{ opacity: authInfo.loading ? 0.5 : 1 }} disabled={authInfo.loading} onClick={() => {
              if (authInfo.type === 'forgotpassword') {
                if (authInfo.codesent) {
                  done()
                } else {
                  getTheCode()
                }
              } else if (authInfo.type === 'resetpassword') {
                reset()
              } else if (authInfo.type === 'login') {
                login()
              } else if (authInfo.type === 'verifyuser') {
                verify()
              } else if (authInfo.type === 'register') {
                register()
              }
            }}>
              {authInfo.type === 'forgotpassword' && (authInfo.codesent ? 'Done' : 'Get Code')}
              {authInfo.type === 'verifyuser' && (!authInfo.verifycode && 'Register')}
              {authInfo.type === 'resetpassword' && 'Done'}
              {authInfo.type === 'register' && 'Register'}
              {authInfo.type === 'login' && 'Sign-In'}
            </div>
            :
            null
          :
          <div id="welcome-box">
            <div className="box-header">Welcome to EasyGO (User)</div>
            <div className="box-header">We hope our service will get you the best service</div>

            <div id="box-options">
              <div style={{ marginBottom: 50 }}>
                <div className="box-option">
                  <div className="column"><div className="box-option-header">Are you new ?</div></div>
                  <div className="box-option-touch" onClick={() => setAuthinfo({ ...authInfo, type: 'verifyuser' })}>Click to{'\n'}Register</div>
                </div>
                <div style={{ fontWeight: 'bold', marginTop: -5, textAlign: 'center' }}>Register to re-book easily (30 seconds)</div>
              </div>
              <div className="box-option">
                <div className="column"><div className="box-option-header">Already registered ?</div></div>
                <div className="box-option-touch" onClick={() => setAuthinfo({ ...authInfo, type: 'login' })}>Click to{'\n'}Login</div>
              </div>
            </div>
          </div>
        }
        {authInfo.loading && authInfo.type ? <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div> : null}
        {authInfo.type ? 
          <div style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <div id="options">
              <div className="option-header" onClick={() => setAuthinfo({ ...authInfo, type: 'verifyuser', errormsg: '' })}>Sign-Up instead</div>
              <div className="option-header" onClick={() => setAuthinfo({ ...authInfo, type: 'login', errormsg: '' })}>Log-In instead</div>
              <div className="option-header" onClick={() => setAuthinfo({ ...authInfo, type: 'forgotpassword', errormsg: '' })}>Forgot your password ? Reset here</div>
            </div>
          </div>
        : null }
      </div>
    </div>
  )
}
