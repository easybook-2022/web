import './addservice.scss';
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Webcam from "react-webcam";
import { useParams } from 'react-router-dom';
import { logo_url } from '../../../businessInfo'
import { resizePhoto } from 'geottuse-tools'
import { getServiceInfo, addNewService, updateService } from '../../../apis/business/services'

// components
import Loadingprogress from '../../../components/loadingprogress';

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return window.innerWidth * (p / 100)}
const steps = ['name', 'photo', 'price']

export default function Addservice() {
  const params = useParams()
  const { parentMenuid, serviceid } = params
  
  const [setupType, setSetuptype] = useState('name')
  const [cameraPermission, setCamerapermission] = useState(null);
  const [pickingPermission, setPickingpermission] = useState(null);
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)

  const [name, setName] = useState('')
  const [image, setImage] = useState({ uri: '', name: '', size: { height: 0, width: 0 }, loading: false })
  const [price, setPrice] = useState('')
  const [loaded, setLoaded] = useState(serviceid !== "null" ? false : true)
  const [loading, setLoading] = useState(false)

  const [errorMsg, setErrormsg] = useState('')

  const addTheNewService = () => {
    const locationid = localStorage.getItem("locationid")

    if (name && (price && !isNaN(price))) {
      const data = { locationid, menuid: parentMenuid !== "null" ? parentMenuid : "", name, image, price }

      setLoading(true)

      addNewService(data)
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
        setErrormsg("Please enter the service name")

        return
      }

      if (!price) {
        setErrormsg("Please enter the price of the service")

        return
      } else if (isNaN(price)) {
        setErrormsg("The price you entered is invalid")

        return
      }
    }
  }
  const updateTheService = () => {
    const locationid = localStorage.getItem("locationid")

    if (name && (price && !isNaN(price))) {
      const data = { locationid, menuid: parentMenuid !== "null" ? parentMenuid : "", serviceid, name, image, price }

      updateService(data)
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
        setErrormsg("Please enter the service name")

        return
      }

      if (!price) {
        setErrormsg("Please enter the price of the service")

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
          msg = "Please provide a name for the service"
        }

        break
      case 2:
        if (!price) {
          msg = "Please provide a price for the service"
        }

        break
      default:
    }

    if (msg === "") {
      const nextStep = index === 2 ? "done" : steps[index + 1]

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
      let uri = camComp.getScreenshot({ width: 640, height: 480 });

      for (let k = 0; k <= photo_name_length - 1; k++) {
        char += "" + (
          k % 2 === 0 ? 
            letters[Math.floor(Math.random() * letters.length)].toUpperCase() 
            : 
            Math.floor(Math.random() * 9) + 0
          )
      }

      setImage({ ...image, uri, name: `${char}.jpg`, size: { width: 640, height: 480 }, loading: false })
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
  
  const getTheServiceInfo = () => {
    getServiceInfo(serviceid !== "null" ? serviceid : -1)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { serviceInfo } = res

          setName(serviceInfo.name)

          if (serviceInfo.image.name) setImage({ ...image, uri: logo_url + serviceInfo.image.name })

          setPrice(serviceInfo.price.toString())
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
    if (serviceid) getTheServiceInfo()
  }, [])
  
  return (
    <div id="addservice" style={{ opacity: loading ? 0.5 : 1 }}>
      {loaded ? 
        <div id="box">
          {setupType === "name" && (
            <div className="input-container">
              <div className="add-header">What is this service call ?</div>

              <input 
                className="add-input" placeholderTextColor="rgba(127, 127, 127, 0.5)" 
                placeholder="example: Men hair cut" onChange={(e) => setName(e.target.value)} 
                value={name} maxlength="20"
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

          {setupType === "price" && (
            <div className="input-container">
              <div className="add-header">{serviceid !== "null" ? "Update" : "Enter"} {name} price</div>
              <input className="add-input" placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="example: 4.99" onKeyUp={(e) => {
                let value = String.fromCharCode(e.keyCode)

                if ((value >= "0" && value <= "9") || e.keyCode === 190 || e.keyCode === 8) {
                  if (e.keyCode === 8) {
                    setPrice(price.substr(0, price.length - 1))
                  } else {
                    setPrice(price + "" + (value >= "0" && value <= "9" ? value : "."))
                  }
                }
              }} value={price} type="text"/>
            </div>
          )}

          <div className="errormsg">{errorMsg}</div>

          <div id="add-actions">
            <div className="add-action" disabled={loading} onClick={() => window.location = "/menu"}>Cancel</div>
            <div className="add-action" disabled={loading} onClick={() => {
              if (serviceid === "null") {
                if (setupType === steps[steps.length - 1]) {
                  addTheNewService()
                } else {
                  saveInfo()
                }
              } else {
                if (setupType === steps[steps.length - 1]) {
                  updateTheService()
                } else {
                  saveInfo()
                }
              }
            }}>
              {serviceid === "null" ? 
                setupType === steps[steps.length - 1] ? "Done" : "Next"
                : 
                setupType === steps[steps.length - 1] ? "Save" : "Next"
              }
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
