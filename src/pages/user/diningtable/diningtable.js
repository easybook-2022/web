import './diningtable.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { getQrCode, orderMeal, viewCustomerOrders } from '../../../apis/user/dining_tables'
import { getProductInfo } from '../../../apis/user/products'
import { getId } from 'geottuse-tools'

import Menus from '../../../widgets/user/menus'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Diningtable(props) {
  const { tableid } = useParams()

  const [locationId, setLocationid] = useState('')
  const [locationName, setLocationname] = useState('')
  const [name, setName] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [refetchMenu, setRefetchmenu] = useState(0)
  const [showProductinfo, setShowproductinfo] = useState({ 
    show: false, 
    id: -1, name: '', note: '', image: '', sizes: [], quantities: [], percents: [], price: 0, 
    quantity: 0, cost: 0, 
    errorMsg: ""
  })
  const [showAlert, setShowalert] = useState(false)
  const [showOrders, setShoworders] = useState({ show: false, orders: [] })

  const getTheTable = () => {
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
          setLoaded(true)

          localStorage.setItem("tableId", tableid)
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
  const viewTheCustomerOrders = () => {
    const tableId = localStorage.getItem("tableId")

    viewCustomerOrders(tableId)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShoworders({ ...showOrders, show: true, orders: res.orders })
        }
      })
  }
  const addToOrders = () => {

  }
  const sendOrders = () => {
    const { id, cost, price, sizes, quantities, percents, image, quantity, note } = showProductinfo
    const newSizes = [], newQuantities = [], newPercents = []

    sizes.forEach(function (info) {
      if (info.selected) {
        newSizes.push(info.name)
      }
    })
    quantities.forEach(function (info) {
      if (info.selected) {
        newQuantities.push(info.input)
      }
    })
    percents.forEach(function (info) {
      if (info.selected) {
        newPercents.push(info.input)
      }
    })

    if (cost > 0 || (newSizes.length > 0 || newQuantities.length > 0)) {
      let data = { key: getId(), tableid, id, sizes: newSizes, quantities: newQuantities, percents: newPercents, image, quantity, note: note ? note : note }

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
              setShowproductinfo({ ...showProductinfo, show: false, id: -1 })
              setShowalert(true)

              setTimeout(function () {
                setShowalert(false)
              }, 1000)
            })
          }
        })
    } else {
      if (!price) {
        setShowproductinfo({ ...showProductinfo, errorMsg: "Please select a size" })
      }
    }
  }
  
  useEffect(() => {
    getTheTable()
  }, [])

  const { sizes, quantities, percents } = showProductinfo

  return (
    <div id="diningtable">
      {loaded && ( 
        <>
          <div id="box">
            <div id="header">
              <div style={{ fontSize: wsize(5) }}>Welcome to {locationName}</div>
              <div style={{ fontSize: wsize(6), margin: '20px 0' }}>You are Table #{name}</div>
              Please order your food below
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

          {/*<div id="hover-box">
            <div className="column"><div className="hover-header" onClick={() => viewTheCustomerOrders()}>{1} Orders</div></div>
          </div>*/}

          {(showProductinfo.show || showAlert) && (
            <div id="hidden-box">
              {showProductinfo.show && (
                <div id="product-info-box">
                  <div id="product-info-container">
                    <div id="product-info-close" onClick={() => setShowproductinfo({ ...showProductinfo, show: false })}><FontAwesomeIcon icon={faTimesCircle} size="2x"/></div>

                    {showProductinfo.image.name && (
                      <div id="image-holder">
                        <img src={logo_url + showProductinfo.image.name} id="image"/>
                      </div>
                    )}
                    <div id="product-info-header">{showProductinfo.name}</div>

                    <div className="options-box">
                      {(sizes.length > 0 || quantities.length) > 0 && (
                        sizes.length > 0 ? 
                          <div className="options-header">{sizes.length == 1 ? "(1 size only)" : "Select a size"}</div>
                          :
                          <div className="options-header">{quantities.length == 1 ? "(1 quantity only)" : "Select a quantity"}</div>
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
                      <div className="item-action" onClick={() => sendOrders()}>Send to<br/>Kitchen</div>
                    </div>
                  </div>
                </div>
              )}

              {showAlert && (
                <div id="alert-box">
                  <div id="alert-header">
                    Your order has been sent{'\n'}to the kitchen
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
