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

  const [logo, setLogo] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [distance, setDistance] = useState(0)
  const [showAuth, setShowauth] = useState(false)
  const [userId, setUserid] = useState(null)
  const [showInfo, setShowinfo] = useState(false)
  const [refetchMenu, setRefetchmenu] = useState(0)

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

  useEffect(() => {
    initialize()
  }, [])

  return (
    <div id="restaurantprofile">
      {loaded ? 
        <div id="box">
          <div id="goback" onClick={() => window.location = "/"}>Back</div>

          <div id="profile-info">
            <div className="column">
              <div className="header-action" onClick={() => setShowinfo(true)}>View Info</div>
            </div>
            <div className="column">
              <div className="header-action" onClick={() => setRefetchmenu(!refetchMenu)}>Refresh menu</div>
            </div>
            <div className="column">
              <div className="header-action" onClick={() => {}}>Call</div>
            </div>
          </div>
          
          <div id="body">
            <Menus
              locationid={locationid}
              refetchMenu={refetchMenu}
              type="restaurant"
            />
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              {userId && (
                <div className="column">
                  <div className="bottom-nav" onClick={() => window.location = "account"}>
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










