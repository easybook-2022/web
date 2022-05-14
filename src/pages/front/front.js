import './front.scss';
import React from 'react';

export default function Front() {
  return (
    <div id="front">
      <div id="front-background">
        <div id="front-background-container">
          <img src="/background.jpg"/>
        </div>
      </div>
      <div id="front-actions-container">
        <div id="front-actions">
          <div className="front-action" onClick={() => window.location = '/intro'}>About Us</div>
          <div className="front-action" onClick={() => window.location = '/auth'}>Business</div>
        </div>
      </div>
    </div>
  )
}
