import './list.scss';
import React, { useEffect, useState } from 'react';
import { getAllLocations } from '../../../apis/business/locations'
import { resizePhoto } from 'geottuse-tools';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { socket, logo_url } from '../../../businessInfo'

const width = window.innerWidth
const height = window.innerHeight
const wsize = p => {return width * (p / 100)}

export default function List(props) {
  const [locations, setLocations] = useState([])

  const getTheAllLocations = () => {
    const ownerid = localStorage.getItem("ownerid")

    getAllLocations(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLocations(res.locations)
        }
      })
  }
  const logout = () => {
    const ownerid = localStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      localStorage.clear()

      window.location = "/auth"
    })
  }

  useEffect(() => {
    getTheAllLocations()
  }, [])

  return (
    <div id="list">
      <div id="box">
        <div id="header">
          <div id="list-add" onClick={() => {
            localStorage.setItem("phase", "locationsetup")
            localStorage.setItem("newBusiness", "true")

            window.location = "/locationsetup"
          }}>
            <div className="column"><div id="list-add-header">Add a business</div></div>
            <div className="column"><FontAwesomeIcon icon={faPlus} size="3x"/></div>
          </div>
        </div>

        <div id="body">
          {locations.map((location, index) => (
            <div className="location" onClick={() => {
              localStorage.setItem("locationid", location.id.toString())
              localStorage.setItem("locationtype", location.type)
              localStorage.setItem("phase", "main")

              window.location = "/main"
            }}>
              <div className="logo">
                <img style={{ height: '100%', width: '100%' }} src={logo_url + location.logo.name}/>
              </div>
              <div className="column">
                <div className="location-name">{location.name}</div>
                <div className="location-address">{location.address}</div>
              </div>
            </div>
          ))}
        </div>

        <div id="bottom-navs">
          <div id="bottom-navs-row">
            <div className="column">
              <div className="bottom-nav" onClick={() => logout()}>Log-Out</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
