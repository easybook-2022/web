import './diningtable.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { getTable, orderMeal } from '../../../apis/user/dining_tables'
import { getProductInfo } from '../../../apis/user/products'
import { getId } from 'geottuse-tools'

import Menus from '../../../widgets/user/menus'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Diningtable(props) {
  const { tableid } = useParams()

  const [locationId, setLocationid] = useState('')
  const [name, setName] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [refetchMenu, setRefetchmenu] = useState(0)
  const [showProductinfo, setShowproductinfo] = useState({ 
    show: false, 
    id: -1, name: '', note: '', image: '', sizes: [], price: 0, 
    quantity: 0, cost: 0, 
    errorMsg: ""
  })
  const [showAlert, setShowalert] = useState(false)

  const getTheTable = () => {
    getTable(tableid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setName(res.name)
          setLocationid(res.locationid)
          setLoaded(true)
        }
      })
  }
  const orderItem = id => {
    getProductInfo(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          let { cost, name, price, productImage, sizes, quantity } = res.productInfo

          setShowproductinfo({
            ...showProductinfo,
            show: true, id, cost, name, image: productImage, 
            sizes, price, quantity
          })
        }
      })
  }
  const selectSize = (index) => {
    let newSizes = [...showProductinfo.sizes]
    let newCost = showProductinfo.cost

    newSizes.forEach(function (size) {
      if (size.selected) {
        size.selected = false

        newCost -= parseFloat(size.price)
      }
    })

    newSizes[index].selected = true
    newCost = showProductinfo.quantity * parseFloat(newSizes[index].price)

    setShowproductinfo({ ...showProductinfo, sizes: newSizes, cost: newCost })
  }
  const changeQuantity = (action) => {
    let newQuantity = showProductinfo.quantity
    let newCost = 0

    newQuantity = action === "+" ? newQuantity + 1 : newQuantity - 1

    if (newQuantity < 1) {
      newQuantity = 1
    }

    if (showProductinfo.sizes.length > 0) {
      showProductinfo.sizes.forEach(function (size) {
        if (size.selected) {
          newCost += newQuantity * parseFloat(size.price)
        }
      })
    } else {
      newCost += newQuantity * parseFloat(showProductinfo.price)
    }

    setShowproductinfo({ ...showProductinfo, quantity: newQuantity, cost: newCost })
  }
  const orderNow = () => {
    const { id, sizes, image, quantity } = showProductinfo
    let data = { key: getId(), tableid, id, sizes, image, quantity }

    orderMeal(data)
      .then((res) => {
        if (res.status == 200) {
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
  }
  
  useEffect(() => {
    getTheTable()
  }, [])

  return (
    <div id="diningtable">
      {loaded ? 
        <>
          <div id="box">
            <div id="header">
              Table #{name}
              <br/>
              Order your meals below
            </div>

            <div id="body">
              <Menus
                locationid={locationId}
                refetchMenu={refetchMenu}
                type="restaurant"
                tableOrder={true}
                orderItem={orderItem}
              />
            </div>
          </div>

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
                    <div id="box-header">{showProductinfo.name}</div>
                    
                    {showProductinfo.sizes.length > 0 && (
                      <div id="sizes-box">
                        <div id="sizes-header">Select a Size</div>

                        <div id="sizes">
                          {showProductinfo.sizes.map((size, index) => (
                            <div key={size.key} className="size">
                              <div className={size.selected ? "size-touch-disabled" : "size-touch"} onClick={() => selectSize(index)}>{size.name}</div>
                              <div className="size-price">$ {size.price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div id="note">
                      <div id="note-header">Add some instruction if you want ?</div>

                      <div id="note-input-container">
                        <textarea
                          id="note-input" 
                          placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder={"example: add 2 cream and 1 sugar"}
                          maxLength={100} onChange={e => setShowproductinfo({ ...showProductinfo, note: e.target.value })}
                        />
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

                    {showProductinfo.errorMsg ? <div className="errormsg">{showProductinfo.errorMsg}</div> : null}

                    <div id="item-actions">
                      <div className="item-action" onClick={() => orderNow()}>Order item</div>
                    </div>
                  </div>
                </div>
              )}

              {showAlert && (
                <div id="alert-box">
                  <div id="alert-header">Your order has been sent</div>
                </div>
              )}
            </div>
          )}
        </>
      : null }
    </div>
  )
}
