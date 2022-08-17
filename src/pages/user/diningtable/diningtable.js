import './diningtable.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { getQrCode, orderMeal, viewTableOrders, viewNumTableOrders } from '../../../apis/user/dining_tables'
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
  const [showAlert, setShowalert] = useState(false)
  const [showCurrentorders, setShowcurrentorders] = useState({ show: false, orders: [] })
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
              setShowcurrentorders({ ...showCurrentorders, show: false, orders: JSON.parse(ordersStr) })
            }
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data


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
          let { cost, name, price, productImage, sizes, quantities, percents, extras, quantity } = res.productInfo
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
            sizes, quantities, percents, extras, price, quantity
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
        newCost += showProductinfo.quantity * parseFloat(newOptions[index].price)

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
        newCost += showProductinfo.quantity * parseFloat(newOptions[index].price)

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
        newCost += showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, percents: newOptions, cost: newCost, errorMsg: "" })

        break;
      case "extra":
        newOptions = [...showProductinfo.extras]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost += showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, extras: newOptions, cost: newCost, errorMsg: "" })


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
      showProductinfo.sizes.forEach(function (size) {
        if (size.selected) {
          newCost += newQuantity * parseFloat(size.price)
        }
      })

      showProductinfo.quantities.forEach(function (quantity) {
        if (quantity.selected) {
          newCost += newQuantity * parseFloat(quantity.price)
        }
      })

      showProductinfo.percents.forEach(function (percent) {
        if (percent.selected) {
          newCost += newQuantity * parseFloat(percent.price)
        }
      })

      showProductinfo.extras.forEach(function (extra) {
        if (extra.selected) {
          newCost += newQuantity * parseFloat(extra.price)
        }
      })
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
  const viewTheNumTableOrders = () => {
    const tableId = localStorage.getItem("tableId")

    viewNumTableOrders(tableId)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setNumtableorders(res.numOrders)
        }
      })
  }
  const addToOrders = () => {
    setShowproductinfo({ ...showProductinfo, loading: true })

    let { id, name, cost, price, sizes, quantities, percents, extras, image, quantity, note } = showProductinfo
    const newOrders = [...showCurrentorders.orders]
    let sizeRequired = sizes.length > 0, quantityRequired = quantities.length > 0, sizeSelected = "", quantitySelected = ""
    let orderKey = ""

    let newCost = 0

    if (price) {
      newCost = parseFloat(price) * quantity
    } else {
      sizes.forEach(function (info) {
        if (info.selected) {
          newCost += parseFloat(info.price) * quantity
          sizeSelected = info.name
        }
      })

      quantities.forEach(function (info) {
        if (info.selected) {
          newCost += parseFloat(info.price) * quantity
          quantitySelected = info.input
        }
      })
    }

    percents.forEach(function (info) {
      if (info.selected) {
        newCost += parseFloat(info.price) * quantity
      }
    })

    extras.forEach(function (info) {
      if (info.selected) {
        newCost += parseFloat(info.price) * quantity
      }
    })

    if (price || ((sizeRequired && sizeSelected) || (quantityRequired && quantitySelected))) {
      newCost = newCost.toFixed(2)

      if (newCost.toString().split(".")[1].length < 2) {
        newCost = newCost + "0"
      }

      while (orderKey == "" || JSON.stringify(newOrders).includes(orderKey)) {
        orderKey = getId()
      }

      newOrders.unshift({
        key: orderKey,
        productId: id,
        name, price, sizes, quantities, percents, extras, 
        image, quantity, note,
        cost: newCost
      })

      localStorage.setItem("orders", JSON.stringify(newOrders))

      setShowcurrentorders({ ...showCurrentorders, orders: newOrders })
      setShowproductinfo({ ...showProductinfo, show: false, id: -1, loading: false })
    } else {
      setShowproductinfo({ ...showProductinfo, errorMsg: "Please select a " + (sizeRequired ? "size" : "quantity") })
    }
  }
  const sendOrders = () => {
    const tableId = localStorage.getItem("tableId")
    const newOrders = [...showCurrentorders.orders]
    let sizes = [], quantities = [], percents = [], extras = []

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

      order.extras.forEach(function (info) {
        if (info.selected) {
          extras.push(info.input)
        }
      })

      order.sizes = sizes
      order.quantities = quantities
      order.percents = percents
      order.extras = extras

      sizes = []
      quantities = []
      percents = []
      extras = []
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
            setShowcurrentorders({ ...showCurrentorders, show: false, orders: [] })
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
    const newOrders = [...showCurrentorders.orders]

    newOrders.splice(index, 1)

    localStorage.setItem("orders", JSON.stringify(newOrders))

    setShowcurrentorders({ 
      ...showCurrentorders, 
      show: newOrders.length > 0,
      orders: newOrders 
    })
  }
  
  useEffect(() => {
    getTheTable()
  }, [])

  const { sizes, quantities, percents, extras } = showProductinfo

  return (
    <div id="diningtable">
      {loaded && ( 
        <>
          <div id="hover-box">
            <div className="row" style={{ width: '100%' }}>
              {showCurrentorders.orders.length > 0 && (
                <div className="hover-header" onClick={() => setShowcurrentorders({ ...showCurrentorders, show: true })}>
                  <div style={{ fontWeight: 'bold' }}>{showCurrentorders.orders.length}</div><div style={{ fontWeight: 'bold' }}>Change Orders/<br/>Send to Kitchen</div>
                </div>
              )}
                
              <div className="hover-header" style={{ pointerEvents: numTableorders > 0 ? '' : 'none' }} onClick={() => viewTheTableOrders()}>
                <div style={{ fontWeight: 'bold' }}>{numTableorders}</div>Ordered
              </div>
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

          {(showProductinfo.show || showAlert || showCurrentorders.show || showTableorders.show) && (
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
                      <div className="options">
                        {sizes.length > 0 && (
                          sizes.length == 1 ? 
                            <>
                              <div className="options-header">(1 size only)</div>
                              <div className="option">
                                <div className="option-price">{sizes[0].name + ": $" + sizes[0].price}</div>
                              </div>
                            </>
                            :
                            <>
                              <div className="options-header">Select a size</div>
                              {sizes.map((size, index) => (
                                <div key={size.key} className="option">
                                  <div className={size.selected ? "option-touch-disabled" : "option-touch"} onClick={() => selectOption(index, "size")}>{size.name}</div>
                                  <div className="column"><div className="option-price">$ {size.price}</div></div>
                                </div>
                              ))}
                            </>
                        )}

                        {quantities.length > 0 && (
                          quantities.length == 1 ? 
                            <>
                              <div className="options-header">(1 quantity only)</div>
                              <div className="option">
                                <div className="option-price">{quantities[0].input + ": $" + quantities[0].price}</div>
                              </div>
                            </>
                            :
                            <>
                              <div className="options-header">Select a quantity</div>
                              {quantities.map((quantity, index) => (
                                <div key={quantity.key} className="option">
                                  <div className={quantity.selected ? "option-touch-disabled" : "option-touch"} onClick={() => selectOption(index, "quantity")}>{quantity.input}</div>
                                  <div className="column"><div className="option-price">$ {quantity.price}</div></div>
                                </div>
                              ))}
                            </>
                        )}

                        {percents.length > 0 && (
                          percents.length == 1 ? 
                            <>
                              <div className="options-header">(1 percent option only)</div>
                              <div className="option">
                                <div className="option-price">{percents[0].input + ": $" + percents[0].price}</div>
                              </div>
                            </>
                            :
                            <>
                              <div className="options-header">Select a percent option</div>
                              {percents.map((percent, index) => (
                                <div key={percent.key} className="option">
                                  <div className={percent.selected ? "option-touch-disabled" : "option-touch"} onClck={() => selectOption(index, "percent")}>{percent.input}</div>
                                  <div className="column"><div className="option-price">$ {percent.price}</div></div>
                                </div>
                              ))}
                            </>
                        )}

                        {extras.length > 0 && (
                          extras.length == 1 ? 
                            <>
                              <div className="options-header">(1 extra option only)</div>
                              <div className="option">
                                <div className="option-price">{extras[0].input + ": $" + extras[0].price}</div>
                              </div>
                            </>
                            :
                            <>
                              <div className="options-header">Select an extra</div>
                              {extras.map((extra, index) => (
                                <div key={extra.key} className="option">
                                  <div className={extra.selected ? "option-touch-disabled" : "option-touch"} onClick={() => selectOption(index, "extra")}>{extra.input}</div>
                                  <div className="column"><div className="option-price">$ {extra.price}</div></div>
                                </div>
                              ))}
                            </>
                        )}
                      </div>
                    </div>

                    <div id="quantity-row">
                      <div id="quantity">
                        <div className="column"><div className="quantity-header">Quantity:</div></div>
                        <div className="column"><div className="quantity-action" onClick={() => changeQuantity("-")}>-</div></div>
                        <div className="column"><div className="quantity-header">{showProductinfo.quantity}</div></div>
                        <div className="column"><div className="quantity-action" onClick={() => changeQuantity("+")}>+</div></div>
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
              {showCurrentorders.show && (
                <div id="show-orders-box">
                  <div id="show-orders-close" onClick={() => setShowcurrentorders({ ...showCurrentorders, show: false })}><FontAwesomeIcon icon={faTimesCircle} size="2x"/></div>
                  <div id="show-orders-header">{showCurrentorders.orders.length} Order(s)</div>

                  <div id="show-orders-send" onClick={() => sendOrders()}>Send to<br/>Kitchen</div>

                  <div id="show-orders-list">
                    {showCurrentorders.orders.map((order, index) => (
                      <div key={order.key} className="order">
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
                              {order.sizes.map(info => info.selected ? <div key={info.key}>{info.name}: ${info.price} ({order.quantity})</div> : <div key={info.key}></div>)}
                              {order.quantities.map(info => info.selected ? <div key={info.key}>{info.input}: ${info.price} ({order.quantity})</div> : <div key={info.key}></div>)}
                            </>
                          }
                              
                          {order.percents.map(info => info.selected ? <div key={info.key}>{info.input}: ${info.price}</div> : <div key={info.key}></div>)}
                          {order.extras.map(info => info.selected ? <div key={info.key}>Extra: {info.input}: ${info.price}</div> : <div key={info.key}></div>)}

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
                      <div key={order.key} className="order">
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
                              {order.sizes.map(info => <div key={info.key}>{info.name}: ${info.price}</div>)}
                              {order.quantities.map(info => <div key={info.key}>{info.input}: ${info.price}</div>)}
                            </>
                          }
                              
                          {order.percents.map(info => <div key={info.key}>{info.input}: ${info.price}</div>)}
                          {order.extras.map(info => <div key={info.key}>{info.input}: ${info.price}</div>)}

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
