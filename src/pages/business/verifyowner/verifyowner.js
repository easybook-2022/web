import './verifyowner.scss';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { verifyUser, registerUser } from '../../../apis/business/owners'
import { ownerRegisterInfo, registerInfo, isLocal } from '../../../businessInfo'
import { displayPhonenumber } from 'geottuse-tools'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Verifyowner() {
  const [cellnumber, setCellnumber] = useState(ownerRegisterInfo.cellnumber)
  const [userCode, setUsercode] = useState('')
  const [verifyCode, setVerifycode] = useState('')
  const [verified, setVerified] = useState(false)

  const [passwordInfo, setPasswordinfo] = useState({ password: ownerRegisterInfo.password, confirmPassword: ownerRegisterInfo.password, step: 0 })

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const verify = () => {
    setLoading(true)

    verifyUser(cellnumber)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { verifycode } = res

          setVerifycode(verifycode)
          setErrormsg('')
          setLoading(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg } = err.response.data

          setErrormsg(errormsg)
        }
      })

      setLoading(false)
  }
  const register = () => {
    const { password, confirmPassword } = passwordInfo
    const data = { cellnumber, password, confirmPassword }

    registerUser(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id } = res

          localStorage.setItem("ownerid", id.toString())

          window.location = "/locationsetup"
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  return (
    <div id="verifyowner" style={{ opacity: loading ? 0.5 : 1 }}>
      <div id="background">
        <div id="background-row">
          <img alt="" src="/background.jpg"/>
        </div>
      </div>
      <div id="box">
        <div id="inputs-box">
          {!verifyCode ?
            <>
              <div className="input-container">
                <div className="input-header">Enter your cell number:</div>
                <input 
                  className="input" 
                  onChange={(e) => setCellnumber(displayPhonenumber(cellnumber, e.target.value, () => {}))} 
                  value={cellnumber} type="text"
                />
              </div>
              <div id="submit" style={{ opacity: loading ? 0.3 : 1 }} disabled={loading} onClick={() => verify()} disabled={loading}>Register</div>
            </>
            :
            <>
              {!verified ? 
                <>
                  <div className="input-container">
                    <div className="input-header">Enter verify code from your message:</div>
                    <input className="input" onChange={(e) => {
                      let usercode = e.target.value

                      setUsercode(usercode)

                      if (usercode.length === 6) {
                        if (usercode === verifyCode || (isLocal && usercode === '111111')) {
                          setVerified(true)
                          setErrormsg("")
                        } else {
                          setErrormsg("The verify code is wrong")
                        }
                      } else {
                        setErrormsg("")
                      }
                    }} type="text" value={userCode}/>
                  </div>
                  <div id="submit" style={{ opacity: loading ? 0.3 : 1 }} disabled={loading} onClick={() => {
                    setVerifycode('')
                    setErrormsg('')
                  }}>Back</div>
                </>
                :
                <>
                  <div className="input-container">
                    <div className="input-header">Enter a password:</div>
                    <input className="input" type="password" onChange={(e) => setPasswordinfo({ ...passwordInfo, password: e.target.value })} value={passwordInfo.password}/>
                  </div>
                  <div className="input-container">
                    <div className="input-header">Confirm your password:</div>
                    <input className="input" type="password" onChange={(e) => {
                      let confirmPassword = e.target.value

                      setPasswordinfo({ ...passwordInfo, confirmPassword })

                      if (confirmPassword.length === passwordInfo.password.length) {

                      }
                    }} value={passwordInfo.confirmPassword}/>
                  </div>
                  <div id="submit" style={{ opacity: loading ? 0.3 : 1 }} disabled={loading} onClick={() => register()}>Next</div>
                </>
              }
            </>
          }

          <div className="errormsg">{errorMsg}</div>
        </div>

        {loading ? <FontAwesomeIcon icon={faCircleNotch} size="3x"/> : null}

        <div id="options">
          <div className="option" style={{ opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => window.location = "/forgotpassword"}>I don't remember my password ? Click here</div>
          <div className="option" style={{ opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => window.location = "/login"}>Already a member ? Login here</div>
        </div>
      </div>
    </div>
  );
}
