import './orders.scss';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCircleNotch } from '@fortawesome/fontawesome-free-solid'
import { resizePhoto } from 'geottuse-tools';
import { socket, logo_url } from '../../../userInfo'
import { searchFriends, selectUser, requestUserPaymentMethod } from '../../../apis/user/users'
import { getCartItems, getCartItemsTotal, editCartItem, updateCartItem, removeFromCart, changeCartItem, checkoutCart } from '../../../apis/user/carts'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Orders(props) {
  const [userId, setUserid] = useState(null)
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [activeCheckout, setActivecheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowconfirm] = useState(false)
  const [itemInfo, setIteminfo] = useState({ 
    show: false, cartid: "", name: "", info: "", note: "", 
    image: "", price: "", options: [], others: [], sizes: [], quantity: 1, cost: 0,
    errorMsg: ""
  })
  const [errorMsg, setErrormsg] = useState('')
  const [showDisabledScreen, setShowdisabledscreen] = useState(false)

  const changeOption = (index, selected) => {
    let { options } = itemInfo
    let newOptions = [...options]

    newOptions[index].selected = selected

    setIteminfo({ ...itemInfo, options: newOptions })
  }
  const changeAmount = (index, action) => {
    let { options } = itemInfo
    let newOptions = [...options]
    let { selected } = newOptions[index]

    selected = action === "+" ? selected + 1 : selected - 1

    if (selected >= 0) {
      newOptions[index].selected = selected

      setIteminfo({ ...itemInfo, options: newOptions })
    }
  }
  const changePercentage = (index, action) => {
    let { options } = itemInfo
    let newOptions = [...options]
    let { selected } = newOptions[index]

    selected = action === "+" ? selected + 10 : selected - 10

    if (selected >= 0 && selected <= 100) {
      newOptions[index].selected = selected

      setIteminfo({ ...itemInfo, options: newOptions })
    }
  }
  const selectSize = (index) => {
    let { sizes, quantity, cost } = itemInfo
    let newSizes = [...sizes]
    let newCost = cost

    newSizes.forEach(function (size) {
      if (size.selected) {
        size.selected = false

        newCost -= parseFloat(size.price)
      }
    })

    newSizes[index].selected = true
    newCost = quantity * parseFloat(newSizes[index].price)

    setIteminfo({
      ...itemInfo,
      sizes: newSizes,
      cost: newCost
    })
  }
  const selectOther = (index) => {
    let { others, cost } = itemInfo
    let newOthers = [...others]
    let newCost = parseFloat(cost)

    newOthers.forEach(function (other, otherindex) {
      if (otherindex === index) {
        if (other.selected) {
          newCost -= parseFloat(other.price)
        } else {
          newCost += parseFloat(other.price)
        }

        other.selected = !other.selected
      }
    })

    setIteminfo({
      ...itemInfo,
      others: newOthers,
      cost: newCost
    })
  }
  const changeQuantity = (action) => {
    let { price, others, sizes, quantity } = itemInfo
    let newQuantity = quantity
    let newCost = 0

    newQuantity = action === "+" ? newQuantity + 1 : newQuantity - 1

    if (newQuantity < 1) {
      newQuantity = 1
    }

    if (sizes.length > 0) {
      sizes.forEach(function (size) {
        if (size.selected) {
          newCost += newQuantity * parseFloat(size.price)
        }
      })
    } else {
      newCost += newQuantity * parseFloat(price)
    }

    others.forEach(function (other) {
      if (other.selected) {
        newCost += parseFloat(other.price)
      }
    })

    setIteminfo({
      ...itemInfo,
      quantity: newQuantity,
      cost: newCost
    })
  }

  const getTheCartItems = async() => {
    const userid = localStorage.getItem("userid")

    getCartItems(userid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/user/login", userid, () => {
            setUserid(userid)
            setItems(res.cartItems)
            setActivecheckout(res.activeCheckout)
            setLoaded(true)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const editTheCartItem = async(cartid) => {
    editCartItem(cartid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, info, image, quantity, options, others, sizes, note, price, cost } = res.cartItem

          setIteminfo({
            ...itemInfo,
            show: true,
            cartid,
            name, info, image,
            quantity, note, options, others, sizes,
            price, cost
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const updateTheCartItem = async() => {
    const { cartid, quantity, options, others, sizes, note } = itemInfo
    const newOptions = JSON.parse(JSON.stringify(options))
    const newOthers = JSON.parse(JSON.stringify(others))
    const newSizes = JSON.parse(JSON.stringify(sizes))
    const data = { cartid, quantity, note }

    newOptions.forEach(function (option) {
      delete option['key']
    })

    newOthers.forEach(function (other) {
      delete other['key']
    })

    newSizes.forEach(function (size) {
      delete size['key']
    })

    data['options'] = newOptions
    data['others'] = newOthers
    data['sizes'] = newSizes

    setLoaded(false)

    updateCartItem(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          getTheCartItems()
          setIteminfo({ ...itemInfo, show: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const removeTheCartItem = id => {
    removeFromCart(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const newItems = [...items]

          newItems.forEach(function (item, index) {
            if (item.id === id) {
              newItems.splice(index, 1)
            }
          })

          setItems(newItems)
        }
      })
  }

  const checkout = async() => {
    const time = Date.now()
    let data = { userid: userId, time, type: "checkout" }

    checkoutCart(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver, speak: res.speak }
          socket.emit("socket/checkoutCart", data, () => {
            setActivecheckout(false)
            setShowconfirm(true)

            setTimeout(function () {
              setLoading(false)

              setShowconfirm(false)
              localStorage.setItem("openNotif", "true")

              window.location = "/"
            }, 2000)
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
    socket.on("updateOrderers", data => {
      if (data.type === "cancelCartOrder") {
        const { userid, cartid } = data
        const newItems = [...items]
        const orderers = [], row = []

        setActivecheckout(true)

        newItems.forEach(function (item) {
          item.orderers.forEach(function (info) {
            info.row.forEach(function (orderer) {
              if (orderer.id !== userid) {
                row.push(orderer)

                if (row.length === 4) {
                  orderers.push(row)
                  row = []
                }

                if (orderer.status && (orderer.status !== "confirmed" && orderer.status !== "rejected")) {
                  setActivecheckout(false)
                }
              }
            })
          })
        })

        newItems.forEach(function (item, index) {
          if (item.id === cartid) {
            if (orderers.length > 0) {
              item.orderers = orderers
            }
          }
        })

        setItems(newItems)
      } else if (data.type === "confirmCartOrder") {
        const { userid, id } = data
        const newItems = [...items]

        setActivecheckout(true)

        newItems.forEach(function (item) {
          item.orderers.forEach(function (info) {
            info.row.forEach(function (orderer) {
              if (item.id === id && orderer.id === userid) {
                orderer.status = "confirmed"
              }

              if (orderer.status && (orderer.status !== "confirmed" && orderer.status !== "rejected")) {
                setActivecheckout(false)
              }
            })
          })
        })

        setItems(newItems)
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
    getTheCartItems()
  }, [])

  useEffect(() => {
    startWebsocket()

    return () => {
      socket.off("updateOrderers")
    }
  }, [items.length])

  return (
    <div id="orders" style={{ opacity: loading ? 0.5 : 1 }}>
      <div id="orders-box">
        <div id="headers">
          <div id="box-close" onClick={() => props.close()}>
            <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
          </div>
          <div id="box-header">Order(s)</div>
        </div>

        <div id="body">
          {loaded ? 
            items.length > 0 ? 
              <>
                <div id="items">
                  {items.map((item, index) => (
                    <>
                      <div className="item" key={item.key}>
                        <div className="item-row">
                          <div disabled={item.status === "checkout"} onClick={() => removeTheCartItem(item.id)}>
                            <FontAwesomeIcon icon={faTimesCircle} size="2x"/>
                          </div>
                          <div className="item-image-holder">
                            <img src={item.image.name ? logo_url + item.image.name : "/noimage.jpeg"} style={resizePhoto(item.image, 70)}/>
                          </div>
                          <div className="item-infos">
                            <div className="item-name">{item.name}</div>

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
                                  <div>($ {other.price})</div>
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
                          <div className="header"><div style={{ fontWeight: 'bold' }}>Quantity:</div> <div>{item.quantity}</div></div>
                        </div>

                        <div style={{ margin: '0 auto' }}>
                          <div className="item-change" disabled={item.status === "checkout"} onClick={() => editTheCartItem(item.id)}>Edit Order</div>
                        </div>

                        {item.note ? 
                          <div className="note">
                            <div className="note-header"><div style={{ fontWeight: 'bold' }}>Customer's note:</div> {'\n' + item.note}</div>
                          </div>
                        : null }
                      </div>

                      {index === items.length - 1 && <div className="send-action" onClick={() => props.close()}>Add more item +</div>}
                    </>
                  ))}
                </div>

                <div id="items-bottom">
                  <div className="orders-action" style={{ opacity: activeCheckout && !loading ? 1 : 0.3 }} disabled={!activeCheckout || loading} onClick={() => checkout()}>Send Order</div>

                  {loading && <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>}   
                </div>
              </>
              :
              <div id="no-result">
                <div id="no-result-header">You don't have order(s)</div>
              </div>
            :
            <div id="loading">
              <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
            </div>
          }
        </div>
      </div>
      
      {(showConfirm || itemInfo.show || showDisabledScreen) && (
        <div id="hidden-box">
          {showConfirm && (
            <div id="confirm-box">
              <div id="confirm-container">
                <div id="confirm-header">Orders sent</div>
              </div>
            </div>
          )}
          {itemInfo.show && (
            <div id="item-info-box">
              <div id="item-info-header">
                <div id="item-close" onClick={() => setIteminfo({ ...itemInfo, show: false })}>
                  <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                </div>
              </div>
              <div id="item-info-container">
                <div id="image-holder">
                  <img src={itemInfo.image.name ? logo_url + itemInfo.image.name : "/noimage.jpeg"} id="image"/>
                </div>
                  
                <div id="box-item-header">{itemInfo.name}</div>
                <div id="box-item-header-info">{itemInfo.info}</div>

                {itemInfo.options.map((option, index) => (
                  <div key={option.key} style={{ margin: '0 auto' }}>
                    <div className="info">
                      <div className="info-header">{option.header}:</div>

                      {option.type === "amount" && (
                        <div style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                          <div className="amount">
                            <div className="amount-action" onClick={() => changeAmount(index, "-")}>-</div>
                            <div className="amount-header">{option.selected}</div>
                            <div className="amount-action" onClick={() => changeAmount(index, "+")}>+</div>
                          </div>
                        </div>
                      )}

                      {option.type === "percentage" && (
                        <div style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                          <div className="percentage">
                            <div className="percentage-action" onClick={() => changePercentage(index, "-")}>-</div>
                            <div className="percentage-header">{option.selected}%</div>
                            <div className="percentage-action" onClick={() => changePercentage(index, "+")}>+</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {itemInfo.others.length > 0 && (
                  <div id="others-box">
                    <div id="others-header">Other options</div>

                    <div id="others">
                      {itemInfo.others.map((other, index) => (
                        <div key={other.key} style={{ margin: '0 auto' }}>
                          <div className="other">
                            <div style={{ flexDirection: 'row' }}>
                              <div className="other-name"># {other.name}:</div>
                              <div className="other-input">{other.input}</div>
                            </div>
                            <div style={{ flexDirection: 'row', marginTop: 10 }}>
                              <div className="other-price">$ {other.price}</div>

                              <div className="other-actions">
                                <div className={other.selected ? "other-action-left-disabled" : "other-action-left"} onClick={() => selectOther(index)}>Yes</div>
                                <div className={!other.selected ? "other-action-right-disabled" : "other-action-right"} onClick={() => selectOther(index)}>No</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {itemInfo.sizes.length > 0 && (
                  <div id="sizes-box">
                    <div id="sizes-header">Select a Size</div>

                    <div id="sizes">
                      {itemInfo.sizes.map((size, index) => (
                        <div key={size.key} className="size">
                          <div className={size.selected ? "size-touch-disabled" : "size-touch"} onClick={() => selectSize(index)}>{size.name}</div>
                          <div className="size-price">$ {size.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div id="note">
                  <textarea 
                    id="note-input" 
                    placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                    maxLength={100} onChange={(e) => setIteminfo({ ...itemInfo, note: e.target.value })} 
                    value={itemInfo.note}
                  />
                </div>

                <div id="quantity-row">
                  <div id="quantity">
                    <div className="column">
                      <div className="quantity-header">Quantity</div>
                    </div>
                    <div className="column">
                      <div className="quantity-action" onClick={() => changeQuantity("-")}>-</div>
                    </div>
                    <div className="column">
                      <div className="quantity-header">{itemInfo.quantity}</div>
                    </div>
                    <div className="column">
                      <div className="quantity-action" onClick={() => changeQuantity("+")}>+</div>
                    </div>
                  </div>
                </div>

                {itemInfo.errorMsg ? <div className="errorMsg">{itemInfo.errorMsg}</div> : null}

                <div id="item-actions">
                  <div style={{ flexDirection: 'row' }}>
                    <div className="item-action" onClick={() => updateTheCartItem()}>Update{'\n'}order</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showDisabledScreen && (
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
          )}
        </div>
      )}
    </div>
  )
}
