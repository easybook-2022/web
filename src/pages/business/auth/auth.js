import './auth.scss';
import React from 'react';

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Auth() {
  return (
    <div id="auth">
      <div id="box">
        <img id="icon" src="/icon.png"/>

        <div id="box-header">Welcome to EasyGO (Business)</div>
        
        <div id="box-options">
          <div className="box-option">
            <div className="column"><div className="box-option-header">Are you new ?</div></div>
            <div className="box-option-touch" onClick={() => window.location = "/verifyowner"}>Click to Register</div>
          </div>
          <div className="box-option">
            <div className="column"><div className="box-option-header">Already registered?</div></div>
            <div className="box-option-touch" onClick={() => window.location = "/login"}>Click to Login</div>
          </div>
        </div>
      </div>
    </div>
  )
}
