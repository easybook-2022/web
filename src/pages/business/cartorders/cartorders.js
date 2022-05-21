import './cartorders.scss';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { socket, logo_url } from '../../../businessInfo'
import { resizePhoto } from 'geottuse-tools'
import { getOrders } from '../../../apis/business/schedules'
import { orderDone, setWaitTime } from '../../../apis/business/carts'

import Loadingprogress from '../../../components/loadingprogress'

const width = window.innerWidth
const height = window.innerHeight
const wsize = p => {return window.innerWidth * (p / 100)}

export default function Cartorders(props) {
  const params = useParams()
  const { userid, ordernumber } = params

  const [ownerId, setOwnerid] = useState(null)
  const [orders, setOrders] = useState([])
  const [waitTime, setWaittime] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNoorders, setShownoorders] = useState(false)
  const [showSetwaittime, setShowsetwaittime] = useState({ show: false, waitTime: '' })

  const getTheOrders = () => {
    const ownerid = localStorage.getItem("ownerid")
    const locationid = localStorage.getItem("locationid")
    const data = { userid, locationid, ordernumber }

    getOrders(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setOwnerid(ownerid)
          setOrders(res.orders)
          setReady(res.ready)
          setWaittime(res.waitTime)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const orderIsDone = () => {
    const time = Date.now()
    const locationid = localStorage.getItem("locationid")
    let data = { userid, ordernumber, locationid, type: "orderDone", receiver: ["user" + userid] }

    setLoading(true)

    orderDone(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        } else {
          setLoading(false)
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/orderDone", data, () => {
            window.location = "/main"
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "nonexist":
              setShownoorders(true)

              break
            default:
          }

          setLoading(false)
        }
      })
  }
  const setTheWaitTime = () => {
    const { waitTime } = showSetwaittime
    let data = { type: "setWaitTime", ordernumber, waitTime }

    setWaitTime(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/setWaitTime", data, () => {
            setShowsetwaittime({ ...showSetwaittime, show: false, waitTime: '' })
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  useEffect(() => {
    getTheOrders()
  }, [])

  return (
    <div style={{ opacity: loading ? 0.5 : 1 }} id="cart-orders">
      <div id="box">
        {orders.map((item, index) => (
          <div className="item" key={item.key}>
            <div className="item-row">
              <div className="item-image-holder">
                {item.image.name && <img alt="" src={logo_url + item.image.name} style={resizePhoto(item.image, width * 0.1)} className="item-image"/>}
              </div>

              <div className="item-infos">
                <div className="item-name">{item.name}</div>
                <div className="header"><div style={{ fontWeight: 'bold' }}>Quantity:</div> {item.quantity}</div>
                {item.cost && <div className="header"><div style={{ fontWeight: 'bold' }}>Total cost:</div> ${item.cost.toFixed(2)}</div>}

                {item.options.map((option, infoindex) => (
                  <div key={option.key} className="item-info">
                    <div style={{ fontWeight: 'bold' }}>{option.header}: </div> 
                    {option.selected}
                    {option.type === 'percentage' && '%'}
                  </div>
                ))}

                {item.others.map((other, otherindex) => (
                  other.selected ? 
                    <div key={other.key} className="item-info">
                      <div style={{ fontWeight: 'bold' }}>{other.name}: </div>
                      <div>{other.input}</div>
                    </div>
                  : null
                ))}

                {item.sizes.map((size, sizeindex) => (
                  size.selected ? 
                    <div key={size.key} className="item-info">
                      <div style={{ fontWeight: 'bold' }}>Size: </div>
                      <div>{size.name}</div>
                    </div>
                  : null
                ))}
              </div>
            </div>

            {item.note ? 
              <div className="note">
                <div className="note-header"><div style={{ fontWeight: 'bold' }}>Customer's note:</div><br/>{item.note}</div>
              </div>
            : null }
          </div>
        ))}

        <div id="actions">
          <div className="action" disabled={loading} onClick={() => setShowsetwaittime({ ...showSetwaittime, show: true, waitTime: '' })}>Set wait time</div>
          <div className="action" disabled={loading} onClick={() => orderIsDone()}>Done</div>
        </div>
      </div>

      {(showNoorders || showSetwaittime.show || loading) && (
        <div id="hidden-box">
          {showNoorders && (
            <div id="required-container">
              <div id="required-header">Order has already been delivered or doesn't exist</div>

              <div id="required-actions">
                <div className="required-action" onClick={() => window.location = "/main"}>Close</div>
              </div>
            </div>
          )}
          {showSetwaittime.show && (
            <div id="wait-time-container">
              <FontAwesomeIcon icon={faTimesCircle} onClick={() => setShowsetwaittime({ ...showSetwaittime, show: false })} size="3x"/>

              <div id="wait-time-header">How long will be the wait ?</div>

              <div id="wait-time-input-container">
                <input 
                  id="wait-time-input"
                  onChange={(e) => setShowsetwaittime({ ...showSetwaittime, waitTime: e.target.value })}
                  value={showSetwaittime.waitTime}
                />
                <div className="column"><div style={{ fontSize: 15, fontWeight: 'bold', marginLeft: 10 }}>mins</div></div>
              </div>

              <div id="wait-time-options">
                <div className="row">
                  {[...Array(3)].map((_, index) => (
                    <div key={index.toString()} className="wait-time-option" onClick={() => setShowsetwaittime({ ...showSetwaittime, waitTime: ((index + 1) * 5).toString() })}>
                      {(index + 1) * 5} mins
                    </div>
                  ))}
                </div>

                <div className="row">
                  {[...Array(3)].map((_, index) => (
                    <div key={index.toString()} className="wait-time-option" onClick={() => setShowsetwaittime({ ...showSetwaittime, waitTime: ((index + 4) * 5).toString() })}>
                      {(index + 4) * 5} mins
                    </div>
                  ))}
                </div>
              </div>

              <div id="wait-time-actions">
                <div className="wait-time-action" onClick={() => setTheWaitTime()}>Done</div>
              </div>
            </div>
          )}
          {loading && <Loadingprogress/>}
        </div>
      )}
    </div>
  )
}
