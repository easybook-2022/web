import './settings.scss';
import React, { useState, useEffect } from 'react'
import Geocode from "react-geocode";
import GoogleMapReact from 'google-map-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationPin, faCircleNotch, faArrowUp, faArrowDown, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { loginInfo, ownerRegisterInfo, logo_url, googleApikey, timeControl } from '../../../businessInfo'
import { displayPhonenumber, resizePhoto } from 'geottuse-tools'
import { addOwner, updateOwner, deleteOwner, getWorkerInfo, getOtherWorkers, getAccounts, getOwnerInfo } from '../../../apis/business/owners'
import { getLocationProfile, updateLocation, setLocationHours, setReceiveType } from '../../../apis/business/locations'

// widgets
import Loadingprogress from '../../../widgets/loadingprogress';

// bank account
let { accountNumber, countryCode, currency, routingNumber, accountHolderName } = loginInfo

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return window.innerWidth * (p / 100)}

Geocode.setApiKey(googleApikey);
Geocode.setLanguage("en");

const LocationPin = () => <FontAwesomeIcon icon={faLocationPin} size="2x"/>

export default function Settings() {
  const [ownerId, setOwnerid] = useState('')
  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)

  // location information
  const [locationInfo, setLocationinfo] = useState('')
  const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, address: '' })
  const [isOwner, setIsowner] = useState(false)
  const [storeName, setStorename] = useState(loginInfo.storeName)
  const [phonenumber, setPhonenumber] = useState(loginInfo.phonenumber)
  const [addressOne, setAddressone] = useState(loginInfo.addressOne)
  const [addressTwo, setAddresstwo] = useState(loginInfo.addressTwo)
  const [city, setCity] = useState(loginInfo.city)
  const [province, setProvince] = useState(loginInfo.province)
  const [postalcode, setPostalcode] = useState(loginInfo.postalcode)
  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }, loading: false })
  const [locationReceivetype, setLocationreceivetype] = useState('')
  const [type, setType] = useState('')

  // location hours
  const [days, setDays] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
    { key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
    { key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
    { key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
    { key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
    { key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
    { key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false }
  ])

  // co-owners
  const [accountHolders, setAccountholders] = useState([])
  const [hoursRange, setHoursrange] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" }
  ])

  const [errorMsg, setErrormsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [accountForm, setAccountform] = useState({
    show: false,
    type: '', editType: '', addStep: 0, id: -1,
    username: '', editUsername: false,
    cellnumber: '', editCellnumber: false,
    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
    profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false,
    workerHours: [], editHours: false,
    loading: false,
    errorMsg: ''
  })
  const [deleteOwnerbox, setDeleteownerbox] = useState({
    show: false,
    id: -1, username: '', profile: '', numWorkingdays: 0
  })
  const [editInfo, setEditinfo] = useState({ show: false, type: '' })
  const [getWorkersbox, setGetworkersbox] = useState({
    show: false,
    day: '',
    workers: []
  })

  const updateYourLocation = async() => {
    if (storeName && phonenumber && addressOne && city && province && postalcode) {
      let longitude, latitude
      const address = `${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`
      const info = await Geocode.fromAddress(address)
      let { lat, lng } = info.results[0].geometry.location;

      longitude = lat
      latitude = lng

      const id = localStorage.getItem("locationid")
      const time = (Date.now() / 1000).toString().split(".")[0]
      const data = {
        id, storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
        longitude, latitude, ownerid: ownerId, time
      }

      setLoading(true)

      updateLocation(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { id } = res

            setEditinfo({ ...editInfo, show: false, type: '' })
            setLoading(false)
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
      if (!storeName) {
        setErrormsg("Please enter your store name")

        return
      }

      if (!phonenumber) {
        setErrormsg("Please enter your store phone number")

        return
      }

      if (!addressOne) {
        setErrormsg("Please enter the Address # 1")

        return
      }

      if (!addressTwo) {
        setErrormsg("Please enter the Address # 2")

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

  const updateTime = (index, timetype, dir, open) => {
    const newDays = [...days]
    let value, period

    value = open ? 
      newDays[index].opentime[timetype]
      :
      newDays[index].closetime[timetype]

    switch (timetype) {
      case "hour":
        value = parseInt(value)
        value = dir === "up" ? value + 1 : value - 1

        if (value > 12) {
          value = 1
        } else if (value < 1) {
          value = 12
        }

        if (value < 10) {
          value = "0" + value
        } else {
          value = value.toString()
        }

        break
      case "minute":
        value = parseInt(value)
        value = dir === "up" ? value + 1 : value - 1

        if (value > 59) {
          value = 0
        } else if (value < 0) {
          value = 59
        }

        if (value < 10) {
          value = "0" + value
        } else {
          value = value.toString()
        }

        break
      case "period":
        value = value === "AM" ? "PM" : "AM"

        break
      default:
    }

    if (open) {
      newDays[index].opentime[timetype] = value
    } else {
      newDays[index].closetime[timetype] = value
    }

    setDays(newDays)
  }
  const dayClose = index => {
    const newDays = [...days]

    newDays[index].close = !newDays[index].close

    setDays(newDays)
  }
  const updateLocationHours = () => {
    setLoading(true)

    const locationid = localStorage.getItem("locationid")
    const hours = {}

    days.forEach(function (day) {
      let { opentime, closetime, close } = day
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

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
    })

    const data = { locationid, hours }

    setLocationHours(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLoading(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setLoading(false)
        }
      })
  }

  const addNewOwner = () => {
    setAccountform({ ...accountForm, loading: true, errorMsg: "" })

    const hours = {}

    accountForm.workerHours.forEach(function (workerHour) {
      let { opentime, closetime, working, takeShift } = workerHour
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

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
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAccountform({
            ...accountForm, show: false, type: '', username: '', cellnumber: '', 
            password: '', confirmPassword: '', profile: { uri: '', name: '', size: { height: 0, width: 0 } }, 
            loading: false, errorMsg: ""
          })
          getAllAccounts()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAccountform({ ...accountForm, errormsg })
        }
      })
  }
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...accountForm.workerHours], hoursRangeInfo = [...hoursRange]
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

      setAccountform({ ...accountForm, workerHours: newWorkerhours })
    }
  }
  const working = index => {
    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours[index].working = !newWorkerhours[index].working

    setAccountform({ ...accountForm, workerHours: newWorkerhours })
  }
  const updateTheOwner = () => {
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
        if (res.status === 200) {
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
            profile: { name: "", uri: "", size: { width: 0, height: 0 }}, editProfile: false, 
            loading: false, errorMsg: ""
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data

          setAccountform({ ...accountForm, errorMsg: errormsg })
        }
      })
  }
  const deleteTheOwner = id => {
    if (!deleteOwnerbox.show) {
      getWorkerInfo(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { username, profile, days } = res

            setDeleteownerbox({
              ...deleteOwnerbox,
              show: true,
              id, username, profile, numWorkingdays: Object.keys(days).length
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      const { id } = deleteOwnerbox

      deleteOwner(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const newAccountholders = [...accountHolders]

            newAccountholders.forEach(function (info, index) {
              if (info.id === id) {
                newAccountholders.splice(index, 1)
              }
            })

            setAccountholders(newAccountholders)
            setDeleteownerbox({ ...deleteOwnerbox, show: false })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const cancelTheShift = async(day) => {
    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) === day) {
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
        if (res.status === 200) {
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
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const selectTheOtherWorker = id => {
    const { day } = getWorkersbox

    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) === day) {
        info.takeShift = id.toString()
      }
    })

    setAccountform({...accountForm, workerHours: newWorkerhours })
    setGetworkersbox({ ...getWorkersbox, show: false })
  }

  const getTheLocationProfile = () => {
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
          const { name, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours, type, receiveType } = res.info
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

          setStorename(name)
          setPhonenumber(phonenumber)
          setAddressone(addressOne)
          setAddresstwo(addressTwo)
          setCity(city)
          setProvince(province)
          setPostalcode(postalcode)
          setLogo({ ...logo, uri: logo_url + logo.name, name: '', size: { width: logo.width, height: logo.height }})
          setType(type)
          setLocationreceivetype(receiveType)
          setDays(hours)
          setHoursrange(hours)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
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
  const getAllAccounts = () => {
    const locationid = localStorage.getItem("locationid")
    const ownerid = localStorage.getItem("ownerid")

    getAccounts(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setOwnerid(ownerid)
          setAccountholders(res.accounts)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const snapProfile = () => {
    setAccountform({ ...accountForm, loading: true })

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

      setAccountform({
        ...accountForm,
        profile: { uri, name: `${char}.jpg`, size: { width: 640, height: 480 }},
        loading: false
      })
    }
  }
  const chooseProfile = e => {
    if (e.target.files && e.target.files[0]) {
      setAccountform({ ...accountForm, loading: true })

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

          setLogo({ ...logo, uri: e.target.result, name: `${char}.jpg`, size, loading: false })
        }

        imageReader.src = e.target.result
      }

      reader.readAsDataURL(e.target.files[0])
    }
  }
  const setTheReceiveType = type => {
    const locationid = localStorage.getItem("locationid")
    const data = { locationid, type }

    setReceiveType(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLocationreceivetype(type)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  
  useEffect(() => {
    getTheLocationProfile()
    getTheOwnerInfo()
    getAllAccounts()
  }, [])

  return (
    <div id="settings">
      <div id="settings-container">
        <div id="box" style={{ opacity: loading ? 0.6 : 1 }}>
          <div id="goback" onClick={() => window.location = "/main"}>Go Back</div>

          {isOwner === true && (
            <>
              <div className="edit-button" onClick={() => setEditinfo({ ...editInfo, show: true, type: 'information' })}>Edit Location Info</div>
              <div className="edit-button" onClick={() => setEditinfo({ ...editInfo, show: true, type: 'hours' })}>
                Edit 
                {(type === "hair" || type === "nail") && " Salon "} 
                {type === "restaurant" && " Restaurant "}
                {type === "store" && " Store "}
                Hour(s)
              </div>
            </>
          )}

          {(type === "hair" || type === "nail") && <div className="edit-button" onClick={() => setEditinfo({ ...editInfo, show: true, type: 'users' })}>Edit Stylist(s) Info</div>}
          {((type === "hair" || type === "nail") && isOwner === true) && <div className="edit-button" onClick={() => setEditinfo({ ...editInfo, show: true, type: 'receivetype' })}>Edit Receive Type</div>}
        </div>

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

                      {(type === "hair" || type === "nail") && 
                        <div 
                          className="account-info-edit" 
                          onClick={() => setAccountform({ ...accountForm, editHours: true, editType: 'hours' })}
                          >Change your days and hours
                        </div>
                      }
                    </>
                    :
                    <>
                      {accountForm.workerHours.map((info, index) => (
                        <div key={index} className="worker-hour">
                          {info.working === true ? 
                            <>
                              <div>
                                <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Working on</div> {info.header}</div>
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
                              <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Not working on</div> {info.header}</div>

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
                  <div className="account-form-edit">
                    {accountForm.addStep === 0 && (
                      <div className="account-form-input-field">
                        <div className="account-form-input-header">Cell number:</div>
                        <input className="account-form-input-input" onChange={(e) => 
                          setAccountform({ 
                            ...accountForm, 
                            cellnumber: displayPhonenumber(accountForm.cellnumber, e.target.value, () => {}) 
                          })
                        } type="text" value={accountForm.cellnumber}/>
                      </div>
                    )}

                    {accountForm.addStep === 1 && (
                      <div className="account-form-input-field">
                        <div className="account-form-input-header">Your name:</div>
                        <input className="account-form-input-input" onChange={(e) => setAccountform({ ...accountForm, username: e.target.value })} value={accountForm.username}/>
                      </div>
                    )}

                    {accountForm.addStep === 2 && (
                      <div id="camera-container">
                        <div id="camera-header">Profile Picture</div>

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
                                <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Working on</div> {info.header}</div>
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
                                <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Not working on</div> {info.header}</div>

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
                              <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Not open on</div> {info.header}</div>
                          }
                        </div>
                      ))
                    )}

                    <div id="account-form-actions">
                      <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                        setAccountform({ 
                          ...accountForm, 
                          show: false,
                          type: '', editType: '', addStep: 0, 
                          username: '', editUsername: false,
                          cellnumber: '', editCellnumber: false,
                          currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                          profile: { uri: '', name: '', size: { height: 0, width: 0 } }, editProfile: false,
                          workerHours: [], editHours: false,
                          errorMsg: ""
                        })
                        setEditinfo({ ...editInfo, show: true })
                      }}>Cancel</div>
                      <div className="account-form-action" style={{ opacity: accountForm.loading ? 0.3 : 1 }} disabled={accountForm.loading} onClick={() => {
                        if (accountForm.addStep === 4) {
                          addNewOwner()
                          getAllAccounts()
                        } else {
                          setAccountform({ ...accountForm, addStep: accountForm.addStep + 1 })
                        }
                      }}>
                        <div id="account-form-submit-header">
                          {accountForm.addStep === 4 ? 
                            (accountForm.type === 'add' ? 'Add' : 'Save') + ' Account'
                            :
                            'Next'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  :
                  <div className="account-form-edit">
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
                      <div id="camera-container">
                        <div id="camera-header">Profile Picture</div>

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
                                <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Working on</div> {info.header}</div>
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
                                  <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Not working on</div> {info.header}</div>

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
                                  <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Taking {info.takeShift.name}'s shift for</div> {info.header}</div>

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
                              <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Not open on</div> {info.header}</div>
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
                <img alt="" style={{ height: '100%', width: '100%' }} src={logo_url + deleteOwnerbox.profile.name}/>
              </div>
              <div id="delete-owner-header">
                {deleteOwnerbox.username}
                <br/><br/>{'Working ' + deleteOwnerbox.numWorkingdays + ' day(s)'}
              </div>

              <div>
                <div id="delete-owner-actions-header">Are you sure you want to remove this stylist</div>
                <div id="delete-owner-actions">
                  <div className="delete-owner-action" onClick={() => setDeleteownerbox({ ...deleteOwnerbox, show: false })}>No</div>
                  <div className="delete-owner-action" onClick={() => deleteTheOwner()}>Yes</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {editInfo.show && (
          <div id="edit-info-box">
            <div id={"edit-info-" + editInfo.type + "-container"}>
              <div id="edit-info-close" onClick={() => setEditinfo({ ...editInfo, show: false, type: '' })}><FontAwesomeIcon icon={faTimesCircle} size="3x"/></div>

              {editInfo.type == 'information' && (
                <>
                  {locationInfo === "" && (
                    <>
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
                    </>
                  )}

                  {locationInfo === "away" && (
                    <>
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

                      <div className="header">Edit Address</div>

                      <div id="inputs-box">
                        <div className="input-container">
                          <div className="input-header">{type}'s name:</div>
                          <input className="input" onChange={(e) => setStorename(e.target.value)} value={storeName}/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">{type}'s Phone number:</div>
                          <input className="input" onChange={(e) => setPhonenumber(displayPhonenumber(phonenumber, e.target.value, () => {}))} value={phonenumber} type="text"/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">{type}'s address #1:</div>
                          <input className="input" onChange={(e) => setAddressone(e.target.value)} value={addressOne} type="text"/>
                        </div>
                        <div className="input-container">
                          <div className="input-header">{type}'s address #2:</div>
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

                        {errorMsg ? <div className="errormsg">{errorMsg}</div> : null }
                      </div>
                    </>
                  )}

                  {locationInfo === "destination" && (
                    <div id="location-container-center">
                      <div className="location-header">Your {(type == 'hair' || type == 'nail') ? type + ' salon' : type} is located at</div>

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

                  <div id="camera-container">
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

                  <div className="update-button" disabled={loading} onClick={() => updateYourLocation()}>Save</div>
                </>
              )}

              {editInfo.type === 'hours' && (
                <>
                  <div className="header">
                    Edit 
                    {(type === "hair" || type === "nail") && " Salon "} 
                    {type === "restaurant" && " Restaurant "}
                    {type === "store" && " Store "}
                    Hour(s)
                  </div>

                  {days.map((info, index) => (
                    <div key={index} className="worker-hour">
                      {info.close === false ? 
                        <>
                          <div style={{ opacity: info.close ? 0.1 : 1, width: '100%' }}>
                            <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Open on</div> {info.header}</div>
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
                          <div className="worker-hour-header"><div style={{ fontWeight: '300' }}>Not open on</div> {info.header}</div>

                          <div className="worker-touch" onClick={() => {
                            const newDays = [...days]

                            newDays[index].close = false

                            setDays(newDays)
                          }}>Change to open</div>
                        </>
                      }
                    </div>
                  ))}

                  <div className="update-button" disabled={loading} onClick={() => updateLocationHours()}>Save</div>
                </>
              )}

              {editInfo.type === 'users' && (
                <div id="account-holders">
                  <div className="header">Edit Stylist(s)</div>

                  {isOwner === true && (
                    <div id="account-holders-add" onClick={() => {
                      setAccountform({
                        ...accountForm,
                        show: true,
                        type: 'add',
                        username: ownerRegisterInfo.username,
                        cellnumber: ownerRegisterInfo.cellnumber,
                        currentPassword: ownerRegisterInfo.password, 
                        newPassword: ownerRegisterInfo.password, 
                        confirmPassword: ownerRegisterInfo.password,
                        workerHours: [...hoursRange]
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
                            }}>
                              Change 
                              {ownerId === info.id ? " Info (your)" : " hours"}
                            </div>
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

              {editInfo.type === 'receivetype' && (
                <div id="receive-types-box">
                  <div id="receive-types-header">How do you want to receive appointments</div>

                  <div id="receive-types">
                    <div className="receive-type" style={{ backgroundColor: locationReceivetype === 'stylist' ? 'black' : '', color: locationReceivetype === 'stylist' ? 'white' : '' }} onClick={() => setTheReceiveType('stylist')}>By each stylist</div>
                    <div className="receive-type" style={{ backgroundColor: locationReceivetype === 'computer' ? 'black' : '', color: locationReceivetype === 'computer' ? 'white' : '' }} onClick={() => setTheReceiveType('computer')}>By main computer</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {(logo.loading || loading || accountForm.loading) && <div id="hidden-box"><Loadingprogress/></div>}
      </div>
    </div>
  )
}
