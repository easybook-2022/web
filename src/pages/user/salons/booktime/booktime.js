import './booktime.scss';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faArrowLeft, faArrowRight, faShoppingBasket, faHome } from '@fortawesome/fontawesome-free-solid'
import { socket, url, logo_url } from '../../../../userInfo'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getServiceInfo } from '../../../../apis/user/services'
import { getLocationHours, getDayHours } from '../../../../apis/user/locations'
import { getAllStylists, getStylistInfo, getAllWorkersTime, getWorkersHour } from '../../../../apis/user/owners'
import { getAppointmentInfo, makeAppointment } from '../../../../apis/user/schedules'
import { getNumCartItems } from '../../../../apis/user/carts'

// components
import Orders from '../../../../components/user/orders'

// widgets
import Userauth from '../../../../widgets/user/userauth'
import Loadingprogress from '../../../../widgets/loadingprogress';

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Booktime(props) {
  const params = useParams()
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 15)

  const { locationid, serviceid, serviceinfo } = params
  const scheduleid = params.scheduleid !== "null" ? params.scheduleid : null

  const [userId, setUserid] = useState(null)
  const [name, setName] = useState('')
  const [hoursInfo, setHoursinfo] = useState({})
  const [oldTime, setOldtime] = useState(0)
  const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0 })
  const [bookedDateinfo, setBookeddateinfo] = useState({ month: '', year: 0, day: '', date: 0, blocked: [] })
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ id: -1, hours: {}, loading: false })
  const [calendar, setCalendar] = useState({ firstDay: 0, numDays: 30, data: [
    { key: "day-row-0", row: [
        { key: "day-0-0", num: 0, passed: false, noservice: false }, { key: "day-0-1", num: 0, passed: false, noservice: false }, { key: "day-0-2", num: 0, passed: false, noservice: false }, 
        { key: "day-0-3", num: 0, passed: false, noservice: false }, { key: "day-0-4", num: 0, passed: false, noservice: false }, { key: "day-0-5", num: 0, passed: false, noservice: false }, 
        { key: "day-0-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-1", row: [
        { key: "day-1-0", num: 0, passed: false, noservice: false }, { key: "day-1-1", num: 0, passed: false, noservice: false }, { key: "day-1-2", num: 0, passed: false, noservice: false }, 
        { key: "day-1-3", num: 0, passed: false, noservice: false }, { key: "day-1-4", num: 0, passed: false, noservice: false }, { key: "day-1-5", num: 0, passed: false, noservice: false }, 
        { key: "day-1-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-2", row: [
        { key: "day-2-0", num: 0, passed: false, noservice: false }, { key: "day-2-1", num: 0, passed: false, noservice: false }, { key: "day-2-2", num: 0, passed: false, noservice: false }, 
        { key: "day-2-3", num: 0, passed: false, noservice: false }, { key: "day-2-4", num: 0, passed: false, noservice: false }, { key: "day-2-5", num: 0, passed: false, noservice: false }, 
        { key: "day-2-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-3", row: [
        { key: "day-3-0", num: 0, passed: false, noservice: false }, { key: "day-3-1", num: 0, passed: false, noservice: false }, { key: "day-3-2", num: 0, passed: false, noservice: false }, 
        { key: "day-3-3", num: 0, passed: false, noservice: false }, { key: "day-3-4", num: 0, passed: false, noservice: false }, { key: "day-3-5", num: 0, passed: false, noservice: false }, 
        { key: "day-3-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-4", row: [
        { key: "day-4-0", num: 0, passed: false, noservice: false }, { key: "day-4-1", num: 0, passed: false, noservice: false }, { key: "day-4-2", num: 0, passed: false, noservice: false }, 
        { key: "day-4-3", num: 0, passed: false, noservice: false }, { key: "day-4-4", num: 0, passed: false, noservice: false }, { key: "day-4-5", num: 0, passed: false, noservice: false }, 
        { key: "day-4-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-5", row: [
        { key: "day-5-0", num: 0, passed: false, noservice: false }, { key: "day-5-1", num: 0, passed: false, noservice: false }, { key: "day-5-2", num: 0, passed: false, noservice: false }, 
        { key: "day-5-3", num: 0, passed: false, noservice: false }, { key: "day-5-4", num: 0, passed: false, noservice: false }, { key: "day-5-5", num: 0, passed: false, noservice: false }, 
        { key: "day-5-6", num: 0, passed: false, noservice: false }
      ]}
  ], loading: false, errorMsg: "" })
  const [times, setTimes] = useState([])
  const [allStylists, setAllstylists] = useState({ stylists: [], numStylists: 0, ids: [] })
  const [allWorkerstime, setAllworkerstime] = useState({})
  const [scheduled, setScheduled] = useState({})
  const [loaded, setLoaded] = useState(false)

  const [step, setStep] = useState(0)
  const [numCartItems, setNumcartitems] = useState(0)
  
  const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, workerIds: [], note: "", requested: false, errormsg: "" })
  const [showTimetaken, setShowtimetaken] = useState({ show: false, time: '' })
  const [openCart, setOpencart] = useState(false)
  const [showAuth, setShowauth] = useState({ show: false, booking: false })
  
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
  const getTheServiceInfo = () => {
    getServiceInfo(serviceid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name } = res.serviceInfo

          setName(name)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheAppointmentInfo = (fetchBlocked) => {
    getAppointmentInfo(scheduleid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { locationId, name, time, worker, blocked } = res
          const unix = jsonDateToUnix(time)

          setName(name)
          setOldtime(unix)

          if (!fetchBlocked) setSelectedworkerinfo({ ...selectedWorkerinfo, id: worker.id })

          const prevTime = new Date(unix)

          blocked.forEach(function (info) {
            info["time"] = JSON.parse(info["time"])
            info["unix"] = jsonDateToUnix(info["time"])
          })

          setBookeddateinfo({ 
            ...bookedDateinfo, 
            month: months[prevTime.getMonth()],  
            day: days[prevTime.getDay()].substr(0, 3),
            year: prevTime.getFullYear(),
            date: prevTime.getDate(),
            blocked
          })
        }
      })
  }
  const getTheLocationHours = () => {
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
  const getCalendar = (month, year) => {
    let currTime = new Date(), currDate = 0, currDay = ''
    let firstDay = (new Date(year, month)).getDay(), numDays = 32 - new Date(year, month, 32).getDate(), daynum = 1
    let data = calendar.data, datetime = 0, hourInfo, closedtime, now = Date.parse(
      days[currTime.getDay()] + " " + 
      months[currTime.getMonth()] + " " + 
      currTime.getDate() + " " + 
      currTime.getFullYear()
    ), timeStr = ""

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        timeStr = days[dayindex] + " " + months[month] + " " + daynum + " " + year

        if (rowindex === 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(timeStr)

            day.passed = now > datetime
            day.noservice = selectedWorkerinfo.id > -1 ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
            :
            !(days[dayindex].substr(0, 3) in allWorkerstime)

            if (!day.noservice) {
              if (selectedWorkerinfo.id > -1 && days[dayindex].substr(0, 3) in selectedWorkerinfo.hours) {
                let timeInfo = selectedWorkerinfo.hours[days[dayindex].substr(0, 3)]

                day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))
              } else {
                let timeInfos = allWorkerstime[days[dayindex].substr(0, 3)]

                for (let k = 0; k < timeInfos.length; k++) {
                  let timeInfo = timeInfos[k]

                  day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))

                  if (!day.noservice) {
                    break;
                  }
                }
              }
            }
            
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(timeStr)

          day.passed = now > datetime
          day.noservice = selectedWorkerinfo.id > -1 ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
            :
            !(days[dayindex].substr(0, 3) in allWorkerstime)

          if (!day.noservice) {
            if (selectedWorkerinfo.id > -1 && days[dayindex].substr(0, 3) in selectedWorkerinfo.hours) {
              let timeInfo = selectedWorkerinfo.hours[days[dayindex].substr(0, 3)]

              day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))
            } else {
              let timeInfos = allWorkerstime[days[dayindex].substr(0, 3)]

              for (let k = 0; k < timeInfos.length; k++) {
                let timeInfo = timeInfos[k]

                day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))

                if (!day.noservice) {
                  break;
                }
              }
            }
          }

          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate === 0) {
          currDay = days[dayindex].substr(0, 3)

          if (currDay in hoursInfo) {
            hourInfo = hoursInfo[currDay]

            closedtime = Date.parse(timeStr + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
            now = Date.now()

            if (now < closedtime) {
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
      date: bookedDateinfo.date === 0 ? 
        currDate 
        : 
        bookedDateinfo.date < currDate ? currDate : bookedDateinfo.date,
      year 
    })
    setCalendar({ ...calendar, data, firstDay, numDays })
  }
  const getAllTheStylists = () => {
    getAllStylists(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists({ ...allStylists, stylists: res.owners, numStylists: res.numWorkers, ids: res.ids })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheWorkersTime = () => {
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
    const data = { locationid, ownerid: null }

    getWorkersHour(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res

          for (let worker in workersHour) {
            for (let info in workersHour[worker]) {
              if (info === "scheduled") {
                const newScheduled = {}

                for (let time in workersHour[worker]["scheduled"]) {
                  let splitInfo = info.split("-")
                  let time = splitInfo[0]
                  let status = splitInfo[1]

                  newScheduled[jsonDateToUnix(JSON.parse(time)) + "-" + worker + "-" + status] = workersHour[worker]["scheduled"][info]
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
    getStylistInfo(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setSelectedworkerinfo({ ...selectedWorkerinfo, id, hours: res.days })
          setStep(1)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const dateNavigate = (dir) => {
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
  const selectDate = () => {
    const { date, day, month, year } = selectedDateinfo, { blocked } = bookedDateinfo
    const { openHour, openMinute, closeHour, closeMinute } = hoursInfo[day]
    const numBlockTaken = scheduleid ? 1 + blocked.length : 0
    let start = openHour + ":" + openMinute
    let end = closeHour + ":" + closeMinute
    let timeStr = month + " " + date + " " + year + " "
    let openDateStr = Date.parse(timeStr + start), closeDateStr = Date.parse(timeStr + end), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

    while (calcDateStr < closeDateStr - pushtime) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"
      let timedisplay = (
        hour <= 12 ? 
          hour === 0 ? 12 : hour
          : 
          hour - 12
        ) 
        + ":" + 
        (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > calcDateStr
      let timetaken = false, timeBlocked = false

      if (selectedWorkerinfo.id > -1) { // worker is selected
        const workerid = selectedWorkerinfo.id

        if (calcDateStr + "-" + workerid + "-c" in scheduled[workerid]["scheduled"]) {
          timetaken = true
        }
      } else {
        let numWorkers = Object.keys(scheduled).length
        let occur = JSON.stringify(scheduled).split("\"" + calcDateStr + "-").length - 1

        timetaken = occur === numWorkers
      }

      let availableService = false, workerIds = []

      if (selectedWorkerinfo.id > -1 && day in selectedWorkerinfo.hours) {
        let startTime = selectedWorkerinfo.hours[day]["start"]
        let endTime = selectedWorkerinfo.hours[day]["end"]

        if (
          calcDateStr >= Date.parse(timeStr + startTime) 
          && 
          calcDateStr < Date.parse(timeStr + endTime)
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
              calcDateStr >= Date.parse(timeStr + startTime) 
              && 
              calcDateStr < Date.parse(timeStr + endTime)
            ) {              
              availableService = true
              workerIds.push(info.workerId)
            }
          })
        }
      }

      if (!timepassed && !timetaken && availableService === true) {
        let startCalc = calcDateStr

        for (let k = 1; k <= numBlockTaken; k++) {
          if (selectedWorkerinfo.id > -1) {
            let { start, end } = selectedWorkerinfo.hours[day]
            if (startCalc + "-" + selectedWorkerinfo.id + "-b" in scheduled[selectedWorkerinfo.id]["scheduled"]) { // time is blocked
              if (!JSON.stringify(blocked).includes("\"unix\":" + startCalc)) {
                timeBlocked = true
              }
            } else if (startCalc + "-" + selectedWorkerinfo.id + "-c" in scheduled[selectedWorkerinfo.id]["scheduled"]) { // time is taken
              timeBlocked = true
            } else if (startCalc >= Date.parse(timeStr + end)) { // stylist is off
              timeBlocked = true
            }
          }

          startCalc += pushtime
        }

        if (!timeBlocked) {
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
  const selectTime = info => {
    const { time, workerIds } = info

    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
  }
  const makeAnAppointment = id => {
    if (userId || id) {
      setConfirm(prev => ({ ...prev, loading: true }))
      setShowauth(prev => ({ ...prev, show: false }))

      const workerid = selectedWorkerinfo.id
      const { blocked } = bookedDateinfo
      const { note, workerIds, time } = confirm
      const selectedinfo = new Date(time)
      const day = days[selectedinfo.getDay()], month = months[selectedinfo.getMonth()], date = selectedinfo.getDate(), year = selectedinfo.getFullYear()
      const hour = selectedinfo.getHours(), minute = selectedinfo.getMinutes()
      const selecteddate = { day, month, date, year, hour, minute }

      blocked.forEach(function (info, index) {
        info["newTime"] = unixToJsonDate(time + (info["unix"] - oldTime))
        info["newUnix"] = (time + (info["unix"] - oldTime)).toString()
      })

      let data = { 
        id: scheduleid, // id for socket purpose (updating)
        userid: userId || id, 
        workerid: workerid > -1 ? workerid : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
        locationid, 
        serviceid: serviceid ? serviceid : -1, 
        serviceinfo: serviceinfo ? serviceinfo : name,
        time: selecteddate, note: note ? note : "", 
        timeDisplay: displayTime(selecteddate),
        type: scheduleid ? "remakeAppointment" : "makeAppointment",
        blocked, unix: time
      }

      makeAppointment(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { 
              ...data, 
              receiver: res.receiver, time, speak: res.speak, worker: res.speak.worker, 
            }

            socket.emit("socket/makeAppointment", data, () => {
              setConfirm({ ...confirm, show: true, requested: true, loading: false })

              setTimeout(function () {
                setConfirm({ ...confirm, show: false, requested: false })

                localStorage.setItem("openNotif", "true")
                window.location = "/main"
              }, 2000)
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data

            switch (status) {
              case "scheduleConflict":
                setConfirm({ errorMsg: "Unable to reschedule due to schedule conflict" })
                
                break;
              case "confirmed":
              case "blocked":
                // already taken, booking is late
                setShowtimetaken({ ...showTimetaken, show: true, time })

                setTimeout(function () {
                  setShowtimetaken({ ...showTimetaken, show: false })
                }, 2000)

                setConfirm({ ...confirm, show: false, requested: false })

                break;
              default:
                setConfirm({ errorMsg: errormsg })
            }
          }
        })
    } else {
      setConfirm(prev => ({ ...prev, show: false }))
      setShowauth(prev => ({ ...prev, show: true, booking: true }))
    }
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["day"] + " " + date["month"] + " " + date["date"] + " " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }
  const unixToJsonDate = unix => {
    const info = new Date(unix)

    return { 
      day: days[info.getDay()], month: months[info.getMonth()], 
      date: info.getDate(), year: info.getFullYear(), 
      hour: info.getHours(), minute: info.getMinutes() 
    }
  }

  useEffect(() => {
    getTheNumCartItems()
    getAllTheStylists()
    getTheLocationHours()
    getAllTheWorkersTime()

    if (serviceid !== 'null') getTheServiceInfo()
    if (scheduleid !== 'null') getTheAppointmentInfo()
  }, [])

  useEffect(() => {
    const currTime = new Date()

    if (oldTime === 0) {
      getCalendar(currTime.getMonth(), currTime.getFullYear())
    } else {
      const prevTime = new Date(oldTime)

      getCalendar(prevTime.getMonth(), prevTime.getFullYear())
    }
  }, [selectedWorkerinfo.hours])

  useEffect(() => {
    if (Object.keys(scheduled).length > 0) selectDate()
  }, [scheduled])

  return (
    <div id="user-booktime">
      <div id="box">
        <div id="headers">
          <div id="service-header">
            <div style={{ fontSize: wsize(5) }}>{scheduleid !== 'null' ? 'Rebook' : 'Book'} an appointment<br/>for </div>
            {name ? name : serviceinfo}
          </div>
        </div>

        {loaded ? 
          <>
            {step === 0 && (
              <div id="worker-selection">
                <div id="worker-selection-header">Pick a {scheduleid !== 'null' ? 'different' : ''} stylist (Optional)</div>
                
                <div id="workers-list">
                  {allStylists.stylists.map((item, index) => (
                    <div key={item.key} className="workers-row">
                      {item.row.map(info => (
                        info.id ? 
                          <div key={info.key} className="worker" style={{ backgroundColor: (selectedWorkerinfo.worker && selectedWorkerinfo.worker.id === info.id) ? 'rgba(0, 0, 0, 0.3)' : null, pointerEvents: selectedWorkerinfo.loading ? "none" : "" }} onClick={() => selectWorker(info.id)}>
                            <div className="worker-profile">
                              <img alt="" src={info.profile.name ? logo_url + info.profile.name : "/profilepicture.jpeg"} style={resizePhoto(info.profile, 70)}/>
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
                <div id="date-selection-header">Tap a {scheduleid !== 'null' ? 'different' : ''} date below</div>

                {!calendar.loading ? 
                  <>
                    <div id="date-headers">
                      <div className="column">
                        <div onClick={() => dateNavigate('left')}><FontAwesomeIcon icon={faArrowLeft} size="2x"/></div>
                      </div>
                      <div className="column">
                        <div id="date-header">{selectedDateinfo.month}, {selectedDateinfo.year}</div>
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
                                  <div key={day.key} className="day-touch" style={{ backgroundColor: 'black', color: 'white' }} onClick={() => {
                                    setSelecteddateinfo({ ...selectedDateinfo, date: day.num, day: days[dayindex].substr(0, 3) })
                                    getAllScheduledTimes()
                                  }}>{day.num}</div>
                                  :
                                  <div key={day.key} className="day-touch" onClick={() => {
                                    setSelecteddateinfo({ ...selectedDateinfo, date: day.num, day: days[dayindex].substr(0, 3) })
                                    getAllScheduledTimes()
                                  }}>{day.num}</div>
                              :
                              <div key={"calendar-header-" + rowindex + "-" + dayindex} className="day-touch-disabled"></div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="errormsg">{calendar.errorMsg}</div>
                  </>
                  :
                  <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
                }
              </div>
            )}

            {step === 2 && (
              <div id="times-selection">
                <div id="times-header" style="font-size: 15px;">{scheduleid !== 'null' && 'Current: ' + displayTime(oldTime)}</div>
                <div id="times-header">Tap a {scheduleid !== 'null' ? 'different' : ''} time below</div>

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
                    window.location = "/"

                    break;
                  default:
                }

                setStep(step - 1)
              }}>Back</div>

              {(step === 0 || step === 1) && (
                <>
                  {step === 0 && (
                    <>
                      <div className="action" onClick={() => {
                        if (allStylists.numStylists === 1) {
                          selectWorker(allStylists.ids[0])
                        } else {
                          setSelectedworkerinfo({ ...selectedWorkerinfo, id: -1, hours: {} })
                        }

                        setStep(1)
                      }}>{allStylists.numStylists === 1 ? 'Next' : 'Pick Random'}</div>

                      {selectedWorkerinfo.id > -1 && allStylists.numStylists > 1 && (
                        <div className="action" onClick={() => selectWorker(selectedWorkerinfo.id)}>Next</div>
                      )}
                    </>
                  )}

                  {step === 1 && (
                    <div className="action" onClick={() => {
                      getTheAppointmentInfo(true)
                      getAllScheduledTimes()
                    }}>Next</div>
                  )}
                </>
              )}
            </div>
          </>
          :
          <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
        }

        <div id="bottom-navs">
          <div id="bottom-navs-row">
            {userId && (
              <div className="column">
                <div className="bottom-nav" onClick={() => setOpencart(true)}>
                  <FontAwesomeIcon icon={faShoppingBasket} size="2x"/>
                  {numCartItems > 0 && <div id="num-cart-items-header">{numCartItems}</div>}
                </div>
              </div>
            )}

            <div className="column">
              <div className="bottom-nav" onClick={() => window.location = "/"}><FontAwesomeIcon icon={faHome} size="2x"/></div>
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
      </div>

      {confirm.show && (
        <div id="hidden-box">
          <div id="confirm-box">
            <div id="confirm-container">
              {!confirm.requested ? 
                <>
                  {oldTime === 0 ? 
                    <div id="confirm-header">
                      <div style="font-family: chilanka_400regular">Make an appointment for</div>
                      {confirm.service}<br/>
                      {displayTime(confirm.time)}<br/>
                    </div>
                    :
                    <div id="confirm-header">
                      Change appointment<br/>
                      {confirm.service}<br/>
                      to<br/>
                      {displayTime(confirm.time)}
                    </div>
                  }

                  <div id="note">
                    <textarea
                      id="note-input" 
                      placeholdertextcolor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                      maxLength={100} onChange={e => setConfirm({ ...confirm, note: e.target.value })}
                    />
                  </div>

                  {confirm.errormsg ? <div className="errormsg">You already made an appointment for this service</div> : null}

                  <div style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <div id="confirm-options">
                      <div className="confirm-option" style={{ opacity: confirm.loading ? 0.3 : 1, pointerEvents: confirm.loading ? "none" : "" }} onClick={() => setConfirm({ ...confirm, show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })}>No</div>
                      <div className="confirm-option" style={{ opacity: confirm.loading ? 0.3 : 1, pointerEvents: confirm.loading ? "none" : "" }} onClick={() => makeAnAppointment()}>Yes</div>
                    </div>
                  </div>

                  {confirm.loading && <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>}
                </>
                :
                <div id="requested-headers">
                  <div id="requested-header">Appointment made for<br/></div>
                  <div id="requested-header-info">{confirm.service}<br/>{displayTime(confirm.time)}</div>
                </div>
              }
            </div>
          </div>
        </div>
      )}
      {showTimetaken.show && (
        <div id="time-taken-box">
          <div id="time-taken-container">
            <div id="time-taken-header">{displayTime(showTimetaken.time)} has already been taken</div>
          </div>
        </div>
      )}
      {openCart && <div id="hidden-box"><Orders close={() => {
        getTheNumCartItems()
        setOpencart(false)
      }}/></div>}
      {showAuth.show && (
        <div id="hidden-box">
          <Userauth close={() => setShowauth({ ...showAuth, show: false })} done={id => {
            socket.emit("socket/user/login", "user" + id, () => {
              setUserid(id)

              if (showAuth.booking === true) {
                makeAnAppointment(id)
              } else {
                setShowauth(prev => ({ ...prev, show: false }))
              }
            })
          }}/>
        </div>
      )}
      {selectedWorkerinfo.loading && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
