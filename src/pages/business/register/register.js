import './register.scss';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { getId, resizePhoto } from 'geottuse-tools';
import { saveUserInfo } from '../../../apis/business/owners'
import { getLocationProfile } from '../../../apis/business/locations'
import { ownerSigninInfo, timeControl } from '../../../businessInfo'

// widgets
import Loadingprogress from '../../../widgets/loadingprogress';

const width = window.innerWidth
const height = window.innerHeight
const wsize = p => {return window.innerWidth * (p / 100)}
const steps = ['nickname', 'profile', 'hours']
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Register(props) {
  const [setupType, setSetuptype] = useState('nickname')
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)
  const [camType, setCamtype] = useState('front')
  const [username, setUsername] = useState(ownerSigninInfo.username)
  const [profile, setProfile] = useState({ uri: '', name: '', size: { width: 0, height: 0 }})

  const [type, setType] = useState('')

  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false })
  const [workerHours, setWorkerhours] = useState([])
  const [hoursRange, setHoursrange] = useState([])

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const getTheLocationProfile = async() => {
    const locationid = localStorage.getItem("locationid")
    const locationtype = localStorage.getItem("locationtype")
    const data = { locationid }

    getLocationProfile(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const hours = [...res.info.hours]
          let openHour, openMinute, closeHour, closeMinute
          let openInfo, closeInfo, currDate, calcDate, openTime, closeTime

          for (let k = 0; k < 7; k++) {
            openInfo = hours[k].opentime
            closeInfo = hours[k].closetime

            openMinute = parseInt(openInfo.minute)
            openHour = parseInt(openInfo.hour)
            openHour = openInfo.period === "PM" ? openHour + 12 : openHour

            closeMinute = parseInt(closeInfo.minute)
            closeHour = parseInt(closeInfo.hour)
            closeHour = closeInfo.period === "PM" ? closeHour + 12 : closeHour

            currDate = new Date()

            calcDate = new Date(currDate.setDate(currDate.getDate() - currDate.getDay() + k)).toUTCString();
            calcDate = calcDate.split(" ")
            calcDate.pop()
            calcDate.pop()

            calcDate = calcDate.join(" ") + " "

            openTime = (openHour < 10 ? "0" + openHour : openHour)
            openTime += ":"
            openTime += (openMinute < 10 ? "0" + openMinute : openMinute)

            closeTime = (closeHour < 10 ? "0" + closeHour : closeHour)
            closeTime += ":"
            closeTime += (closeMinute < 10 ? "0" + closeMinute : closeMinute)

            hours[k]["calcDate"] = calcDate
            hours[k]["openunix"] = Date.parse(calcDate + openTime)
            hours[k]["closeunix"] = Date.parse(calcDate + closeTime)
          }

          setType(locationtype)
          setWorkerhours(hours)
          setHoursrange(hours)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const setTime = () => {
    const newWorkerhours = []
    let emptyDays = true

    daysArr.forEach(function (day, index) {
      newWorkerhours.push({ 
        key: newWorkerhours.length.toString(), 
        header: day, 
        opentime: {...hoursRange[index].opentime}, 
        closetime: {...hoursRange[index].closetime}, 
        working: daysInfo.working[index] ? true : false
      })

      if (daysInfo.working[index]) {
        emptyDays = false
      }
    })

    if (!emptyDays) {
      setDaysinfo({ ...daysInfo, done: true })
      setWorkerhours(newWorkerhours)
      setErrormsg('')
    } else {
      setErrormsg('Please select the days you work on')
    }
  }

  const register = () => {
    setLoading(true)

    const id = localStorage.getItem("ownerid")
    const hours = {}
    let invalid = false

    workerHours.forEach(function (workerHour) {
      let { opentime, closetime, working } = workerHour
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

      delete newOpentime.period
      delete newClosetime.period

      if (working === true || working === false) {
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

        hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working, takeShift: "" }
      } else {
        invalid = true
      }
    })

    const data = { id, username, profile, hours }

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
            localStorage.setItem("phase", "main")
            localStorage.setItem("firstTime", "true")

            window.location = "/main"
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
    let char = getId()

    if (camComp) {
      let uri = camComp.getScreenshot({ height: (width * 0.3) - 130, width: width * 0.3 });

      setProfile({ uri, name: `${char}.jpg`, size: { height: (width * 0.3) - 130, width: width * 0.3 }})
      setLoading(false)
    }
  }
  const choosePhoto = e => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader()
      let char = getId()

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

  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...workerHours], hoursRangeInfo = [...hoursRange]
    let value, { openunix, closeunix, calcDate } = hoursRangeInfo[index]
    let { opentime, closetime } = newWorkerhours[index], valid = false

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    if (open) {
      valid = (
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) >= openunix
        &&
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) <= Date.parse(calcDate + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period)
      )
    } else {
      valid = (
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) <= closeunix
        &&
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) >= Date.parse(calcDate + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period)
      )
    }
      
    if (valid) {
      value.hour = hour < 10 ? "0" + hour : hour.toString()
      value.minute = minute < 10 ? "0" + minute : minute.toString()
      value.period = period

      if (open) {
        newWorkerhours[index].opentime = value
      } else {
        newWorkerhours[index].closetime = value
      }

      setWorkerhours(newWorkerhours)
    }
  }

  useEffect(() => {
    getTheLocationProfile()
  }, [])

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
              <input id="input" style={{ fontSize: wsize(3) }} onChange={(e) => setUsername(e.target.value)} value={username}/>
            </div>
          )}

          {setupType === "profile" && (
            <div id="camera-container">
              <div className="input-header" style={{ textAlign: 'center' }}>Upload a picture of your face for clients (optional)</div>

              {profile.uri ? (
                <>
                  <div id="camera">
                    <img alt="" style={resizePhoto(profile.size, width * 0.3)} src={profile.uri}/>
                  </div>

                  <div id="camera-actions">
                    <div className="camera-action" onClick={() => setProfile({ uri: '', name: '' })}>Cancel</div>
                  </div>
                </>
              ) : (
                <>
                  <div id="camera-actions">
                    <div className="camera-action" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "" }} onClick={() => fileComp.click()}>Choose<br/>from phone</div>
                  </div>

                  <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                </>
              )}
            </div>
          )}

          {setupType === "hours" && (
            <>
              {!daysInfo.done ? 
                <div style={{ width: '100%' }}>
                  <div id="worker-day-header">What days do you work ?</div>

                  {daysArr.map((day, index) => (
                    <div key={index} className={
                      !hoursRange[index].close ? 
                        daysInfo.working.indexOf(day) > -1 ? 
                          "worker-day-touch-selected" : "worker-day-touch"
                        :
                        "worker-day-touch-off"
                    } onClick={() => {
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
                <div id="worker-hours">
                  <div id="worker-hours-back" onClick={() => setDaysinfo({ ...daysInfo, done: false })}>Change days</div>

                  {workerHours.map((info, index) => (
                    info.working ?
                      <div key={index} className="worker-hour">
                        <div className="worker-hour-header">Your working hours on {info.header}</div>

                        <div className="time-selection-container">
                          <div className="time-selection">
                            <div className="selection">
                              <div onClick={() => updateWorkingHour(index, "hour", "up", true)}>
                                <FontAwesomeIcon icon={faArrowUp} size="2x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].opentime["hour"] = e.target.value.toString()

                                setWorkerhours(newWorkerhours)
                              }} type="text" maxLength={2} value={info.opentime.hour}/>
                              <div onClick={() => updateWorkingHour(index, "hour", "down", true)}>
                                <FontAwesomeIcon icon={faArrowDown} size="2x"/>
                              </div>
                            </div>
                            <div className="column">
                              <div className="selection-div">:</div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateWorkingHour(index, "minute", "up", true)}>
                                <FontAwesomeIcon icon={faArrowUp} size="2x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].opentime["minute"] = e.target.value.toString()

                                setWorkerhours(newWorkerhours)
                              }} type="text" maxLength={2} value={info.opentime.minute}/>
                              <div onClick={() => updateWorkingHour(index, "minute", "down", true)}>
                                <FontAwesomeIcon icon={faArrowDown} size="2x"/>
                              </div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateWorkingHour(index, "period", "up", true)}>
                                <FontAwesomeIcon icon={faArrowUp} size="2x"/>
                              </div>
                              <div className="selection-header">{info.opentime.period}</div>
                              <div onClick={() => updateWorkingHour(index, "period", "down", true)}>
                                <FontAwesomeIcon icon={faArrowDown} size="2x"/>
                              </div>
                            </div>
                          </div>
                          <div className="time-selection-header-holder">
                            <div className="time-selection-header">To</div>
                          </div>
                          <div className="time-selection">
                            <div className="selection">
                              <div onClick={() => updateWorkingHour(index, "hour", "up", false)}>
                                <FontAwesomeIcon icon={faArrowUp} size="2x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].closetime["hour"] = e.target.value.toString()

                                setWorkerhours(newWorkerhours)
                              }} type="text" maxLength={2} value={info.closetime.hour}/>
                              <div onClick={() => updateWorkingHour(index, "hour", "down", false)}>
                                <FontAwesomeIcon icon={faArrowDown} size="2x"/>
                              </div>
                            </div>
                            <div className="column">
                              <div className="selection-div">:</div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateWorkingHour(index, "minute", "up", false)}>
                                <FontAwesomeIcon icon={faArrowUp} size="2x"/>
                              </div>
                              <input className="selection-header" onChange={(e) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].closetime["minute"] = e.target.value.toString()

                                setWorkerhours(newWorkerhours)
                              }} type="text" maxLength={2} value={info.closetime.minute}/>
                              <div onClick={() => updateWorkingHour(index, "minute", "down", false)}>
                                <FontAwesomeIcon icon={faArrowDown} size="2x"/>
                              </div>
                            </div>
                            <div className="selection">
                              <div onClick={() => updateWorkingHour(index, "period", "up", false)}>
                                <FontAwesomeIcon icon={faArrowUp} size="2x"/>
                              </div>
                              <div className="selection-header">{info.closetime.period}</div>
                              <div onClick={() => updateWorkingHour(index, "period", "down", false)}>
                                <FontAwesomeIcon icon={faArrowDown} size="2x"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    : null
                  ))}
                </div>
              }
            </>
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

            <div className="action" style={{ opacity: loading ? 0.3 : 1, pointerEvents: loading ? "none" : "" }} onClick={() => {
              if (setupType === "hours") {
                if (!daysInfo.done) {
                  setTime()
                } else {
                  register()
                }
              } else {
                saveInfo()
              }
            }}>{
              setupType === "hours" ? 
                !daysInfo.done ? 
                  "Next"
                  :
                  "Done"
                :
                "Next"
            }</div>
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
