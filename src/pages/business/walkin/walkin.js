import './walkin.scss';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import { socket, logo_url } from '../../../businessInfo'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getLocationHours, getLocationProfile } from '../../../apis/business/locations'
import { getAllStylists, getAllWorkersTime, getWorkersHour } from '../../../apis/business/owners'
import { getMenus } from '../../../apis/business/menus'
import { bookWalkIn } from '../../../apis/business/schedules'

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return width * (p / 100)}

export default function Authoption() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const [locationId, setLocationid] = useState(0)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [step, setStep] = useState(0)
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ id: -1, username: '', hours: {}, loading: false })
  const [hoursInfo, setHoursinfo] = useState({})
  const [allStylists, setAllstylists] = useState({ stylists: [], numStylists: 0 })
  const [allWorkerstime, setAllworkerstime] = useState({})
  const [requestInfo, setRequestinfo] = useState({ search: '', error: false })
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [] })
  const [scheduled, setScheduled] = useState({})
  const [confirm, setConfirm] = useState({ show: false, worker: -1, search: "", serviceInfo: null, showClientInput: false, clientName: "", cellnumber: "", confirm: false, timeDisplay: "" })
  const [loaded, setLoaded] = useState(false)

  const getAllTheStylists = () => {
    const locationid = localStorage.getItem("locationid")
    const locationtype = localStorage.getItem("locationtype")

    getAllStylists(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists({ ...allStylists, stylists: res.owners, numStylists: res.numWorkers })
          setLocationid(locationid)
          setType(locationtype)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheLocationProfile = () => {
    const locationid = localStorage.getItem("locationid")
    const data = { locationid }

    getLocationProfile(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setName(res.info.name)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        }
      })
  }
  const getTheLocationHours = () => {
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
  const getAllTheWorkersTime = () => {
    const locationid = localStorage.getItem("locationid")
    
    getAllWorkersTime(locationid)
    .then((res) => {
      if (res.status == 200) {
        return res.data
      }
    })
    .then((res) => {
      if (res) {
        setAllworkerstime(res.workers)
      }
    })
    .catch((err) => {
      if (err.response && err.response.status == 400) {
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
          setLoaded(true)
        }
      })
  }
  const selectWorker = info => {
    const { id, username } = info
    const workingDays = {}

    for (let day in allWorkerstime) {
      allWorkerstime[day].forEach(function (workerInfo) {
        const { workerId, start, end } = workerInfo

        if (workerId == id) {
          workingDays[day] = { start, end }
        }
      })
    }

    setSelectedworkerinfo({ ...selectedWorkerinfo, id, username, hours: workingDays })
    getAllMenus()
  }
  const getAllMenus = async() => {
    getMenus(locationId)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setMenuinfo({ ...menuInfo, list: res.list, photos: res.photos })
          setStep(2)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const displayList = info => {
    let { id, image, name, list, listType } = info

    return (
      <div>
        {name ?
          <div className="menu">
            <div className="menu-row">
              <div className="menu-image-holder">
                <img alt="" className="menu-image" style={resizePhoto(image, 50)} src={image.name ? logo_url + image.name : "/noimage.jpeg"}/>
              </div>
              <div className="column"><div className="menu-name">{name} (Menu)</div></div>
            </div>
            {list.length > 0 && list.map((info, index) => (
              <div key={"list-" + index}>
                {info.listType === "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType })
                  :
                  <div className="item">
                    <div className="item-image-holder">
                      <img alt="" className="item-image" style={resizePhoto(info.image, wsize(10))} src={info.image.name ? logo_url + info.image.name : "/noimage.jpeg"}/>
                    </div>
                    <div className="column"><div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div></div>
                    <div className="column">
                      <div className="item-action" onClick={() => bookTheWalkIn(info)}>Pick <strong>{info.name}</strong></div>
                    </div>
                  </div>
                }
              </div>
            ))}
          </div>
          :
          list.map((info, index) => (
            <div key={"list-" + index}>
              {info.listType === "list" ? 
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list })
                :
                <div className="item">
                  <div className="item-image-holder">
                    <img alt="" className="item-image" style={resizePhoto(info.image, wsize(10))} src={info.image.name ? logo_url + info.image.name : "/noimage.jpeg"}/>
                  </div>
                  <div className="column"><div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div></div>
                  <div className="column">
                    <div className="item-action" onClick={() => bookTheWalkIn(info)}>Pick <strong>{info.name}</strong></div>
                  </div>
                </div>
              }
            </div>
          ))
        }
      </div>
    )
  }
  const bookTheWalkIn = serviceInfo => {
    if (!confirm.show) {
      let { id, username } = selectedWorkerinfo
      const { search } = requestInfo
      const time = new Date(Date.now())
      const day = days[time.getDay()], month = months[time.getMonth()], date = time.getDate(), year = time.getFullYear()
      const calcDay = day + " " + month + " " + date + " " + year, now = Date.now()

      if (id == -1) {
        const workers = allWorkerstime[day.substr(0, 3)]
        let activeWorkers = [], info

        workers.forEach(function (worker) {
          let { start, end, workerId, username } = worker

          if (now >= Date.parse(calcDay + " " + start) && now <= Date.parse(calcDay + " " + end)) {
            activeWorkers.push({ workerId, username })
          }
        })

        info = activeWorkers[Math.floor(Math.random() * (activeWorkers.length)) + 0]
        id = info.workerId
        username = info.username
      }

      setConfirm({ ...confirm, show: true, worker: { id, username }, search, serviceInfo })
    } else {
      const { worker, search, serviceInfo, clientName } = confirm
      const time = new Date(Date.now()), hour = time.getHours(), minute = time.getMinutes()
      const jsonDate = {"day":days[time.getDay()].substr(0, 3),"month":months[time.getMonth()],"date":time.getDate(),"year":time.getFullYear(), hour, minute}
      const data = { 
        workerid: worker.id, locationid: locationId, 
        time: jsonDate, note: "", type, 
        client: {
          name: !serviceInfo ? search : "",
          type: !serviceInfo ? "service" : ""
        }, serviceid: serviceInfo ? serviceInfo.id : null,
      }
      const timeDisplay = (hour > 12 ? hour - 12 : hour) + ":" + (minute < 10 ? "0" + minute : minute) + " " + (hour < 12 ? "am" : "pm")

      bookWalkIn(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setConfirm({ ...confirm, showClientInput: false, timeDisplay })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false, client: { name: "", cellnumber: "" }, confirm: false })
              setStep(0)
            }, 3000)
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data

          }
        })
    }
  }
  const logout = () => {
    const ownerid = localStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      localStorage.clear()

      window.location = "/auth"
    })
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["day"] + " " + date["month"] + " " + date["date"] + " " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }

  const initialize = () => {
    getAllTheStylists()
    getTheLocationProfile()
    getTheLocationHours()
    getAllTheWorkersTime()
    getAllScheduledTimes()
  }

  useEffect(() => initialize(), [])

  return (
    <div id="walkin">
      <div id="box">
        {step === 0 && (
          <div id="headers">
            <div className="header">
              Hi Client{':)'}<br/>
              Welcome to {name}
            </div>

            <div className="header">Easily pick a stylist and service<br/>(you want)<br/>then have a seat</div>

            <div id="done" onClick={() => setStep(1)}>Begin</div>
          </div>
        )}

        {step === 1 && (
          <div id="worker-selection">
            <div id="worker-selection-header">Pick a stylist (Optional)</div>
            
            <div id="workers-list">
              {allStylists.stylists.map((item, index) => (
                <div key={item.key} className="workers-row">
                  {item.row.map(info => (
                    info.id ? 
                      <div key={info.key} className="worker" style={{ backgroundColor: (selectedWorkerinfo.id === info.id) ? 'rgba(0, 0, 0, 0.3)' : null, pointerEvents: selectedWorkerinfo.loading ? "none" : "" }} onClick={() => selectWorker(info)}>
                        <div className="worker-profile">
                          <img 
                            alt="" 
                            src={info.profile.name ? logo_url + info.profile.name : "/profilepicture.jpg"} 
                            style={resizePhoto(info.profile, 100)}
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

        {(step === 2 && (menuInfo.photos.length > 0 || menuInfo.list.length > 0)) && (
          <div>
            <div id="open-input" onClick={() => setRequestinfo({ ...requestInfo, show: true })}>Search</div>

            <div id="menu">{displayList({ id: "", name: "", image: "", list: menuInfo.list })}</div>
          </div>
        )}

        <div id="bottom-navs">
          <div id="bottom-navs-row">
            <div className="column">
              <div className="bottom-nav" onClick={() => logout()}>Log-Out</div>
            </div>
          </div>
        </div>
      </div>

      {(confirm.show || requestInfo.show) && (
        <div id="hidden-box">
          {confirm.show && (
            <div id="bookwalkin-container">
              <div id="bookwalkin-box">
                {!confirm.confirm ? 
                  <>
                    <div id="bookwalkin-headers">
                      <div className="bookwalkin-header">Confirming....</div>

                      <div className="bookwalkin-header" style={{ marginTop: '10%' }}>
                        {confirm.serviceInfo ? confirm.serviceInfo.name : confirm.search}
                      </div>

                      <div className="bookwalkin-header">Stylist: {confirm.worker.username}</div>
                    </div>

                    <div id="bookwalkin-actions">
                      <div className="bookwalkin-action" onClick={() => setConfirm({ ...confirm, show: false })}>Cancel</div>
                      <div className="bookwalkin-action" onClick={() => setConfirm({ ...confirm, confirm: true, showClientInput: true })}>Ok</div>
                    </div>
                  </>
                  :
                  confirm.showClientInput ? 
                    <>
                      <input id="bookwalkin-input" placeholder="Enter your name" onChange={e => setConfirm({ ...confirm, clientName: e.target.value })}/>

                      <div id="done" onClick={() => bookTheWalkIn()}>Done</div>
                    </>
                    :
                    <div className="bookwalkin-header">
                      Ok, we will call you soon. Your estimated time:
                      <br/><br/>{confirm.timeDisplay}
                    </div>
                }
              </div>
            </div>
          )}

          {requestInfo.show && (
            <div id="service-input-box">
              <div id="service-input-header">
                <div id="service-input-close" onClick={() => setRequestinfo({ ...requestInfo, show: false })}>
                  <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                </div>

                {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
                  <>
                    <div id="menu-input-box">
                      <input 
                        id="menu-input" type="text" 
                        placeholder={
                          "Enter " + 
                          (type == "restaurant" && "meal" || type == "store" && "product" || (type == "hair" || type == "nail") && "service") 
                          + " # or name"
                        }
                        placeholdertextcolor="rgba(0, 0, 0, 0.5)"
                        onChange={e => setRequestinfo({ ...requestInfo, search: e.target.value, error: false })} maxLength="37"
                      />

                      <div id="menu-input-touch" onClick={() => {
                        if (requestInfo.search) {
                          setRequestinfo({ ...requestInfo, show: false })

                          bookTheWalkIn()
                        } else {
                          setRequestinfo({ ...requestInfo, error: true })
                        }
                      }}>Next</div>
                    </div>
                    {requestInfo.error && <div className="errormsg">Your request is empty</div>}
                  </>
                )}
              </div>

              <div id="menu-photos">
                {menuInfo.photos.length > 0 && (
                  menuInfo.photos[0].row && (
                    menuInfo.photos.map(info => (
                      info.row.map(item => (
                        item.photo && item.photo.name && (
                          <div key={item.key} className="menu-photo" style={resizePhoto(item.photo, wsize(95)), { borderRadius: wsize(95) / 2 }}>
                            <img 
                              style={{ widht: '100%', height: '100%' }}
                              source={{ uri: logo_url + item.photo.name }}
                            />
                          </div>
                        )
                      ))
                    ))
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
