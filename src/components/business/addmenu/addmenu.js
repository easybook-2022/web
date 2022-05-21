import './addmenu.scss';
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Webcam from "react-webcam";
import { useParams } from 'react-router-dom';
import { logo_url } from '../../../businessInfo'
import { resizePhoto } from 'geottuse-tools'
import { addNewMenu, getMenuInfo, saveMenu } from '../../../apis/business/menus'

// components
import Loadingprogress from '../../../components/loadingprogress';

const width = window.innerWidth;
const height = window.innerHeight;
const wsize = p => {return window.innerWidth * (p / 100)}
const steps = ['name', 'photo']

export default function Addmenu(props) {
  const params = useParams()
  const { parentMenuid, menuid } = params

  const [setupType, setSetuptype] = useState('name')
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)
  
  const [name, setName] = useState('')
  const [image, setImage] = useState({ uri: '', name: '', size: { height: 0, width: 0 }, loading: false })

  const [loaded, setLoaded] = useState(menuid !== "null" ? false : true)
  const [loading, setLoading] = useState(false)

  const [errorMsg, setErrormsg] = useState('')

  const addTheNewMenu = async() => {
    const ownerid = localStorage.getItem("ownerid")
    const locationid = localStorage.getItem("locationid")
    const data = { locationid, parentMenuid: parentMenuid !== "null" ? parentMenuid : "", name, image }

    setLoading(true)

    addNewMenu(data)
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
        }

        setLoading(false)
      })
  }
  const saveTheMenu = () => {
    const data = { menuid: menuid !== "null" ? menuid : "", name, image }

    setLoading(true)
    
    saveMenu(data)
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
        }
      })
  }
  const saveInfo = () => {
    const index = steps.indexOf(setupType)
    let msg = ""

    setLoading(true)

    switch (index) {
      case 0:
        if (!name) {
          msg = "Please provide a name for the menu"
        }

        break
      default:
    } 

    if (msg === "") {
      const nextStep = index === 1 ? "done" : steps[index + 1]

      setSetuptype(nextStep)
      setErrormsg('')
    } else {
      setErrormsg(msg)
    }

    setLoading(false)
  }

  const getTheMenuInfo = async() => {
    getMenuInfo(menuid !== "null" ? menuid : -1)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, image } = res.info

          setName(name)

          if (image.name) setImage({ ...image, uri: logo_url + image.name })

          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
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
          size['width'] = imageReader.width
          size['height'] = imageReader.height

          setImage({ ...image, uri: e.target.result, name: `${char}.jpg`, size })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }

  useEffect(() => {
    getTheMenuInfo()
  }, [])

  return (
    <div id="addmenu" style={{ opacity: loading ? 0.5 : 1 }}>
      {loaded ? 
        <div id="box">
          {setupType === 'name' && (
            <div id="input-container">
              <div id="add-header">What is this menu call</div>

              <input 
                id="add-input" placeholder="example: Beverages" placeholderTextColor="rgba(127, 127, 127, 0.5)" 
                onChange={(e) => setName(e.target.value)} value={name} maxlength="20"
              />
            </div>
          )}

          {setupType === 'photo' && (
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
                <div id="camera-actions">
                  <div className="camera-action" style={{ opacity: image.loading ? 0.5 : 1 }} disabled={image.loading} onClick={() => fileComp.click()}>Choose{'\n'}from phone</div>
                
                  <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                </div>
              )}
            </div>
          )}
          
          <div class="errormsg">{errorMsg}</div>
          
          <div id="add-actions">
            <div className="add-action" disabled={loading} onClick={() => window.location = "/menu"}>Cancel</div>
            <div className="add-action" disabled={loading} onClick={() => {
              if (menuid === "null") {
                if (setupType === "photo") {
                  addTheNewMenu()
                } else {
                  saveInfo()
                }
              } else {
                if (setupType === "photo") {
                  saveTheMenu()
                } else {
                  saveInfo()
                }
              }
            }}>
              {menuid === "null" ? 
                setupType === "photo" ? "Done" : "Next" 
                : 
                setupType === "photo" ? "Save" : "Next"
              }
            </div>
          </div>
        </div>
        :
        <div id="loading">
          <Loadingprogress/>
        </div>
      }

      {(image.loading || loading) && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
