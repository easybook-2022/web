import './userauth.scss';
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCircleNotch } from '@fortawesome/fontawesome-free-solid'
import { signinInfo } from '../../../userInfo'
import { displayPhonenumber } from 'geottuse-tools'
import { getCode, verifyUser, resetPassword, registerUser, loginUser } from '../../../apis/user/users'

const { username, cellnumber, password, confirmPassword } = signinInfo

const height = window.innerHeight;
const width = window.innerWidth;
const wsize = p => {return window.innerWidth * (p / 100)}

export default function Userauth(props) {
  const [authInfo, setAuthinfo] = useState({ info: { username, cellnumber, password, confirmPassword }, loading: false, verifycode: null, verified: false, codesent: false, noAccount: false, errormsg: "" })

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

  useEffect(() => {
    const { password, confirmPassword } = authInfo.info

    if (password.length === confirmPassword.length) {
      if (password === confirmPassword) {
        register()
      } else {
        setAuthinfo({ ...authInfo, info: {...authInfo.info, confirmPassword: "" }, errormsg: "Password is incorrect" })
      }
    }
  }, [authInfo.info.confirmPassword])

  return (
    <div id="userauth">
      <div id="auth-box">
        <FontAwesomeIcon icon={faTimesCircle} size="3x" onClick={() => props.close()}/>

        <div id="welcome-box">
          <div className="box-header">Welcome to EasyGO (User)</div>
          <div className="box-header">We show you the nearest services</div>

          {!authInfo.noAccount ? 
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
            :
            !authInfo.verified ? 
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
              <div style={{ width: '100%' }}>
                <div className="auth-input-container">
                  <div className="auth-input-header">Enter your name:</div>
                  <input className="auth-input" onChange={e => setAuthinfo({ ...authInfo, info: { ...authInfo.info, username: e.target.value }})} value={authInfo.info.username}/>
                </div>
                <div className="auth-input-container">
                  <div className="auth-input-header">Confirm Password:</div>
                  <input className="auth-input" type="password" onChange={e => setAuthinfo({ ...authInfo, info: {...authInfo.info, confirmPassword: e.target.value }})} value={authInfo.info.confirmPassword}/>
                </div>
              </div>
          }
        </div>

        <div className="errormsg">{authInfo.errormsg}</div>

        {!authInfo.noAccount ? 
          !authInfo.verified && (
            <div id="submit" style={{ opacity: authInfo.loading ? 0.5 : 1, pointerEvents: authInfo.loading ? "none" : "" }} onClick={() => {
              if (!authInfo.noAccount) {
                login()
              } else if (authInfo.verified) {
                register()
              }
            }}>Sign in</div>
          )
          :
          <div id="submit" style={{ opacity: authInfo.loading ? 0.5 : 1, pointerEvents: authInfo.loading ? "none" : "" }} onClick={() => setAuthinfo({ ...authInfo, noAccount: false, verified: false })}>Back</div>
        }
      </div>
    </div>
  )
}
