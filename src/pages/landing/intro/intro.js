import './intro.scss';
import React from 'react';

export default function Intro() {
  return (
    <div id="intro">
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
                <video id="video" controls>
                  <source src="/intro.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="body">
        <div className="tutorial">
          <div className="tutorial-header">Setup an account</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">For Restaurant(s)</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/restaurant_setup.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">For Salon(s)</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/salon_setup.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>

          <div className="tutorial-info">
            <div className="info-icon-holder">
              <img className="info-icon" src="/c-icon.png"/>
            </div>

            <div className="info-header">For User(s)</div>

            <video className="info-video" width="300" controls>
              <source src="/tutorials/user_setup.mp4" type="video/mp4"/>
            </video>
          </div>
        </div>

        <div className="tutorial">
          <div className="tutorial-header">Setup menu for salon</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">Menu photo</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/salon_menu_photo_setup.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">Menu list</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/salon_menu_list_setup.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="tutorial">
          <div className="tutorial-header">Setup menu for restaurant</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">Menu photo</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/restaurant_menu_photo_setup.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">Menu list</div>

                <video className="info-video" width="300" controls>
                  <source src="/tutorials/restaurant_menu_list_setup.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="tutorial">
          <div className="tutorial-header">Booking and rebook appointment at salon (from menu photo)</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">Booking</div>

                <video className="info-video" width="500" controls>
                  <source src="/tutorials/salon_booking_photo.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="info-icon-holder">
                  <img className="info-icon" src="/b-icon.png"/>
                </div>

                <div className="info-header">Rebooking</div>

                <video className="info-video" width="500" controls>
                  <source src="/tutorials/salon_rebooking_photo.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="tutorial">
          <div className="tutorial-header">Booking and rebook appointment at salon (from menu list)</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="row">
                  <div className="info-icon-holder">
                    <img className="info-icon" src="/b-icon.png"/>
                  </div>
                  <div className="info-icon-holder">
                    <img className="info-icon" src="/c-icon.png"/>
                  </div>
                </div>

                <div className="info-header">Booking</div>

                <video className="info-video" width="500" controls>
                  <source src="/tutorials/salon_booking_list.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-info">
                <div className="row">
                  <div className="info-icon-holder">
                    <img className="info-icon" src="/b-icon.png"/>
                  </div>
                  <div className="info-icon-holder">
                    <img className="info-icon" src="/c-icon.png"/>
                  </div>
                </div>

                <div className="info-header">Rebooking</div>

                <video className="info-video" width="500" controls>
                  <source src="/tutorials/salon_rebooking_list.mp4" type="video/mp4"/>
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="tutorial">
          <div className="tutorial-header">Ordering at restaurant</div>

          <div className="row">
            <div className="tutorial-infos">
              <div className="tutorial-info">
                <div className="row">
                  <div className="info-icon-holder">
                    <img className="info-icon" src="/b-icon.png"/>
                  </div>
                  <div className="info-icon-holder">
                    <img className="info-icon" src="/c-icon.png"/>
                  </div>
                </div>

                <div className="info-header">from menu photo</div>

                <video className="info-video" width="470" controls>
                  <source src="/tutorials/restaurant_order_photo.mp4" type="video/mp4"/>
                </video>
              </div>
              <div className="tutorial-infos">
                <div className="tutorial-info">
                  <div className="row">
                    <div className="info-icon-holder">
                      <img className="info-icon" src="/b-icon.png"/>
                    </div>
                    <div className="info-icon-holder">
                      <img className="info-icon" src="/c-icon.png"/>
                    </div>
                  </div>

                  <div className="info-header">from menu list</div>

                  <video className="info-video" width="500" controls>
                    <source src="/tutorials/restaurant_order_list.mp4" type="video/mp4"/>
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="footer">EasyGO by 2022 Geottuse, Inc.</div>
    </div>
  )
}
