import './privacy.scss';
import React from 'react';

export default function Privacy() {
  return (
    <div id="privacy">
      <div>
        <div id="header">
          <div id="header-row">
            <div id="header-icon">
              <img src="/icon.png"/>
            </div>
            <div className="column">
              <div id="header-navs-container">
                <div id="header-navs">
                  <div className="header-nav" onClick={() => window.location = '/intro'}>Intro & Setup</div>
                  <div className="header-nav" onClick={() => window.location = '/privacy'}>Privacy Policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="masthead">
          <div id="masthead-row">
            <div className="masthead-container">
              <div id="masthead-intro">
                <div className="masthead-header">Welcome to EasyGO</div>
                <div className="masthead-header">
                  The fastest and easiest
                  <br/>
                  <strong>food ordering </strong>
                  and
                  <strong> salon appointment booking </strong>
                  <br/>
                  service you'll ever use
                </div>
              </div>
            </div>
            <div className="masthead-container">
              <div className="masthead-header">What we provide</div>
              <div id="video-container">
                <video controls>
                  <source src="/intro.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="body">
        <div id="policy-information">
          <div id="policy-header">Privacy Policy</div>

          <div className="policy-item-header">What personal information do we collect from users ?</div>
          <div className="policy-list">
            <div className="policy-list-item">Username</div>
            <div className="policy-list-item">Phone number</div>
            <div className="policy-list-item">Profile Picture (Salon registration only)</div>
          </div>

          <div className="policy-item-header">When do we collect information ?</div>
          <div className="policy-list">
            <div className="policy-list-item">Username and cell number is collected when users/businesses sign up</div>
            <div className="policy-list-item">Collects businesses/users' geo-coordinates (longitude and latitude)</div>
           </div>

          <div className="policy-item-header">How do we use your information ?</div>
          <div className="policy-list">
            <div className="policy-list-item">User app: Constantly grab users' geo-coordinates to present them the nearest restaurants and salons to them</div>
            <div className="policy-list-item">Business app: Grab locations' geo-coordinates to mark them on the map to present to users</div>
          </div>

          <div className="policy-item-header">How do we protect your information ?</div>
          <div className="policy-item">We promise that we will never share your information with any other users or platforms.</div>

          <div id="policy-question-header">Questions about the Policy can be e-mail to</div>
          <div style={{ marginBottom: 50 }}><a style={{ color: '#11357B' }} href="mailto:admin@geottuse.com">admin@geottuse.com</a></div>
        </div>
      </div>

      <div id="footer">EasyGO by 2022 Geottuse, Inc.</div>
    </div>
  )
}
