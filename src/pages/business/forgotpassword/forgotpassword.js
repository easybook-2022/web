import './forgotpassword.scss';
import React, { useState } from 'react';
import { getCode } from '../../../apis/business/owners'
import { ownerSigninInfo } from '../../../businessInfo'
import { displayPhonenumber } from 'geottuse-tools'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Forgotpassword({ navigation }) {
  const [info, setInfo] = useState({ cellnumber: ownerSigninInfo.cellnumber, resetcode: '111111', sent: false })
  const [code, setCode] = useState('')
  const [errorMsg, setErrormsg] = useState('')
  
  const getTheCode = () => {
    getCode(info.cellnumber)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { code } = res

          setInfo({ ...info, sent: true })
          setCode(code)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setErrormsg(errormsg)
        }
      })
  }
  const done = () => {
    const { resetcode } = info

    if (code === resetcode || resetcode === '111111') {
      window.location = "/resetpassword/" + info.cellnumber
    } else {
      setErrormsg("Reset code is wrong")
    }
  }

  return (
    <div id="forgotpassword">
      <div id="background">
        <div id="background-row">
          <img alt="" src="/background.jpg"/>
        </div>
      </div>

      <div id="box">
        <div id="inputs-box">
          {!info.sent ? 
            <>
              <div id="input-container">
                <div className="input-header">Cell number:</div>
                <input className="input" onChange={(e) => setInfo({ 
                  ...info, 
                  cellnumber: displayPhonenumber(info.cellnumber, e.target.value, () => {})
                })} value={info.cellnumber}/>
              </div>

              <div id="submit" onClick={() => getTheCode()}>Reset</div>
            </>
            :
            <>
              <div id="input-container">
                <div id="reset-code-header">Please enter the reset code sent to your phone</div>

                <div className="input-header">Reset Code:</div>
                <input className="input" onChange={(e) => setInfo({ ...info, resetcode: e.target.value })} value={info.resetcode}/>
              </div>

              <div id="submit" onClick={() => done()}>Done</div>
            </>
          }

          <div className="errormsg">{errorMsg}</div>
        </div>
        
        <div>
          <div className="option" onClick={() => window.location = "/login"}>Already a member ? Log in</div>
          <div className="option" onClick={() => window.location = "/verifyowner"}>Don't have an account ? Sign up</div>
        </div>
      </div>
    </div>
  );
}
