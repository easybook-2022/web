import './masthead.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faGavel } from '@fortawesome/free-solid-svg-icons'

export default function Masthead() {
  return (
    <div id="masthead-container">
      <div id="header">
          <div id="header-icon">
          <img src="/icon.png"/>
        </div>
        <div id="header-navs-container">
          <div id="header-navs">
            <div className="header-nav" onClick={() => window.location = '/'}>
              <FontAwesomeIcon color="black" icon={faCircleInfo} size="2x"/>
              <div className="header-nav-header">Intro</div>
            </div>
            <div className="header-nav" onClick={() => window.location = '/privacy'}>
              <FontAwesomeIcon color="black" icon={faGavel} size="2x"/>
              <div className="header-nav-header">Privacy</div>
            </div>
          </div>
        </div>
      </div>
      <div id="masthead">
        <div id="masthead-row">
          <div className="masthead-container">
            <div id="masthead-intro">
              <div className="masthead-header">Welcome to EasyBook</div>
              <div className="masthead-header">
                the fastest
                <br/>
                <strong> (food ordering) </strong>
                and
                <strong> (appointment booking) </strong>
                <br/>
                app you'll ever use:)
              </div>
            </div>
          </div>
          <div className="masthead-container">
            <div className="masthead-photos">
              <img src="/masthead-photos/1.jpeg"/>
              <img src="/masthead-photos/2.jpeg"/>
              <img src="/masthead-photos/3.jpeg"/>
            </div>

            <div className="masthead-photos">
              <img src="/masthead-photos/4.jpeg"/>
              <img src="/masthead-photos/5.jpeg"/>
              <img src="/masthead-photos/6.jpeg"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
