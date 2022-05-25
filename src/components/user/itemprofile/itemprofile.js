import './itemprofile.scss';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faShoppingBasket, faHome } from '@fortawesome/fontawesome-free-solid'
import { socket, logo_url } from '../../../userInfo'
import { getProductInfo } from '../../../apis/user/products'
import { getNumCartItems, addItemtocart } from '../../../apis/user/carts'

// components
import Orders from '../../../components/user/orders'

// widgets
import Userauth from '../../../widgets/user/userauth'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Itemprofile(props) {
  const { locationid, productid, productinfo, type } = useParams()

  const [itemName, setItemname] = useState('')
  const [itemNote, setItemnote] = useState('')
  const [itemImage, setItemimage] = useState('')
  const [itemPrice, setItemprice] = useState(0)
  const [options, setOptions] = useState([])
  const [others, setOthers] = useState([])
  const [sizes, setSizes] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [cost, setCost] = useState(0)
  const [errorMsg, setErrormsg] = useState('')
  const [showNotifyUser, setShownotifyuser] = useState({ show: false, userid: 0, username: "" })
  const [showAuth, setShowauth] = useState({ show: false, addcart: false })
  const [userId, setUserid] = useState(null)

  const [orderingItem, setOrderingitem] = useState({ name: "", image: "", options: [], others: [], sizes: [], quantity: 0, cost: 0 })

  const [openOrders, setOpenorders] = useState(false)
  const [numCartItems, setNumcartitems] = useState(2)

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
  const changeAmount = (index, action) => {
    let newOptions = [...options]
    let { selected } = newOptions[index]

    selected = action === "+" ? selected + 1 : selected - 1

    if (selected >= 0) {
      newOptions[index].selected = selected

      setOptions(newOptions)
    }
  }
  const changePercentage = (index, action) => {
    let newOptions = [...options]
    let { selected } = newOptions[index]

    selected = action === "+" ? selected + 10 : selected - 10

    if (selected >= 0 && selected <= 100) {
      newOptions[index].selected = selected

      setOptions(newOptions)
    }
  }
  const selectSize = (index) => {
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

    setSizes(newSizes)
    setCost(newCost)
  }
  const selectOther = (index) => {
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

    setOthers(newOthers)
    setCost(newCost)
  }
  const changeQuantity = (action) => {
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
      newCost += newQuantity * parseFloat(itemPrice)
    }

    others.forEach(function (other) {
      if (other.selected) {
        newCost += parseFloat(other.price)
      }
    })

    setQuantity(newQuantity)
    setCost(newCost)
  }
  const addCart = async(id) => {
    if (userId || id) {
      setShowauth({ ...showAuth, show: false })
      
      let callfor = [], receiver = []
      let newOptions = JSON.parse(JSON.stringify(options))
      let newOthers = JSON.parse(JSON.stringify(others))
      let newSizes = JSON.parse(JSON.stringify(sizes))
      let size = "", price = 0

      if (productinfo === 'null') {
        if (newSizes.length > 0) {
          newSizes.forEach(function (info) {
            delete info['key']

            if (info.selected) {
              price = parseFloat(info.price) * quantity
            }
          })
        } else {
          price = itemPrice * quantity
        }

        newOptions.forEach(function (option) {
          delete option['key']
        })

        newOthers.forEach(function (other) {
          delete other['key']
        })
      }

      if (price || productinfo) {
        const data = { 
          userid: userId || id, locationid, 
          productid: productid !== 'null' ? productid : -1, 
          productinfo: productinfo !== 'null' ? productinfo : "", 
          quantity, 
          callfor, 
          options: newOptions, others: newOthers, sizes: newSizes, 
          note: itemNote, type,
          receiver 
        }

        addItemtocart(data)
          .then((res) => {
            if (res.status === 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              socket.emit("socket/addItemtocart", data, () => showOrders())
            }
          })
          .catch((err) => {
            if (err.response && err.response.status === 400) {
              const { errormsg, status } = err.response.data
            }
          })
      } else {
        setErrormsg("Please choose a size")
      }
    } else {
      setShowauth({ ...showAuth, show: true, addcart: true })
    }
  }
  const showOrders = () => {
    setOpenorders(true)
    setNumcartitems(numCartItems + 1)
  }
  const getTheProductInfo = async() => {
    getProductInfo(productid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { image, name, options, others, sizes, price } = res.productInfo

          setItemname(name)
          setItemimage(image)
          setItemprice(price)
          setOptions(options)
          setOthers(others)
          setSizes(sizes)
          setCost(quantity * price)
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

    if (productid !== 'null') getTheProductInfo()
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <div id="itemprofile">
      <div id="box">
        {itemImage ? 
          <div id="image-holder">
            <img src={logo_url + itemImage.name} id="image"/>
          </div>
        : null }
        <div id="box-header">{itemName ? itemName : productinfo}</div>

        {options.map((option, index) => (
          <div key={option.key} style={{ alignItems: 'center' }}>
            <div className="info">
              <div className="info-header">{option.header}:</div>

              {option.type === "amount" && (
                <div style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <div className="amount">
                    <div className="amount-action" onClick={() => changeAmount(index, "-")}>-</div>
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

        {others.length > 0 && (
          <div id="others-box">
            <div id="others-header">Other options</div>

            <div id="others">
              {others.map((other, index) => (
                <div key={other.key} style={{ alignItems: 'center' }}>
                  <div className="other">
                    <div style={{ flexDirection: 'row' }}>
                      <div className="other-name"># {other.name}:</div>
                      <div className="other-input">{other.input}</div>
                    </div>
                    <div style={{ flexDirection: 'row', marginTop: 10 }}>
                      <div className="other-price">$ {other.price}</div>

                      <div id="other-actions">
                        <div className={other.selected ? "other-action-left-disabled" : "other-action-left"} onClick={() => selectOther(index)}>Yes</div>
                        <div className={other.selected ? "other-action-right-disabled" : "other-action-right"} onClick={() => selectOther(index)}>No</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {sizes.length > 0 && (
          <div id="sizes-box">
            <div id="sizes-header">Select a Size</div>

            <div id="sizes">
              {sizes.map((size, index) => (
                <div key={size.key} className="size">
                  <div className={size.selected ? "size-touch-disabled" : "size-touch"} onClick={() => selectSize(index)}>{size.name}</div>
                  <div className="size-price">$ {size.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productinfo === 'null' ? 
          <div id="note">
            <div id="note-input-container">
              <textarea
                id="note-input" 
                placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder="Leave a note if you want" 
                maxLength={100} onChange={e => setItemnote(e.target.value)}
              />
            </div>
          </div>
          :
          <div id="note">
            <div id="note-header">Add some instruction if you want ?</div>

            <div id="note-input-container">
              <textarea
                id="note-input" 
                placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder={"example: " + (type == "store" ? "make it medium size" : "add 2 cream and 1 sugar")}
                maxLength={100} onChange={e => setItemnote(e.target.value)}
              />
            </div>
          </div>
        }

        <div id="quantity-row">
          <div id="quantity">
            <div className="column">
              <div className="quantity-header">Quantity:</div>
            </div>
            <div className="column">
              <div className="quantity-action" onClick={() => changeQuantity("-")}>-</div>
            </div>
            <div className="column">
              <div className="quantity-header">{quantity}</div>
            </div>
            <div className="column">
              <div className="quantity-action" onClick={() => changeQuantity("+")}>+</div>
            </div>
          </div>
        </div>

        {productinfo === 'null' ? <div id="price">Cost: $ {cost.toFixed(2)}</div> : null}

        {errorMsg ? <div className="errormsg">{errorMsg}</div> : null}

        <div id="item-actions">
          <div className="item-action" onClick={() => addCart()}>Order item</div>
        </div>
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
                setShowauth({ ...showAuth, show: true })
              }
            }}>
              {userId ? 'Log-Out' : 'Log-In'}
            </div>
          </div>
        </div>
      </div>

      {openOrders && <div id="hidden-box"><Orders close={() => {
        setOpenorders(false)
        window.location = "/restaurantprofile/" + locationid
      }}/></div>}
      {showAuth.show && (
        <div id="hidden-box">
          <Userauth close={() => setShowauth({ ...showAuth, show: false })} done={id => {
            socket.emit("socket/user/login", "user" + id, () => {
              setUserid(id)

              if (showAuth.addcart === true) {
                addCart(id)
              }
            })
          }}/>
        </div>
      )}
    </div>
  )
}
