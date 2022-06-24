import './booktime.scss';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faArrowLeft, faArrowRight, faShoppingBasket, faHome } from '@fortawesome/fontawesome-free-solid'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { socket, logo_url } from '../../../businessInfo'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getLocationHours } from '../../../apis/business/locations'
import { getAllStylists, getStylistInfo, getAllWorkersTime, getWorkersHour, logoutUser } from '../../../apis/business/owners'
import { getAppointmentInfo, salonChangeAppointment } from '../../../apis/business/schedules'

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Booktime(props) {
  const params = useParams()
  const { scheduleid, serviceid, serviceinfo } = params
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 15)

  const [clientInfo, setClientinfo] = useState({ id: -1, name: "" })
  const [name, setName] = useState()
  const [hoursInfo, setHoursinfo] = useState({})
  const [oldTime, setOldtime] = useState(0)
  const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0, time: 0 })
  const [bookedDateinfo, setBookeddateinfo] = useState({ month: '', year: 0, day: '', date: 0 })
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ worker: null, workers: [], numWorkers: 0, loading: false })
  const [calendar, setCalendar] = useState({ firstDay: 0, numDays: 30, data: [
    { key: "day-row-0", row: [
        { key: "day-0-0", num: 0, passed: false }, { key: "day-0-1", num: 0, passed: false }, { key: "day-0-2", num: 0, passed: false }, 
        { key: "day-0-3", num: 0, passed: false }, { key: "day-0-4", num: 0, passed: false }, { key: "day-0-5", num: 0, passed: false }, 
        { key: "day-0-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-1", row: [
        { key: "day-1-0", num: 0, passed: false }, { key: "day-1-1", num: 0, passed: false }, { key: "day-1-2", num: 0, passed: false }, 
        { key: "day-1-3", num: 0, passed: false }, { key: "day-1-4", num: 0, passed: false }, { key: "day-1-5", num: 0, passed: false }, 
        { key: "day-1-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-2", row: [
        { key: "day-2-0", num: 0, passed: false }, { key: "day-2-1", num: 0, passed: false }, { key: "day-2-2", num: 0, passed: false }, 
        { key: "day-2-3", num: 0, passed: false }, { key: "day-2-4", num: 0, passed: false }, { key: "day-2-5", num: 0, passed: false }, 
        { key: "day-2-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-3", row: [
        { key: "day-3-0", num: 0, passed: false }, { key: "day-3-1", num: 0, passed: false }, { key: "day-3-2", num: 0, passed: false }, 
        { key: "day-3-3", num: 0, passed: false }, { key: "day-3-4", num: 0, passed: false }, { key: "day-3-5", num: 0, passed: false }, 
        { key: "day-3-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-4", row: [
        { key: "day-4-0", num: 0, passed: false }, { key: "day-4-1", num: 0, passed: false }, { key: "day-4-2", num: 0, passed: false }, 
        { key: "day-4-3", num: 0, passed: false }, { key: "day-4-4", num: 0, passed: false }, { key: "day-4-5", num: 0, passed: false }, 
        { key: "day-4-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-5", row: [
        { key: "day-5-0", num: 0, passed: false }, { key: "day-5-1", num: 0, passed: false }, { key: "day-5-2", num: 0, passed: false }, 
        { key: "day-5-3", num: 0, passed: false }, { key: "day-5-4", num: 0, passed: false }, { key: "day-5-5", num: 0, passed: false }, 
        { key: "day-5-6", num: 0, passed: false }
      ]}
  ], errorMsg: "" })
  const [times, setTimes] = useState([])
  const [allStylists, setAllstylists] = useState({ stylists: [], numStylists: 0 })
  const [allWorkerstime, setAllworkerstime] = useState({})
  const [scheduled, setScheduled] = useState({})
  const [loaded, setLoaded] = useState(false)

  const [step, setStep] = useState(0)
  const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, workerIds: [], note: "", requested: false, errormsg: "" })

  const getTheAppointmentInfo = () => {
    getAppointmentInfo(scheduleid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { client, locationId, name, time, worker } = res
          const unix = jsonDateToUnix(time)

          setClientinfo({ ...clientInfo, ...client })
          setName(name)
          setOldtime(unix)
          setSelectedworkerinfo({ ...selectedWorkerinfo, id: worker.id })

          const prevTime = new Date(unix)

          setBookeddateinfo({ 
            ...bookedDateinfo, 
            month: months[prevTime.getMonth()],  
            day: days[prevTime.getDay()].substr(0, 3),
            year: prevTime.getFullYear(),
            date: prevTime.getDate()
          })

          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getCalendar = (month, year) => {
    let currTime = new Date(), currDate = 0, currDay = ''
    let firstDay = (new Date(year, month)).getDay(), numDays = 32 - new Date(year, month, 32).getDate(), daynum = 1
    let data = calendar.data, datetime = 0, hourInfo, current, now = Date.parse(
      days[currTime.getDay()] + " " + 
      months[currTime.getMonth()] + " " + 
      currTime.getDate() + " " + 
      currTime.getFullYear()
    )

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        if (rowindex === 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

            day.passed = now > datetime
            day.noservice = selectedWorkerinfo.id > -1 ? 
              !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
              :
              !(days[dayindex].substr(0, 3) in allWorkerstime)
            
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

          day.passed = now > datetime
          day.noservice = selectedWorkerinfo.id > -1 ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
            :
            !(days[dayindex].substr(0, 3) in allWorkerstime)
          
          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate === 0) {
          currDay = days[dayindex].substr(0, 3)

          if (currDay in hoursInfo) {
            hourInfo = hoursInfo[currDay]

            current = Date.parse(days[dayindex] + " " + months[month] + ", " + day.num + " " + year + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
            now = Date.now()

            if (now < current) {
              currDate = day.num
            } else {
              day.passed = true
            }
          } else {
            day.noservice = true
          }
        }
      })
    })

    setSelecteddateinfo({ 
      ...selectedDateinfo, 
      month: months[month], day: currDay, 
      date: bookedDateinfo.date == 0 ? currDate : bookedDateinfo.date, 
      year 
    })
    setCalendar({ ...calendar, firstDay, numDays, data })
  }
  const selectDate = (date, day) => {
    const { month, year } = selectedDateinfo
    const { openHour, openMinute, closeHour, closeMinute } = hoursInfo[day]
    let start = day in allWorkerstime ? allWorkerstime[day][0]["start"] : openHour + ":" + openMinute
    let end = day in allWorkerstime ? allWorkerstime[day][0]["end"] : closeHour + ":" + closeMinute
    let openStr = month + " " + date + ", " + year + " " + start
    let closeStr = month + " " + date + ", " + year + " " + end
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

    while (calcDateStr < (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"
      let timedisplay = (
        hour <= 12 ? 
          (hour === 0 ? 12 : hour) 
          : 
          hour - 12
        ) 
        + ":" + 
        (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > calcDateStr
      let timetaken = false

      if (selectedWorkerinfo.id > -1) { // worker is selected
        const workerid = selectedWorkerinfo.id

        timetaken = JSON.stringify(scheduled).includes("\"" + calcDateStr + "\":" + workerid)
      } else {
        let numWorkers = Object.keys(scheduled).length
        let occur = JSON.stringify(scheduled).split("\"" + calcDateStr + "\":").length - 1

        timetaken = occur == numWorkers
      }

      let availableService = false, workerIds = []

      if (selectedWorkerinfo.id > -1 && day in selectedWorkerinfo.hours) {
        let startTime = selectedWorkerinfo.hours[day]["start"]
        let endTime = selectedWorkerinfo.hours[day]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.hours[day]["workerId"]]
        }
      } else {
        if (day in allWorkerstime) {
          let times = allWorkerstime[day]
          let startTime = "", endTime = ""

          times.forEach(function (info) {
            startTime = info.start
            endTime = info.end

            if (
              calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
              && 
              calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
            ) {              
              availableService = true
              workerIds.push(info.workerId)
            }
          })
        }
      }

      if (!timepassed && !timetaken && availableService === true) {
        timesRow.push({
          key: timesNum.toString(), header: timedisplay, 
          time: calcDateStr, workerIds
        })
        timesNum++

        if (timesRow.length === 3) {
          newTimes.push({ key: newTimes.length, row: timesRow })
          timesRow = []
        }
      }
    }

    if (timesRow.length > 0) {
      for (let k = 0; k < (3 - timesRow.length); k++) {
        timesRow.push({ key: timesNum.toString() })
      }

      newTimes.push({ key: newTimes.length, row: timesRow })
    }

    setSelecteddateinfo({ ...selectedDateinfo, date, day })
    setTimes(newTimes)
    setStep(2)
  }
  const getTheLocationHours = time => {
    const locationid = localStorage.getItem("locationid")

    getLocationHours(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { hours } = res

          setHoursinfo(hours)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheStylists = () => {
    const locationid = localStorage.getItem("locationid")

    getAllStylists(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists({ ...allStylists, stylists: res.owners, numStylists: res.numWorkers })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheWorkersTime = () => {
    const locationid = localStorage.getItem("locationid")

    getAllWorkersTime(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllworkerstime(res.workers)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllScheduledTimes = () => {
    const locationid = localStorage.getItem("locationid")
    const data = { locationid, ownerid: null }

    getWorkersHour(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res

          for (let worker in workersHour) {
            for (let info in workersHour[worker]) {
              if (info == "scheduled") {
                const newScheduled = {}

                for (let info in workersHour[worker]["scheduled"]) {
                  let splitTime = info.split("-")
                  let time = splitTime[0]
                  let status = splitTime[1]

                  newScheduled[jsonDateToUnix(JSON.parse(time))] = workersHour[worker]["scheduled"][info]
                }

                workersHour[worker]["scheduled"] = newScheduled
              }
            }
          }

          setScheduled(workersHour)
        }
      })
  }
  const selectWorker = id => {
    const workingDays = {}

    for (let day in allWorkerstime) {
      allWorkerstime[day].forEach(function (workerInfo) {
        const { workerId, start, end } = workerInfo

        if (workerId == id) {
          workingDays[day] = { start, end }
        }
      })
    }

    allStylists.stylists.forEach(function (item) {
      item.row.forEach(function (worker) {
        if (worker.id == id) {
          setSelectedworkerinfo({ ...selectedWorkerinfo, id, hours: workingDays })
          setStep(1)
        }
      })
    })
  }
  const dateNavigate = dir => {
    const currTime = new Date(Date.now())
    const currDay = days[currTime.getDay()]
    const currMonth = months[currTime.getMonth()]

    let month = months.indexOf(selectedDateinfo.month), year = selectedDateinfo.year

    month = dir === 'left' ? month - 1 : month + 1

    if (month < 0) {
      month = 11
      year--
    } else if (month > 11) {
      month = 0
      year++
    }

    getCalendar(month, year)
  }
  const selectTime = info => {
    const { time, workerIds } = info

    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
  }
  const salonChangeTheAppointment = () => {
    setConfirm({ ...confirm, loading: true })

    const locationid = localStorage.getItem("locationid")
    const workerid = selectedWorkerinfo.id
    const { note, workerIds, time } = confirm
    const selectedinfo = new Date(time)
    const day = days[selectedinfo.getDay()], month = months[selectedinfo.getMonth()], date = selectedinfo.getDate(), year = selectedinfo.getFullYear()
    const hour = selectedinfo.getHours(), minute = selectedinfo.getMinutes()
    const selecteddate = JSON.stringify({ day, month, date, year, hour, minute })
    let data = { 
      id: scheduleid, // id for socket purpose (updating)
      clientid: clientInfo.id, 
      workerid: workerid > -1 ? workerid : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
      locationid, 
      serviceid: serviceid != "null" ? serviceid : -1, 
      serviceinfo: serviceinfo ? serviceinfo : "",
      time: selecteddate, note: note ? note : "", 
      type: "salonChangeAppointment",
      timeDisplay: displayTime({ day, month, date, year, hour, minute })
    }

    salonChangeAppointment(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          if (res.receiver) {
            data = { ...data, receiver: res.receiver, time, worker: res.worker }

            socket.emit("socket/salonChangeAppointment", data, () => {
              setConfirm({ ...confirm, requested: true, loading: false })

              setTimeout(function () {
                setConfirm({ ...confirm, show: false, requested: false })

                setTimeout(function () {
                  window.location = "/main"
                }, 1000)
              }, 2000)
            })
          } else {
            setConfirm({ ...confirm, requested: true, loading: false })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false, requested: false })

              setTimeout(function () {
                window.location = "/main"
              }, 1000)
            }, 2000)
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setConfirm({ ...confirm, errorMsg: errormsg })
        }
      })
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["day"] + " " + date["month"] + " " + date["date"] + " " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }

  const logout = () => {
    const ownerid = localStorage.getItem("ownerid")

    logoutUser(ownerid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/business/logout", ownerid, () => {
            localStorage.clear()

            window.location = "/auth"
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  useEffect(() => {
    getAllTheStylists()
    getTheLocationHours()
    getAllTheWorkersTime()
    getTheAppointmentInfo()
  }, [])

  useEffect(() => {
    const prevTime = new Date(oldTime)
      
    getCalendar(prevTime.getMonth(), prevTime.getFullYear())
  }, [selectedWorkerinfo.hours])

  return (
    <div id="business-booktime">
      <div id="box">
        <div id="headers">
          <div id="service-header">
            <div style={{ fontSize: wsize(5) }}>{scheduleid !== 'null' ? 'Rebook' : 'Book'}<br/>for </div>
            {name ? name : serviceinfo}
          </div>
        </div>

        {loaded ? 
          <>
            {step === 0 && (
              <div id="worker-selection">
                <div id="worker-selection-header">Pick a stylist (Optional)</div>
                
                <div id="workers-list">
                  {allStylists.stylists.map((item, index) => (
                    <div key={item.key} className="workers-row">
                      {item.row.map(info => (
                        info.id ? 
                          <div key={info.key} className="worker" style={{ backgroundColor: (selectedWorkerinfo.id === info.id) ? 'rgba(0, 0, 0, 0.3)' : null, pointerEvents: selectedWorkerinfo.loading ? "none" : "" }} onClick={() => selectWorker(info.id)}>
                            <div className="worker-profile">
                              <img 
                                alt="" 
                                src={info.profile.name ? logo_url + info.profile.name : "/profilepicture.jpg"} 
                                style={resizePhoto(info.profile, 70)}
                              />
                            </div>
                            <div className="worker-header">{info.username}</div>
                          </div>
                          :
                          <div key={info.key} className="worker"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step === 1 && (
              <div id="date-selection">
                <div id="date-selection-header">Tap a {'\ndifferent'} date below</div>

                {!calendar.loading && ( 
                  <>
                    <div id="date-headers">
                      <div className="column">
                        <div onClick={() => dateNavigate('left')}><FontAwesomeIcon icon={faArrowLeft} size="2x"/></div>
                      </div>
                      <div className="column">
                        <div className="date-header">{selectedDateinfo.month}, {selectedDateinfo.year}</div>
                      </div>
                      <div className="column">
                        <div onClick={() => dateNavigate('right')}><FontAwesomeIcon icon={faArrowRight} size="2x"/></div>
                      </div>
                    </div>
                    <div id="days">
                      <div id="days-header-row">
                        {days.map((day, index) => <div key={"day-header-" + index} className="days-header">{day.substr(0, 3)}</div>)}
                      </div>
                      {calendar.data.map((info, rowindex) => (
                        <div key={info.key} className="days-data-row">
                          {info.row.map((day, dayindex) => (
                            day.num > 0 ? 
                              day.passed || day.noservice ? 
                                day.passed ? 
                                  <div key={day.key} className="day-touch" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', pointerEvents: "none" }}>{day.num}</div>
                                  :
                                  <div key={day.key} className="day-touch" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', pointerEvents: "none" }}>{day.num}</div>
                                :
                                selectedDateinfo.date === day.num ? 
                                  <div key={day.key} className="day-touch" style={{ backgroundColor: 'black', color: 'white' }} onClick={() => selectDate(day.num, days[dayindex].substr(0, 3))}>{day.num}</div>
                                  :
                                  <div key={day.key} className="day-touch" onClick={() => selectDate(day.num, days[dayindex].substr(0, 3))}>{day.num}</div>
                              :
                              <div key={"calendar-header-" + rowindex + "-" + dayindex} className="day-touch-disabled"></div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="errormsg">{calendar.errorMsg}</div>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div id="times-selection">
                <div id="times-header">Tap a time below</div>

                <div id="times">
                  {times.map(info => (
                    <div key={info.key} className="times-row">
                      {info.row.map(item => (
                        item.header ? 
                          <div key={item.key} className="unselect" onClick={() => selectTime(item)}>{item.header}</div>
                          :
                          <div key={item.key} className="unselect" style={{ borderColor: 'transparent' }}></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div id="actions">
              <div className="action" onClick={() => {
                switch (step) {
                  case 0:
                    window.location = "/main"

                    break;
                  default:
                }

                setStep(step - 1)
              }}>Back</div>

              {(step === 0 || step == 1) && (
                step === 0 ? 
                  selectedWorkerinfo.id > -1 ? 
                    <div className="action" onClick={() => selectWorker(selectedWorkerinfo.id)}>Next</div>
                    :
                    <div className="action" onClick={() => {
                      getTheLocationHours()
                      setSelectedworkerinfo({ ...selectedWorkerinfo, id: -1, hours: {} })
                      setStep(1)
                    }}>Skip</div>
                  :
                  <div className="action" onClick={() => {
                    const { day, date } = selectedDateinfo

                    selectDate(date, day)
                  }}>Pick today</div>
              )}
            </div>
          </>
          :
          <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
        }

        <div id="bottom-navs">
          <div id="bottom-navs-row">
            <div className="column">
              <div className="bottom-nav" onClick={() => window.location = "/main"}><FontAwesomeIcon icon={faHome}/></div>
            </div>
            <div className="column">
              <div className="bottom-nav" onClick={() => logout()}>Log-Out</div>
            </div>
          </div>
        </div>
      </div>

      {confirm.show && (
        <div id="hidden-box">
          <div id="confirm-box">
            <div id="confirm-container">
              {!confirm.requested ? 
                <>
                  <div id="confirm-header">
                    Name: {clientInfo.name}<br/>
                    Service: {confirm.service}<br/>
                    Change time to<br/>
                    {displayTime(confirm.time)}
                  </div>

                  <div id="note">
                    <textarea
                      id="note-input" 
                      placeholdertextcolor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                      maxLength={100} onChange={e => setConfirm({ ...confirm, note: e.target.value })}
                    />
                  </div>

                  <div style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <div id="confirm-options">
                      <div className="confirm-option" style={{ opacity: confirm.loading ? 0.3 : 1, pointerEvents: confirm.loading ? "none" : "" }} onClick={() => setConfirm({ ...confirm, show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })}>No</div>
                      <div className="confirm-option" style={{ opacity: confirm.loading ? 0.3 : 1, pointerEvents: confirm.loading ? "none" : "" }} onClick={() => salonChangeTheAppointment()}>Yes</div>
                    </div>
                  </div>

                  {confirm.loading && <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>}
                </>
                :
                <div id="requested-headers">
                  <div id="requested-header">Appointment changed for<br/></div>
                  <div id="requested-header-info">
                    {confirm.service}<br/>{displayTime(confirm.time)}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}