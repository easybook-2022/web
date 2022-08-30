import './privacy.scss';
import React from 'react';

import Masthead from '../../../widgets/landing/masthead'
import Footer from '../../../widgets/landing/footer'

export default function Privacy() {
  return (
    <div id="privacy">
      <Masthead/>
      
      <div id="body">
        <div id="policy-information">
          <div id="policy-header">Privacy Policy</div>

          <div className="policy-item-header">What personal information do we collect from users ?</div>
          <div className="policy-list">
            <div className="policy-list-item">Username</div>
            <div className="policy-list-item">Phone number</div>
            <div className="policy-list-item">Geo locations (User and Business registration only)</div>
            <div className="policy-list-item">Profile Picture (Salons' stylists registration only)</div>
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

      <Footer/>
    </div>
  )
}
