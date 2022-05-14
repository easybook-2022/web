import './addproduct.scss';
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import Webcam from "react-webcam";
import { useParams } from 'react-router-dom';
import { logo_url } from '../../../businessInfo'
import { resizePhoto } from 'geottuse-tools'
import { getProductInfo, addNewProduct, updateProduct } from '../../../apis/business/products'

// components
import Loadingprogress from '../../../components/loadingprogress';

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return window.innerWidth * (p / 100)}
const steps = ['name', 'photo', 'options', 'others', 'sizes']

export default function Addproduct() {
  const params = useParams()
  const { parentMenuid, productid } = params
  
  const [setupType, setSetuptype] = useState('name')
  const [cameraPermission, setCamerapermission] = useState(null);
  const [pickingPermission, setPickingpermission] = useState(null);
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)

  const [name, setName] = useState('')
  const [image, setImage] = useState({ uri: '', name: '', size: { height: 0, width: 0 }, loading: false })
  const [options, setOptions] = useState([])
  const [others, setOthers] = useState([])
  const [sizes, setSizes] = useState([])
  const [price, setPrice] = useState('')
  const [loaded, setLoaded] = useState(productid !== "null" ? false : true)
  const [loading, setLoading] = useState(false)

  const [errorMsg, setErrormsg] = useState('')

  const addTheNewProduct = () => {
    const locationid = localStorage.getItem("locationid")
    const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }

    setErrormsg("")

    for (let k = 0; k < options.length; k++) {
      if (!options[k].text) {
        setErrormsg("One of the options has empty values")

        return
      }

      if (!options[k].option) {
        setErrormsg("One of the options has empty values")

        return
      }
    }

    for (let k = 0; k < others.length; k++) {
      if (!others[k].name) {
        setErrormsg("One of the others has empty values")

        return
      }

      if (!others[k].price) {
        setErrormsg("One of the others has empty prices")

        return
      }
    }

    for (let k = 0; k < sizes.length; k++) {
      if (!sizes[k].name) {
        setErrormsg("One of the size is not selected")

        return
      }

      if (!sizes[k].price) {
        setErrormsg("One of the size's price is not provided")

        return
      } else if (isNaN(sizes[k].price)) {
        setErrormsg("One of the size's price is invalid")

        return
      }

      if (!sizenames[sizes[k].name]) {
        sizenames[sizes[k].name] = true
      } else {
        setErrormsg("There are two or more similar sizes")

        return
      }
    }

    if (name && (sizes.length > 0 || (price && !isNaN(price)))) {
      options.forEach(function (option) {
        delete option['key']
      })

      others.forEach(function (other) {
        delete other['key']
      })

      sizes.forEach(function (size) {
        delete size['key']
      })

      const data = { locationid, menuid: parentMenuid !== "null" ? parentMenuid : "", name, image, options, others, sizes, price: sizes.length > 0 ? "" : price }

      setLoading(true)

      addNewProduct(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            window.location = "/menu"
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data

            setErrormsg(errormsg)
            setLoading(false)
          }
        })
    } else {
      if (!name) {
        setErrormsg("Please enter the product name")

        return
      }

      if (sizes.length === 0 && !price) {
        setErrormsg("Please enter the price of the product")

        return
      } else if (isNaN(price)) {
        setErrormsg("The price you entered is invalid")

        return
      }
    }
  }
  const updateTheProduct = () => {
    const locationid = localStorage.getItem("locationid")
    const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }

    setErrormsg("")

    for (let k = 0; k < options.length; k++) {
      if (!options[k].text) {
        setErrormsg("One of the options has empty values")

        return
      }

      if (!options[k].option) {
        setErrormsg("One of the options has empty values")

        return
      }
    }

    for (let k = 0; k < others.length; k++) {
      if (!others[k].name) {
        setErrormsg("One of the options has empty values")

        return
      }

      if (!others[k].price) {
        setErrormsg("One of the options has empty prices")

        return
      }
    }

    for (let k = 0; k < sizes.length; k++) {
      if (!sizes[k].name) {
        setErrormsg("One of the size is not named")

        return
      }

      if (!sizes[k].price) {
        setErrormsg("One of the size's price is not provided")

        return
      } else if (isNaN(sizes[k].price)) {
        setErrormsg("One of the size's price is invalid")

        return
      }

      if (!sizenames[sizes[k].name]) {
        sizenames[sizes[k].name] = true
      } else {
        setErrormsg("There are two or more similar sizes")

        return
      }
    }

    if (name && (sizes.length > 0 || (price && !isNaN(price)))) {
      options.forEach(function (option) {
        delete option['key']
      })

      others.forEach(function (other) {
        delete other['key']
      })

      sizes.forEach(function (size) {
        delete size['key']
      })

      const data = { locationid, menuid: parentMenuid !== "null" ? parentMenuid : "", productid, name, image, options, others, sizes, price: sizes.length > 0 ? "" : price }

      setLoading(true)

      updateProduct(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            window.location = "/menu"
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data

            setErrormsg(errormsg)
            setLoading(false)
          }
        })
    } else {
      if (!name) {
        setErrormsg("Please enter the product name")

        return
      }

      if (sizes.length === 0 && !price) {
        setErrormsg("Please enter the price of the product")

        return
      } else if (isNaN(price)) {
        setErrormsg("The price you entered is invalid")

        return
      }
    }
  }
  const saveInfo = () => {
    const index = steps.indexOf(setupType)
    let msg = ""

    setLoading(true)

    switch (index) {
      case 0:
        if (!name) {
          msg = "Please provide a name for the product"
        }

        break
      default:

    }

    if (msg === "") {
      const nextStep = index === 4 ? "done" : steps[index + 1]

      setSetuptype(nextStep)
      setErrormsg('')
    } else {
      setErrormsg(msg)
    }

    setLoading(false)
  }
  const snapPhoto = () => {
    setImage({ ...image, loading: true })

    let letters = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
      "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ]
    let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
    let char = ""

    if (camComp) {
      let photo = camComp.getScreenshot({ width: 640, height: 480 });

      for (let k = 0; k <= photo_name_length - 1; k++) {
        char += "" + (
          k % 2 === 0 ? 
            letters[Math.floor(Math.random() * letters.length)].toUpperCase() 
            : 
            Math.floor(Math.random() * 9) + 0
          )
      }

      setImage({ ...image, uri: photo, name: `${char}.jpg`, size: { width: 640, height: 480 }, loading: false })
      setErrormsg('')
    }
  }
  const choosePhoto = e => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader()
      let letters = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
        "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
      ]
      let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
      let char = ""

      for (let k = 0; k <= photo_name_length - 1; k++) {
        char += "" + (
          k % 2 === 0 ? 
            letters[Math.floor(Math.random() * letters.length)].toUpperCase()
            :
            Math.floor(Math.random() * 9) + 0
        )
      }

      reader.onload = e => {
        let imageReader = new Image()
        let size = {}

        imageReader.onload = () => {
          size['height'] = imageReader.height
          size['width'] = imageReader.width

          setImage({ ...image, uri: e.target.result, name: `${char}.jpg`, size })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }
  const getTheProductInfo = () => {
    getProductInfo(productid !== "null" ? productid : -1)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { image, name, options, others, sizes, price } = res.productInfo
          const newOptions = [], newOthers = [], newSizes = []

          setName(name)

          if (image.name) setImage({ ...image, uri: logo_url + image.name, size: { width: image.width, height: image.height }})
          
          setPrice(price)

          options.forEach(function (option, index) {
            newOptions.push({
              key: "option-" + index.toString(),
              text: option.header,
              option: option.type
            })
          })

          others.forEach(function (other, index) {
            newOthers.push({
              key: "other-" + index.toString(),
              name: other.name,
              input: other.input,
              price: other.price
            })
          })

          sizes.forEach(function (size, index) {
            newSizes.push({
              key: "size-" + index.toString(),
              name: size.name,
              price: size.price
            })
          })

          setOptions(newOptions)
          setOthers(newOthers)
          setSizes(newSizes)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  useEffect(() => {
    if (productid !== "null") getTheProductInfo()
  }, [])

  return (
    <div id="addproduct" style={{ opacity: loading ? 0.5 : 1 }}>
      {loaded ? 
        <div id="box">
          {setupType === "name" && (
            <div id="input-container">
              <div id="add-header">What is this product call</div>

              <input 
                id="add-input" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="example: Iced coffee" 
                onChange={(e) => setName(e.target.value)} value={name}
              />
            </div>
          )}

          {setupType === "photo" && (
            <div id="camera-container">
              <div id="camera-header">Provide a photo for {name} (Optional)</div>

              {image.uri ? (
                <>
                  <div id="camera">
                    <img alt="" style={resizePhoto(image, width * 0.3)} src={image.uri}/>
                  </div>

                  <div id="camera-actions">
                    <div className="camera-action" onClick={() => setImage({ ...image, uri: '', name: '' })}>Cancel</div>
                  </div>
                </>
              ) : (
                <>
                  <div id="camera">
                    <Webcam
                      audio={false}
                      ref={r => { setCamcomp(r) }}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                      width={'100%'}
                    />
                  </div>

                  <div id="camera-actions">
                    <div className="camera-action" style={{ opacity: image.loading ? 0.5 : 1 }} disabled={image.loading} onClick={snapPhoto.bind(this)}>Take{'\n'}this photo</div>
                    <div className="camera-action" style={{ opacity: image.loading ? 0.5 : 1 }} disabled={image.loading} onClick={() => fileComp.click()}>Choose{'\n'}from phone</div>

                    <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                  </div>
                </>
              )}  
            </div>
          )}

          {setupType === "options" && (
            <>
              <div style={{ height: '50%', padding: '20px 0', width: '100%' }}>
                <div style={{ margin: '0 auto', width: '100%' }}>
                  <div className="add-option" onClick={() => {
                    let new_key

                    if (options.length > 0) {
                      let last_option = options[options.length - 1]

                      new_key = parseInt(last_option.key.split("-")[1]) + 1
                    } else {
                      new_key = 0
                    }

                    setOptions([...options, { key: "option-" + new_key.toString(), text: '', option: '' }])
                  }}>Add % or amount option</div>

                  <div className="options">
                    {options.map((option, index) => (
                      <div key={option.key} className="option">
                        <div className="column">
                          <div className="option-remove" onClick={() => {
                            let newOptions = [...options]

                            newOptions.splice(index, 1)

                            setOptions(newOptions)
                          }}>
                            <FontAwesomeIcon icon={faTimesCircle} size="4x"/>
                          </div>
                        </div>
                        <div className="column">
                          <input className="option-input" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="eg. Sugar" value={option.text} onChange={(e) => {
                            let newOptions = [...options]

                            newOptions[index].text = e.target.value

                            setOptions(newOptions)
                          }}/>
                        </div>
                        <div className="option-types-box">
                          <div className="option-types-header">Select type</div>
                          <div className="option-types">
                            <div className={option.option === 'percentage' ? "option-type-selected" : "option-type"} onClick={() => {
                              let newOptions = [...options]

                              newOptions[index].option = 'percentage'

                              setOptions(newOptions)
                            }}>%</div>
                            <div className={option.option === 'amount' ? "option-type-selected" : "option-type"} onClick={() => {
                              let newOptions = [...options]
                              
                              newOptions[index].option = 'amount'

                              setOptions(newOptions)
                            }}>#</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {setupType === "others" && (
            <>
              <div style={{ height: '50%', padding: '20px 0', width: '100%' }}>
                <div style={{ margin: '0 auto', width: '100%' }}>
                  <div className="add-option" onClick={() => {
                    let new_key

                    if (others.length > 0) {
                      let last_other = others[others.length - 1]

                      new_key = parseInt(last_other.key.split("-")[1]) + 1
                    } else {
                      new_key = 0
                    }

                    setOthers([...others, { key: "other-" + new_key.toString(), name: '', price: "0.00" }])
                  }}>Add Specific Option</div>

                  <div className="options">
                    {others.map((other, index) => (
                      <div key={other.key} className="other">
                        <div className="column">
                          <div className="other-remove" onClick={() => {
                            let newOthers = [...others]

                            newOthers.splice(index, 1)

                            setOthers(newOthers)
                          }}>
                            <FontAwesomeIcon icon={faTimesCircle} size="4x"/>
                          </div>
                        </div>
                        <div className="column">
                          <input className="other-input" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Tapioca" value={other.name.toString()} onChange={(e) => {
                            let newOthers = [...others]

                            newOthers[index].name = e.target.value.toString()

                            setOthers(newOthers)
                          }}/>
                        </div>
                        <div className="column">
                          <input className="other-price" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="eg. 0.50" value={other.price.toString()} onChange={(e) => {
                            let newOthers = [...others]

                            newOthers[index].price = e.target.value.toString()

                            setOthers(newOthers)
                          }} type="number"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {setupType === "sizes" && (
            sizes.length > 0 ?
              <div style={{ height: '50%', padding: '20px 0', width: '100%' }}>
                <div style={{ margin: '0 auto', width: '100%' }}>
                  <div className="add-option" onClick={() => {
                    let new_key

                    if (sizes.length > 0) {
                      let last_size = sizes[sizes.length - 1]

                      new_key = parseInt(last_size.key.split("-")[1]) + 1
                    } else {
                      new_key = 0
                    }

                    setSizes([...sizes, { key: "size-" + new_key.toString(), name: '', price: "0.00" }])
                  }}>Add Size</div>

                  <div className="options">
                    {sizes.map((size, index) => (
                      <div key={size.key} className="size">
                        <div className="column">
                          <div className="size-remove" onClick={() => {
                            let newSizes = [...sizes]

                            newSizes.splice(index, 1)

                            setSizes(newSizes)
                          }}>
                            <FontAwesomeIcon icon={faTimesCircle} size="4x"/>
                          </div>
                        </div>
                        <div className="size-types-box">
                          <div className="column"><div className="size-types-header">Select size:</div></div>
                          <div className="column">
                            <div className="size-types">
                              {["Small", "Medium", "Large", "Extra large"].map((sizeopt, sizeindex) => (
                                <div key={sizeindex.toString()} className={size.name === sizeopt.toLowerCase() ? "size-type-selected" : "size-type"} onClick={() => {
                                  let newSizes = [...sizes]

                                  newSizes[index].name = sizeopt.toLowerCase()

                                  setSizes(newSizes)
                                }}>
                                  <div className={size.name === sizeopt.toLowerCase() ? "size-type-header-selected" : "size-type-header"}>{sizeopt}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="column">
                            <input className="size-input" placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={size.price.toString()} onChange={(e) => {
                              let newSizes = [...sizes]
                              let newPrice = e.target.value.toString()

                              if (newPrice.includes(".") && newPrice.split(".")[1].length === 2) {

                              }

                              newSizes[index].price = newPrice.toString()

                              setSizes(newSizes)
                              setErrormsg()
                            }} type="number"/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              :
              <div style={{ margin: '0 auto', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 0', width: '100%' }}>
                <div className="add-option" onClick={() => {
                  let new_key

                  if (sizes.length > 0) {
                    let last_size = sizes[sizes.length - 1]

                    new_key = parseInt(last_size.key.split("-")[1]) + 1
                  } else {
                    new_key = 0
                  }

                  setSizes([...sizes, { key: "size-" + new_key.toString(), name: '', price: "0.00" }])
                }}>Add Size</div>

                <div style={{ fontSize: wsize(2), fontWeight: 'bold', margin: '50px 0', textAlign: 'center' }}>or</div>

                <div id="price-box">
                  <div id="price-header">Enter product price</div>
                  <input id="price-input" placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onKeyUp={(e) => {
                    let value = String.fromCharCode(e.keyCode)

                    if ((value >= "0" && value <= "9") || e.keyCode === 190 || e.keyCode === 8) {
                      if (e.keyCode === 8) {
                        setPrice(price.substr(0, price.length - 1))
                      } else {
                        setPrice(price + "" + (value >= "0" && value <= "9" ? value : "."))
                      }
                    }
                  }} value={price.toString()} type="text"/>
                </div>
              </div>
          )}

          <div className="errormsg">{errorMsg}</div>

          <div style={{ flexDirection: 'row' }}>
            <div id="add-actions">
              <div className="add-action" disabled={loading} onClick={() => window.location = "/menu"}>Cancel</div>
              <div className="add-action" disabled={loading} onClick={() => {
                if (productid === "null") {
                  if (setupType === "sizes") {
                    addTheNewProduct()
                  } else {
                    saveInfo()
                  }
                } else {
                  if (setupType === "sizes") {
                    updateTheProduct()
                  } else {
                    saveInfo()
                  }
                }
              }}>
                {productid === "null" ? 
                  setupType === "sizes" ? "Done" : "Next" 
                  : 
                  setupType === "sizes" ? "Save" : "Next"
                }
              </div>
            </div>
          </div>
        </div>
        :
        <div id="loading"><Loadingprogress/></div>
      }

      {(image.loading || loading) && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
