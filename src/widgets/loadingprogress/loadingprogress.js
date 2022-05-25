import './loadingprogress.scss';
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/fontawesome-free-solid'

export default function Loadingprogress(props) {
  return (
    <div id="loadingprogress">
      <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
    </div>
  )
}