import './seeorders.scss';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { resizePhoto } from 'geottuse-tools'
import { seeOrders } from '../../../apis/user/carts'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Seeorders(props) {
  const { ordernumber } = useParams()

  const [userId, setUserid] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDisabledScreen, setShowdisabledscreen] = useState(false)

  const seeTheOrders = () => {
    const userid = localStorage.getItem("userid")

    seeOrders(ordernumber)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/user/login", userid, () => {
            setUserid(userid)
            setOrders(res.orders)
            setLoading(false)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const startWebsocket = () => {
    socket.on("updateSeeorders", data => {
      if (data.type === "orderDone") {
        window.location = "/"
      } else if (data.type === "setWaitTime") {

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
    startWebsocket()
    seeTheOrders()

    return () => {
      socket.off("updateSeeorders")
    }
  }, [orders.length])

  return (
    <div id="seeorders" style={{ opacity: loading ? 0.5 : 1 }}>
      {!loading ? 
        <div id="box">
          <div id="headers">
            <div id="box-back" onClick={() => {
              localStorage.setItem("openNotif", "true")

              window.location = "/"
            }}>Back</div>
            <div id="box-header">#{ordernumber} Order(s)</div>
          </div>

          <div id="items">
            {orders.map((item, index) => (
              <div className="item" key={item.key}>
                <div className="item-row">
                  <div className="item-image-holder">
                    <img src={item.image.name ? logo_url + item.image.name : "/noimage.jpeg"} style={resizePhoto(item.image, 100)}/>
                  </div>

                  <div className="item-infos">
                    <div className="item-name">{item.name}</div>
                    <div className="header"><div style={{ fontWeight: 'bold' }}>Quantity: {item.quantity}</div></div>

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
                  <div style={{ alignItems: 'center' }}>
                    <div id="note">
                      <div id="note-header"><div style={{ fontWeight: 'bold' }}>Customer's note:</div> <br/>{item.note}</div>
                    </div>
                  </div>
                : null }
              </div>
            ))}
          </div>
        </div>
        :
        <div id="loading">
          <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
        </div>
      }

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
