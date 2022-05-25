import './profile.scss';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faUserCircle, faTimesCircle, faShoppingBasket, faHome } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../../userInfo';
import { resizePhoto } from 'geottuse-tools'
import { getWorkersTime } from '../../../../apis/user/owners';
import { getLocationProfile } from '../../../../apis/user/locations';
import { getMenus } from '../../../../apis/user/menus';
import { getNumCartItems } from '../../../../apis/user/carts';

// components
import Orders from '../../../../components/user/orders'

// widgets
import Userauth from '../../../../widgets/user/userauth'
import Menus from '../../../../widgets/user/menus'

const width = window.innerWidth
const height = window.innerHeight
const wsize = p => {return window.innerWidth * (p / 100)}

export default function Profile(props) {
  const { locationid } = useParams()

  const [logo, setLogo] = useState({})
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [distance, setDistance] = useState(0)
  const [showAuth, setShowauth] = useState({ show: false, action: "" })
  const [showInfo, setShowinfo] = useState({ show: false, workerHours: [] })
  const [refetchMenu, setRefetchmenu] = useState(0)
  const [userId, setUserid] = useState(null)

  const [loaded, setLoaded] = useState(false)

  const [openCart, setOpencart] = useState(false)
  const [numCartItems, setNumcartitems] = useState(0)

  const getTheNumCartItems = () => {
    const userid = localStorage.getItem("userid")

    if (userid) {
      getNumCartItems(userid)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setUserid(userid)
            setNumcartitems(res.numCartItems)
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const getTheLocationProfile = () => {
    const longitude = localStorage.getItem("longitude")
    const latitude = localStorage.getItem("latitude")
    const data = { locationid, longitude, latitude }

    getLocationProfile(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, logo, fullAddress, city, province, postalcode, phonenumber, distance } = res.info

          setLogo(logo)
          setName(name)
          setAddress(fullAddress)
          setPhonenumber(phonenumber)
          setDistance(distance)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const initialize = () => {
    getTheNumCartItems()
    getTheLocationProfile()
  }
  const getTheWorkersTime = () => {
    getWorkersTime(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowinfo({ show: true, workerHours: res.workerHours })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  
  useEffect(() => {
    initialize()
  }, [])

  return (
    <div id="salonprofile">
      {loaded ? 
        <div id="box">
          <div id="goback" onClick={() => window.location = "/"}>Back</div>

          <div id="profile-info">
            <div className="column">
              <div className="header-action" onClick={() => getTheWorkersTime()}>View Salon<br/>Info</div>
            </div>
            <div className="column">
              <div className="header-action" onClick={() => setRefetchmenu(!refetchMenu)}>Refresh<br/>Menu</div>
            </div>
            <div className="column">
              <div className="header-action" onClick={() => {}}>Call</div>
            </div>
          </div>

          <div id="body">
            <Menus
              locationid={locationid}
              refetchMenu={refetchMenu}
              type="salon"
            />
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              {userId && (
                <div className="column">
                  <div className="bottom-nav" onClick={() => window.location = "/account"}>
                    <FontAwesomeIcon icon={faUserCircle} size="2x"/>
                  </div>
                </div>
              )}

              {userId && (
                <div className="column">
                  <div className="bottom-nav" onClick={() => setOpencart(true)}>
                    <FontAwesomeIcon icon={faShoppingBasket} size="2x"/>
                    {numCartItems > 0 && <div id="num-cart-items-header">{numCartItems}</div>}
                  </div>
                </div>
              )}

              <div className="column">
                <div className="bottom-nav" onClick={() => window.location = "/"}><FontAwesomeIcon icon={faHome} size="2x"/></div>
              </div>
              <div className="column">
                <div className="bottom-nav" onClick={() => {
                  if (userId) {
                    socket.emit("socket/user/logout", userId, () => {
                      localStorage.clear()
                      setUserid(null)
                    })
                  } else {
                    setShowauth({ ...showAuth, show: true })
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

      {openCart && <div id="hidden-box"><Orders close={() => {
        getTheNumCartItems()
        setOpencart(false)
      }}/></div>}
      {showAuth.show && (
        <div id="hidden-box">
          <Userauth close={() => setShowauth({ ...showAuth, show: false, action: "" })} done={id => {
            socket.emit("socket/user/login", "user" + id, () => setUserid(id))
            setShowauth({ ...showAuth, show: false, action: false })
          }}/>
        </div>
      )}
      {showInfo.show && (
        <div id="hidden-box">
          <div id="show-info-container">
            <div id="show-info-box">
              <div style={{ alignItems: 'center' }}>
                <div id="show-info-close" onClick={() => setShowinfo(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                </div>

                <div className="show-info-header">{name}</div>
                <div className="show-info-header">{address}</div>
                <div id="show-info-phonenumber">{phonenumber}</div>
                <div className="show-info-header">{distance}</div>

                <div id="worker-info-list">
                  {showInfo.workerHours.map(worker => (
                    <div key={worker.key} className="worker">
                      <div className="worker-info">
                        <div className="worker-info-profile">
                          <img alt="" style={resizePhoto(worker.profile, 50)} src={logo_url + worker.profile.name}/>
                        </div>
                        <div className="worker-info-name">{worker.name}</div>
                      </div>
                      <div className="worker-time">
                        {worker.hours.map(info => (
                          info.working && (
                            <div className="worker-time-container" key={info.key}>
                              <div className="day-header">{info.header}: </div>
                              <div className="time-headers">
                                <div className="time-header">{info.opentime.hour}</div>
                                <div className="column"><div>:</div></div>
                                <div className="time-header">{info.opentime.minute}</div>
                                <div className="time-header">{info.opentime.period}</div>
                              </div>
                              <div className="column"><div> - </div></div>
                              <div className="time-headers">
                                <div className="time-header">{info.closetime.hour}</div>
                                <div className="column"><div>:</div></div>
                                <div className="time-header">{info.closetime.minute}</div>
                                <div className="time-header">{info.closetime.period}</div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}











