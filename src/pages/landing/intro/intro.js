import './intro.scss';
import React from 'react';

import Masthead from '../../../widgets/landing/masthead'
import Footer from '../../../widgets/landing/footer'

export default function Intro() {
  return (
    <div id="intro">
      <Masthead/>

      <div id="body">
        <div className="body-header">For restaurants</div>
        <div className="body-mini-header">
          We will provide each of your tables with<br/>a laminated bar code
        </div>

        <div className="tutorial">
          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="info-header">Customer order meals<br/>and send to kitchen</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/scan_and_order.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="info-header">Kitchen see meals and payment<br/>(iPad/Tablet)</div>

                <div className="column">
                  <video className="info-video" width="400" controls>
                    <source src="/tutorials/done_order_see_payment.mp4" type="video/mp4"/>
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="body-header">For salons</div>
        
        <div className="tutorial">
          <div className="tutorial-header">Booking and rebook<br/>(in a few seconds)</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="info-header">Client booking</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/client booking.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="info-header">Client rebooking</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/client rebooking.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="tutorial">
          <div className="tutorial-header">
            Salon rebooking for clients<br/>(in a few seconds)
            <div style={{ fontSize: 20 }}>(iPad/Tablet/iPhone/Android Phone)</div>
          </div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-infos">
                <div className="tutorial-info">
                  <div className="info-header">by list</div>

                  <video className="info-video" width="300" controls>
                    <source src="/tutorials/salon rebooking(by list).mp4" type="video/mp4"/>
                  </video>
                </div>
                <div className="tutorial-info">
                  <div className="info-header">by table</div>

                  <video className="info-video" width="300" controls>
                    <source src="/tutorials/salon rebooking(by table).mp4" type="video/mp4"/>
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="start-header">
          To get started, e-mail us <a href="mailto:kmrobogram@gmail.com">here</a>
          <br/>and<br/> 
          we'll get you setup in HOURS
        </div>
      </div>

      <Footer/>
    </div>
  )
}
