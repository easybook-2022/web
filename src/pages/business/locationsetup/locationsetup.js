import './locationsetup.scss';
import React, { useState, useEffect } from 'react';
import Geocode from "react-geocode";
import GoogleMapReact from 'google-map-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationPin, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { setupLocation } from '../../../apis/business/locations'
import { registerLocationInfo, googleApikey, timeControl } from '../../../businessInfo'
import { getId, displayPhonenumber, resizePhoto } from 'geottuse-tools'

// widgets
import Loadingprogress from '../../../widgets/loadingprogress';

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return window.innerWidth * (p / 100)}
const steps = ['type', 'name', 'location', 'phonenumber', 'logo', 'hours']
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

Geocode.setApiKey(googleApikey);
Geocode.setLanguage("en");

const LocationPin = () => <FontAwesomeIcon icon={faLocationPin} size="2x"/>

export default function Locationsetup({ navigation }) {
  const [setupType, setSetuptype] = useState('')
  const [locationPermission, setLocationpermission] = useState(null)
  const [newBusiness, setNewbusiness] = useState(null)

  const [locationInfo, setLocationinfo] = useState('')
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)
  const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null })

  const [storeName, setStorename] = useState(registerLocationInfo.storeName)
  const [addressOne, setAddressone] = useState(registerLocationInfo.addressOne)
  const [addressTwo, setAddresstwo] = useState(registerLocationInfo.addressTwo)
  const [city, setCity] = useState(registerLocationInfo.city)
  const [province, setProvince] = useState(registerLocationInfo.province)
  const [postalcode, setPostalcode] = useState(registerLocationInfo.postalcode)
  const [address, setAddress] = useState('')
  
  const [phonenumber, setPhonenumber] = useState(registerLocationInfo.phonenumber)

  const [type, setType] = useState(registerLocationInfo.storeType)

  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }})

  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false, step: 0 })
  const [days, setDays] = useState([])

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const setupYourLocation = () => {
    setLoading(true)

    const ownerid = localStorage.getItem("ownerid")
    const hours = {}
    let longitude, latitude, invalid = false

    if (storeName && phonenumber && addressOne && city && province && postalcode) {
      days.forEach(function (day) {
        let { opentime, closetime, close } = day
        let newOpentime = {...opentime}, newClosetime = {...closetime}
        let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
        let openperiod = newOpentime.period, closeperiod = newClosetime.period

        if (close === false || close === true) {
          if (openperiod === "PM") {
            if (openhour < 12) {
              openhour += 12
            }

            openhour = openhour < 10 ? 
              "0" + openhour
              :
              openhour.toString()
          } else {
            if (openhour === 12) {
              openhour = "00"
            } else if (openhour < 10) {
              openhour = "0" + openhour
            } else {
              openhour = openhour.toString()
            }
          }

          if (closeperiod === "PM") {
            if (closehour < 12) {
              closehour += 12
            }

            closehour = closehour < 10 ? 
              "0" + closehour
              :
              closehour.toString()
          } else {
            if (closehour === 12) {
              closehour = "00"
            } else if (closehour < 10) {
              closehour = "0" + closehour
            } else {
              closehour = closehour.toString()
            }
          }

          newOpentime.hour = openhour
          newClosetime.hour = closehour

          delete newOpentime.period
          delete newClosetime.period

          hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
        } else {
          invalid = true
        }
      })

      if (locationInfo === "destination") {
        longitude = locationCoords.longitude
        latitude = locationCoords.latitude
      } else {
        if (!locationPermission) {
          longitude = registerLocationInfo.longitude
          latitude = registerLocationInfo.latitude
        } else {
          longitude = locationCoords.longitude
          latitude = locationCoords.latitude
        }
      }

      const data = {
        storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours, type, 
        longitude, latitude, ownerid, web: true
      }

      if (!invalid) {
        setupLocation(data)
          .then((res) => {
            if (res.status === 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              const { id, ownerProfile } = res

              localStorage.setItem("locationid", id.toString())
              localStorage.setItem("locationtype", type)

              setLoading(false)

              if (type === "restaurant" || type === "store") {
                localStorage.setItem("phase", "main")
                localStorage.setItem("firstTime", !newBusiness ? "true" : "false")

                window.location = "/main"
              } else {
                if (ownerProfile["name"] !== undefined) {
                  localStorage.setItem("phase", "main")

                  window.location = "/main"
                } else {
                  localStorage.setItem("phase", "register")

                  window.location = "/register"
                }
              }
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
        setLoading(false)
        setErrormsg("Please choose an option for all the days")
      }
    } else {
      setLoading(false)

      if (!storeName) {
        setErrormsg("Please enter your location name")

        return
      }

      if (!phonenumber) {
        setErrormsg("Please enter your location phone number")

        return
      }

      if (!addressOne) {
        setErrormsg("Please enter the Address # 1")

        return
      }

      if (!city) {
        setErrormsg("Please enter the city")

        return
      }

      if (!province) {
        setErrormsg("Please enter the province")

        return
      }

      if (!postalcode) {
        setErrormsg("Please enter the postal code")

        return
      }
    }
  }
  const saveInfo = async() => {
    const index = steps.indexOf(setupType)
    let msg = "", skip = false

    switch (index) {
      case 0:
        if (!type) {
          msg = "Please tell what service you are"
        }

        break
      case 1:
        if (!storeName) {
          msg = "Please enter the name of your " + ((type == 'hair' || type == 'nail') ? type + ' salon' : type)
        }

        break
      case 2:
        if (locationInfo !== "") {
          if (locationInfo === "away") {
            if (!addressOne || !city || !province || !postalcode) {
              msg = "There are some missing address info"
            } else {
              const address = `${addressOne}${addressTwo ? ' ' + addressTwo : ''}, ${city} ${province}, ${postalcode}`
              const info = await Geocode.fromAddress(address)
              const { lng, lat } = info.results[0].geometry.location

              setLocationcoords({ longitude: lng, latitude: lat })
            }
          }
        } else {
          msg = "Please choose an option"
        }

        break
      case 3:
        if (!phonenumber) {
          msg = "Please provide the " + ((type == 'hair' || type == 'nail') ? type + ' salon' : type) + " phone number"
        }

        break
      case 4:
        if (!logo.uri) {
          msg = "Please provide a photo of the " + ((type == 'hair' || type == 'nail') ? type + ' salon' : type)
        }

        break
      case 5:
        if (!daysInfo.done) {
          const newDays = []

          daysArr.forEach(function (day, index) {
            newDays.push({ 
              key: newDays.length.toString(), 
              header: day, 
              opentime: { hour: "06", minute: "00", period: "AM" }, 
              closetime: { hour: "09", minute: "00", period: "PM" }, 
              close: daysInfo.working[index] ? false : true
            })
          })

          if (JSON.stringify(newDays).includes("\"close\":false")) {
            setDaysinfo({ ...daysInfo, done: true, step: 1 })
            setDays(newDays)

            skip = true
          } else {
            msg = "You didn't select any opening day"
          }
        }

        break
      default:
    }

    if (!skip) {
      if (msg === "") {
        const nextStep = index === 5 ? "done" : steps[index + 1]

        setSetuptype(nextStep)
        setErrormsg('')
      } else {
        setErrormsg(msg)
      }
    } else {
      setErrormsg()
    }

    setLoading(false)
  }

  const choosePhoto = e => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader()
      let char = getId()

      reader.onload = e => {
        let imageReader = new Image()
        let size = {}

        imageReader.onload = () => {
          size['height'] = imageReader.height
          size['width'] = imageReader.width

          setLogo({ ...logo, uri: e.target.result, name: `${char}.jpg`, size })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }

  const updateTime = (index, timetype, dir, open) => {
    const newDays = [...days]
    let value, { opentime, closetime } = newDays[index]

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    value.hour = hour < 10 ? "0" + hour : hour.toString()
    value.minute = minute < 10 ? "0" + minute : minute.toString()
    value.period = period

    if (open) {
      newDays[index].opentime = value
    } else {
      newDays[index].closetime = value
    }

    setDays(newDays)
  }
  const dayTouch = index => {
    const newDays = [...days]

    newDays[index].close = !newDays[index].close

    setDays(newDays)
  }

  useEffect(() => {
    setNewbusiness(localStorage.getItem("newBusiness"))
  }, [])

  const header = type == 'hair' || type == 'nail' ? type + ' salon' : type
    
  return (
    <div id="locationsetup" style={{ opacity: loading ? 0.5 : 1 }}>
      {setupType !== "hours" ? 
        <div id="box">
          <div className="header"><div className="box-header">Setup</div></div>

          <div id="inputs-box">
            <div id="inputs-container">
              {setupType === "" && (
                <div id="intro-box">
                  <div className="intro-header">Welcome to EasyGO Business</div>
                  <div className="intro-header">We will bring the nearest customers to your door<br/>VERY FAST</div>
                  <div className="intro-header">Let's setup your business information</div>
                </div>
              )}

              {setupType === "type" && (
                <div id="type-container">
                  <div id="type-header">What business are you ?</div>
                  
                  <div id="type-selections">
                    <div className="type-selection" style={{ backgroundColor: type === 'hair' ? 'rgba(0, 0, 0, 0.5)' : null }} onClick={() => setType('hair')}>
                      <div className="type-selection-row">
                        <div className="column">
                          <div className="type-selection-header">Hair<br/>Salon</div>
                        </div>
                        <div className="column">
                          <img alt="" src="/hairsalon.png" className="type-selection-icon"/>
                        </div>
                      </div>
                    </div>
                    <div className="type-selection" style={{ backgroundColor: type === 'nail' ? 'rgba(0, 0, 0, 0.5)' : null }} onClick={() => setType('nail')}>
                      <div className="type-selection-row">
                        <div className="column">
                          <div className="type-selection-header">Nail<br/>Salon</div>
                        </div>
                        <div className="column">
                          <img alt="" src="/nailsalon.png" className="type-selection-icon"/>
                        </div>
                      </div>
                    </div>
                    <div className="type-selection" style={{ backgroundColor: type === 'restaurant' ? 'rgba(0, 0, 0, 0.5)' : null }} onClick={() => setType('restaurant')}>
                      <div className="type-selection-row">
                        <div className="column">
                          <div className="type-selection-header">Restaurant</div>
                        </div>
                        <div className="column">
                          <img alt="" src="/food.png" className="type-selection-icon"/>
                        </div>
                      </div>
                    </div>
                    <div className="type-selection" style={{ backgroundColor: type === 'store' ? 'rgba(0, 0, 0, 0.5)' : null }} onClick={() => setType('store')}>
                      <div className="type-selection-row">
                        <div className="column">
                          <div className="type-selection-header">Store</div>
                        </div>
                        <div className="column">
                          <img alt="" src="/shopping-cart.png" className="type-selection-icon"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {setupType === "name" && (
                <div className="input-container">
                  <div className="input-header">Enter {header} name:</div>
                  <input className="input" onChange={(e) => setStorename(e.target.value)} value={storeName}/>
                </div>
              )}

              {setupType === "location" && (
                <div id="location-container">
                  {locationInfo === '' && (
                    <div id="location-container-center">
                      <div className="location-header">If you are at the {header} right now,</div>

                      <div className="location-action-option" disabled={loading} onClick={() => {
                        setLocationinfo('destination')

                        navigator.geolocation.getCurrentPosition(function (position) {
                          const id = localStorage.getItem("id")
                          const { longitude, latitude } = position.coords

                          setLocationcoords({ longitude, latitude })
                          setErrormsg()
                        })
                      }}>Mark your location</div>

                      <div className="location-div">Or</div>

                      <div className="location-action-option" disabled={loading} onClick={() => {
                        setLocationinfo('away')
                        setErrormsg()
                      }}>Enter address instead</div>
                    </div>
                  )}

                  {locationInfo === 'destination' && (
                    <div id="location-container-center">
                      <div className="location-header">Your {header} is located at</div>
                      
                      <div style={{ height: 500, margin: '0 auto', width: 500 }}>
                        {(locationCoords.longitude !== null && locationCoords.latitude !== null) ? 
                          <GoogleMapReact
                            bootstrapURLKeys={{ key: googleApikey }}
                            defaultZoom={16}
                            defaultCenter={{ lat: locationCoords.latitude, lng: locationCoords.longitude }}
                            options={{
                              scrollwheel: false,
                              gestureHandling: 'none'
                            }}
                          >
                            <LocationPin 
                              lat={locationCoords.latitude}
                              lng={locationCoords.longitude}
                            />
                          </GoogleMapReact>
                          :
                          <Loadingprogress/>
                        }
                      </div>

                      <div className="location-div">Or</div>

                      <div className="location-action-option" onClick={() => {
                        setLocationcoords({ longitude: null, latitude: null })
                        setLocationinfo('away')
                      }}>Enter address instead</div>
                    </div>
                  )}

                  {locationInfo === 'away' && (
                    <div id="location-container-center">
                      <div id="location-infos">
                        <div style={{ marginTop: 50 }}>
                          <div className="location-header">If you are at the {header} right now,</div>
                          <div className="location-action-option" disabled={loading} onClick={() => {
                            setLocationinfo('destination')

                            navigator.geolocation.getCurrentPosition(function (position) {
                              const id = localStorage.getItem("id")
                              const { longitude, latitude } = position.coords

                              setLocationcoords({ longitude, latitude })
                              setErrormsg()
                            })
                          }}>Mark your location</div>
                        </div>

                        <div className="location-div">Or</div>

                        <div className="location-header">Enter your {header} information</div>

                        <div className="input-container">
                          <div className="input-header">Enter {header} address #1:</div>
                          <input className="input" onChange={(e) => setAddressone(e.target.value)} value={addressOne}/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">Enter {header} address #2: (Optional)</div>
                          <input className="input" onChange={(e) => setAddresstwo(e.target.value)} value={addressTwo}/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">Enter city:</div>
                          <input className="input" onChange={(e) => setCity(e.target.value)} value={city} placeholder="example: Toronto"/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">Enter province:</div>
                          <input className="input" onChange={(e) => setProvince(e.target.value)} value={province} placeholder="example: ON"/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">Enter postal code:</div>
                          <input className="input" onChange={(e) => setPostalcode(e.target.value)} value={postalcode}/>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {setupType === "phonenumber" && (
                <div className="input-container">
                  <div className="input-header">Enter {header}'s phone number:</div>
                  <input className="input" onChange={(e) => setPhonenumber(displayPhonenumber(phonenumber, e.target.value, () => {}))} value={phonenumber} type="text"/>
                </div>
              )}

              {setupType === "logo" && (
                <div id="camera-container">
                  <div id="camera-header">Upload a picture of your {header}</div>
                  
                  {logo.uri ? (
                    <>
                      <div id="camera">
                        <img alt="" style={resizePhoto(logo, width * 0.3)} src={logo.uri}/>
                      </div>

                      <div id="camera-actions">
                        <div className="camera-action" onClick={() => setLogo({ uri: '', name: '' })}>Cancel</div>
                      </div>
                    </>
                  ) : (
                    <div id="camera-actions">
                      <div className="camera-action" style={{ opacity: loading ? 0.3 : 1 }} disabled={loading} onClick={() => fileComp.click()}>Choose<br/>from computer</div>

                      <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div id="action-container">
              <div className="errormsg">{errorMsg}</div>

              <div id="actions">
                {steps.indexOf(setupType) > 0 && (
                  <div className="action" onClick={() => {
                    let index = steps.indexOf(setupType)

                    index--

                    setSetuptype(steps[index])
                  }}>Back</div>
                )}
                  
                <div className="action" disabled={loading} onClick={() => setupType === "hours" && daysInfo.step === 1 ? setupYourLocation() : saveInfo()}>{setupType === "" ? "Let's go" : "Next"}</div>
              </div>
            </div>
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              {newBusiness && <div className="bottom-nav" onClick={() => {
                localStorage.removeItem("newBusiness")

                window.location = "/list"
              }}>Cancel</div>}

              <div className="bottom-nav" onClick={() => {
                localStorage.clear()

                window.location = "/auth"
              }}>Log-Out</div>
            </div>
          </div>
        </div>
        :
        <>
          <div style={{ backgroundColor: '#EAEAEA', height: '90%' }}>
            <div className="header"><div className="box-header">Setup</div></div>

            <div id="days">
              <div className="input-header" style={{ marginBottom: 20, textAlign: 'center' }}>What days are you open ?</div>

              {!daysInfo.done ?
                <div style={{ marginBottom: 50, width: '100%' }}>
                  {daysArr.map((day, index) => (
                    <div key={index} className={daysInfo.working.indexOf(day) > -1 ? "opening-day-touch-selected" : "opening-day-touch"} onClick={() => {
                      const newWorking = [...daysInfo.working]

                      if (newWorking[index] === '') {
                        newWorking[index] = day
                      } else {
                        newWorking[index] = ''
                      }

                      setDaysinfo({ ...daysInfo, working: newWorking })
                    }}>{day}</div>
                  ))}
                </div>
                :
                <div style={{ marginBottom: 200, opacity: loading ? 0.5 : 1 }}>
                  <div id="days-back" disabled={loading} onClick={() => setDaysinfo({ ...daysInfo, done: false, step: 0 })}>Change days</div>

                  {days.map((info, index) => (
                    !info.close ?
                      <div key={index} className="day">
                        <div className="day-header">Set hours for {info.header}</div>

                        <div className="time-selection-container">
                          <div className="time-selection">
                            <div className="selection">
                              <div onClick={() => updateTime(index, "hour", "up", true)}>
                                <FontAwesomeIcon icon={faArrowUp} size="1x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newDays = [...days]

                                newDays[index].opentime["hour"] = e.target.value.toString()

                                setDays(newDays)
                              }} type="text" maxLength="2" value={info.opentime.hour}/>
                              <div onClick={() => updateTime(index, "hour", "down", true)}>
                                <FontAwesomeIcon icon={faArrowDown} size="1x"/>
                              </div>
                            </div>
                            <div className="column">
                              <div className="selection-div">:</div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateTime(index, "minute", "up", true)}>
                                <FontAwesomeIcon icon={faArrowUp} size="1x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newDays = [...days]

                                newDays[index].opentime["minute"] = e.target.value.toString()

                                setDays(newDays)
                              }} type="text" maxLength="2" value={info.opentime.minute}/>
                              <div onClick={() => updateTime(index, "minute", "down", true)}>
                                <FontAwesomeIcon icon={faArrowDown} size="1x"/>
                              </div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateTime(index, "period", "up", true)}>
                                <FontAwesomeIcon icon={faArrowUp} size="1x"/>
                              </div>
                              <div className="selection-header">{info.opentime.period}</div>
                              <div onClick={() => updateTime(index, "period", "down", true)}>
                                <FontAwesomeIcon icon={faArrowDown} size="1x"/>
                              </div>
                            </div>
                          </div>
                          <div className="time-selection-header">To</div>
                          <div className="time-selection">
                            <div className="selection">
                              <div onClick={() => updateTime(index, "hour", "up", false)}>
                                <FontAwesomeIcon icon={faArrowUp} size="1x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newDays = [...days]

                                newDays[index].closetime["hour"] = e.target.value.toString()

                                setDays(newDays)
                              }} type="text" maxLength="2" value={info.closetime.hour}/>
                              <div onClick={() => updateTime(index, "hour", "down", false)}>
                                <FontAwesomeIcon icon={faArrowDown} size="1x"/>
                              </div>
                            </div>
                            <div className="column">
                              <div className="selection-div">:</div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateTime(index, "minute", "up", false)}>
                                <FontAwesomeIcon icon={faArrowUp} size="1x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newDays = [...days]

                                newDays[index].closetime["minute"] = e.target.value.toString()

                                setDays(newDays)
                              }} type="text" maxLength="2" value={info.closetime.minute}/>

                              <div onClick={() => updateTime(index, "minute", "down", false)}>
                                <FontAwesomeIcon icon={faArrowDown} size="1x"/>
                              </div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateTime(index, "period", "up", false)}>
                                <FontAwesomeIcon icon={faArrowUp} size="1x"/>
                              </div>
                              <div className="selection-header">{info.closetime.period}</div>
                              <div onClick={() => updateTime(index, "period", "down", false)}>
                                <FontAwesomeIcon icon={faArrowDown} size="1x"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    : null
                  ))}
                </div>
              }
            </div>
            <div id="action-container">
              <div className="errormsg">{errorMsg}</div>

              <div id="actions">
                {steps.indexOf(setupType) > 0 && (
                  <div className="action" onClick={() => {
                    let index = steps.indexOf(setupType)

                    index--

                    setSetuptype(steps[index])
                  }}>Back</div>
                )}
                  
                <div className="action" disabled={loading} onClick={() => setupType === "hours" && daysInfo.step === 1 ? setupYourLocation() : saveInfo()}>{setupType === "" ? "Let's go" : "Next"}</div>
              </div>
            </div>
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              {newBusiness && <div className="bottom-nav" onClick={() => {
                localStorage.removeItem("newBusiness")

                window.location = "/list"
              }}>Cancel</div>}

              <div className="bottom-nav" onClick={() => {
                localStorage.clear()

                window.location = "/auth"
              }}>Log-Out</div>
            </div>
          </div>
        </>
      }

      {loading && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
