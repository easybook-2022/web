import './booktime.scss';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faArrowLeft, faArrowRight, faShoppingBasket, faHome } from '@fortawesome/fontawesome-free-solid'
import { socket, url, logo_url } from '../../../../userInfo'
import { displayTime, resizePhoto } from 'geottuse-tools'
import { getServiceInfo } from '../../../../apis/user/services'
import { getLocationHours } from '../../../../apis/user/locations'
import { getWorkers, getWorkerInfo, getAllWorkersTime } from '../../../../apis/user/owners'
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
  const { locationid, serviceid, serviceinfo } = params
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 15)

  const scheduleid = params.scheduleid !== "null" ? params.scheduleid : null

  const [name, setName] = useState()
  const [allWorkers, setAllworkers] = useState({})
  const [scheduledTimes, setScheduledtimes] = useState([])
  const [oldTime, setOldtime] = useState(0)
  const [openTime, setOpentime] = useState({ hour: 0, minute: 0 })
  const [closeTime, setClosetime] = useState({ hour: 0, minute: 0 })
  const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0, time: 0 })
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
  ], loading: false, errorMsg: "" })
  const [userId, setUserid] = useState(null)
  const [times, setTimes] = useState([])
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ worker: null, workers: [], numWorkers: 0, loading: false })
  const [loaded, setLoaded] = useState(false)
  const [showAuth, setShowauth] = useState({ show: false, booking: false })
  const [step, setStep] = useState(0)

  const [openOrders, setOpenorders] = useState(false)
  const [numCartItems, setNumcartitems] = useState(0)
  const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, workerIds: [], note: "", requested: false, errormsg: "" })

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
  const getTheAppointmentInfo = () => {
    getAppointmentInfo(scheduleid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { locationId, name, time, worker } = res.appointmentInfo

          const { day, month, date, year, hour, minute } = time
          const unixtime = Date.parse(day + " " + month + " " + date + " " + year + " " + hour + ":" + minute)

          setName(name)
          setOldtime(unixtime)
          setSelectedworkerinfo(prev => ({ ...prev, worker }))
          getTheLocationHours(time)
        }
      })
  }
  const getCalendar = (month, year) => {
    let currTime = new Date(), currDate = 0, currDay = ''
    let datenow = Date.parse(days[currTime.getDay()] + " " + months[currTime.getMonth()] + " " + currTime.getDate() + " " + year)
    let firstDay = (new Date(year, month)).getDay(), numDays = 32 - new Date(year, month, 32).getDate(), daynum = 1
    let data = calendar.data, datetime = 0

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        if (rowindex === 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

            day.passed = datenow > datetime

            day.noservice = selectedWorkerinfo.worker != null ? 
              !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
              :
              !(days[dayindex].substr(0, 3) in allWorkers)
            
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

          day.passed = datenow > datetime

          day.noservice = selectedWorkerinfo.worker != null ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
            :
            !(days[dayindex].substr(0, 3) in allWorkers)
          
          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate == 0) {
          currDate = day.num
          currDay = days[dayindex]
        }
      })
    })

    setCalendar({ firstDay, numDays, data, loading: false })

    return { currDate, currDay }
  }
  const getTimes = () => {
    const { month, day, date, year } = selectedDateinfo
    let start = day in allWorkers ? allWorkers[day][0]["start"] : openTime.hour + ":" + openTime.minute
    let end = day in allWorkers ? allWorkers[day][0]["end"] : closeTime.hour + ":" + closeTime.minute
    let openStr = month + " " + date + ", " + year + " " + start
    let closeStr = month + " " + date + ", " + year + " " + end
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0, firstTime = true

    while (calcDateStr < (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"

      let timedisplay = (
        hour <= 12 ? 
          (hour == 0 ? 12 : hour) 
          : 
          hour - 12
        ) 
        + ":" + 
        (minute < 10 ? '0' + minute : minute) + " " + period

      let timepassed = currenttime > calcDateStr
      let timetaken = scheduledTimes.indexOf(calcDateStr) > -1
      let availableService = false, workerIds = []

      if (selectedWorkerinfo.worker != null && day.substr(0, 3) in selectedWorkerinfo.worker.days) {
        let startTime = selectedWorkerinfo.worker.days[day.substr(0, 3)]["start"]
        let endTime = selectedWorkerinfo.worker.days[day.substr(0, 3)]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.worker.days[day.substr(0, 3)]["workerId"]]
        }
      } else {
        if (day.substr(0, 3) in allWorkers) {
          let times = allWorkers[day.substr(0, 3)]
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

      if (!timepassed && !timetaken && availableService == true) {
        timesRow.push({
          key: timesNum.toString(), header: timedisplay, 
          time: calcDateStr, workerIds
        })
        timesNum++

        if (timesRow.length == 3) {
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

    setTimes(newTimes)
  }
  const getTheLocationHours = async(time) => {
    const day = selectedDateinfo.day ? selectedDateinfo.day : new Date(Date.now()).toString().split(" ")[0]
    const data = { locationid, day: day.substr(0, 3) }

    setCalendar({ ...calendar, loading: true })

    getLocationHours(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { openTime, closeTime, scheduled } = res

          let openHour = openTime.hour, openMinute = openTime.minute, openPeriod = openTime.period
          let closeHour = closeTime.hour, closeMinute = closeTime.minute, closePeriod = closeTime.period

          const currTime = new Date(Date.now())
          const currMonth = months[currTime.getMonth()]

          let selectedTime = time > 0 ? new Date(time) : null
          let selectedDay = null, selectedDate = null, selectedMonth = null

          let { currDate, currDay } = getCalendar(currTime.getMonth(), currTime.getFullYear())

          if (selectedTime) {
            selectedDay = days[selectedTime.getDay()]
            selectedDate = selectedTime.getDate()
            selectedMonth = months[selectedTime.getMonth()]

            getCalendar(selectedTime.getMonth(), selectedTime.getFullYear())
            setSelecteddateinfo({ month: selectedMonth, year: selectedTime.getFullYear(), day: selectedDay.substr(0, 3), date: selectedDate, time: 0 })
          } else {
            setSelecteddateinfo({
              month: currMonth, year: currTime.getFullYear(), day: currDay.substr(0, 3),
              date: currDate,
              time: 0
            })
          }

          setScheduledtimes(scheduled)
          setOpentime({ hour: openHour, minute: openMinute })
          setClosetime({ hour: closeHour, minute: closeMinute })
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheWorkers = () => {
    getWorkers(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setSelectedworkerinfo(prev => ({ ...prev, workers: res.owners, numWorkers: res.numWorkers, loading: false }))
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
          setAllworkers(res.workers)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const selectWorker = id => {
    setSelectedworkerinfo({ ...selectedWorkerinfo, loading: true })

    let workerinfo

    getWorkerInfo(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          selectedWorkerinfo.workers.forEach(function (item) {
            item.row.forEach(function (worker) {
              if (worker.id === id) {
                workerinfo = {...worker, days: res.days }

                setSelectedworkerinfo({ ...selectedWorkerinfo, worker: workerinfo, loading: false })
              }
            })
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const dateNavigate = (dir) => {
    setLoaded(false)

    const currTime = new Date(Date.now())
    const currDay = days[currTime.getDay()]
    let currDate = 0
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

    let firstDay, numDays, daynum = 1, data = calendar.data, datetime
    let datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())
    let date = month === currTime.getMonth() && year === currTime.getFullYear() ? currTime.getDate() : 1
    let openStr = months[month] + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = months[month] + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

    firstDay = (new Date(year, month)).getDay()
    numDays = 32 - new Date(year, month, 32).getDate()

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        if (rowindex === 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

            day.passed = datenow > datetime

            if (selectedWorkerinfo.worker !== null) {
              day.noservice = !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
            } else {
              day.noservice = !(days[dayindex].substr(0, 3) in allWorkers)
            }

            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

          day.passed = datenow > datetime

          if (selectedWorkerinfo.worker !== null) {
            day.noservice = !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
          } else {
            day.noservice = !(days[dayindex].substr(0, 3) in allWorkers)
          }

          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate == 0) {
          currDate = day.num
        }
      })
    })

    while (calcDateStr < (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"
      
      let timepassed = currenttime > calcDateStr
      let timetaken = scheduledTimes.indexOf(calcDateStr) > -1
      let availableService = false
      let timedisplay = "", workerIds = []

      if (selectedWorkerinfo.worker !== null && currDay.substr(0, 3) in selectedWorkerinfo.worker.days) {
        let startTime = selectedWorkerinfo.worker.days[currDay.substr(0, 3)]["start"]
        let endTime = selectedWorkerinfo.worker.days[currDay.substr(0, 3)]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.worker.days[currDay.substr(0, 3)]["workerId"]]
        }
      } else {
        if (currDay.substr(0, 3) in allWorkers) {
          let times = allWorkers[currDay.substr(0, 3)]
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
        timedisplay = (hour <= 12 ? (hour === 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period

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
      while (timesRow.length < 3) {
        timesRow.push({ key: timesNum.toString() })
        timesNum++
      }

      newTimes.push({ key: newTimes.length, row: timesRow })
    }

    setSelecteddateinfo({ ...selectedDateinfo, month: months[month], year })
    setCalendar({ firstDay, numDays, data })
    setTimes(newTimes)
    setLoaded(true)
  }
  const selectDate = async(date) => {
    const { month, year } = selectedDateinfo

    let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), day = new Date(openDateStr).toString().split(" ")[0]

    setSelecteddateinfo({ ...selectedDateinfo, date, day: day.substr(0, 3) })
    getAllTheWorkersTime()
  }
  const selectTime = (name, timeheader, time, workerIds) => {
    const { month, date, year } = selectedDateinfo

    setSelecteddateinfo({ ...selectedDateinfo, name, time })
    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
  }
  const makeAnAppointment = id => {
    if (userId || id) {
      setConfirm({ ...confirm, loading: true })
      setShowauth({ ...showAuth, show: false })

      const { time } = selectedDateinfo
      const { worker } = selectedWorkerinfo
      const { note, workerIds } = confirm
      const selectedinfo = new Date(time)
      const day = days[selectedinfo.getDay()], month = months[selectedinfo.getMonth()], date = selectedinfo.getDate(), year = selectedinfo.getFullYear()
      const hour = selectedinfo.getHours(), minute = selectedinfo.getMinutes()
      const selecteddate = JSON.stringify({ day, month, date, year, hour, minute })
      let data = { 
        id: scheduleid, // id for socket purpose (updating)
        userid: userId || id, 
        workerid: worker !== null ? worker.id : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
        locationid, 
        serviceid: serviceid !== 'null' ? serviceid : -1, 
        serviceinfo: serviceinfo ? serviceinfo : name,
        oldtime: oldTime, 
        time: selecteddate, note: note ? note : "", 
        type: scheduleid ? "remakeAppointment" : "makeAppointment",
        timeDisplay: displayTime({ day, month, date, year, hour, minute })
      }

      makeAppointment(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { ...data, receiver: res.receiver, time: JSON.parse(selecteddate), speak: res.speak }
            socket.emit("socket/makeAppointment", data, () => {
              setConfirm({ ...confirm, show: true, requested: true, loading: false })

              setTimeout(function () {
                setConfirm({ ...confirm, show: false, requested: false })

                setTimeout(function () {
                  localStorage.setItem("openNotif", "true")

                  window.location = "/"
                }, 1000)
              }, 2000)
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      setConfirm({ ...confirm, show: false })
      setShowauth({ ...showAuth, show: true, booking: true })
    }
  }

  useEffect(() => {
    getTheNumCartItems()
    getTheWorkers()
    getAllTheWorkersTime()

    if (serviceid !== 'null') getTheServiceInfo()
    if (scheduleid !== 'null') getTheAppointmentInfo()

    getTheLocationHours()
  }, [])

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
                <div id="worker-selection-header">Pick a stylist (Optional)</div>
                
                <div id="workers-list">
                  {selectedWorkerinfo.workers.map((item, index) => (
                    <div key={item.key} className="workers-row">
                      {item.row.map(info => (
                        info.id ? 
                          <div key={info.key} className="worker" style={{ backgroundColor: (selectedWorkerinfo.worker && selectedWorkerinfo.worker.id === info.id) ? 'rgba(0, 0, 0, 0.3)' : null }} disabled={selectedWorkerinfo.loading} onClick={() => selectWorker(info.id)}>
                            <div className="worker-profile">
                              {info.profile.name && <img alt="" src={logo_url + info.profile.name} style={resizePhoto(info.profile, 70)}/>}
                            </div>
                            <div className="worker-header">{info.username}</div>
                          </div>
                          :
                          <div key={info.key} className="worker"></div>
                      ))}
                    </div>
                  ))}
                </div>

                {selectedWorkerinfo.worker !== null && (
                  <div id="choose-worker-actions">
                    <div className="choose-worker-action" onClick={() => {
                      setSelectedworkerinfo({ ...selectedWorkerinfo, worker: null })
                      getAllTheWorkersTime()
                    }}>Cancel</div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div id="date-selection">
                <div id="date-selection-header">Tap a date below</div>

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
                        {days.map((day, index) => (
                          <div key={"day-header-" + index} className="days-header">{day.substr(0, 3)}</div>
                        ))}
                      </div>
                      {calendar.data.map((info, rowindex) => (
                        <div key={info.key} className="days-data-row">
                          {info.row.map((day, dayindex) => (
                            day.num > 0 ? 
                              day.passed || day.noservice ? 
                                day.passed ? 
                                  <div key={day.key} disabled={true} className="day-touch" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>{day.num}</div>
                                  :
                                  <div key={day.key} disabled={true} className="day-touch" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>{day.num}</div>
                                :
                                selectedDateinfo.date === day.num ? 
                                  <div key={day.key} className="day-touch" style={{ backgroundColor: 'black', color: 'white' }} onClick={() => {
                                    if (selectedWorkerinfo.worker !== null) {
                                      selectWorker(selectedWorkerinfo.worker.id)
                                    } else {
                                      getAllTheWorkersTime()
                                    }

                                    selectDate(day.num)
                                  }}>{day.num}</div>
                                  :
                                  <div key={day.key} className="day-touch" onClick={() => {
                                    if (selectedWorkerinfo.worker !== null) {
                                      selectWorker(selectedWorkerinfo.worker.id)
                                    } else {
                                      getAllTheWorkersTime()
                                    }

                                    selectDate(day.num)
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
                <div id="times-header">Tap a time below</div>

                <div id="times">
                  {times.map(info => (
                    <div key={info.key} className="times-row">
                      {info.row.map(item => (
                        item.header ? 
                          <div key={item.key} className="unselect" onClick={() => selectTime(name, item.header, item.time, item.workerIds)}>{item.header}</div>
                          :
                          <div key={item.key} className="unselect" style={{ borderColor: 'transparent' }}></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div id="actions">
              {step > 0 && (
                <div className="action" onClick={() => {
                  if (selectedWorkerinfo.worker !== null) {
                    selectWorker(selectedWorkerinfo.worker.id)
                  } else {
                    getAllTheWorkersTime()
                  }

                  setStep(step - 1)
                }}>Back</div>
              )}

              {step < 2 && (
                <div className="action" onClick={() => {
                  switch (step) {
                    case 0:
                      if (selectedWorkerinfo.worker !== null) {
                        selectWorker(selectedWorkerinfo.worker.id)
                      }

                      getTheLocationHours(oldTime)

                      setStep(1)

                      break
                    case 1:
                      if (selectedDateinfo.date > 0) {
                        setStep(2)
                        getTimes()
                      } else {
                        setCalendar({ ...calendar, errorMsg: "Please tap on a day" })
                      }

                      break;
                    default:
                      setStep(step + 1)
                  }
                }}>Next</div>
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
                <div className="bottom-nav" onClick={() => setOpenorders(true)}>
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
                      <div style={{ fontFamily: 'appFont' }}>Make an appointment for</div>
                      {confirm.service}<br/>
                      {displayTime(confirm.time)}<br/>
                    </div>
                    :
                    <div id="confirm-header">
                      Change appointment for<br/>
                      {'Service: ' + confirm.service}<br/><br/>
                      {displayTime(oldTime)}<br/>to<br/>
                      {displayTime(confirm.time)}<br/>
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
                      <div className="confirm-option" style={{ opacity: confirm.loading ? 0.3 : 1 }} disabled={confirm.loading} onClick={() => setConfirm({ ...confirm, show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })}>No</div>
                      <div className="confirm-option" style={{ opacity: confirm.loading ? 0.3 : 1 }} disabled={confirm.loading} onClick={() => makeAnAppointment()}>Yes</div>
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
      {openOrders && <div id="hidden-box"><Orders close={() => {
        getTheNumCartItems()
        setOpenorders(false)
      }}/></div>}
      {showAuth.show && (
        <div id="hidden-box">
          <Userauth close={() => setShowauth({ ...showAuth, show: false })} done={id => {
            socket.emit("socket/user/login", "user" + id, () => {
              setUserid(id)

              if (showAuth.booking === true) {
                makeAnAppointment(id)
              }
            })
          }}/>
        </div>
      )}
    </div>
  )
}
