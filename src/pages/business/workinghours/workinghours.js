import './workinghours.scss';
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { setOwnerHours } from '../../../apis/business/owners'
import { getLocationProfile } from '../../../apis/business/locations'
import { timeControl } from '../../../businessInfo'

// components
import Loadingprogress from '../../../components/loadingprogress';

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return window.innerWidth * (p / 100)}
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Workinghours({ navigation }) {
  const [type, setType] = useState('')

  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false })
  const [workerHours, setWorkerhours] = useState([])
  const [hoursRange, setHoursrange] = useState([])
  const [errorMsg, setErrormsg] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const getInfo = async() => {
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
          setLoaded(true)
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
  const done = async() => {
    const locationid = localStorage.getItem("locationid")
    const ownerid = localStorage.getItem("ownerid")
    const hours = {}
    let invalid = false

    setLoading(true)

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

    if (!invalid) {
      const data = { ownerid, hours }

      setOwnerHours(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setLoading(false)
            localStorage.setItem("phase", "main")
            localStorage.setItem("firstTime", "true")

            window.location = "/main"
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
            
            setLoading(false)
          }
        })
    } else {
      setLoading(false)
      setErrormsg("Please choose an option for all the days")
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

  return (
    <div id="workinghours" style={{ opacity: loading ? 0.5 : 1 }}>
      {!type ? 
        <div id="intro-box">
          <div className="intro-header">The Final Step</div>
          <div className="intro-header">Let's set your working days and hours</div>
          <div id="submit" disabled={loading} onClick={() => getInfo()}>Let's go</div>
        </div>
        :
        loaded ? 
          <div style={{ height: '90%', overflowY: 'scroll', width: '100%' }}>
            <div id="box-header">Your time</div>
            <div id="box-mini-header">Set your working days and hours</div>

            {!daysInfo.done ? 
              <div style={{ width: '100%' }}>
                <div id="worker-day-header">Tap the days you work on</div>

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
                <div id="worker-hours-back" onClick={() => setDaysinfo({ working: ['', '', '', '', '', '', ''], done: false })}>Go Back</div>

                {workerHours.map((info, index) => (
                  info.working ?
                    <div key={index} className="worker-hour">
                      <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Your working time for</div> {info.header}</div>

                      <div className="time-selection-container">
                        <div className="time-selection">
                          <div className="selection">
                            <div onClick={() => updateWorkingHour(index, "hour", "up", true)}>
                              <FontAwesomeIcon icon={faArrowUp}/>
                            </div>
                            <input className="selection-header" onChange={(e) => {
                              const newWorkerhours = [...workerHours]

                              newWorkerhours[index].opentime["hour"] = e.target.value.toString()

                              setWorkerhours(newWorkerhours)
                            }} type="text" maxLength={2} value={info.opentime.hour}/>
                            <div onClick={() => updateWorkingHour(index, "hour", "down", true)}>
                              <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                          </div>
                          <div className="column">
                            <div className="selection-div">:</div>
                          </div>
                          <div className="selection">
                            <div onClick={() => updateWorkingHour(index, "minute", "up", true)}>
                              <FontAwesomeIcon icon={faArrowUp}/>
                            </div>
                            <input className="selection-header" onChange={(e) => {
                              const newWorkerhours = [...workerHours]

                              newWorkerhours[index].opentime["minute"] = e.target.value.toString()

                              setWorkerhours(newWorkerhours)
                            }} type="text" maxLength={2} value={info.opentime.minute}/>
                            <div onClick={() => updateWorkingHour(index, "minute", "down", true)}>
                              <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                          </div>
                          <div className="selection">
                            <div onClick={() => updateWorkingHour(index, "period", "up", true)}>
                              <FontAwesomeIcon icon={faArrowUp}/>
                            </div>
                            <div className="selection-header">{info.opentime.period}</div>
                            <div onClick={() => updateWorkingHour(index, "period", "down", true)}>
                              <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                          </div>
                        </div>
                        <div className="time-selection-header-holder">
                          <div className="time-selection-header">To</div>
                        </div>
                        <div className="time-selection">
                          <div className="selection">
                            <div onClick={() => updateWorkingHour(index, "hour", "up", false)}>
                              <FontAwesomeIcon icon={faArrowUp}/>
                            </div>
                            <input className="selection-header" onChange={(e) => {
                              const newWorkerhours = [...workerHours]

                              newWorkerhours[index].closetime["hour"] = e.target.value.toString()

                              setWorkerhours(newWorkerhours)
                            }} type="text" maxLength={2} value={info.closetime.hour}/>
                            <div onClick={() => updateWorkingHour(index, "hour", "down", false)}>
                              <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                          </div>
                          <div className="column">
                            <div className="selection-div">:</div>
                          </div>
                          <div className="selection">
                            <div onClick={() => updateWorkingHour(index, "minute", "up", false)}>
                              <FontAwesomeIcon icon={faArrowUp}/>
                            </div>
                            <input className="selection-header" onChange={(e) => {
                              const newWorkerhours = [...workerHours]

                              newWorkerhours[index].closetime["minute"] = e.target.value.toString()

                              setWorkerhours(newWorkerhours)
                            }} type="text" maxLength={2} value={info.closetime.minute}/>
                            <div onClick={() => updateWorkingHour(index, "minute", "down", false)}>
                              <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                          </div>
                          <div className="selection">
                            <div onClick={() => updateWorkingHour(index, "period", "up", false)}>
                              <FontAwesomeIcon icon={faArrowUp}/>
                            </div>
                            <div className="selection-header">{info.closetime.period}</div>
                            <div onClick={() => updateWorkingHour(index, "period", "down", false)}>
                              <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  : null
                ))}
              </div>
            }

            <div className="errormsg">{errorMsg}</div>
            
            <div id="submit" disabled={loading} onClick={() => !daysInfo.done ? setTime() : done()}>{!daysInfo.done ? "Next" : "Done"}</div>
          </div>
          :
          <div id="loading">
            <Loadingprogress/>
          </div>
      }

      <div id="bottom-navs">
        <div id="bottom-navs-row">
          <div className="bottom-nav" onClick={() => {
            localStorage.clear()

            window.location = "/auth"
          }}>Log-Out</div>
        </div>
      </div>

      {loading && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
