import './profile.scss';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faTimesCircle, faCircleNotch, faPhone, faShoppingBasket, faHome } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../../userInfo'
import { resizePhoto } from 'geottuse-tools'
import { getLocationProfile } from '../../../../apis/user/locations'
import { getMenus } from '../../../../apis/user/menus'
import { getNumCartItems } from '../../../../apis/user/carts'

import Orders from '../../../../components/user/orders'
import Userauth from '../../../../components/user/userauth'

const width = window.innerWidth
const height = window.innerHeight
const wsize = p => {return window.innerWidth * (p / 100)}

export default function Profile(props) {
  const { locationid } = useParams()

  const [logo, setLogo] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [distance, setDistance] = useState(0)
  const [showAuth, setShowauth] = useState(false)
  const [userId, setUserid] = useState(null)
  const [showInfo, setShowinfo] = useState(false)

  const [productInfo, setProductinfo] = useState('')
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [], error: false })

  const [loaded, setLoaded] = useState(false)
  
  const [openOrders, setOpenorders] = useState(false)
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
    setLoaded(false)

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
              <div className="menu-image-holder">
                {image.name && <img alt="" className="menu-image" style={resizePhoto(image, 50)} src={logo_url + image.name}/>}
              </div>
              <div className="column">
                <div className="menu-name">{name} (Menu)</div>
              </div>
            </div>
            {list.length > 0 && list.map((info, index) => (
              <div key={"list-" + index}>
                {info.listType === "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, left: left + 10 })
                  :
                  <div className="item">
                    <div className="item-image-holder">
                      {info.image.name && <img alt="" className="item-image" style={resizePhoto(info.image, 50)} src={logo_url + info.image.name}/>}
                    </div>
                    <div className="column">
                      <div className="item-header">{info.name}</div>
                    </div>
                    <div className="column">
                      <div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div>
                    </div>
                    <div className="column">
                      <div className="item-action" onClick={() => 
                        window.location.replace(
                          "/itemprofile/" + 
                          locationid + "/null/" + 
                          info.id + "/null"
                        )
                      }>See / Buy</div>
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
                  <div className="item-image-holder">
                    {info.image.name && <img alt="" className="item-image" style={resizePhoto(info.image, 50)} src={logo_url + info.image.name}/>}
                  </div>
                  <div className="column">
                    <div className="item-header">{info.name}</div>
                  </div>
                  <div className="column">
                    <div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div>
                  </div>
                  <div className="column">
                    <div className="item-action" onClick={() => 
                      window.location.replace(
                        '/itemprofile/' + 
                        locationid + '/null/' + info.id + '/null'
                      )
                    }>See / Buy</div>
                  </div>
                </div>
              }
            </div>
          ))
        }
      </div>
    )
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <div id="storeprofile">
      {loaded ? 
        <div id="box">
          <div id="goback" onClick={() => window.location = "/"}>Back</div>

          <div id="profile-info">
            <div className="column">
              <div className="header-action" onClick={() => setShowinfo(true)}>View Info</div>
            </div>
            <div className="column">
              <div className="header-action" onClick={() => getAllMenus()}>Refresh menu</div>
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
                    <input id="menu-input" type="text" placeholder="Enter product # or name" onChange={e => setProductinfo(e.target.value)}/>
                  </div>
                  <div id="menu-input-actions">
                    <div id="menu-input-touch" onClick={() => {
                      if (productInfo) {
                        window.location.replace("/itemprofile/" + locationid + "/null/null/" + productInfo + "/store")
                      } else {
                        setMenuinfo({ ...menuInfo, error: true })
                      }
                    }}>Order item</div>
                  </div>
                </div>
                {menuInfo.error && <div id="menu-input-error">Your request is empty</div>}
              </>
            )}

            {menuInfo.items.length > 0 && (
              menuInfo.items[0].row && ( 
                menuInfo.items.map(info => (
                  info.row.map(item => (
                    item.photo && (
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
                  <div className="bottom-nav" onClick={() => window.location.replace("account")}>
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

      {openOrders && <div id="hidden-box"><Orders close={() => setOpenorders(false)}/></div>}
      {showAuth && (
        <div id="hidden-box">
          <Userauth close={() => setShowauth(false)} done={id => {
            setUserid(id)
            setShowauth(false)
          }}/>
        </div>
      )}
      {showInfo && (
        <div id="hidden-box">
          <div id="show-info-container">
            <div id="show-info-box">
              <div id="show-info-close" onClick={() => setShowinfo(false)}>
                <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
              </div>

              <div className="show-info-header">{name}</div>
              <div className="show-info-header">{address}</div>

              <div style={{ alignItems: 'center' }}>
                <div id="show-info-row">
                  <FontAwesomeIcon icon={faPhone} size="3x"/>
                  <div id="show-info-phonenumber">{phonenumber}</div>
                </div>
              </div>
              <div className="show-info-header">{distance}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
