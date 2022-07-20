import { useEffect, useState } from 'react';

export default function Disable(props) {
  const { close } = props.route.params

  return (
    <div id="disabled">
      <div id="disabled-container">
        <div id="disabled-header">
          There is an update to the app
          <br/>
          Please wait a moment
          <br/>
          Or tap 'close'
        </div>

        <div id="disabled-close" onPress={close}>Close</div>
      </div>
    </div>
  )
}
