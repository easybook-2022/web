import './footer.scss';
import React from 'react';

export default function Footer() {
  return (
    <div id="footer">
      <div id="footer-follows-header">Follow us</div>
      <div id="footer-follows">
        <div className="footer-follow" onClick={() => window.open("https://www.facebook.com/easybook.2022")}>
          <img src="/facebook.png"/>
        </div>
        <div className="footer-follow" onClick={() => window.open("https://www.instagram.com/easybook.2022")}>
          <img src="/instagram.png"/>
        </div>
        <div className="footer-follow" onClick={() => window.open("https://www.tiktok.com/@easybook.2022")}>
          <img src="/tiktok.png"/>
        </div>
        <div className="footer-follow" onClick={() => window.open("https://vimeo.com/easybook2022")}>
          <img src="/vimeo.png"/>
        </div>
        <div className="footer-follow" onClick={() => window.open("https://twitter.com/EasyBook2022")}>
          <img src="/twitter.png"/>
        </div>
      </div>
      <div id="footer-header">EasyBook by 2022 Geottuse, Inc.</div>
    </div>
  )
}
