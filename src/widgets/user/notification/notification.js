import './notification.scss';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faTimesCircle } from '@fortawesome/fontawesome-free-solid'
import { socket, url, logo_url } from '../../../userInfo'
import { displayTime } from 'geottuse-tools'
import { getNotifications } from '../../../apis/user/users'
import { getWorkers, searchWorkers } from '../../../apis/user/owners'
import { cancelCartOrder, confirmCartOrder } from '../../../apis/user/products'
import { acceptRequest, closeSchedule, cancelRequest } from '../../../apis/user/schedules'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Notification(props) {
  const [userId, setUserid] = useState(null)
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [numUnreaded, setNumunreaded] = useState(0)
  const [confirm, setConfirm] = useState({ show: false, type: "", index: 0, name: "", price: "", quantity: 0 })
  const [cancelSchedule, setCancelschedule] = useState({ show: false, id: -1, location: "", type: "", service: "", time: 0, index: -1 })
  const [showDisabledScreen, setShowdisabledscreen] = useState(false)

  const cancelTheCartOrder = (cartid, index) => {
    let data = { userid: userId, cartid, type: "cancelCartOrder" }

    cancelCartOrder(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/cancelCartOrder", data, () => {
            const newItems = [...items]

            newItems.splice(index, 1)

            setItems(newItems)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const confirmTheCartOrder = async(index) => {
    const info = items[index]
    const { id, name, quantity, price } = info
    let data = { userid: userId, id, type: "confirmCartOrder" }

    confirmCartOrder(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/confirmCartOrder", data, () => {
            setConfirm({ ...confirm, show: true, type: "cart", index, name, quantity, price })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false })
            }, 3000)
          })
        }
      })
  }
  const closeTheSchedule = index => {
    const { id } = items[index]
    let data = { scheduleid: id, type: "closeSchedule" }

    closeSchedule(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/closeSchedule", data, () => {
            const newItems = [...items]

            newItems.splice(index, 1)

            setItems(newItems)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const cancelTheRequest = async(info, index) => {
    if (!cancelSchedule.show) {
      const { id, location, locationtype, service, time } = info

      setCancelschedule({ show: true, id, location, type: locationtype, service, time, index })
    } else {
      const { id, index } = cancelSchedule
      let data = { userid: userId, scheduleid: id, type: "cancelRequest" }

      setCancelschedule({ ...cancelSchedule, loading: true })

      cancelRequest(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { ...data, receivers: res.receivers, locationType: res.type, speak: res.speak }
            socket.emit("socket/cancelRequest", data, () => {
              const newItems = [...items]

              newItems.splice(index, 1)

              setItems(newItems)

              setCancelschedule({ ...cancelSchedule, show: false, loading: false })
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }

  const getTheNotifications = () => {
    const userid = localStorage.getItem("userid")

    setLoaded(false)

    getNotifications(userid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/user/login", userid, () => {
            setUserid(userid)
            setItems(res.notifications)
            setLoaded(true)
            setNumunreaded(0)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  // websockets
  const startWebsocket = async() => {
    socket.on("updateNotifications", data => {
      if (data.type === "cancelAppointment") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id === data.id) {
            newItems.splice(index, 1)
          }
        })

        setItems(newItems)
      } else if (data.type === "closeSchedule") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id === data.scheduleid) {
            newItems.splice(index, 1)
          }
        })

        setItems(newItems)
      } else if (data.type === "rescheduleAppointment") {
        const newItems = [...items]
        const { appointmentid, time, worker } = data

        newItems.forEach(function (item) {
          if (item.id === appointmentid) {
            item.action = "rebook"
            item.nextTime = parseInt(time)
            item.worker = worker
          }
        })

        setItems(newItems)
      } else if (data.type === "doneService") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id === data.id) {
            newItems.splice(index, 1)
          }
        })

        setItems(newItems)
      } else if (data.type === "cancelSchedule") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.id === data.scheduleid) {
            item.action = "cancel"

            if (data.reason) {
              item.reason = data.reason
            }
          }
        })

        setItems(newItems)
      } else if (data.type === "orderReady") {
        const newItems = [...items]
        const { ordernumber } = data

        newItems.forEach(function (item) {
          if (item.orderNumber === ordernumber) {
            item.status = "ready"
          }
        })

        setItems(newItems)
      } else if (data.type === "orderDone") {
        const newItems = [...items]
        const numItems = newItems.length

        for (let k = 0; k < numItems; k++) {
          newItems.forEach(function (item, index) {
            if (item.orderNumber === data.ordernumber) {
              newItems.splice(index, 1)
            }
          })
        }

        setItems(newItems)
      } else if (data.type === "setWaitTime") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.orderNumber === data.ordernumber) {
            item.status = 'inprogress'
            item.waitTime = data.waitTime
          }
        })

        setItems(newItems)
      } else {
        setNumunreaded(numUnreaded + 1)
      }
    })
    socket.io.on("open", () => {
      if (userId !== null) {
        socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))
      }
    })
    socket.io.on("close", () => userId !== null ? setShowdisabledscreen(true) : {})
  }

  useEffect(() => {
    getTheNotifications()
  }, [])

  useEffect(() => {
    startWebsocket()

    return () => {
      socket.off("updateNotifications")
    }
  }, [items.length])

  return (
    <div id="notifications">
      {loaded ? 
        <div id="box">
          <div style={{ alignItems: 'center', height: '20%', width: '100%' }}>
            <div style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
              <div id="close" onClick={() => props.close()}>
                <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
              </div>

              <div id="box-header">{items.length} Notification(s)</div>

              <div id="refresh" onClick={() => getTheNotifications()}>Refresh {numUnreaded > 0 ? <div style={{ fontWeight: 'bold' }}>({numUnreaded})</div> : null}</div>
            </div>
          </div>

          <div id="body">
            {items.length > 0 ? 
              items.map((item, index) => (
                <div className="item" key={item.key}>
                  {item.type === "cart-order-self" && (
                    <>
                      <div className="item-order-number">Your order#: {item.orderNumber}</div>
                      
                      <div className="item-header">
                        {item.status === 'checkout' ? 
                          item.locationType === 'restaurant' ? 
                            'The restaurant will respond you with wait time'
                            :
                            ''
                          :
                          'The order will be ready for pickup in ' + item.waitTime + ' minutes'
                        }
                      </div>

                      <div className="row">
                        <div className="action" onClick={() => window.location = "/seeorders/" + item.orderNumber}>See order ({item.numOrders})</div>
                      </div>
                    </>
                  )}
                  {item.type === "service" && (
                    <div className="item-row">
                      <div className="item-image-holders">
                        <div className="item-location-image-holder">
                          <img src={logo_url + item.locationimage.name} style={{ height: '100%', width: '100%' }}/>
                        </div>
                        <div className="item-service-image-holder">
                          <img src={item.serviceimage.name ? logo_url + item.serviceimage.name : "/noimage.jpeg"} style={{ height: '100%', width: '100%' }}/>
                        </div>
                      </div>
                      <div style={{ flexDirection: 'column', width: wsize(70) }}>
                        <div className="item-service-header">
                          Appointment booking <br/><br/>
                          {'for ' + item.service} <br/>
                          {'at ' + item.location} <br/>
                          {displayTime(item.time)} <br/><br/>
                          {(item.worker !== null && 'with stylist: ' + item.worker.username)}
                        </div>

                        {item.action === "confirmed" && (
                          <div style={{ alignItems: 'center' }}>
                            {item.serviceid ? 
                              <div className="row">
                                <div style={{ alignItems: 'center' }}>
                                  <div className="action" onClick={() => cancelTheRequest(item, index)}>Cancel</div>
                                  <div className="action" onClick={() => {
                                    props.close()

                                    window.location = "/booktime/" + item.locationid + "/" + item.id + "/" + (item.serviceid ? item.serviceid : "null") + "/" + (item.service ? item.service : "null")
                                  }}>Rebook</div>
                                </div>
                              </div>
                              :
                              <div style={{ alignItems: 'center' }}>
                                <div className="row">
                                  <div style={{ alignItems: 'center' }}>
                                    <div className="action" onClick={() => cancelTheRequest(item, index)}>Cancel</div>
                                    <div className="action" onClick={() => {
                                      props.close()

                                      window.location = "/booktime/" + item.locationid + "/" + item.id + "/" + (item.serviceid ? item.serviceid : "null") + "/" + (item.service ? item.service : "null")
                                    }}>Rebook</div>
                                  </div>
                                </div>
                              </div>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
              :
              <div id="no-result">
                <div id="no-result-header">No Notification(s) Yet</div>
              </div>
            }
          </div>
        </div>
        :
        <div id="loading">
          <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
        </div>
      }

      {confirm.show && (
        <div id="hidden-box">
          <div id="confirm-box">
            <div id="confirm-container">
              <div id="confirm-header">
                Confirmed Cart Order: <br/><br/>
                {'Quantity: ' + confirm.quantity}<br/><br/>
                {confirm.name}
              </div>
            </div>
          </div>
        </div>
      )}
      {cancelSchedule.show && (
        <div id="hidden-box">
          <div id="confirm-box">
            <div id="confirm-container">
              <div id="confirm-header">
                <div style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>Cancel Appointment</div><br/>
                {cancelSchedule.service && 'for ' + cancelSchedule.service}<br/>
                {'at ' + cancelSchedule.location}<br/>
                {displayTime(cancelSchedule.time)}
              </div>

              <div id="confirm-options">
                <div className="confirm-option" onClick={() => setCancelschedule({ ...cancelSchedule, show: false, service: "", time: 0, index: -1 })}>No</div>
                <div className="confirm-option" onClick={() => cancelTheRequest()}>Yes</div>
              </div>

              {cancelSchedule.loading && <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>}
            </div>
          </div>
        </div>
      )}
      {showDisabledScreen && (
        <div id="hidden-box">
          <div id="disabled">
            <div id="disabled-container">
              <div id="disabled-header">
                There is an update to the app<br/>
                Please wait a moment<br/>
                or tap 'Close'
              </div>

              <div id="disabled-close" onClick={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}>Close</div>

              <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
