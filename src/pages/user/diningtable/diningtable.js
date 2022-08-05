import './diningtable.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { getQrCode, orderMeal, viewTableOrders } from '../../../apis/user/dining_tables'
import { getProductInfo } from '../../../apis/user/products'
import { getId } from 'geottuse-tools'

import Menus from '../../../widgets/user/menus'
import Loadingprogress from '../../../widgets/loadingprogress'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Diningtable(props) {
  const { tableid } = useParams()

  const [locationId, setLocationid] = useState('')
  const [locationName, setLocationname] = useState('')
  const [name, setName] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [refetchMenu, setRefetchmenu] = useState(0)
  const [numTableorders, setNumtableorders] = useState(0)
  const [showProductinfo, setShowproductinfo] = useState({ 
    show: false, 
    id: -1, name: '', note: '', image: '', sizes: [], quantities: [], percents: [], price: 0, 
    quantity: 0, cost: 0, 
    errorMsg: "",
    loading: false
  })
  const [orders, setOrders] = useState([])
  const [showAlert, setShowalert] = useState(false)
  const [showOrders, setShoworders] = useState({ show: false, orders: [] })
  const [showTableorders, setShowtableorders] = useState({ show: false, orders: [] })

  const getTheTable = () => {
    const ordersStr = localStorage.getItem("orders")

    getQrCode(tableid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setName(res.name)
          setLocationid(res.locationid)
          setLocationname(res.locationName)
          setNumtableorders(res.numOrders)
          setLoaded(true)

          localStorage.setItem("tableId", tableid)

          if (res.status == "finish") {
            localStorage.setItem("orders", "[]")
          } else {
            if (!ordersStr) {
              localStorage.setItem("orders", "[]")
            } else {
              setOrders(JSON.parse(ordersStr))
            }
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          alert(errormsg)
        }
      })
  }
  const getMealInfo = id => {
    getProductInfo(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          let { cost, name, price, productImage, sizes, quantities, percents, quantity } = res.productInfo
          let newCost = cost

          if (sizes.length == 1) {
            sizes[0].selected = true
            newCost += parseFloat(sizes[0].price)
          }

          if (quantities.length == 1) {
            quantities[0].selected = true
            newCost += parseFloat(quantities[0].price)
          }

          setShowproductinfo({
            ...showProductinfo,
            show: true, id, cost: newCost, name, image: productImage, 
            sizes, quantities, percents, price, quantity
          })
        }
      })
  }
  const selectOption = (index, option) => {
    let newCost = showProductinfo.cost, newOptions

    switch (option) {
      case "size":
        newOptions = [...showProductinfo.sizes]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost = showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, sizes: newOptions, cost: newCost, errorMsg: "" })

        break;
      case "quantity":
        newOptions = [...showProductinfo.quantities]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost = showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, quantities: newOptions, cost: newCost, errorMsg: "" })

        break;
      case "percent":
        newOptions = [...showProductinfo.percents]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost = showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, percents: newOptions, cost: newCost, errorMsg: "" })

        break;
      default:
    }
  }
  const changeQuantity = action => {
    let newQuantity = showProductinfo.quantity
    let newCost = 0

    newQuantity = action === "+" ? newQuantity + 1 : newQuantity - 1

    if (newQuantity < 1) {
      newQuantity = 1
    }

    if (showProductinfo.price) {
      newCost += newQuantity * parseFloat(showProductinfo.price)
    } else {
      if (showProductinfo.sizes.length > 0) {
        showProductinfo.sizes.forEach(function (size) {
          if (size.selected) {
            newCost += newQuantity * parseFloat(size.price)
          }
        })
      } else {
        showProductinfo.quantities.forEach(function (quantity) {
          if (quantity.selected) {
            newCost += newQuantity * parseFloat(quantity.price)
          }
        })
      }
    }

    setShowproductinfo({ ...showProductinfo, quantity: newQuantity, cost: newCost })
  }
  const viewTheTableOrders = () => {
    const tableId = localStorage.getItem("tableId")

    viewTableOrders(tableId)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowtableorders({ ...showTableorders, show: true, orders: res.orders })
        }
      })
  }
  const viewTheOrders = () => {
    const newOrders = [...orders]

    setShoworders({ ...showOrders, show: true, orders: newOrders })
  }
  const addToOrders = () => {
    setShowproductinfo({ ...showProductinfo, loading: true })

    const { id, name, cost, price, sizes, quantities, percents, image, quantity, note } = showProductinfo
    const newOrders = [...orders]

    let newCost = 0

    if (price) {
      newCost = parseFloat(price) * quantity
    } else {
      sizes.forEach(function (info) {
        if (info.selected) {
          newCost += parseFloat(info.price) * quantity
        }
      })

      quantities.forEach(function (info) {
        if (info.selected) {
          newCost += parseFloat(info.price) * quantity
        }
      })
    }

    percents.forEach(function (info) {
      if (info.selected) {
        newCost += parseFloat(info.price) * quantity
      }
    })

    newCost = newCost.toFixed(2)

    if (newCost.toString().split(".")[1].length < 2) {
      newCost = newCost + "0"
    }

    newOrders.unshift({
      key: getId(),
      productId: id,
      name, price, sizes, quantities, percents,
      image, quantity, note,
      cost: newCost
    })

    localStorage.setItem("orders", JSON.stringify(newOrders))
    setOrders(newOrders)

    setShowproductinfo({ ...showProductinfo, show: false, id: -1, loading: false })
  }
  const sendOrders = () => {
    const tableId = localStorage.getItem("tableId")
    const newOrders = [...orders]
    let sizes = [], quantities = [], percents = []

    newOrders.forEach(function (order) {
      order.sizes.forEach(function (info) {
        if (info.selected) {
          sizes.push(info.name)
        }
      })

      order.quantities.forEach(function (info) {
        if (info.selected) {
          quantities.push(info.input)
        }
      })

      order.percents.forEach(function (info) {
        if (info.selected) {
          percents.push(info.input)
        }
      })

      order.sizes = sizes
      order.quantities = quantities
      order.percents = percents

      sizes = []
      quantities = []
      percents = []
    })

    let data = { orders: JSON.stringify(newOrders), tableid: tableId }

    orderMeal(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/orderMeal", data, () => {
            setShoworders({ ...showOrders, show: false, orders: [] })
            setShowalert(true)

            setTimeout(function () {
              setShowalert(false)

              localStorage.setItem("orders", "[]")
              getTheTable()
            }, 1000)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const deleteOrder = index => {
    const newOrders = [...orders]

    newOrders.splice(index, 1)

    setOrders(newOrders)
    localStorage.setItem("orders", JSON.stringify(orders))
    setShoworders({ ...showOrders, orders: newOrders })
  }
  
  useEffect(() => {
    getTheTable()
  }, [])

  const { sizes, quantities, percents } = showProductinfo

  return (
    <div id="diningtable">
      {loaded && ( 
        <>
          <div id="hover-box">
            {orders.length > 0 && (
              <div className="hover-header" onClick={() => viewTheOrders()}>
                <div style={{ fontWeight: 'bold' }}>{orders.length}</div><div style={{ fontWeight: 'bold' }}>See / Send</div>Your Orders
              </div>
            )}
              
            <div className="hover-header" onClick={() => viewTheTableOrders()}>
              <div style={{ fontWeight: 'bold' }}>{numTableorders}</div>Ordered
            </div>
          </div>

          <div id="box">
            <div id="header">
              <div style={{ fontSize: wsize(5) }}>Welcome to {locationName}</div>
              <div style={{ fontSize: wsize(6), margin: '20px 0' }}>You are Table #{name}</div>
              Please order your meals below
            </div>

            <div id="body">
              <Menus
                locationid={locationId}
                refetchMenu={refetchMenu}
                type="restaurant"
                tableOrder={true}
                getMealInfo={getMealInfo}
              />
            </div>
          </div>

          {(showProductinfo.show || showAlert || showOrders.show || showTableorders.show) && (
            <div id="hidden-box">
              {showProductinfo.show && (
                <div id="product-info-box">
                  <div id="product-info-container">
                    <div id="product-info-close" onClick={() => setShowproductinfo({ ...showProductinfo, show: false, loading: false })}><FontAwesomeIcon icon={faTimesCircle} size="2x"/></div>

                    {showProductinfo.image.name && (
                      <div id="image-holder">
                        <img src={logo_url + showProductinfo.image.name} id="image"/>
                      </div>
                    )}
                    <div id="product-info-header">{showProductinfo.name}</div>

                    <div className="options-box">
                      {(sizes.length > 0 || quantities.length) > 0 && (
                        <div className="options-header">
                          {sizes.length > 0 ? 
                            sizes.length == 1 ? "(1 size only)" : "Select a size"
                            :
                            quantities.length == 1 ? "(1 quantity only)" : "Select a quantity"
                          }
                        </div>
                      )}

                      <div className="options">
                        {sizes.length > 0 && (
                          sizes.length == 1 ? 
                            <div className="option">
                              <div className="option-price">{sizes[0].name + ": $" + sizes[0].price}</div>
                            </div>
                            :
                            sizes.map((size, index) => (
                              <div key={size.key} className="option">
                                <div className={size.selected ? "option-touch-disabled" : "option-touch"} onClick={() => selectOption(index, "size")}>{size.name}</div>
                                <div className="option-price">$ {size.price}</div>
                              </div>
                            ))
                        )}

                        {quantities.length > 0 && (
                          quantities.length == 1 ? 
                            <div className="option">
                              <div className="option-price">{quantities[0].input + ": $" + quantities[0].price}</div>
                            </div>
                            :
                            quantities.map((quantity, index) => (
                              <div key={quantity.key} className="option">
                                <div className={quantity.selected ? "option-touch-disabled" : "option-touch"} onClick={() => selectOption(index, "quantity")}>{quantity.input}</div>
                                <div className="option-price">$ {quantity.price}</div>
                              </div>
                            ))
                        )}

                        {percents.length > 0 && (
                          percents.length == 1 ? 
                            <div className="option">
                              <div className="option-price">{percents[0].input + ": $" + percents[0].price}</div>
                            </div>
                            :
                            percents.map((percent, index) => (
                              <div key={percent.key} className="option">
                                <div className={percent.selected ? "option-touch-disabled" : "option-touch"} onClck={() => selectOption(index, "percent")}>{percent.input}</div>
                                <div className="option-price">$ {percent.price}</div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    <div id="quantity-row">
                      <div id="quantity">
                        <div className="column">
                          <div className="quantity-header">Quantity:</div>
                        </div>
                        <div className="column">
                          <div className="quantity-action" onClick={() => changeQuantity("-")}>-</div>
                        </div>
                        <div className="column">
                          <div className="quantity-header">{showProductinfo.quantity}</div>
                        </div>
                        <div className="column">
                          <div className="quantity-action" onClick={() => changeQuantity("+")}>+</div>
                        </div>
                      </div>
                    </div>

                    <div id="price">Cost: $ {showProductinfo.cost.toFixed(2)}</div>

                    <div id="note">
                      <div id="note-header">Add some instruction if you want ?</div>

                      <div id="note-input-container">
                        <textarea
                          id="note-input" 
                          placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder="Type in here"
                          maxLength={100} onChange={e => setShowproductinfo({ ...showProductinfo, note: e.target.value })}
                        />
                      </div>
                    </div>

                    {showProductinfo.errorMsg ? <div className="errormsg">{showProductinfo.errorMsg}</div> : null}

                    <div id="item-actions">
                      <div 
                        className="item-action" 
                        style={{ opacity: showProductinfo.loading ? 0.1 : 1, pointerEvents: showProductinfo.loading ? "none" : "" }} 
                        onClick={() => addToOrders()}
                      >
                        Add to Orders
                      </div>
                    </div>

                    {showProductinfo.loading && <Loadingprogress/>}
                  </div>
                </div>
              )}
              {showAlert && (
                <div id="alert-box">
                  <div id="alert-header">
                    Your order(s) has been sent{'\n'}to the kitchen
                  </div>
                </div>
              )}
              {showOrders.show && (
                <div id="show-orders-box">
                  <div id="show-orders-close" onClick={() => setShoworders({ ...showOrders, show: false })}><FontAwesomeIcon icon={faTimesCircle} size="2x"/></div>
                  <div id="show-orders-header">{showOrders.orders.length} Order(s)</div>

                  <div id="show-orders-send" onClick={() => sendOrders()}>Send to<br/>Kitchen</div>

                  <div id="show-orders-list">
                    {showOrders.orders.map((order, index) => (
                      <div className="order">
                        <div style={{ width: '50%' }}>
                          {order.image.name && (
                            <div className="order-photo">
                              <img style={{ height: '100%', width: '100%' }} src={logo_url + order.image.name}/>
                            </div>
                          )}
                          <div className="order-header">{order.name}</div>
                        </div>
                        <div style={{ width: '50%' }}>
                          {order.price ? 
                            <div>$ {order.price} ({order.quantity})</div>
                            :
                            <>
                              {order.sizes.map(info => info.selected ? <div>{info.name}: ${info.price} ({order.quantity})</div> : <div></div>)}
                              {order.quantities.map(info => info.selected ? <div>{info.input}: ${info.price} ({order.quantity})</div> : <div></div>)}
                            </>
                          }
                              
                          {order.percents.map(info => info.selected ? <div>{info.input}: ${info.price}</div> : <div></div>)}

                          <div className="order-cost">Cost: $ {order.cost}</div>
                        </div>
                        <div className="order-delete" onClick={() => deleteOrder(index)}><FontAwesomeIcon icon={faTimesCircle} size="2x"/></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showTableorders.show && (
                <div id="show-orders-box">
                  <div id="show-orders-close" onClick={() => setShowtableorders({ ...showTableorders, show: false })}><FontAwesomeIcon icon={faTimesCircle} size="2x"/></div>
                  <div id="show-orders-header">{showTableorders.orders.length} Ordered</div>

                  <div id="show-orders-list">
                    {showTableorders.orders.map(order => (
                      <div className="order">
                        <div style={{ width: '50%' }}>
                          {order.image.name && (
                            <div className="order-photo">
                              <img style={{ height: '100%', width: '100%' }} src={logo_url + order.image.name}/>
                            </div>
                          )}
                          <div className="order-header">{order.name}</div>
                        </div>
                        <div style={{ width: '50%' }}>
                          {order.price ? 
                            <div>$ {order.price} ({order.quantity})</div>
                            :
                            <>
                              {order.sizes.map(info => <div>{info.name}: ${info.price}</div>)}
                              {order.quantities.map(info => <div>{info.input}: ${info.price}</div>)}
                            </>
                          }
                              
                          {order.percents.map(info => info.selected ? <div>{info.input}: ${info.price}</div> : <div></div>)}

                          <div className="order-cost">Cost: $ {order.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
