import './authoption.scss';
import { useEffect, useState } from 'react';
import { socket, logo_url } from '../../../businessInfo'

export default function Authoption() {
  const logout = () => {
    const ownerid = localStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      localStorage.clear()

      window.location = "/auth"
    })
  }

  return (
    <div id="authoption">
      <div id="box">
        <div id="body">
          <div id="auth-options">
            <div className="auth-option-touch" onClick={() => {
              localStorage.setItem("phase", "walkin")

              window.location = "/walkin"
            }}>Walk-in(s)</div>
            <div className="auth-option-touch" onClick={() => {
              localStorage.setItem("phase", "main")

              window.location = "/main"
            }}>Appointment(s)</div>
          </div>
        </div>

        <div id="bottom-navs">
          <div id="bottom-navs-row">
            <div className="column">
              <div className="bottom-nav" onClick={() => logout()}>Log-Out</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
