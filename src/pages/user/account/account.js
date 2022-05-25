import './account.scss';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/fontawesome-free-solid'
import { logo_url } from '../../../userInfo'
import { displayPhonenumber } from 'geottuse-tools'
import { getUserInfo, updateUser } from '../../../apis/user/users'

// widgets
import Loadingprogress from '../../../widgets/loadingprogress';

const wsize = p => {return window.innerWidth * (p / 100)}

export default function Account(props) {
  const [username, setUsername] = useState('')
  const [cellnumber, setCellnumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmpassword] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const getTheUserInfo = async() => {
    const userid = localStorage.getItem("userid")

    getUserInfo(userid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { username, cellnumber } = res.userInfo

          setUsername(username)
          setCellnumber(cellnumber)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const updateAccount = async() => {
    const userid = localStorage.getItem("userid")

    if (username && cellnumber) {
      const data = { userid, username, cellnumber, password, confirmPassword }

      setLoading(true)

      updateUser(data)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setLoading(false)

            window.location = "/"
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
      if (!username) {
        setErrormsg("Please enter a username you like")

        return
      }

      if (!cellnumber) {
        setErrormsg("Please enter your cell phone number")

        return
      }

      if (password || confirmPassword) {
        if (!password) {
          setErrormsg("Please enter your new password")
        } else {
          setErrormsg("Please confirm your new password")
        }

        return
      }
    }
  }

  useEffect(() => {
    getTheUserInfo()
  }, [])

  return (
    <div id="account">
      <div id="box">
        {loaded ? 
          <div id="inputs-box">
            <div className="input-container">
              <div className="input-header">Username:</div>
              <input className="input" type="text" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Username" onChange={e => setUsername(e.target.value)} value={username}/>
            </div>

            <div className="input-container">
              <div className="input-header">Cell number:</div>
              <input className="input" type="numeric" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Cell phone number" onChange={e => setCellnumber(displayPhonenumber(cellnumber, e.target.value, () => {}))} value={cellnumber}/>
            </div>

            <div id="input-container-div">
              <div className="input-container">
                <div className="input-header">New password:</div>
                <input className="input" type="password" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="New password" onChange={e => setPassword(e.target.value)} value={password}/>
              </div>
              <div className="input-container">
                <div className="input-header">Confirm your new password:</div>
                <input className="input" type="password" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Confirm password" onChange={e => setConfirmpassword(e.target.value)} value={confirmPassword}/>
              </div>
            </div>

            {errorMsg ? <div className="errormsg">{errorMsg}</div> : null }

            <div id="actions">
              <div className="action" onClick={() => window.location = "/"}>Back</div>
              <div className="action" onClick={() => updateAccount()}>Save</div>
            </div>
          </div>
          :
          <div id="loading">
            <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="3x"/></div>
          </div>
        }
      </div>

      {loading && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
