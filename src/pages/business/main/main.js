import './main.scss';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faLocationPin } from '@fortawesome/free-solid-svg-icons'
import { socket, logo_url } from '../../../businessInfo'
import { displayTime } from 'geottuse-tools'
import { updateNotificationToken, getOwnerInfo } from '../../../apis/business/owners'
import { fetchNumAppointments, fetchNumCartOrderers, getLocationProfile } from '../../../apis/business/locations'
import { getMenus, removeMenu, addNewMenu } from '../../../apis/business/menus'
import { cancelSchedule, doneService, getAppointments, getCartOrderers } from '../../../apis/business/schedules'
import { removeProduct } from '../../../apis/business/products'

// components
import Loadingprogress from '../../../components/loadingprogress';

const width = window.innerWidth
const wsize = p => {return width * (p / 100)}

export default function Main(props) {
  const params = useParams()

  const [ownerId, setOwnerid] = useState(null)
  const [isOwner, setIsowner] = useState(false)
  const [storeIcon, setStoreicon] = useState('')
  const [storeName, setStorename] = useState('')
  const [locationType, setLocationtype] = useState('')

  const [appointments, setAppointments] = useState([])
  const [numAppointments, setNumappointments] = useState(0)

  const [cartOrderers, setCartorderers] = useState([])
  const [numCartorderers, setNumcartorderers] = useState(0)

  const [loaded, setLoaded] = useState(false)

  const [viewType, setViewtype] = useState('')
  const [cancelInfo, setCancelinfo] = useState({ show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })

  const [showMenurequired, setShowmenurequired] = useState(false)
  const [showDisabledscreen, setShowdisabledscreen] = useState(false)
  const [showFirsttime, setShowfirsttime] = useState({ show: false, step: 0 })
  
  const fetchTheNumAppointments = () => {
    const ownerid = localStorage.getItem("ownerid")

    fetchNumAppointments(ownerid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) setNumappointments(res.numAppointments)
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const fetchTheNumCartOrderers = () => {
    const locationid = localStorage.getItem("locationid")

    fetchNumCartOrderers(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) setNumcartorderers(res.numCartorderers)
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  const getTheLocationProfile = () => {
    const ownerid = localStorage.getItem("ownerid")
    const locationid = localStorage.getItem("locationid")
    const data = { locationid }

    getLocationProfile(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, fullAddress, logo, type } = res.info

          socket.emit("socket/business/login", ownerid, () => {
            setOwnerid(ownerid)
            setStorename(name)
            setStoreicon(logo)
            setLocationtype(type)

            if (type === 'restaurant') {
              getAllCartOrderers()
            } else {
              getAllAppointments()
            }
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheOwnerInfo = () => {
    const ownerid = localStorage.getItem("ownerid")

    getOwnerInfo(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setIsowner(res.isOwner)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  const getAllAppointments = () => {
    const ownerid = localStorage.getItem("ownerid")
    const locationid = localStorage.getItem("locationid")
    const data = { ownerid, locationid }

    getAppointments(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAppointments(res.appointments)
          setNumappointments(res.numappointments)
          setViewtype('appointments')
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllCartOrderers = () => {
    const locationid = localStorage.getItem("locationid")

    getCartOrderers(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setCartorderers(res.cartOrderers)
          setNumcartorderers(res.numCartorderers)
          setViewtype('cartorderers')
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const cancelTheSchedule = (index, requestType) => {
    let id, type, item = index != null ? appointments[index] : appointments[cancelInfo.index]

    id = item.id
    type = item.type

    if (!cancelInfo.show) {
      setCancelinfo({ ...cancelInfo, show: true, type, requestType, id, index })
    } else {
      const { reason, id, index } = cancelInfo
      let data = { scheduleid: id, reason, type: "cancelSchedule" }

      cancelSchedule(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { ...data, receiver: res.receiver }
            socket.emit("socket/business/cancelSchedule", data, () => {
              switch (requestType) {
                case "appointment":
                  const newAppointments = [...appointments]

                  newAppointments.splice(index, 1)

                  setAppointments(newAppointments)
                  fetchTheNumAppointments()

                  break
                default:
              }
                  
              setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })
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

  const doneTheService = (index, id) => {
    doneService(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const newAppointments = [...appointments]
          let data = { id, type: "doneService", receiver: res.receiver }

          newAppointments.splice(index, 1)

          socket.emit("socket/doneService", data, () => {
            fetchTheNumAppointments()
            setAppointments(newAppointments)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const removeFromList = (id, type) => {
    let newItems = []

    switch (type) {
      case "appointments":
        newItems = [...appointments]

        break
      case "cartOrderers":
        newItems = [...cartOrderers]

        break
      default:
    }

    newItems.forEach(function (item, index) {
      if (item.id === id) {
        newItems.splice(index, 1)
      }
    })

    switch (type) {
      case "appointments":
        setAppointments(newItems)

        break
      case "cartOrderers":
        setCartorderers(newItems)
        
        break
      default:
    }
  }
  const logout = () => {
    const ownerid = localStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      localStorage.clear()

      window.location = "/auth"
    })
  }
  const startWebsocket = () => {
    socket.on("updateSchedules", data => {
      if (data.type === "makeAppointment") {
        // if rebook 
        const newAppointments = [...appointments]

        newAppointments.forEach(function (info) {
          if (info.id === data.id) {
            info.time = data.time
          }
        })

        setAppointments(newAppointments)

        getAllAppointments()
      } else if (data.type === "cancelRequest") {
        const newAppointments = [...appointments]

        newAppointments.forEach(function (item, index) {
          if (item.id === data.scheduleid) {
            newAppointments.splice(index, 1)
          }
        })

        setAppointments(newAppointments)
        fetchTheNumAppointments()
      } else if (data.type === "cancelService") {
        const newAppointments = [...appointments]

        newAppointments.forEach(function(item, index) {
          if (item.id === data.id) {
            newAppointments.splice(index, 1)
          }
        })

        setAppointments(newAppointments)
        fetchTheNumAppointments()
      }
    })
    socket.on("updateOrders", () => getAllCartOrderers())
    socket.io.on("open", () => {
      if (ownerId != null) {
        socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
      }
    })
    socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})
  }

  const initialize = () => {
    getTheLocationProfile()
    getTheOwnerInfo()
  }
  
  useEffect(() => {
    let firstTime = localStorage.getItem("firstTime")

    initialize()

    if (firstTime === "true") {
      localStorage.removeItem("firstTime")

      setShowfirsttime({ ...showFirsttime, show: true })
    }
  }, [])

  useEffect(() => {
    startWebsocket()

    return () => {
      socket.off("updateSchedules")
      socket.off("updateOrders")
    }
  }, [appointments.length, cartOrderers.length])

  return (
    <div id="business-main">
      {loaded ?
        <div id="box">
          <div id="body">
            <div className="header">
              {(locationType === 'hair' || locationType === 'nail') ? 'Appointment(s)' : 'Orderer(s)'}
            </div>

            {viewType === "appointments" && (
              appointments.length > 0 ? 
                appointments.map((item, index) => (
                  <div key={item.key} className="schedule">
                    {item.image ?
                      <div className="schedule-image">
                        <img alt="" style={{ height: '100%', width: '100%' }} src={logo_url + item.image.name}/>
                      </div>
                    : null }
                      
                    <div className="schedule-header">
                      Client: {item.client.username}
                      <br/>{'Appointment for: ' + item.name}
                      <br/>{displayTime(item.time)}
                      <br/>with stylist: {item.worker.username}
                    </div>

                    <div id="schedule-actions">
                      <div className="column">
                        <div className="schedule-action" onClick={() => cancelTheSchedule(index, "appointment")}>Cancel</div>
                      </div>
                      <div className="column">
                        <div className="schedule-action" onClick={() => window.location = "booktime/" + item.id + "/" + (item.serviceid == "" ? null : item.serviceid) + "/" + item.name}>Pick another time for client</div>
                      </div>
                      <div className="column">
                        <div className="schedule-action" onClick={() => doneTheService(index, item.id)}>Done</div>
                      </div>
                    </div>
                  </div>
                ))
                :
                <div id="body-result">
                  <div id="body-result-header">
                    {numAppointments === 0 ? "No appointment(s) yet" : numAppointments + " appointment(s)"}
                  </div>
                </div>
            )}
            {viewType === "cartorderers" && (
              cartOrderers.length > 0 ? 
                cartOrderers.map((item, index) => (
                  item.product ? 
                    <div key={item.key} className="order-request">
                      <div className="order-request-row">
                        <div className="order-request-header">{item.product}</div>
                        <div className="order-request-quantity">Quantity: {item.quantity}</div>
                      </div>
                    </div>
                    :
                    <div key={item.key} className="cart-orderer">
                      <div className="cart-orderer-info">
                        <div className="cart-orderer-username">Customer: {item.username}</div>
                        <div className="cart-orderer-ordernumber">Order #{item.orderNumber}</div>

                        <div id="cart-orderer-actions">
                          <div className="cart-orderer-action" onClick={() => window.location = "/cartorders/" + item.adder + "/" + item.orderNumber}>See Order(s) ({item.numOrders})</div>
                        </div>
                      </div>
                    </div>
                ))
                :
                <div id="body-result">
                  <div id="body-result-header">
                    {numCartorderers === 0 ? 'No order(s) yet' : numCartorderers + ' order(s)'}
                  </div>
                </div>
            )}
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              <div className="column">
                <div className="bottom-nav" onClick={() => window.location = "/settings"}>
                  <FontAwesomeIcon icon={faGear}/>
                </div>
              </div>

              {isOwner === true && (
                <div className="bottom-nav" onClick={() => {
                  localStorage.removeItem("locationid")
                  localStorage.removeItem("locationtype")
                  localStorage.setItem("phase", "list")

                  window.location = "/list"
                }}>Switch Business</div>
              )}

              <div className="bottom-nav" onClick={() => window.location = "/menu"}>{isOwner === true ? "Edit" : "View"} Menu</div>

              <div className="column">
                <div className="bottom-nav" onClick={() => logout()}>Log-Out</div>
              </div>
            </div>
          </div>
        </div>
        :
        <div id="loading"><Loadingprogress/></div>
      }
      
      {(cancelInfo.show || showMenurequired || showFirsttime.show || showDisabledscreen) && (
        <div id="hidden-box">
          {cancelInfo.show && (
            <div id="cancel-request-box">
              <div id="cancel-request-header">Why cancel? (optional)</div>

              <textarea 
                placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" 
                id="cancel-request-input"
                onChange={(e) => setCancelinfo({ ...cancelInfo, reason: e.target.value })} 
              />

              <div id="cancel-request-actions">
                <div className="cancel-request-touch" onClick={() => setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", id: 0, index: 0, reason: "" })}>Close</div>
                <div className="cancel-request-touch" onClick={() => cancelTheSchedule(null, cancelInfo.requestType)}>Done</div>
              </div>
            </div>
          )}
          {showMenurequired && (
            <div id="required-box-container">
              <div id="required-box">
                <div id="required-container">
                  <div id="required-header">
                    You need to add some 
                    {locationType === "restaurant" ? " food " : " products / services "}
                    to your menu to list your location publicly
                  </div>

                  <div id="required-actions">
                    <div className="required-action" onClick={() => setShowmenurequired(false)}>Close</div>
                    <div className="required-action" onClick={() => {
                      setShowmenurequired(false)
                      
                      window.location = "/menu"
                    }}>Ok</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showFirsttime.show && (
            <div id="first-time-box">
              {showFirsttime.step === 0 ? 
                <div className="first-time-header">
                  Welcome!!<br/>
                  This is the main page<br/>
                  You will see all 
                  {locationType === 'restaurant' ? ' orders ' : ' appointments '}
                  here
                </div>
              : null }

              {showFirsttime.step === 1 ? 
                <div className="first-time-header">
                  Before you can accept {locationType === 'restaurant' ? ' orders ' : ' appointments '} from {locationType === 'restaurant' ? 'customers' : 'clients'}
                  <br/>
                  you need to setup your menu
                </div>
              : null }

              <div id="first-time-actions">
                {showFirsttime.step > 0 && (
                  <div className="first-time-action" onClick={() => setShowfirsttime({ ...showFirsttime, step: showFirsttime.step - 1 })}>Back</div>
                )}
                  
                <div className="first-time-action" onClick={() => {
                  if (showFirsttime.step === 1) {
                    setShowfirsttime({ show: false, step: 0 })

                    window.location = "/menu"
                  } else {
                    setShowfirsttime({ ...showFirsttime, step: showFirsttime.step + 1 })
                  }
                }}>{showFirsttime.step < 1 ? 'Next' : "Setup Menu"}</div>
              </div>
            </div>
          )}
          {showDisabledscreen && (
            <div id="disabled">
              <div style={{ margin: '0 auto' }}>
                <Loadingprogress/>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
