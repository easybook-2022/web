import './main.scss';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Geocode from "react-geocode";
import GoogleMapReact from 'google-map-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faLocationPin, faTimesCircle, faCircleNotch, faArrowDown, faArrowUp, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { socket, logo_url, loginLocationInfo, ownerSigninInfo, timeControl, googleApikey } from '../../../businessInfo'
import { getId, displayTime, resizePhoto, displayPhonenumber } from 'geottuse-tools'
import { 
  updateNotificationToken, verifyUser, addOwner, updateOwner, deleteOwner, getStylistInfo, 
  getOtherWorkers, getAccounts, getOwnerInfo, logoutUser, getWorkersTime, getAllWorkersTime, 
  getWorkersHour
} from '../../../apis/business/owners'
import { getLocationProfile, getLocationHours, setLocationHours, updateLocation, setReceiveType, getDayHours } from '../../../apis/business/locations'
import { getMenus, removeMenu, addNewMenu } from '../../../apis/business/menus'
import { cancelSchedule, doneService, getAppointments, getCartOrderers, bookWalkIn, removeBooking, getAppointmentInfo } from '../../../apis/business/schedules'
import { removeProduct } from '../../../apis/business/products'
import { setWaitTime } from '../../../apis/business/carts'

// widgets
import Loadingprogress from '../../../widgets/loadingprogress';

const width = window.innerWidth
const wsize = p => {return width * (p / 100)}

Geocode.setApiKey(googleApikey);
Geocode.setLanguage("en");

const LocationPin = () => <FontAwesomeIcon icon={faLocationPin} size="2x"/>

export default function Main(props) {
  const params = useParams()

  const [ownerId, setOwnerid] = useState(null)
  const [isOwner, setIsowner] = useState(false)
  const [locationType, setLocationtype] = useState('')

  const [appointments, setAppointments] = useState({ list: [], loading: false })
  const [chartInfo, setChartinfo] = useState({ chart: {}, workers: [], workersHour: {}, dayDir: 0, date: {}, loading: false })
  const [bookWalkinconfirm, setBookwalkinconfirm] = useState({ show: false, worker: {}, client: { name: "", cellnumber: "" }, date: {}, confirm: false, note: "", errorMsg: "" })
  const [removeBookingconfirm, setRemovebookingconfirm] = useState({ show: false, scheduleid: -1, client: { name: "", cellnumber: "" }, workerid: -1, date: {}, reason: "", confirm: false })

  const [cartOrderers, setCartorderers] = useState([])
  const [numCartorderers, setNumcartorderers] = useState(0)

  const [loaded, setLoaded] = useState(false)

  const [viewType, setViewtype] = useState('')
  const [cancelInfo, setCancelinfo] = useState({ show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })

  const [showMenurequired, setShowmenurequired] = useState(false)
  const [showDisabledscreen, setShowdisabledscreen] = useState(false)
  const [showInfo, setShowinfo] = useState({ show: false, workersHours: [], locationHours: [] })

  const [showMoreoptions, setShowmoreoptions] = useState({ show: false, loading: false, infoType: '' })
  const [editInfo, setEditinfo] = useState({ show: false, type: '', loading: false })
  const [accountForm, setAccountform] = useState({
    show: false,
    type: '', editType: '', addStep: 0, id: -1, self: false,
    username: '', editUsername: false,
    cellnumber: '', verified: false, verifyCode: '', codeInput: '', editCellnumber: false,
    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
    profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false, camType: 'front',
    workerHours: [], editHours: false,
    loading: false,
    errorMsg: ''
  })

  const [locationInfo, setLocationinfo] = useState('')
  const [fileComp, setFilecomp] = useState(null)
  const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, address: '' })
  const [storeName, setStorename] = useState(loginLocationInfo.storeName)
  const [phonenumber, setPhonenumber] = useState(loginLocationInfo.phonenumber)
  const [addressOne, setAddressone] = useState(loginLocationInfo.addressOne)
  const [addressTwo, setAddresstwo] = useState(loginLocationInfo.addressTwo)
  const [city, setCity] = useState(loginLocationInfo.city)
  const [province, setProvince] = useState(loginLocationInfo.province)
  const [postalcode, setPostalcode] = useState(loginLocationInfo.postalcode)
  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }, loading: false })
  const [locationReceivetype, setLocationreceivetype] = useState('')

  const [days, setDays] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "1", header: "Monday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "2", header: "Tuesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "3", header: "Wednesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "4", header: "Thursday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "5", header: "Friday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "6", header: "Saturday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false }
  ])
  const [deleteOwnerbox, setDeleteownerbox] = useState({
    show: false,
    id: -1, username: '', 
    profile: { name: "", width: 0, height: 0 }, numWorkingdays: 0
  })
  const [accountHolders, setAccountholders] = useState([])
  const [cameraPermission, setCamerapermission] = useState(null);
  const [pickingPermission, setPickingpermission] = useState(null);
  const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
  const [timeRange, setTimerange] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "1", header: "Monday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "2", header: "Tuesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "3", header: "Wednesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "4", header: "Thursday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "5", header: "Friday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "6", header: "Saturday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" }
  ])
  const [hoursInfo, setHoursinfo] = useState({})
  const [getWorkersbox, setGetworkersbox] = useState({ show: false, day: '', workers: [] })

  const getTheLocationProfile = () => {
    const ownerid = localStorage.getItem("ownerid")
    const locationid = localStorage.getItem("locationid")
    const data = { locationid }

    getLocationProfile(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, fullAddress, logo, type, receiveType, hours } = res.info
          let openInfo, openMinute, openHour, closeInfo, closeMinute, closeHour
          let currDate, calcDate, openTime, closeTime

          socket.emit("socket/business/login", ownerid, () => {
            setShowinfo({ ...showInfo, locationHours: hours })

            for (let k = 0; k < 7; k++) {
              let openInfo = hours[k].opentime
              let closeInfo = hours[k].closetime

              openMinute = parseInt(openInfo.minute)
              openHour = parseInt(openInfo.hour)
              openHour = openInfo.period == "PM" ? openHour + 12 : openHour

              closeMinute = parseInt(closeInfo.minute)
              closeHour = parseInt(closeInfo.hour)
              closeHour = closeInfo.period == "PM" ? closeHour + 12 : closeHour

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
              hours[k]["working"] = true
            }

            setOwnerid(ownerid)
            setStorename(name)
            setPhonenumber(phonenumber)
            setAddressone(addressOne)
            setAddresstwo(addressTwo)
            setCity(city)
            setProvince(province)
            setPostalcode(postalcode)
            setLogo({ ...logo, uri: logo_url + logo.name, size: { width: logo.width, height: logo.height }})
            setLocationtype(type)
            setLocationreceivetype(receiveType)
            setDays(hours)
            setTimerange(hours)

            if (type == 'store' || type == 'restaurant') {
              getAllCartOrderers()
            } else {
              getListAppointments()
            }
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheLocationHours = async() => {
    const locationid = localStorage.getItem("locationid")

    getLocationHours(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        } 
      })
      .then((res) => {
        if (res) {
          const { hours } = res

          setHoursinfo(hours)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data


        }
      })
  }
  const getTheOwnerInfo = () => {
    const ownerid = localStorage.getItem("ownerid")

    getOwnerInfo(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setIsowner(res.isOwner)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheWorkersTime = async() => {
    const locationid = localStorage.getItem("locationid")

    getWorkersTime(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowinfo({ ...showInfo, show: true, workersHours: res.workers })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  const getListAppointments = () => {
    const ownerid = localStorage.getItem("ownerid")
    const locationid = localStorage.getItem("locationid")
    const data = { ownerid, locationid }

    getAppointments(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAppointments({ ...appointments, list: res.appointments })
          setViewtype('appointments_list')
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAppointmentsChart = (dayDir, dir) => {
    setViewtype("appointments_chart")
    setChartinfo({ ...chartInfo, loading: true })

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const locationid = localStorage.getItem("locationid"), today = new Date(), pushtime = 1000 * (60 * 15)
    let chart, date = new Date(today.getTime())

    date.setDate(today.getDate() + dayDir)

    let jsonDate, newWorkersTime = {}, hourInfo = hoursInfo[days[date.getDay()].substr(0, 3)]
    let current = Date.parse(days[today.getDay()] + " " + months[today.getMonth()] + ", " + today.getDate() + " " + today.getFullYear() + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
    let now = Date.parse(days[today.getDay()] + " " + months[today.getMonth()] + ", " + today.getDate() + " " + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes())

    if (now > current && dir == null) {
      getAppointmentsChart(dayDir + 1)
    } else {
      if (dayDir != 0) date.setDate(today.getDate() + dayDir)

      jsonDate = {"day":days[date.getDay()].substr(0, 3),"month":months[date.getMonth()],"date":date.getDate(),"year":date.getFullYear()}

      let data = { locationid, ownerid: null }

      getWorkersHour(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            let { workersHour } = res

            for (let worker in workersHour) {
              for (let day in workersHour[worker]) {
                if (day != "scheduled" && day != "profileInfo") {
                  let { open, close } = workersHour[worker][day]

                  workersHour[worker][day]["open"] = jsonDateToUnix({ ...jsonDate, "hour": open["hour"], "minute": open["minute"] })
                  workersHour[worker][day]["close"] = jsonDateToUnix({ ...jsonDate, "hour": close["hour"], "minute": close["minute"] })
                } else if (day == "scheduled") {
                  let scheduled = workersHour[worker][day]
                  let newScheduled = {}

                  for (let info in scheduled) {
                    newScheduled[jsonDateToUnix(JSON.parse(info))] = scheduled[info]
                  }

                  workersHour[worker][day] = newScheduled
                }
              }
            }

            delete jsonDate["hour"]
            delete jsonDate["minute"]

            data = { locationid, jsonDate }

            getDayHours(data)
              .then((res) => {
                if (res.status == 200) {
                  return res.data
                }
              })
              .then((res) => {
                if (res) {
                  const { opentime, closetime, workers } = res
                  let times = [], chart = {}, openhour = parseInt(opentime["hour"]), openminute = parseInt(opentime["minute"])
                  let closehour = parseInt(closetime["hour"]), closeminute = parseInt(closetime["minute"])
                  let openStr = jsonDate["month"] + " " + jsonDate["date"] + ", " + jsonDate["year"] + " " + openhour + ":" + openminute
                  let closeStr = jsonDate["month"] + " " + jsonDate["date"] + ", " + jsonDate["year"] + " " + closehour + ":" + closeminute
                  let openTimeStr = Date.parse(openStr), closeTimeStr = Date.parse(closeStr), calcTimeStr = openTimeStr
                  let currenttime = Date.now(), key = 0

                  while (calcTimeStr < closeTimeStr - pushtime) {
                    calcTimeStr += pushtime

                    let timestr = new Date(calcTimeStr)
                    let hour = timestr.getHours()
                    let minute = timestr.getMinutes()
                    let period = hour < 12 ? "AM" : "PM"
                    let timeDisplay = (
                      hour <= 12 ? 
                        hour == 0 ? 12 : hour
                        :
                        hour - 12
                      )
                      + ":" + 
                      (minute < 10 ? '0' + minute : minute) + " " + period
                    let timepassed = currenttime > calcTimeStr

                    jsonDate = { ...jsonDate, day: days[date.getDay()], hour, minute }

                    times.push({
                      key: "time-" + key + "-" + dayDir,
                      timeDisplay, time: calcTimeStr, jsonDate,
                      timepassed
                    })

                    key += 1
                  }

                  chart = { 
                    "key": dayDir.toString(), 
                    "times": times, 
                    "dateHeader": days[date.getDay()] + ", " + jsonDate["month"] + " " + jsonDate["date"] + ", " + jsonDate["year"]
                  }

                  setChartinfo({ 
                    ...chartInfo, chart, 
                    workersHour, workers, 
                    dayDir, date: jsonDate, 
                    loading: false 
                  })
                  setLoaded(true)
                }
              })
              .catch((err) => {
                if (err.response && err.response.status == 400) {
                  const { errormsg, status } = err.response.data
                }
              })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const removeTheBooking = id => {
    if (!removeBookingconfirm.show) {
      getAppointmentInfo(id)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { client, worker, time } = res

            setRemovebookingconfirm({ 
              ...removeBookingconfirm, 
              show: true, scheduleid: id, workerid: worker.id, 
              client: { name: client.name, cellnumber: client.cellnumber }, 
              date: jsonDateToUnix(time) 
            })
          }
        })
    } else {
      const { scheduleid, workerid, date, reason } = removeBookingconfirm
      const newWorkershour = {...chartInfo.workersHour}
      let data = { scheduleid, reason, type: "cancelSchedule" }

      if (date in newWorkershour[workerid]["scheduled"]) {
        delete newWorkershour[workerid]["scheduled"][date]
      }

      removeBooking(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { ...data, receiver: res.receiver }

            socket.emit("socket/business/cancelSchedule", data, () => {
              setRemovebookingconfirm({ ...removeBookingconfirm, confirm: true })
              setChartinfo({ ...chartInfo, workersHour: newWorkershour })

              setTimeout(function () {
                setRemovebookingconfirm({ ...removeBookingconfirm, show: false, confirm: false })
              }, 2000)
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const bookTheWalkIn = async(worker, jsonDate) => {
    if (!bookWalkinconfirm.show) {
      setBookwalkinconfirm({ ...bookWalkinconfirm, show: true, worker, jsonDate })
    } else {
      const { worker, jsonDate, note, client } = bookWalkinconfirm

      if (client.name && client.cellnumber) {
        const locationid = localStorage.getItem("locationid")
        const newWorkershour = {...chartInfo.workersHour}
        const unix = jsonDateToUnix(jsonDate)

        let data = { 
          workerid: worker.id, locationid, time: jsonDate, note: note ? note : "", 
          type: locationType, client
        }

        bookWalkIn(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              newWorkershour[worker.id]["scheduled"][unix] = res.id

              setBookwalkinconfirm({ ...bookWalkinconfirm, confirm: true })
              setChartinfo({ ...chartInfo, workersHour: newWorkershour })

              setTimeout(function () {
                setBookwalkinconfirm({ ...bookWalkinconfirm, show: false, client: { name: "", cellnumber: "" }, jsonDate: {}, confirm: false })
              }, 2000)
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data

            }
          })
      } else {
        if (!client.name) {
          setBookwalkinconfirm({ ...bookWalkinconfirm, errorMsg: "Please enter the client's name" })
        } else {
          setBookwalkinconfirm({ ...bookWalkinconfirm, errorMsg: "Please enter the client's cell number" })
        }
      }
    }
  }

  const getAllCartOrderers = () => {
    const locationid = localStorage.getItem("locationid")

    getCartOrderers(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setCartorderers(res.cartOrderers)
          setNumcartorderers(res.numCartorderers)
          setViewtype('cartorderers')
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const cancelTheSchedule = (index, requestType) => {
    let id, type, item = index != null ? appointments[index] : appointments[cancelInfo.index]

    id = item.id
    type = item.type

    if (!cancelInfo.show) {
      setCancelinfo({ ...cancelInfo, show: true, type, requestType, id, index })
    } else {
      const { reason, id, index } = cancelInfo
      let data = { scheduleid: id, reason, type: "cancelSchedule" }

      cancelSchedule(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { ...data, receiver: res.receiver }
            socket.emit("socket/business/cancelSchedule", data, () => {
              switch (requestType) {
                case "appointment":
                  const newAppointments = [...appointments]

                  newAppointments.splice(index, 1)

                  setAppointments(newAppointments)

                  break
                default:
              }
                  
              setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })
            })        
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }

  const doneTheService = (index, id) => {
    doneService(id)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const newAppointments = [...appointments]
          let data = { id, type: "doneService", receiver: res.receiver }

          newAppointments.splice(index, 1)

          socket.emit("socket/doneService", data, () => {
            setAppointments(newAppointments)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const removeFromList = (id, type) => {
    let newItems = []

    switch (type) {
      case "appointments":
        newItems = [...appointments]

        break
      case "cartOrderers":
        newItems = [...cartOrderers]

        break
      default:
    }

    newItems.forEach(function (item, index) {
      if (item.id === id) {
        newItems.splice(index, 1)
      }
    })

    switch (type) {
      case "appointments":
        setAppointments(newItems)

        break
      case "cartOrderers":
        setCartorderers(newItems)
        
        break
      default:
    }
  }
  const logout = () => {
    const ownerid = localStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      localStorage.clear()

      window.location = "/auth"
    })
  }
  const startWebsocket = () => {
    socket.on("updateSchedules", data => {
      if (
        data.type === "makeAppointment" || 
        data.type === "cancelRequest" || 
        data.type === "remakeAppointment"
      ) {
        if (viewType === "appointments_list") {
          getListAppointments()
        } else if (viewType === "appointments_chart") {
          const newChartinfo = {...chartInfo}
          const { workersHour } = newChartinfo
          const { scheduleid, time, worker } = data.speak
          const workerId = worker.id.toString(), unix = jsonDateToUnix(time)
          const scheduled = workersHour[workerId]["scheduled"]

          for (let time in scheduled) {
            if (scheduled[time] == scheduleid) {
              delete workersHour[workerId]["scheduled"][time]
            }
          }

          if (data.type == "makeAppointment" || data.type == "remakeAppointment") {
            workersHour[workerId]["scheduled"][unix] = parseInt(scheduleid)
          }

          newChartinfo.workersHour = workersHour

          setChartinfo(newChartinfo)
        }
      }
    })
    socket.on("updateOrders", () => getAllCartOrderers())
    socket.io.on("open", () => {
      if (ownerId != null) {
        socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
      }
    })
    socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})

    return () => {
      socket.off("updateSchedules")
      socket.off("updateOrders")
    }
  }

  const initialize = () => {
    getTheLocationProfile()
    getTheLocationHours()
    getTheOwnerInfo()
  }

  const verify = () => {
    setAccountform({ ...accountForm, loading: true })

    const { cellnumber } = accountForm

    verifyUser(cellnumber)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { verifycode } = res

          setAccountform({ ...accountForm, verifyCode: verifycode, codeInput: '', errorMsg: "", loading: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg } = err.response.data

          setAccountform({ ...accountForm, errorMsg: errormsg, loading: false })
        }
      })
  }
  const getAllAccounts = async() => {
    const locationid = localStorage.getItem("locationid")

    getAccounts(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAccountholders(res.accounts)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const updateYourLocation = async() => {
    if (storeName && phonenumber && addressOne && city && province && postalcode) {
      let longitude = null, latitude = null

      const address = `${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`
      const info = await Geocode.fromAddress(address)
      let { lat, lng } = info.results[0].geometry.location;

      longitude = lat
      latitude = lng

      if (longitude && latitude) {
        const id = localStorage.getItem("locationid")
        const time = (Date.now() / 1000).toString().split(".")[0]
        const data = {
          id, storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
          longitude, latitude
        }

        updateLocation(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              const { id } = res

              setShowmoreoptions({ ...showMoreoptions, infoType: '' })
              setEditinfo({ ...editInfo, show: false, type: '', loading: false })
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data

              setEditinfo({ ...editInfo, errorMsg: errormsg, loading: false })
            }
          })
      }
    } else {
      if (!storeName) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter your store name" })

        return
      }

      if (!phonenumber) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter your store phone number" })

        return
      }

      if (!addressOne) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the Address # 1" })

        return
      }

      if (!addressTwo) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the Address # 2" })

        return
      }

      if (!city) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the city" })

        return
      }

      if (!province) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the province" })

        return
      }

      if (!postalcode) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the postal code" })

        return
      }
    }
  }
  const chooseProfile = e => {
    if (e.target.files && e.target.files[0]) {
      setAccountform({ ...accountForm, loading: true })

      let reader = new FileReader()
      let char = getId()

      reader.onload = e => {
        let imageReader = new Image()
        let size = {}

        imageReader.onload = () => {
          size['width'] = imageReader.width
          size['height'] = imageReader.height

          setAccountform({
            ...accountForm,
            profile: { uri: e.target.result, name: `${char}.jpg`, size },
            loading: false
          })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }
  const choosePhoto = e => {
    if (e.target.files && e.target.files[0]) {
      setLogo({ ...logo, loading: true })

      let reader = new FileReader()
      let char = getId()

      reader.onload = e => {
        let imageReader = new Image()
        let size = {}

        imageReader.onload = () => {
          size['width'] = imageReader.width
          size['height'] = imageReader.height

          setLogo({ ...logo, uri: e.target.result, name: `${char}.jpg`, size, loading: false })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }
  const markLocation = async() => {
    const getGeocoding = async() => {
      setLocationinfo('destination')

      const location = await Location.getCurrentPositionAsync({});
      const { longitude, latitude } = location.coords
      let address = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      for (let item of address) {
        setLocationcoords({ 
          longitude, 
          latitude,
          address: `${item.name}, ${item.subregion} ${item.region}, ${item.postalCode}`
        })
        setAddressone(item.name)
        setCity(item.subregion)
        setProvince(item.region)
        setPostalcode(item.postalCode)
      }
      
      setEditinfo({ ...editInfo, errorMsg: '' })
    }

    const { status } = await Location.getForegroundPermissionsAsync()

    if (status == 'granted') {
      getGeocoding()
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status == 'granted') {
        getGeocoding()
      }
    }
  }
  const addNewOwner = async() => {
    setAccountform({ ...accountForm, loading: true, errorMsg: "" })

    const hours = {}

    accountForm.workerHours.forEach(function (workerHour) {
      let { opentime, closetime, working, takeShift } = workerHour
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

      if (openperiod == "PM") {
        if (openhour < 12) {
          openhour += 12
        }

        openhour = openhour < 10 ? 
          "0" + openhour
          :
          openhour.toString()
      } else {
        if (openhour == 12) {
          openhour = "00"
        } else if (openhour < 10) {
          openhour = "0" + openhour
        } else {
          openhour = openhour.toString()
        }
      }

      if (closeperiod == "PM") {
        if (closehour < 12) {
          closehour += 12
        }

        closehour = closehour < 10 ? 
          "0" + closehour
          :
          closehour.toString()
      } else {
        if (closehour == 12) {
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

      hours[workerHour.header.substr(0, 3)] = { 
        opentime: newOpentime, 
        closetime: newClosetime, working, 
        takeShift: takeShift ? takeShift : "" 
      }
    })

    const id = localStorage.getItem("locationid")
    const { cellnumber, username, newPassword, confirmPassword, profile } = accountForm
    const data = { id, cellnumber, username, password: newPassword, confirmPassword, hours, profile }

    addOwner(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }

        return
      })
      .then((res) => {
        if (res) {
          setAccountform({
            ...accountForm, 
            show: false, 
            type: '', editType: '', addStep: 0, id: -1, 
            username: '', cellnumber: '', 
            currentPassword: '', newPassword: '', confirmPassword: '', 
            profile: { uri: '', name: '', size: { width: 0, height: 0 } }, 
            loading: false, errorMsg: ""
          })
          setEditinfo({ ...editInfo, show: true })
          getAllAccounts()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setAccountform({ ...accountForm, errormsg })
        }
      })
  }
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...accountForm.workerHours], timeRangeInfo = [...timeRange]
    let value, { openunix, closeunix, calcDate } = timeRangeInfo[index]
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

      setAccountform({ ...accountForm, workerHours: newWorkerhours })
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
  const working = index => {
    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours[index].working = !newWorkerhours[index].working

    setAccountform({ ...accountForm, workerHours: newWorkerhours })
  }
  const updateTheOwner = async() => {
    setAccountform({ ...accountForm, loading: true, errorMsg: "" })

    const { cellnumber, username, profile, currentPassword, newPassword, confirmPassword } = accountForm
    let data = { ownerid: accountForm.id, type: accountForm.editType }

    switch (accountForm.editType) {
      case "cellnumber":
        data = { ...data, cellnumber }

        break;
      case "username":
        data = { ...data, username }

        break;
      case "profile":
        data = { ...data, profile }

        break;
      case "password":
        data = { ...data, currentPassword, newPassword, confirmPassword }

        break;
      case "hours":
        const hours = {}

        accountForm.workerHours.forEach(function (workerHour) {
          let { opentime, closetime, working, takeShift } = workerHour
          let newOpentime = {...opentime}, newClosetime = {...closetime}
          let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
          let openperiod = newOpentime.period, closeperiod = newClosetime.period

          if (openperiod == "PM") {
            if (openhour < 12) {
              openhour += 12
            }

            openhour = openhour < 10 ? 
              "0" + openhour
              :
              openhour.toString()
          } else {
            if (openhour == 12) {
              openhour = "00"
            } else if (openhour < 10) {
              openhour = "0" + openhour
            } else {
              openhour = openhour.toString()
            }
          }

          if (closeperiod == "PM") {
            if (closehour < 12) {
              closehour += 12
            }

            closehour = closehour < 10 ? 
              "0" + closehour
              :
              closehour.toString()
          } else {
            if (closehour == 12) {
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

          hours[workerHour.header.substr(0, 3)] = { 
            opentime: newOpentime, 
            closetime: newClosetime, working, 
            takeShift: takeShift ? takeShift : ""
          }
        })

        data = { ...data, hours }

        break;
      default:
    }

    updateOwner(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAccountform({
            ...accountForm,
            show: false,
            type: '', editType: '', 
            username: "", editUsername: false, 
            cellnumber: "", editCellnumber: false,
            currentPassword: "", newPassword: "", confirmPassword: "", editPassword: false, 
            profile: { name: "", uri: "" }, editProfile: false, 
            loading: false, errorMsg: ""
          })
          setEditinfo({ ...editInfo, show: true })
          getAllAccounts()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setAccountform({ ...accountForm, errorMsg: errormsg })
        }
      })
  }
  const deleteTheOwner = id => {
    if (!deleteOwnerbox.show) {
      getStylistInfo(id)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { username, profile, days } = res

            setDeleteownerbox({
              ...deleteOwnerbox,
              show: true,
              id, username, 
              profile,
              numWorkingdays: Object.keys(days).length
            })
            setEditinfo({ ...editInfo, show: false })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      const { id } = deleteOwnerbox

      deleteOwner(id)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const newAccountholders = [...accountHolders]

            newAccountholders.forEach(function (info, index) {
              if (info.id == id) {
                newAccountholders.splice(index, 1)
              }
            })

            setAccountholders(newAccountholders)
            setDeleteownerbox({ ...deleteOwnerbox, show: false })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const cancelTheShift = async(day) => {
    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) == day) {
        info.takeShift = ""
      }
    })

    setAccountform({...accountForm, workerHours: newWorkerhours })
  }
  const getTheOtherWorkers = async(day) => {
    const locationid = localStorage.getItem("locationid")
    const data = { ownerid: accountForm.id, locationid, day }

    getOtherWorkers(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setGetworkersbox({
            ...getWorkersbox,
            show: true,
            workers: res.workers,
            day
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const selectTheOtherWorker = id => {
    const { day } = getWorkersbox

    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) == day) {
        info.takeShift = id.toString()
      }
    })

    setAccountform({...accountForm, workerHours: newWorkerhours })
    setGetworkersbox({ ...getWorkersbox, show: false })
  }
  const updateLocationHours = async() => {
    setEditinfo({ ...editInfo, loading: true })

    const locationid = localStorage.getItem("locationid")
    const hours = {}

    days.forEach(function (day) {
      let { opentime, closetime, close } = day
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

      if (openperiod == "PM") {
        if (openhour < 12) {
          openhour += 12
        }

        openhour = openhour < 10 ? 
          "0" + openhour
          :
          openhour.toString()
      } else {
        if (openhour == 12) {
          openhour = "00"
        } else if (openhour < 10) {
          openhour = "0" + openhour
        } else {
          openhour = openhour.toString()
        }
      }

      if (closeperiod == "PM") {
        if (closehour < 12) {
          closehour += 12
        }

        closehour = closehour < 10 ? 
          "0" + closehour
          :
          closehour.toString()
      } else {
        if (closehour == 12) {
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
    })

    const data = { locationid, hours: JSON.stringify(hours) }

    setLocationHours(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowmoreoptions({ ...showMoreoptions, infoType: '' })
          setEditinfo({ ...editInfo, show: false, type: '', loading: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setEditinfo({ ...editInfo, loading: false })
        }
      })
  }
  const setTheReceiveType = async(type) => {
    const locationid = localStorage.getItem("locationid")
    const data = { locationid, type }

    setReceiveType(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLocationreceivetype(type)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["month"] + " " + date["date"] + ", " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }
  
  useEffect(() => initialize(), [])

  useEffect(() => {
    startWebsocket()

    return () => {
      socket.off("updateSchedules")
      socket.off("updateOrders")
    }
  }, [viewType, chartInfo.workersHour, appointments.list.length, cartOrderers.length])

  const header = (locationType == "hair" || locationType == "nail") && " Salon " || 
                  locationType == "restaurant" && " Restaurant " || 
                  locationType == "store" && " Store "
  const currenttime = Date.now()
  const { date, workersHour, workers } = chartInfo
  let currDay = date.day ? date.day.substr(0, 3) : ""

  return (
    <div id="business-main">
      {loaded ?
        <div id="box">
          <div id="body">
            <div className="header" style={{ height: '10%' }}>
              {(locationType === 'hair' || locationType === 'nail') ? 'Appointment(s)' : 'Orderer(s)'}
            </div>
            
            <div style={{ flexDirection: 'row', height: '5%', justifyContent: 'space-around', width: '100%' }}>
              {(locationType === "hair" || locationType == "nail") && (
                <div id="view-types">
                  <div className="view-type" onClick={() => getListAppointments()}>See{'\n'}Your(s)</div>
                  <div className="view-type" onClick={() => getAppointmentsChart(0)}>See{'\n'}All Stylist(s)</div>
                </div>
              )}
            </div>

            {viewType === "appointments_list" && (
              !appointments.loading ? 
                appointments.list.length > 0 ? 
                  appointments.list.map((item, index) => (
                    <div key={item.key} className="schedule">
                      <div className="schedule-image">
                        <img 
                          alt="" 
                          style={{ height: '100%', width: '100%' }} 
                          src={item.image.name ? logo_url + item.image.name : "/noimage.jpeg"}
                        />
                      </div>
                        
                      <div className="schedule-header">
                        Client: {item.client.username + ' for ' + item.name}
                        <br/>{displayTime(item.time)}
                        <br/>Stylist: {item.worker.username}
                      </div>

                      <div id="schedule-actions">
                        <div className="column">
                          <div className="schedule-action" onClick={() => cancelTheSchedule(index, "appointment")}>Cancel</div>
                        </div>
                        <div className="column">
                          <div className="schedule-action" onClick={() => window.location = "booktime/" + item.id + "/" + (item.serviceid == "" ? null : item.serviceid) + "/" + item.name}>Pick another time for client</div>
                        </div>
                        <div className="column">
                          <div className="schedule-action" onClick={() => doneTheService(index, item.id)}>Done</div>
                        </div>
                      </div>
                    </div>
                  ))
                  :
                  <div id="body-result">
                    <div id="body-result-header">You will see your appointment(s) here in order</div>
                  </div>
                :
                <div id="loading">
                  <FontAwesomeIcon icon={faCircleNotch} size="3x"/>
                </div>
            )}

            {viewType === "appointments_chart" && (
              !chartInfo.loading ? 
                <div style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: 2 }}>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                    <div className="column">
                      <div onClick={() => getAppointmentsChart(chartInfo.dayDir - 1, "left")}><FontAwesomeIcon icon={faArrowLeft} size="3x"/></div>
                    </div>
                    <div className="column">
                      <div style={{ fontSize: wsize(3), fontWeight: 'bold', textAlign: 'center' }}>{chartInfo.chart.dateHeader}</div>
                    </div>
                    <div className="column">
                      <div onClick={() => getAppointmentsChart(chartInfo.dayDir + 1, "right")}><FontAwesomeIcon icon={faArrowRight} size="3x"/></div>
                    </div>
                  </div>
                  <div className="chart-row">
                    {chartInfo.workers.map(worker => (
                      <div key={worker.key} className="chart-worker" style={{ width: workers.length < 5 ? (width / workers.length) : 200 }}>
                        <div className="chart-worker-header">{worker.username}</div>
                        <div className="chart-worker-profile">
                          <img
                            style={resizePhoto(worker.profile, wsize(5))}
                            src={worker.profile.name ? logo_url + worker.profile.name : "/profilepicture.jpg"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    {chartInfo.chart.times && chartInfo.chart.times.map(item => (
                      <div key={item.key} className="chart-row">
                        <div className="chart-row">
                          {chartInfo.workers.map(worker => (
                            <div
                              disabled={!(
                                item.time >= workersHour[worker.id][currDay]["open"] && item.time < workersHour[worker.id][currDay]["close"] // working times
                                &&
                                workersHour[worker.id][currDay]["workking"]
                                &&
                                !item.timepassed
                              )}
                              key={worker.key}
                              className="chart-worker"
                              style={{
                                backgroundColor: item.time in workersHour[worker.id]["scheduled"] ? 'black' : 'transparent',
                                opacity: (
                                  item.time >= workersHour[worker.id][currDay]["open"] && item.time < workersHour[worker.id][currDay]["close"]
                                  &&
                                  workersHour[worker.id][currDay]["working"]
                                  &&
                                  !item.timepassed
                                ) ? 1 : 0.3,
                                width: workers.length < 5 ? (width / workers.length) : 200
                              }}
                              onClick={() => {
                                if (item.time in workersHour[worker.id]["scheduled"]) {
                                  removeTheBooking(workersHour[worker.id]["scheduled"][item.time])
                                } else {
                                  if (item.time >= workersHour[worker.id][currDay]["open"] && item.time < workersHour[worker.id][currDay]["close"]) bookTheWalkIn(worker, item.jsonDate)
                                }
                              }}
                            >
                              <div 
                                className="chart-time-header"
                                style={{
                                  color: (
                                    item.time >= workersHour[worker.id][currDay]["open"] && item.time < workersHour[worker.id][currDay]["close"] ?
                                      item.time in workersHour[worker.id]["scheduled"] ? 'white' : 'black'
                                      :
                                      'black'
                                  )
                                }}
                              >{item.timeDisplay}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                :
                <div id="loading">
                  <FontAwesomeIcon icon={faCircleNotch} size="3x"/>
                </div>
            )}

            {viewType === "cartorderers" && (
              cartOrderers.length > 0 ? 
                cartOrderers.map((item, index) => (
                  item.product ? 
                    <div key={item.key} className="order-request">
                      <div className="order-request-row">
                        <div className="order-request-header">{item.product}</div>
                        <div className="order-request-quantity">Quantity: {item.quantity}</div>
                      </div>
                    </div>
                    :
                    <div key={item.key} className="cart-orderer">
                      <div className="cart-orderer-info">
                        <div className="cart-orderer-username">Customer: {item.username}</div>
                        <div className="cart-orderer-ordernumber">Order #{item.orderNumber}</div>

                        <div id="cart-orderer-actions">
                          <div className="cart-orderer-action" onClick={() => window.location = "/cartorders/" + item.adder + "/" + item.orderNumber}>See Order(s) ({item.numOrders})</div>
                        </div>
                      </div>
                    </div>
                ))
                :
                <div id="body-result">
                  <div id="body-result-header">You will see all order(s) here</div>
                </div>
            )}
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              <div className="column">
                <div className="bottom-nav" onClick={() => setShowmoreoptions({ ...showMoreoptions, show: true })}>Change Info</div>
              </div>

              <div className="column">
                <div className="bottom-nav" onClick={() => getTheWorkersTime()}>Hour(s)</div>
              </div>

              <div className="column">
                <div className="bottom-nav" onClick={() => logout()}>Log-Out</div>
              </div>
            </div>
          </div>
        </div>
        :
        <div id="loading"><Loadingprogress/></div>
      }
      
      {(cancelInfo.show || showMenurequired || showInfo.show || showMoreoptions.show || bookWalkinconfirm.show || removeBookingconfirm.show || showDisabledscreen) && (
        <div id="hidden-box">
          {cancelInfo.show && (
            <div id="cancel-request-box">
              <div id="cancel-request-header">Why cancel? (optional)</div>

              <textarea 
                placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" 
                id="cancel-request-input"
                onChange={(e) => setCancelinfo({ ...cancelInfo, reason: e.target.value })} 
              />

              <div id="cancel-request-actions">
                <div className="cancel-request-touch" onClick={() => setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", id: 0, index: 0, reason: "" })}>Close</div>
                <div className="cancel-request-touch" onClick={() => cancelTheSchedule(null, cancelInfo.requestType)}>Done</div>
              </div>
            </div>
          )}
          {showMenurequired && (
            <div id="required-box-container">
              <div id="required-box">
                <div id="required-container">
                  <div id="required-header">
                    You need to add some 
                    {locationType === "restaurant" ? " food " : " products / services "}
                    to your menu to list your location publicly
                  </div>

                  <div id="required-actions">
                    <div className="required-action" onClick={() => setShowmenurequired(false)}>Close</div>
                    <div className="required-action" onClick={() => {
                      setShowmenurequired(false)
                      
                      window.location = "/menu"
                    }}>Ok</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showInfo.show && (
            <div id="show-info-container">
              <div id="show-info-box">
                <div id="show-info-close" onClick={() => setShowinfo({ ...showInfo, show: false })}>
                  <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                </div>

                <div id="show-info-header">{header.substr(1, header.length - 2)}'s hour(s)</div>

                <div className="row">
                  {showInfo.locationHours.map(info => (
                    !info.close && (
                      <div className="worker-time-container" key={info.key}>
                        <div className="day-header">{info.header}: </div>
                        <div className="time-headers">
                          <div className="time-header">{info.opentime.hour}</div>
                          <div className="column">:</div>
                          <div className="time-header">{info.opentime.minute}</div>
                          <div className="time-header">{info.opentime.period}</div>
                        </div>
                        <div className="column"> - </div>
                        <div className="time-headers">
                          <div className="time-header">{info.closetime.hour}</div>
                          <div className="column">:</div>
                          <div className="time-header">{info.closetime.minute}</div>
                          <div className="time-header">{info.closetime.period}</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div id="worker-info-list">
                  {showInfo.workersHours.map(worker => (
                    <div className="row">
                      <div className="worker-row">
                        <div className="worker-info">
                          <div className="worker-info-profile">
                            <img 
                              src={worker.profile.name ? logo_url + worker.profile.name : "/noimage.jpeg"}
                              style={resizePhoto(worker.profile, 100)}
                            />
                          </div>
                          <div className="worker-info-name">{worker.name}</div>
                        </div>
                        <div className="worker-time">
                          {worker.hours.map(info => (
                            info.working && (
                              <div className="worker-time-container" key={info.key}>
                                <div className="day-header">{info.header}: </div>
                                <div className="time-headers">
                                  <div className="time-header">{info.opentime.hour}</div>
                                  <div className="column">:</div>
                                  <div className="time-header">{info.opentime.minute}</div>
                                  <div className="time-header">{info.opentime.period}</div>
                                </div>
                                <div className="column"> - </div>
                                <div className="time-headers">
                                  <div className="time-header">{info.closetime.hour}</div>
                                  <div className="column">:</div>
                                  <div className="time-header">{info.closetime.minute}</div>
                                  <div className="time-header">{info.closetime.period}</div>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {showMoreoptions.show && (
            <div id="more-options-container">
              <div id="more-options-box">
                {showMoreoptions.infoType === '' ? 
                  <>
                    <div id="more-options-close" onClick={() => setShowmoreoptions({ ...showMoreoptions, show: false })}>
                      <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                    </div>

                    <div className="more-option-touch" onClick={() => {
                      setShowmoreoptions({ ...showMoreoptions, show: false })

                      localStorage.setItem("isOwner", isOwner ? "true" : "false")

                      window.location = "/menu"
                    }}>{isOwner === true ? "Change" : "Read"} Menu</div>

                    {(locationType === "hair" || locationType === "nail") && (
                      <div className="more-option-touch" onClick={() => {
                        setEditinfo({ ...editInfo, show: true, type: "users" })
                        setShowmoreoptions({ ...showMoreoptions, infoType: "users" })
                        getAllAccounts()
                      }}>Change Worker(s) Info</div>
                    )}

                    {isOwner === true && (
                      <>
                        <div className="more-option-touch" onClick={() => {
                          setShowmoreoptions({ ...showMoreoptions, infoType: 'information' })
                          setEditinfo({ ...editInfo, show: true, type: 'information' })
                        }}>Change{header}Info</div>

                        <div className="more-option-touch" onClick={() => {
                          setShowmoreoptions({ ...showMoreoptions, infoType: 'hours' })
                          setEditinfo({ ...editInfo, show: true, type: 'hours' })
                        }}>Change{header}Hour(s)</div>

                        <div className="more-option-touch" onClick={() => {
                          localStorage.removeItem("locationid")
                          localStorage.removeItem("locationtype")
                          localStorage.setItem("phase", "list")

                          setShowmoreoptions({ ...showMoreoptions, show: false })

                          window.location = "/list"
                        }}>Switch Business</div>

                        {(locationType === "hair" || locationType === "nail") && (
                          <div id="receive-types-box">
                            <div id="receive-types-header">Get appointments</div>

                            <div id="receive-types">
                              <div className="receive-type" 
                                style={{ 
                                  backgroundColor: locationReceivetype === 'stylist' ? 'black' : 'transparent', 
                                  color: locationReceivetype === 'stylist' ? 'white' : 'black'
                                }} onClick={() => setTheReceiveType('stylist')}
                              >By stylist(s)</div>

                              <div className="receive-type" 
                                style={{ 
                                  backgroundColor: locationReceivetype === 'owner' ? 'black' : 'transparent', 
                                  color: locationReceivetype === 'owner' ? 'white' : 'black'
                                }} onClick={() => setTheReceiveType('owner')}
                              >By owner</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                  :
                  <>
                    {editInfo.show && (
                      <div id="edit-info-box">
                        <div id="edit-info-container">
                          <div id="edit-info-close" onClick={() => {
                            setShowmoreoptions({ ...showMoreoptions, infoType: '' })
                            setEditinfo({ ...editInfo, show: false, type: '' })
                          }}><FontAwesomeIcon icon={faTimesCircle} size="3x"/></div>

                          {editInfo.type === "information" && (
                            <>
                              {locationInfo === "" && (
                                <>
                                  <div className="location-action-option" disabled={editInfo.loading} onClick={() => markLocation()}>Mark your location</div>

                                  <div className="location-div">Or</div>

                                  <div className="location-action-option" disabled={editInfo.loading} onClick={() => {
                                    setLocationinfo('away')
                                    setEditinfo({ ...editInfo, errorMsg: '' })
                                  }}>Enter address instead</div>
                                </>
                              )}

                              {locationInfo === "away" && (
                                <>
                                  <div className="location-action-option" disabled={editInfo.loading} onClick={() => markLocation()}>Mark your location</div>

                                  <div className="location-div">Or</div>

                                  <div className="header">Edit Address</div>

                                  <div id="inputs-box">
                                    <div className="input-container">
                                      <div className="input-header">{header}'s name:</div>
                                      <input className="input" onChange={(e) => setStorename(e.target.value)} value={storeName}/>
                                    </div>
                                    <div className="input-container">
                                      <div className="input-header">{header}'s Phone number:</div>
                                      <input className="input" onChange={(e) => setPhonenumber(displayPhonenumber(phonenumber, e.target.value, () => {}))} value={phonenumber} type="text"/>
                                    </div>
                                    <div className="input-container">
                                      <div className="input-header">{header}'s address #1:</div>
                                      <input className="input" onChange={(e) => setAddressone(e.target.value)} value={addressOne} type="text"/>
                                    </div>
                                    <div className="input-container">
                                      <div className="input-header">{header}'s address #2:</div>
                                      <input className="input" onChange={(e) => setAddresstwo(e.target.value)} value={addressTwo} type="text"/>
                                    </div>
                                    <div className="input-container">
                                      <div className="input-header">City:</div>
                                      <input className="input" onChange={(e) => setCity(e.target.value)} value={city} type="text"/>
                                    </div>
                                    <div className="input-container">
                                      <div className="input-header">Province:</div>
                                      <input className="input" onChange={(e) => setProvince(e.target.value)} value={province} type="text"/>
                                    </div>
                                    <div className="input-container">
                                      <div className="input-header">Postal Code:</div>
                                      <input className="input" onChange={(e) => setPostalcode(e.target.value)} value={postalcode} type="text"/>
                                    </div>

                                    {editInfo.errorMsg ? <div className="errormsg">{editInfo.errorMsg}</div> : null }
                                  </div>
                                </>
                              )}

                              {locationInfo === "destination" && (
                                <div id="location-container-center">
                                  <div className="location-header">Your{header}is located at</div>

                                  {(locationCoords.longitude && locationCoords.latitude) ? 
                                    <div style={{ height: '50vh', margin: '0 auto', width: '50vh' }}>
                                      <GoogleMapReact
                                        bootstrapURLKeys={{ key: googleApikey }}
                                        defaultZoom={17}
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
                                    </div>
                                    :
                                    <div className="loading"><Loadingprogress/></div>
                                  }

                                  <div className="location-div">Or</div>

                                  <div className="location-action-option" onClick={() => {
                                    setLocationcoords({ longitude: null, latitude: null })
                                    setLocationinfo('away')
                                  }}>Enter address instead</div>
                                </div>
                              )}

                              <div className="camera-container">
                                <div className="input-header">Store Logo</div>

                                {logo.uri ? (
                                  <>
                                    <div className="camera">
                                      <img alt="" style={resizePhoto(logo.size, width * 0.3)} src={logo.uri}/>
                                    </div>

                                    <div id="camera-actions">
                                      <div className="camera-action" onClick={() => setLogo({ ...logo, uri: '' })}>Cancel</div>
                                    </div>
                                  </>
                                ) : (
                                  <div id="camera-actions">
                                    <div className="camera-action" style={{ opacity: logo.loading ? 0.5 : 1 }} disabled={logo.loading} onClick={() => fileComp.click()}>Choose from computer</div>

                                    <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                                  </div>
                                )}  
                              </div>

                              <div className="update-button" disabled={editInfo.loading} onClick={() => updateYourLocation()}>Save</div>
                            </>
                          )}

                          {editInfo.type === "hours" && (
                            <>
                              <div className="header">Edit{header}Hour(s)</div>

                              {days.map((info, index) => (
                                <div key={index} className="worker-hour">
                                  {info.close === false ? 
                                    <>
                                      <div style={{ opacity: info.close ? 0.1 : 1 }}>
                                        <div className="worker-hour-header">Open on {info.header}</div>
                                        <div className="time-selection-container">
                                          <div className="time-selection">
                                            <div className="selection">
                                              <div className="selection-arrow" onClick={() => updateTime(index, "hour", "up", true)}>
                                                <FontAwesomeIcon icon={faArrowUp}/>
                                              </div>
                                              <input className="selection-header" onChange={(e) => {
                                                const newDays = [...days]

                                                newDays[index].opentime["hour"] = e.target.value.toString()

                                                setDays(newDays)
                                              }} type="text" maxLength={2} value={info.opentime.hour}/>
                                              <div className="selection-arrow" onClick={() => updateTime(index, "hour", "down", true)}>
                                                <FontAwesomeIcon icon={faArrowDown}/>
                                              </div>
                                            </div>
                                            <div className="column">
                                              <div className="selection-div">:</div>
                                            </div>
                                            <div className="selection">
                                              <div className="selection-arrow" onClick={() => updateTime(index, "minute", "up", true)}>
                                                <FontAwesomeIcon icon={faArrowUp}/>
                                              </div>
                                              <input className="selection-header" onChange={(e) => {
                                                const newDays = [...days]

                                                newDays[index].opentime["minute"] = e.target.value.toString()

                                                setDays(newDays)
                                              }} type="text" maxLength={2} value={info.opentime.minute}/>
                                              <div className="selection-arrow" onClick={() => updateTime(index, "minute", "down", true)}>
                                                <FontAwesomeIcon icon={faArrowDown}/>
                                              </div>
                                            </div>
                                            <div className="selection">
                                              <div className="selection-arrow" onClick={() => updateTime(index, "period", "up", true)}>
                                                <FontAwesomeIcon icon={faArrowUp}/>
                                              </div>
                                              <div className="selection-header">{info.opentime.period}</div>
                                              <div className="selection-arrow" onClick={() => updateTime(index, "period", "down", true)}>
                                                <FontAwesomeIcon icon={faArrowDown}/>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="column">
                                            <div className="time-selection-header">To</div>
                                          </div>
                                          <div className="time-selection">
                                            <div className="selection">
                                              <div className="selection-arrow" onClick={() => updateTime(index, "hour", "up", false)}>
                                                <FontAwesomeIcon icon={faArrowUp}/>
                                              </div>
                                              <input className="selection-header" onChange={(e) => {
                                                const newDays = [...days]

                                                newDays[index].closetime["hour"] = e.target.value.toString()

                                                setDays(newDays)
                                              }} type="text" maxLength={2} value={info.closetime.hour}/>
                                              <div className="selection-arrow" onClick={() => updateTime(index, "hour", "down", false)}>
                                                <FontAwesomeIcon icon={faArrowDown}/>
                                              </div>
                                            </div>
                                            <div className="column">
                                              <div className="selection-div">:</div>
                                            </div>
                                            <div className="selection">
                                              <div className="selection-arrow" onClick={() => updateTime(index, "minute", "up", false)}>
                                                <FontAwesomeIcon icon={faArrowUp}/>
                                              </div>
                                              <input className="selection-header" onChange={(e) => {
                                                const newDays = [...days]

                                                newDays[index].closetime["minute"] = e.target.value.toString()

                                                setDays(newDays)
                                              }} type="text" maxLength={2} value={info.closetime.minute}/>
                                              <div className="selection-arrow" onClick={() => updateTime(index, "minute", "down", false)}>
                                                <FontAwesomeIcon icon={faArrowDown}/>
                                              </div>
                                            </div>
                                            <div className="selection">
                                              <div className="selection-arrow" onClick={() => updateTime(index, "period", "up", false)}>
                                                <FontAwesomeIcon icon={faArrowUp}/>
                                              </div>
                                              <div className="selection-header">{info.closetime.period}</div>
                                              <div className="selection-arrow" onClick={() => updateTime(index, "period", "down", false)}>
                                                <FontAwesomeIcon icon={faArrowDown}/>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="worker-touch" onClick={() => {
                                        const newDays = [...days]

                                        newDays[index].close = true

                                        setDays(newDays)
                                      }}>Change to not open</div>
                                    </>
                                    :
                                    <>
                                      <div className="worker-hour-header">Not open on {info.header}</div>

                                      <div className="worker-touch" onClick={() => {
                                        const newDays = [...days]

                                        newDays[index].close = false

                                        setDays(newDays)
                                      }}>Change to open</div>
                                    </>
                                  }
                                </div>
                              ))}

                              <div id="update-buttons">
                                <div className="update-button" disabled={editInfo.loading} onClick={() => {
                                  setShowmoreoptions({ ...showMoreoptions, infoType: '' })
                                  setEditinfo({ ...editInfo, show: false, type: '' })
                                }}>Cancel</div>
                                <div className="update-button" disabled={editInfo.loading} onClick={() => updateLocationHours()}>Save</div>
                              </div>
                            </>
                          )}

                          {editInfo.type === "users" && (
                            <div id="account-holders">
                              <div className="header">Edit Stylist(s)</div>

                              {isOwner === true && (
                                <div id="account-holders-add" onClick={() => {
                                  setAccountform({
                                    ...accountForm,
                                    show: true,
                                    type: 'add',
                                    username: ownerSigninInfo.username,
                                    cellnumber: ownerSigninInfo.cellnumber,
                                    currentPassword: ownerSigninInfo.password, 
                                    newPassword: ownerSigninInfo.password, 
                                    confirmPassword: ownerSigninInfo.password,
                                    workerHours: [...timeRange]
                                  })
                                  setEditinfo({ ...editInfo, show: false })
                                }}>Add a new stylist</div>
                              )}

                              {accountHolders.map((info, index) => (
                                <div className="row">
                                  <div key={info.key} className="account">
                                    <div className="column">
                                      <div className="account-header">#{index + 1}:</div>
                                    </div>

                                    <div className="account-edit">
                                      <div className="column">
                                        <div className="account-edit-header">{info.username}</div>
                                      </div>
                                      <div className="column">
                                        <div className="account-edit-touch" onClick={() => {
                                          if (info.id === ownerId) {
                                            const { name, height, width } = info.profile
                                            const size = { height, width }

                                            setAccountform({
                                              ...accountForm,
                                              show: true, type: 'edit', 
                                              id: info.id,
                                              username: info.username,
                                              cellnumber: info.cellnumber,
                                              password: '',
                                              confirmPassword: '',
                                              profile: { uri: logo_url + name, name: "", size },
                                              workerHours: info.hours
                                            })
                                          } else { // others can only edit other's hours
                                            setAccountform({ 
                                              ...accountForm, 
                                              show: true, type: 'edit', editType: 'hours', 
                                              id: info.id, workerHours: info.hours
                                            })
                                          }

                                          setEditinfo({ ...editInfo, show: false })
                                        }}>Change {ownerId === info.id ? " Info (your)" : " hours"}</div>
                                      </div>
                                      {isOwner === true && (
                                        <div className="column">
                                          <div onClick={() => deleteTheOwner(info.id)}>
                                            <FontAwesomeIcon icon={faTimesCircle} size="2x"/>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {accountForm.show && (
                      <div id="account-form-container">
                        <div id="account-form">
                          {(!accountForm.editCellnumber && !accountForm.editUsername && !accountForm.editProfile && !accountForm.editPassword && !accountForm.editHours && accountForm.type !== 'add') ? 
                            <>
                              <div id="account-form-close" onClick={() => {
                                setAccountform({
                                  ...accountForm,

                                  show: false,
                                  username: '',
                                  cellnumber: '', password: '', confirmPassword: '',
                                  profile: { uri: '', name: '', size: { height: 0, width: 0 } },
                                  errorMsg: ""
                                })
                                setEditinfo({ ...editInfo, show: true })
                              }}>
                                <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                              </div>

                              <div id="account-form-header">{accountForm.type === 'add' ? 'Add' : 'Editing'} stylist info</div>

                              {accountForm.id === ownerId ? 
                                <>
                                  <div className="account-info-edit" onClick={() => setAccountform({ ...accountForm, editCellnumber: true, editType: 'cellnumber' })}>Change Cell number</div>
                                  <div className="account-info-edit" onClick={() => setAccountform({ ...accountForm, editUsername: true, editType: 'username' })}>Change your name</div>
                                  <div className="account-info-edit" onClick={() => setAccountform({ ...accountForm, editProfile: true, editType: 'profile' })}>Change your profile</div>
                                  <div className="account-info-edit" onClick={() => setAccountform({ ...accountForm, editPassword: true, editType: 'password' })}>Change your password</div>

                                  {(locationType === "hair" || locationType === "nail") && 
                                    <div className="account-info-edit" 
                                      onClick={() => setAccountform({ ...accountForm, editHours: true, editType: 'hours' })}
                                    >Change your days and hours</div>
                                  }
                                </>
                                :
                                <>
                                  {accountForm.workerHours.map((info, index) => (
                                    <div key={index} className="worker-hour">
                                      {info.working === true ? 
                                        <>
                                          <div>
                                            <div className="worker-hour-header">Working on {info.header}</div>
                                            <div className="time-selection-container">
                                              <div className="time-selection">
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["hour"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.opentime.hour}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="selection-div">:</div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["minute"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.opentime.minute}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <div className="selection-header">{info.opentime.period}</div>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="column">
                                                <div className="time-selection-header">To</div>
                                              </div>
                                              <div className="time-selection">
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["hour"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.closetime.hour}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="selection-div">:</div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["minute"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.closetime.minute}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <div className="selection-header">{info.closetime.period}</div>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div id="worker-hour-actions">
                                            <div className="worker-hour-action" onClick={() => {
                                              const newWorkerhours = [...accountForm.workerHours]

                                              newWorkerhours[index].working = false

                                              setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                            }}>Change to not working</div>
                                          </div>
                                        </>
                                        :
                                        <>
                                          <div className="worker-hour-header">Not working on {info.header}</div>

                                          <div id="worker-hour-actions">
                                            <div className="worker-hour-action" onClick={() => {
                                              const newWorkerhours = [...accountForm.workerHours]

                                              newWorkerhours[index].working = true

                                              setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                            }}>Change to working</div>

                                            {info.takeShift !== "" ? 
                                              <div className="worker-hour-action" onClick={() => cancelTheShift(info.header.substr(0, 3))}>Cancel shift</div>
                                              :
                                              <div className="worker-hour-action" onClick={() => getTheOtherWorkers(info.header.substr(0, 3))}>Take co-worker's shift</div>
                                            }
                                          </div>
                                        </>
                                      }
                                    </div>
                                  ))}

                                  <div id="account-form-actions">
                                    <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => setAccountform({ ...accountForm, show: false, type: 'edit', editType: '', id: -1, editHours: false })}>Cancel</div>
                                    <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                                      if (accountForm.type === 'add') {
                                        addNewOwner()
                                      } else {
                                        updateTheOwner()
                                      }

                                      getAllAccounts()
                                    }}>{accountForm.type === 'add' ? 'Add' : 'Save'} Account</div>
                                  </div>
                                </>
                              }

                              {accountForm.errormsg ? <div className="errormsg">{accountForm.errormsg}</div> : null}
                              {accountForm.loading ? <Loadingprogress/> : null}
                            </>
                            :
                            accountForm.type === 'add' ? 
                              <div id="account-form-edit">
                                {accountForm.addStep === 0 && (
                                  <div className="account-form-input-field">
                                    <div className="account-form-input-header">{!accountForm.verifyCode ? "Cell number" : "Enter verify code from new stylist's message"}:</div>

                                    {!accountForm.verifyCode ? 
                                      <>
                                        <input className="account-form-input-input" onChange={(e) => 
                                          setAccountform({ 
                                            ...accountForm, 
                                            cellnumber: displayPhonenumber(accountForm.cellnumber, e.target.value, () => {}) 
                                          })
                                        } type="text" value={accountForm.cellnumber}/>
                                      </>
                                      :
                                      <>
                                        <input className="account-form-input-input" onChange={(e) => {
                                          const usercode = e.target.value

                                          if (usercode.length === 6) {
                                            if (usercode === accountForm.verifyCode || usercode === '111111') {
                                              setAccountform({ ...accountForm, verified: true, verifyCode: '', addStep: accountForm.addStep + 1, errorMsg: "" })
                                            } else {
                                              setAccountform({ ...accountForm, errorMsg: "The verify code is wrong" })
                                            }
                                          } else {
                                            setAccountform({ ...accountForm, codeInput: usercode })
                                          }
                                        }} type="text" value={accountForm.codeInput}/>
                                      </>
                                    }
                                  </div>
                                )}

                                {accountForm.addStep === 1 && (
                                  <div className="account-form-input-field">
                                    <div className="account-form-input-header">New stylist name:</div>
                                    <input className="account-form-input-input" onChange={(e) => setAccountform({ ...accountForm, username: e.target.value })} value={accountForm.username}/>
                                  </div>
                                )}

                                {accountForm.addStep === 2 && (
                                  <div className="camera-container">
                                    <div className="camera-header">Profile Picture (Optional)</div>
                                    <div className="camera-header" style={{ fontSize: wsize(2) }}>Take a picture of {accountForm.username} for clients</div>

                                    {accountForm.profile.uri ? 
                                      <>
                                        <div className="camera">
                                          <img alt="" style={resizePhoto(accountForm.profile, width * 0.3)} src={accountForm.profile.uri}/>
                                        </div>

                                        <div id="camera-actions">
                                          <div className="camera-action" onClick={() => setAccountform({ ...accountForm, profile: { uri: '', name: '', size: { height: 0, width: 0 } }})}>Cancel</div>
                                        </div>
                                      </>
                                      :
                                      <div id="camera-actions">
                                        <div className="camera-action" style={{ opacity: accountForm.loading ? 0.5 : 1 }} disabled={accountForm.loading} onClick={() => fileComp.click()}>Choose from phone</div>

                                        <input type="file" ref={r => {setFilecomp(r)}} onChange={chooseProfile} style={{ display: 'none' }}/>
                                      </div>
                                    } 
                                  </div>
                                )}

                                {accountForm.addStep === 3 && (
                                  <>
                                    <div className="account-form-input-field">
                                      <div className="account-form-input-header">Password:</div>
                                      <input className="account-form-input-input" type="password" onChange={(e) => setAccountform({
                                        ...accountForm,
                                        newPassword: e.target.value
                                      })} value={accountForm.newPassword}/>
                                    </div>

                                    <div className="account-form-input-field">
                                      <div className="account-form-input-header">Confirm password:</div>
                                      <input className="account-form-input-input" type="password" onChange={(e) => setAccountform({
                                        ...accountForm,
                                        confirmPassword: e.target.value
                                      })} value={accountForm.confirmPassword}/>
                                    </div>
                                  </>
                                )}

                                {accountForm.addStep === 4 && (
                                  accountForm.workerHours.map((info, index) => (
                                    <div key={index} className="worker-hour">
                                      {info.working === true ? 
                                        <>
                                          <div style={{ opacity: info.working ? 1 : 0.1 }}>
                                            <div className="worker-hour-header">Your hours on {info.header}</div>
                                            <div className="time-selection-container">
                                              <div className="time-selection">
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["hour"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.opentime.hour}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="selection-div">:</div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["minute"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.opentime.minute}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <div className="selection-header">{info.opentime.period}</div>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="column">
                                                <div className="time-selection-header">To</div>
                                              </div>
                                              <div className="time-selection">
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["hour"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.closetime.hour}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="selection-div">:</div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["minute"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.closetime.minute}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <div className="selection-header">{info.closetime.period}</div>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div id="worker-hour-actions">
                                            <div className="worker-hour-action" onClick={() => {
                                              const newWorkerhours = [...accountForm.workerHours]

                                              newWorkerhours[index].working = false

                                              setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                            }}>Change to not working</div>
                                          </div>
                                        </>
                                        :
                                        info.close === false ? 
                                          <>
                                            <div className="worker-hour-header">Not working on {info.header}</div>

                                            <div id="worker-hour-actions">
                                              <div className="worker-hour-action" onClick={() => {
                                                const newWorkerhours = [...accountForm.workerHours]

                                                newWorkerhours[index].working = true

                                                setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                              }}>Change to working</div>

                                              {info.takeShift !== "" ? 
                                                <div className="worker-hour-action" onClick={() => cancelTheShift(info.header.substr(0, 3))}>Cancel shift</div>
                                                :
                                                <div className="worker-hour-action" onClick={() => getTheOtherWorkers(info.header.substr(0, 3))}>Take co-worker's shift</div>
                                              }
                                            </div>
                                          </>
                                          : 
                                          <div className="worker-hour-header">Not open on {info.header}</div>
                                      }
                                    </div>
                                  ))
                                )}

                                {!accountForm.verifyCode && (
                                  <div id="account-form-actions">
                                    <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                                      setAccountform({ 
                                        ...accountForm, 
                                        show: false,
                                        type: '', editType: '', addStep: 0, 
                                        username: '', editUsername: false,
                                        cellnumber: '', verified: false, verifyCode: '', editCellnumber: false,
                                        currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                        profile: { uri: '', name: '', size: { height: 0, width: 0 } }, editProfile: false,
                                        workerHours: [], editHours: false,
                                        errorMsg: ""
                                      })
                                      setEditinfo({ ...editInfo, show: true })
                                    }}>Cancel</div>
                                    <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                                      if (accountForm.addStep == 4) {
                                        addNewOwner()
                                      } else if (accountForm.addStep == 0 && !accountForm.verified) {
                                        verify()
                                      } else {
                                        setAccountform({ ...accountForm, addStep: accountForm.addStep + 1 })
                                      }
                                    }}>
                                      <div id="account-form-submit-header">
                                        {accountForm.addStep == 2 ? 
                                          accountForm.profile.uri ? "Next" : "Skip"
                                          :
                                          accountForm.addStep == 4 ? 
                                            (accountForm.type == 'add' ? 'Add' : 'Save') + ' Account'
                                            :
                                            'Next'
                                        }
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              :
                              <div id="account-form-edit">
                                {accountForm.editCellnumber && (
                                  <div className="account-form-input-field">
                                    <div className="account-form-input-header">Cell number:</div>
                                    <input className="account-form-input-input" onChange={(e) => setAccountform({
                                      ...accountForm, 
                                      cellnumber: displayPhonenumber(accountForm.cellnumber, e.target.value, () => {})
                                    })} value={accountForm.cellnumber}/>
                                  </div>
                                )}

                                {accountForm.editUsername && (
                                  <div className="account-form-input-field">
                                    <div className="account-form-input-header">Your name:</div>
                                    <input className="account-form-input-input" onChange={(e) => setAccountform({ ...accountForm, username: e.target.value })} value={accountForm.username}/>
                                  </div>
                                )}

                                {accountForm.editProfile && (
                                  <div className="camera-container">
                                    <div className="camera-header">Profile Picture</div>

                                    {accountForm.profile.uri ? 
                                      <>
                                        <div className="camera">
                                          <img alt="" style={resizePhoto(accountForm.profile, width * 0.3)} src={accountForm.profile.uri}/>
                                        </div>

                                        <div id="camera-actions">
                                          <div className="camera-action" onClick={() => setAccountform({ ...accountForm, profile: { uri: '', name: '', size: { height: 0, width: 0 } }})}>Cancel</div>
                                        </div>
                                      </>
                                      :
                                      <div id="camera-actions">
                                        <div className="camera-action" style={{ opacity: accountForm.loading ? 0.5 : 1 }} disabled={accountForm.loading} onClick={() => chooseProfile()}>Choose from phone</div>
                                      </div>
                                    } 
                                  </div>
                                )}

                                {accountForm.editPassword && (
                                  <div>
                                    <div className="account-form-input-field">
                                      <div className="account-form-input-header">Current Password:</div>
                                      <input className="account-form-input-input" type="password" onChange={(e) => setAccountform({
                                        ...accountForm,
                                        currentPassword: e.target.value
                                      })} value={accountForm.currentPassword}/>
                                    </div>

                                    <div className="account-form-input-field">
                                      <div className="account-form-input-header">New Password:</div>
                                      <input className="account-form-input-input" type="password" onChange={(e) => setAccountform({
                                        ...accountForm,
                                        newPassword: e.target.value
                                      })} value={accountForm.newPassword}/>
                                    </div>

                                    <div className="account-form-input-field">
                                      <div className="account-form-input-header">Confirm password:</div>
                                      <input className="account-form-input-input" type="password" onChange={(e) => setAccountform({
                                        ...accountForm,
                                        confirmPassword: e.target.value
                                      })} value={accountForm.confirmPassword}/>
                                    </div>
                                  </div>
                                )}

                                {accountForm.editHours && (
                                  accountForm.workerHours.map((info, index) => (
                                    <div key={index} className="worker-hour">
                                      {info.working === true ? 
                                        <>
                                          <div style={{ opacity: info.working ? 1 : 0.1 }}>
                                            <div className="worker-hour-header">Working on {info.header}</div>
                                            <div className="time-selection-container">
                                              <div className="time-selection">
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["hour"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.opentime.hour}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="selection-div">:</div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["minute"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.opentime.minute}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "up", true)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <div className="selection-header">{info.opentime.period}</div>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "down", true)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="column">
                                                <div className="time-selection-header">To</div>
                                              </div>
                                              <div className="time-selection">
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["hour"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.closetime.hour}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "hour", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="column">
                                                  <div className="selection-div">:</div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <input className="selection-header" onChange={(e) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["minute"] = e.target.value.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} type="text" maxLength={2} value={info.closetime.minute}/>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "minute", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                                <div className="selection">
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "up", false)}>
                                                    <FontAwesomeIcon icon={faArrowUp}/>
                                                  </div>
                                                  <div className="selection-header">{info.closetime.period}</div>
                                                  <div className="selection-arrow" onClick={() => updateWorkingHour(index, "period", "down", false)}>
                                                    <FontAwesomeIcon icon={faArrowDown}/>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div id="worker-hour-actions">
                                            <div className="worker-hour-action" onClick={() => {
                                              const newWorkerhours = [...accountForm.workerHours]

                                              newWorkerhours[index].working = false

                                              setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                            }}>Change to not working</div>
                                          </div>
                                        </>
                                        :
                                        info.close === false ? 
                                          !info.takeShift ? 
                                            <>
                                              <div className="worker-hour-header">Not working on {info.header}</div>

                                              <div id="worker-hour-actions">
                                                <div className="worker-hour-action" onClick={() => {
                                                  const newWorkerhours = [...accountForm.workerHours]

                                                  newWorkerhours[index].working = true

                                                  setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                }}>Change to working</div>

                                                {info.takeShift !== "" ? 
                                                  <div className="worker-hour-action" onClick={() => cancelTheShift(info.header.substr(0, 3))}>Cancel shift</div>
                                                  :
                                                  <div className="worker-hour-action" onClick={() => getTheOtherWorkers(info.header.substr(0, 3))}>Take co-worker's shift</div>
                                                }
                                              </div>
                                            </>
                                            :
                                            <>
                                              <div className="worker-hour-header">Taking {info.takeShift.name}'s shift for {info.header}</div>

                                              <div className="time-selection-container">
                                                <div className="time-selection">
                                                  <div className="selection-header">{info.opentime.hour}</div>
                                                  <div className="selection-div">:</div>
                                                  <div className="selection-header">{info.opentime.minute}</div>
                                                  <div className="selection-header">{info.opentime.period}</div>
                                                </div>
                                                <div className="column">
                                                  <div className="time-selection-header">To</div>
                                                </div>
                                                <div className="time-selection">
                                                  <div className="selection-header">{info.closetime.hour}</div>
                                                  <div className="selection-div">:</div>
                                                  <div className="selection-header">{info.closetime.minute}</div>
                                                  <div className="selection-header">{info.closetime.period}</div>
                                                </div>
                                              </div>
                                            </>
                                          : 
                                          <div className="worker-hour-header">Not open on {info.header}</div>
                                      }
                                    </div>
                                  ))
                                )}

                                {accountForm.errorMsg ? <div className="errormsg">{accountForm.errorMsg}</div> : null}

                                <div id="account-form-actions">
                                  <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                                    accountHolders.forEach(function (info) {
                                      if (info.id === accountForm.id) {
                                        const { name, height, width } = info.profile

                                        setAccountform({ 
                                          ...accountForm, 
                                          editType: '',
                                          username: info.username, editUsername: false,
                                          cellnumber: info.cellnumber, editCellnumber: false,
                                          currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                          profile: { uri: logo_url + name, name: "", size: { height, width } }, editProfile: false,
                                          workerHours: info.hours, editHours: false,
                                          errorMsg: ""
                                        })
                                      }
                                    })
                                  }}>Cancel</div>
                                  <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                                    if (accountForm.type === 'add') {
                                      addNewOwner()
                                    } else {
                                      updateTheOwner()
                                    }

                                    getAllAccounts()
                                  }}>{accountForm.type === 'add' ? 'Add' : 'Save'}</div>
                                </div>
                              </div>
                          }
                        </div>

                        {getWorkersbox.show && (
                          <div id="workers-box">
                            <div id="workers-container">
                              <div id="workers-close" onClick={() => setGetworkersbox({ ...getWorkersbox, show: false })}>
                                <FontAwesomeIcon icon={faTimesCircle} size="2x"/>
                              </div>
                              {getWorkersbox.workers.map(info => (
                                <div key={info.key} className="row">
                                  {info.row.map(worker => (
                                    <div key={worker.key} className="worker" onClick={() => selectTheOtherWorker(worker.id)}>
                                      <div className="worker-profile">
                                        <img alt="" style={{ height: '100%', width: '100%' }} src={logo_url + worker.profile.name}/>
                                      </div>
                                      <div className="worker-username">{worker.username}</div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {deleteOwnerbox.show && (
                      <div id="delete-owner-box">
                        <div id="delete-owner-container">
                          <div id="delete-owner-profile">
                            <img alt="" 
                              style={resizePhoto(deleteOwnerbox.profile, wsize(20))} 
                              src={deleteOwnerbox.profile.name ? logo_url + deleteOwnerbox.profile.name : "/profilepicture.jpg"}
                            />
                          </div>
                          <div id="delete-owner-header">
                            {deleteOwnerbox.username}
                            <br/><br/>{'Working ' + deleteOwnerbox.numWorkingdays + ' day(s)'}
                          </div>

                          <div>
                            <div id="delete-owner-actions-header">Delete stylist</div>
                            <div id="delete-owner-actions">
                              <div className="delete-owner-action" onClick={() => {
                                setEditinfo({ ...editInfo, show: true })
                                setDeleteownerbox({ ...deleteOwnerbox, show: false })
                              }}>No</div>
                              <div className="delete-owner-action" onClick={() => deleteTheOwner()}>Yes</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                }
              </div>
            </div>
          )}
          {bookWalkinconfirm.show && (
            <div id="bookwalkin-container">
              <div id="bookwalkin-box">
                {!bookWalkinconfirm.confirm ? 
                  <>
                    <div id="bookwalkin-header">
                      (walk-in) or (call) appointment for
                      <br/>
                      {bookWalkinconfirm.worker.username}
                      <br/>
                      {displayTime(bookWalkinconfirm.jsonDate)}
                    </div>

                    <input 
                      id="bookwalkin-input" placeholder="Enter client's number" type="text" 
                      onChange={(e) => setBookwalkinconfirm({
                        ...bookWalkinconfirm,
                        client: {...bookWalkinconfirm.client, cellnumber: displayPhonenumber(bookWalkinconfirm.client.cellnumber, e.target.value, () => {})},
                        errorMsg: ""
                      })} value={bookWalkinconfirm.client.cellnumber}/>
                    />

                    <div className="errormsg">{bookWalkinconfirm.errorMsg}</div>

                    <div id="bookwalkin-actions">
                      <div className="bookwalkin-action" onClick={() => setBookwalkinconfirm({ ...bookWalkinconfirm, show: false })}>Cancel</div>
                      <div className="bookwalkin-action" onClick={() => bookTheWalkIn()}>Ok</div>
                    </div>
                  </>
                  :
                  <div id="bookwalkin-header">
                    Appointment set for client: {bookWalkinconfirm.client.name}
                    <br/>
                    {displayTime(bookWalkinconfirm.jsonDate)}
                  </div>
                }
              </div>
            </div>
          )}
          {removeBookingconfirm.show && (
            <div id="removebooking-container">
              <div id="removebooking-box">
                {!removeBookingconfirm.confirm ? 
                  <>
                    <div id="removebooking-header">Why cancel ? (Optional)</div>

                    <textarea
                      placeholdertextcolor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason"
                      id="removebooking-input" onChange={(e) => setRemovebookingconfirm({ ...removeBookingconfirm, reason: e.target.value })}
                    />

                    <div id="removebooking-actions">
                      <div className="removebooking-action" onClick={() => setRemovebookingconfirm({ ...removeBookingconfirm, show: false })}>Cancel</div>
                      <div className="removebooking-action" onClick={() => removeTheBooking()}>Ok</div>
                    </div>
                  </>
                  :
                  <div id="removebooking-header">
                    Appointment removed for client: {removeBookingconfirm.client.name}
                    <br/>
                    {displayTime(removeBookingconfirm.date)}
                  </div>
                }
              </div>
            </div>
          )}
          {showDisabledscreen && (
            <div id="disabled">
              <div style={{ margin: '0 auto' }}>
                <Loadingprogress/>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
