import './register.scss';
import React, { useState, useEffect } from 'react';
import Webcam from "react-webcam";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { saveUserInfo } from '../../../apis/business/owners'
import { ownerRegisterInfo, registerInfo } from '../../../businessInfo'

// components
import Loadingprogress from '../../../components/loadingprogress';

const width = window.innerWidth
const height = window.innerHeight
const wsize = p => {return window.innerWidth * (p / 100)}
const steps = ['nickname', 'profile']

export default function Register(props) {
  const [setupType, setSetuptype] = useState('nickname')
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)
  const [camType, setCamtype] = useState('front')
  const [username, setUsername] = useState(ownerRegisterInfo.username)
  const [profile, setProfile] = useState({ uri: '', name: '', size: { width: 0, height: 0 }})

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const register = () => {
    setLoading(true)

    const id = localStorage.getItem("ownerid")
    const data = { id, username, profile }

    saveUserInfo(data)
      .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { msg } = res

            setLoading(false)
            localStorage.setItem("phase", "workinghours")

            window.location = "/workinghours"
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data

            setErrormsg(errormsg)
          }

          setLoading(false)
        })
  }
  const saveInfo = () => {
    const index = steps.indexOf(setupType)
    let nextStep, msg = ""

    setLoading(true)

    switch (index) {
      case 0:
        if (!username) {
          msg = "Please provide a name you like"
        }

        break
      case 1:
        if (!profile.uri) {
          msg = "Please provide a profile you like"
        }

        break
      default:
    }

    if (msg === "") {
      nextStep = index === 2 ? "done" : steps[index + 1]

      setSetuptype(nextStep)
      setErrormsg("")
    } else {
      setErrormsg(msg)
    }

    setLoading(false)
  }
  const snapPhoto = () => {
    setLoading(true)

    let letters = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
      "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ]
    let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
    let char = ""

    if (camComp) {
      let uri = camComp.getScreenshot({ height: (width * 0.3) - 130, width: width * 0.3 });

      for (let k = 0; k <= photo_name_length - 1; k++) {
        char += "" + (
          k % 2 === 0 ? 
            letters[Math.floor(Math.random() * letters.length)].toUpperCase()
            :
            Math.floor(Math.random() * 9) + 0
        )
      }

      setProfile({ uri, name: `${char}.jpg`, size: { height: (width * 0.3) - 130, width: width * 0.3 }})
      setLoading(false)
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
          size["width"] = imageReader.width
          size["height"] = imageReader.height

          setProfile({ uri: e.target.result, name: `${char}.jpg`, size })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }

  return (
    <div id="register">
      <div id="box" style={{ opacity: loading ? 0.5 : 1 }}>
        <div id="header">
          <div id="box-header">Setup your stylist info</div>
        </div>

        <div id="inputs-box">
          {setupType === "nickname" && (
            <div id="input-container">
              <div className="input-header">Enter your name:</div>
              <input id="input" onChange={(e) => setUsername(e.target.value)} value={username}/>
            </div>
          )}

          {setupType === "profile" && (
            <div id="camera-container">
              <div className="input-header">Provide a photo of yourself</div>
              <div id="input-info">clients will be able to find and book you easily</div>

              {profile.uri ? (
                <>
                  <div id="camera">
                    <img alt="" style={{ height: (width * 0.3) - 130, width: width * 0.3 }} src={profile.uri}/>
                  </div>

                  <div id="camera-actions">
                    <div className="camera-action" onClick={() => setProfile({ uri: '', name: '' })}>Cancel</div>
                  </div>
                </>
              ) : (
                <>
                  <div id="camera">
                    <Webcam
                      audio={false}
                      ref={r => {setCamcomp(r)}}
                      screenshotFormat="image/jpeg"
                      width={width * 0.3}
                    />
                  </div>

                  <div style={{ alignItems: 'center', marginVertical: 10 }}>
                    <FontAwesomeIcon icon="fa-regular fa-camera-rotate" onClick={() => setCamtype(camType === 'back' ? 'front' : 'back')}/>
                  </div>

                  <div id="camera-actions">
                    <div className="camera-action" style={{ opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={snapPhoto.bind(this)}>Take<br/>this photo</div>
                    <div className="camera-action" style={{ opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => fileComp.click()}>Choose<br/>from phone</div>
                  </div>

                  <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                </>
              )}
            </div>
          )}

          <div className="errormsg">{errorMsg}</div>

          <div id="actions">
            {setupType !== 'nickname' && (
              <div className="action" style={{ opacity: loading ? 0.3 : 1 }} onClick={() => {
                let index = steps.indexOf(setupType)
                
                index--

                setSetuptype(steps[index])
              }}>Back</div>
            )}

            <div className="action" style={{ opacity: loading ? 0.3 : 1 }} disabled={loading} onClick={() => setupType === "profile" ? register() : saveInfo()}>{setupType === "profile" ? "Done" : "Next"}</div>
          </div>
        </div>

        <div id="bottom-navs">
          <div id="bottom-navs-row">
            <div className="bottom-nav" onClick={() => {
              localStorage.clear()

              window.location = "/auth"
            }}>Log-Out</div>
          </div>
        </div>
      </div>

      {loading && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  );
}
