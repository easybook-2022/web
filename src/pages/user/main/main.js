import './main.scss';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { geolocated } from "react-geolocated";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faCircleNotch, faBell, faShoppingBasket } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { resizePhoto } from 'geottuse-tools'
import { getNumNotifications } from '../../../apis/user/users'
import { getLocations, getMoreLocations } from '../../../apis/user/locations'
import { getNumCartItems } from '../../../apis/user/carts'

// widgets
import NotificationsBox from '../../../widgets/user/notification'
import Userauth from '../../../widgets/user/userauth'

// components
import Orders from '../../../components/user/orders'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Main(props) {
  const params = useParams()
  let updateTrackUser
  const firstTime = params.firstTime ? 
    true 
    : 
    false 

  const [locationPermission, setLocationpermission] = useState(false)
  const [geolocation, setGeolocation] = useState({ longitude: null, latitude: null })
  const [searchLocationname, setSearchlocationname] = useState('')
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [openNotifications, setOpennotifications] = useState(false)
  const [numNotifications, setNumnotifications] = useState(0)
  const [userId, setUserid] = useState(null)

  const [openOrders, setOpenorders] = useState(false)
  const [numCartItems, setNumcartitems] = useState(0)
  const [showAuth, setShowauth] = useState(false)
  const [userName, setUsername] = useState('')
  const [showDisabledScreen, setShowdisabledscreen] = useState(false)

  const fetchTheNumNotifications = () => {
    const userid = localStorage.getItem("userid")

    if (userid) {
      getNumNotifications(userid)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            socket.emit("socket/user/login", userid, () => {
              setUserid(userid)
              setNumnotifications(res.numNotifications)
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
  const getTheNumCartItems = async() => {
    const userid = localStorage.getItem("userid")

    if (userid) {
      getNumCartItems(userid)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) setNumcartitems(res.numCartItems)
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const getTheLocations = (longitude, latitude, locationName) => {
    const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const data = { longitude, latitude, locationName, day: day[d.getDay()] }

    setLoading(true)

    getLocations(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLocations(res.locations)
          setSearchlocationname(locationName)
          setLoaded(true)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheMoreLocations = (type, lindex, index) => {
    const newLocations = [...locations]
    const location = newLocations[lindex]
    const { longitude, latitude } = geolocation
    const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const data = { longitude, latitude, locationName: searchLocationname, type, index, day: day[d.getDay()] }

    getMoreLocations(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { index, max, newlocations } = res

          if (newlocations.length > 0) {
            location["locations"] = location["locations"].concat(newlocations)
            location["index"] = index
            location["max"] = max

            newLocations[lindex] = location
            setLocations(newLocations)
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getLocationPermission = () => {
    let longitude = localStorage.getItem("longitude")
    let latitude = localStorage.getItem("latitude")

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        let { longitude, latitude } = position.coords

        setLocationpermission(true)
        setGeolocation({ longitude, latitude })

        localStorage.setItem("longitude", longitude.toString())
        localStorage.setItem("latitude", latitude.toString())

        updateTrackUser = setInterval(() => trackUserLocation(), 2000)
        setGeolocation({ longitude, latitude })
        getTheLocations(longitude, latitude, "")
      });
    }
  }
  const trackUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let { longitude, latitude } = position.coords

        setGeolocation({ longitude, latitude })

        localStorage.setItem("longitude", longitude.toString())
        localStorage.setItem("latitude", latitude.toString())
      });
    } 
  }
  const displayLocationStatus = (opentime, closetime) => {
    let openHour = parseInt(opentime['hour']), openMinute = parseInt(opentime['minute']), openPeriod = opentime['period']
    let closeHour = parseInt(closetime['hour']), closeMinute = parseInt(closetime['minute']), closePeriod = closetime['period']
    let currentTime = new Date(Date.now()).toString().split(" "), currTime = Date.now()

    openHour = openPeriod === "PM" ? parseInt(openHour) + 12 : openHour
    closeHour = closePeriod === "PM" ? parseInt(closeHour) + 12 : closeHour

    let openStr = currentTime[0] + " " + currentTime[1] + " " + currentTime[2] + " " + currentTime[3] + " " + openHour + ":" + openMinute
    let closeStr = currentTime[0] + " " + currentTime[1] + " " + currentTime[2] + " " + currentTime[3] + " " + closeHour + ":" + closeMinute
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)

    if (currTime < openDateStr && currTime > closeDateStr) {
      return "Closed"
    }

    return ""
  }
  const startWebsocket = async() => {
    socket.on("updateNumNotifications", () => fetchTheNumNotifications())
    socket.io.on("open", () => {
      if (userId !== null) {
        socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))
      }
    })
    socket.io.on("close", () => userId !== null ? setShowdisabledscreen(true) : {})
  }
  const initialize = () => {
    const openNotif = localStorage.getItem("openNotif")

    fetchTheNumNotifications()
    getTheNumCartItems()
    getLocationPermission()

    if (openNotif === "true") {
      localStorage.removeItem("openNotif")

      setTimeout(function () {
        setOpennotifications(true)
      }, 1000)
    }
  }

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    startWebsocket()

    return () => {
      clearInterval(updateTrackUser)
      socket.off("updateNumNotifications")
    }
  }, [numNotifications])

  return (
    <div id="user-main">
      {loaded ? 
        <div id="box">
          <div id="headers">
            <div id="headers-row">
              <div id="search-input-container">
                <input 
                  type="text" id="search-input" placeholdertextcolor="rgba(127, 127, 127, 0.5)"
                  placeholder="Search salons, restaurants and stores" onChange={(e) => getTheLocations(geolocation.longitude, geolocation.latitude, e.target.value)}
                />
              </div>

              {userId && (
                <div id="notification" onClick={() => {
                  if (userId) {
                    setOpennotifications(true)
                  } else {
                    setShowauth(true)
                  }
                }}>
                  <FontAwesomeIcon icon={faBell} size="2x"/>
                  {numNotifications > 0 && (<div id="notification-header">{numNotifications}</div>)}
                </div>
              )}
            </div>
          </div>

          <div id="refresh-container">
            <div id="refresh" onClick={() => getLocationPermission()}>Reload</div>
          </div>

          <div id="body">
            {geolocation.longitude && geolocation.latitude && !loading ? 
              locations.map(item => (
                item.locations.length > 0 && (
                  <div key={item.key} className="service">
                    <div className="row-header">{item.locations.length} {item.header} near you</div>

                    <div className="row">
                      {item.locations.map((info, index) => (
                        <div key={index} className="location" onClick={() => {
                          clearInterval(updateTrackUser)

                          window.location.href = "/" + info.nav + "/" + info.id
                        }}>
                          <div className="location-photo-holder">
                            <img alt="" src={logo_url + info.logo.name} style={resizePhoto(info.logo, 100)}/>
                          </div>

                          <div className="location-header">{info.name}</div>
                          <div className="location-header">{info.distance}</div>

                          <div className="location-action">{info.service === "restaurant" ? "Order" : "Book"} now</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))
              :
              <div id="loading">
                <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
              </div>
            }
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              {userId && (
                <div className="column">
                  <div className="bottom-nav" onClick={() => {
                    clearInterval(updateTrackUser)

                    window.location.replace("/account")
                  }}>
                    <FontAwesomeIcon icon={faUserCircle} size="2x"/>
                  </div>
                </div>
              )}

              {userId && (
                <div className="column">
                  <div className="bottom-nav" onClick={() => setOpenorders(true)}>
                    <FontAwesomeIcon icon={faShoppingBasket} size="2x"/>
                    {numCartItems > 0 && <div id="num-cart-items-header">{numCartItems}</div>}
                  </div>
                </div>
              )}

              <div className="column">
                <div className="bottom-nav" onClick={() => {
                  if (userId) {
                    socket.emit("socket/user/logout", userId, () => {
                      clearInterval(updateTrackUser)
                      localStorage.clear()
                      setUserid(null)
                    })
                  } else {
                    setShowauth(true)
                  }
                }}>
                  {userId ? 'Log-Out' : 'Log-In'}
                </div>
              </div>
            </div>
          </div>
        </div>
        :
        <div id="loading">
          <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
        </div>
      }

      {openNotifications && 
        <div id="hidden-box">
          <NotificationsBox close={() => {
            const userid = localStorage.getItem("userid")
            
            socket.emit("socket/user/login", userid, () => {
              fetchTheNumNotifications()
              setOpennotifications(false)
            })
          }}/>
        </div>
      }
      {openOrders && <div id="hidden-box"><Orders showNotif={() => {
        setOpenorders(false)
        setOpennotifications(true)
      }} navigate={() => {
        setOpenorders(false)
        setOpennotifications(false)

        window.location.replace("/account")
      }} close={() => {
        getTheNumCartItems()
        setOpenorders(false)
      }}/></div>}
      {showAuth && (
        <div id="hidden-box">
          <Userauth close={() => setShowauth(false)} done={id => {
            socket.emit("socket/user/login", "user" + id, () => {
              setUserid(id)
              setShowauth(false)
              initialize()
            })
          }}/>
        </div>
      )}
      {showDisabledScreen && (
        <div id="hidden-box">
          <div id="disabled">
            <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
          </div>
        </div>
      )}
    </div>
  )
}
