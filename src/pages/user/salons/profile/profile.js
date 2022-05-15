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

import Orders from '../../../../components/user/orders'
import Userauth from '../../../../components/user/userauth'

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
  const [showAuth, setShowauth] = useState(false)
  const [showInfo, setShowinfo] = useState({ show: false, workerHours: [] })
  const [userId, setUserid] = useState(null)

  const [serviceInfo, setServiceinfo] = useState('')
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [], error: false })

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
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllMenus = () => {
    getMenus(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setMenuinfo({ ...menuInfo, list: res.list, photos: res.photos })
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
    getAllMenus()
  }
  const displayList = info => {
    let { id, image, name, list, left } = info
    
    return (
      <div style={{ marginLeft: left }}>
        {name ?
          <div className="menu">
            <div className="menu-row">
              {image.name ? 
                <div className="menu-image-holder">
                  <img alt="" className="menu-image" style={resizePhoto(image, 50)} src={logo_url + image.name}/>
                </div>
              : null }
              <div className="menu-name">{name} (Menu)</div>
            </div>
            {list.length > 0 && list.map((info, index) => (
              <div key={"list-" + index}>
                {info.listType === "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, left: left + 10 })
                  :
                  <div className="item">
                    {info.image.name ? 
                      <div className="item-image-holder">
                        <img alt="" className="item-image" style={resizePhoto(info.image, 100)} src={logo_url + info.image.name}/>
                      </div>
                    : null }
                    <div className="column">
                      <div className="item-header">{info.name}</div>
                    </div>
                    <div className="column">
                      <div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div>
                    </div>
                    <div className="column">
                      <div className="item-action" onClick={() => 
                        window.location.replace(
                          "/booktime/" + 
                          locationid + "/null/null/" + 
                          info.id + "/null"
                        )
                      }>Book a time</div>
                    </div>
                  </div>
                }
              </div>
            ))}
          </div>
          :
          list.map((info, index) => (
            <div key={"list-" + index}>
              {info.listType === "list" ? 
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list, left: left + 10 })
                :
                <div className="item">
                  {info.image ? 
                    <div className="item-image-holder">
                      <img alt="" className="item-image" style={resizePhoto(info.image, 100)} src={logo_url + info.image.name}/>
                    </div>
                  : null }
                  <div className="column">
                    <div className="item-header">{info.name}</div>
                  </div>
                  <div className="column">
                    <div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div>
                  </div>
                  <div className="column">
                    <div className="item-action" onClick={() => 
                      window.location.replace(
                        "/booktime/" + 
                        locationid + "/null/null/" + 
                        info.id + "/null"
                      )
                    }>Book a time</div>
                  </div>
                </div>
              }
            </div>
          ))
        }
      </div>
    )
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
              <div className="header-action" onClick={() => getAllMenus()}>Refresh<br/>Menu</div>
            </div>
            <div className="column">
              <div className="header-action" onClick={() => {}}>Call</div>
            </div>
          </div>

          <div id="body">
            {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
              <>
                <div id="menu-input-box">
                  <div id="menu-input-container">
                    <input id="menu-input" type="text" placeholder="Enter service # or name" onChange={e => {
                      setServiceinfo(e.target.value)
                      setMenuinfo({ ...menuInfo, error: false })
                    }}/>
                  </div>
                  <div id="menu-input-touch" onClick={() => {
                    if (serviceInfo) {
                      window.location.replace("/booktime/" + locationid + "/null/null/null/" + serviceInfo + "/salon")
                    } else 
                    setMenuinfo({ ...menuInfo, error: true })
                  }}>Book now</div>
                </div>
                {menuInfo.error && <div id="menu-input-error">Your request is empty</div>}
              </>
            )}

            {menuInfo.photos.length > 0 && (
              menuInfo.photos[0].row && (
                menuInfo.photos.map(info => (
                  info.row.map(item => (
                    (item.photo && item.photo.name) && (
                      <div key={item.key} className="menu-photo" style={resizePhoto(item.photo, wsize(95))}>
                        <img alt="" style={{ height: '100%', width: '100%' }} src={logo_url + item.photo.name}/>
                      </div>
                    )
                  ))
                ))
              )
            )}

            {displayList({ id: "", name: "", image: "", list: menuInfo.list, left: 0 })}
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              {userId && (
                <div className="column">
                  <div className="bottom-nav" onClick={() => window.location.replace("/account")}>
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
                <div className="bottom-nav" onClick={() => window.location.replace("/")}><FontAwesomeIcon icon={faHome} size="2x"/></div>
              </div>
              <div className="column">
                <div className="bottom-nav" onClick={() => {
                  if (userId) {
                    socket.emit("socket/user/logout", userId, () => {
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
