import './resetpassword.scss';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { resetPassword } from '../../../apis/business/owners'
import { userInfo } from '../../../businessInfo'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Resetpassword(props) {
  const params = useParams()
  const cellnumber = params.cellnumber ? params.cellnumber : null
  
  const [newPassword, setNewpassword] = useState('')
  const [confirmPassword, setConfirmpassword] = useState('')
  const [errorMsg, setErrormsg] = useState('')

  const reset = () => {
    const data = { cellnumber, newPassword, confirmPassword }

    resetPassword(data)
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
          const { errormsg, status } = err.response.data

          setErrormsg(errormsg)
        }
      })
  }

  return (
    <div id="resetpassword">
      <div id="box">
        <div id="inputs-box">
          <div className="input-container">
            <div className="input-header">New password:</div>
            <input className="input" type="password" onChange={(e) => setNewpassword(e.target.value)} value={newPassword}/>
          </div>

          <div className="input-container">
            <div className="input-header">Confirm password:</div>
            <input className="input" type="password" onChange={(e) => setConfirmpassword(e.target.value)} value={confirmPassword}/>
          </div>

          <div className="errormsg">{errorMsg}</div>

          <div id="submit" onClick={() => reset()}>Done</div>
        </div>

        <div id="options">
          <div className="option" onClick={() => window.location = "/verifyowner"}>Don't have an account ? Sign up</div>
          <div className="option" onClick={() => window.location = "/login"}>Already a member ? Log in</div>
        </div>
      </div>
    </div>
  );
}
