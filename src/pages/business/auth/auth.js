import './auth.scss';
import { useState, useEffect } from 'react'
import { loginUser, verifyUser, registerUser } from '../../../apis/business/owners'
import { ownerSigninInfo } from '../../../businessInfo'
import { displayPhonenumber } from 'geottuse-tools'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Auth() {
  const [cellnumber, setCellnumber] = useState(ownerSigninInfo.cellnumber)
  const [password, setPassword] = useState(ownerSigninInfo.password)
  const [confirmPassword, setConfirmpassword] = useState(ownerSigninInfo.confirmPassword)
  const [noAccount, setNoaccount] = useState(false)
  const [verifyCode, setVerifycode] = useState('')
  const [codeInput, setCodeinput] = useState('')
  const [verified, setVerified] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const login = () => {
    const data = { cellnumber, password }
    
    loginUser(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { ownerid, locationid, locationtype, msg } = res

          localStorage.setItem("ownerid", ownerid.toString())
          localStorage.setItem("locationid", locationid ? locationid.toString() : "")
          localStorage.setItem("locationtype", locationtype ? locationtype : "")
          localStorage.setItem("phase", msg)
          localStorage.setItem("isOwner", res.isOwner ? "true" : "")

          window.location = "/" + msg
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "nonexist":
              setNoaccount(true)
              verify()

              break;
            default:
              setErrormsg(errormsg)
          }
        }
      })
  }
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
    const data = { cellnumber, password, confirmPassword: password }

    registerUser(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id } = res

          setLoading(false)

          localStorage.setItem("ownerid", id.toString())
          localStorage.setItem("phase", "locationsetup")

          window.location = "/locationsetup"
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setLoading(false)
        }
      })
  }
  const back = () => {
    setVerifycode('')
    setVerified(false)
    setNoaccount(false)
    setErrormsg('')
  }

  return (
    <div id="auth">
      <div id="box">
        <img id="icon" src="/icon.png"/>

        <div id="box-header">Welcome to EasyGO (Business)</div>
        
        <div id="inputs-box">
          {!noAccount ? 
            <>
               <div className="input-container">
                <div className="input-header">Cell phone number:</div>
                <input className="input" onChange={(e) => setCellnumber(displayPhonenumber(cellnumber, e.target.value, () => {}))} value={cellnumber} type="text"/>
              </div>

              <div className="input-container">
                <div className="input-header">Password:</div>
                <input className="input" type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
              </div>

              <div className="errormsg">{errorMsg}</div>

              <div id="submit" onClick={() => login()}>Sign in</div>
            </>
            :
            !verified ? 
              <>
                <div className="input-container">
                  <div className="input-header">Please enter verify code from your message:</div>
                  <input className="input" onChange={(e) => {
                    let usercode = e.target.value

                    setCodeinput(usercode)

                    if (usercode.length === 6) {
                      if (usercode === verifyCode || usercode === '111111') {
                        setVerified(true)
                        setErrormsg("")
                      } else {
                        setErrormsg("The code is wrong")
                      }
                    } else {
                      setErrormsg("")
                    }
                  }} type="text" value={codeInput}/>
                </div>
                <div className="errormsg">{errorMsg}</div>
                <div id="submit" style={{ opacity: loading ? 0.3 : 1, pointerEvents: loading ? "none" : "" }} onClick={() => back()}>Back</div>
              </>
              :
              <div style={{ width: '100%' }}>
                <div className="input-container">
                  <div className="input-header">Confirm your password:</div>
                  <input className="input" type="password" onChange={(e) => {
                    const confirmingPassword = e.target.value

                    if (confirmingPassword.length === password.length) {
                      if (confirmingPassword === password) {
                        register()
                      } else {
                        setErrormsg("Password is incorrect")
                      }
                    }
                  }}/>
                </div>
                <div className="errormsg">{errorMsg}</div>
                <div id="submit" style={{ opacity: loading ? 0.3 : 1, pointerEvents: loading ? "none" : "" }} onClick={() => back()}>Back</div>
              </div>
          }
        </div>
      </div>
    </div>
  )
}
