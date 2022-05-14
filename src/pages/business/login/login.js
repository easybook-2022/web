import './login.scss';
import React, { useState } from 'react';
import { loginUser } from '../../../apis/business/owners'
import { loginInfo } from '../../../businessInfo'
import { displayPhonenumber } from 'geottuse-tools'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Login() {
  const [phonenumber, setPhonenumber] = useState(loginInfo.cellnumber)
  const [password, setPassword] = useState(loginInfo.password)
  const [errorMsg, setErrormsg] = useState('')

  const login = () => {
    const data = { cellnumber: phonenumber, password: password }
    
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

          window.location = "/" + msg
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg } = err.response.data

          setErrormsg(errormsg)
        }
      })
  }

  return (
    <div id="login">
      <div id="background">
        <div id="background-row">
          <img alt="" src="/background.jpg"/>
        </div>
      </div>
      <div id="box">
        <div id="inputs-box">
          <div className="input-container">
            <div className="input-header">Phone number:</div>
            <input className="input" onChange={(e) => setPhonenumber(displayPhonenumber(phonenumber, e.target.value, () => {}))} value={phonenumber} type="text"/>
          </div>

          <div className="input-container">
            <div className="input-header">Password:</div>
            <input className="input" type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
          </div>

          <div className="errormsg">{errorMsg}</div>

          <div id="submit" onClick={() => login()}>Sign-In</div>
        </div>

        <div id="options">
          <div className="option" onClick={() => window.location = "/forgotpassword"}>I don't remember my password ? Click here</div>
          <div className="option" onClick={() => window.location = "/verifyowner"}>Not a member ? Signup here</div>
        </div>
      </div>
    </div>
  );
}
