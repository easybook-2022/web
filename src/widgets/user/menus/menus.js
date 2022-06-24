import './menus.scss';
import { useEffect, useState } from 'react'
import { resizePhoto } from 'geottuse-tools'
import { logo_url } from '../../../userInfo'
import { getMenus } from '../../../apis/user/menus'

// widgets
import Loadingprogress from '../../loadingprogress'

const height = window.innerHeight
const width = window.innerWidth
const wsize = p => {return width * (p / 100)}

export default function Menus(props) {
  const { locationid, refetchMenu, type } = props
  const [requestInfo, setRequestinfo] = useState({ search: '', error: false })
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [] })
  const [loaded, setLoaded] = useState(false)

  const getAllMenus = async() => {
    setLoaded(false)

    getMenus(locationid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setMenuinfo({ ...menuInfo, list: res.list, photos: res.photos })
          setLoaded(true)
        }
      })
  }
  const displayList = info => {
    let { id, image, name, list } = info
    
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
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list })
                  :
                  <div className="item">
                    <div className="item-image-holder">
                      <img alt="" className="item-image" style={resizePhoto(info.image, 50)} src={info.image.name ? logo_url + info.image.name : "/noimage.jpeg"}/>
                    </div>
                    <div className="column"><div className="item-header">{info.name}</div></div>
                    <div className="column"><div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div></div>
                    <div className="column">
                      <div 
                        className="item-action" 
                        onClick={() => {
                          if (type === "salon") {
                            window.location = "/booktime/" + locationid + "/null/" + info.id + "/null"
                          } else {
                            window.location = "/itemprofile/" + locationid + "/null/" + info.id + "/null/restaurant"
                          }
                        }}
                      >{type === "salon" ? "Book a time" : "See/Buy"}</div>
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
                    <img alt="" className="item-image" style={resizePhoto(info.image, 50)} src={info.image.name ? logo_url + info.image.name : "/noimage.jpeg"}/>
                  </div>
                  <div className="column"><div className="item-header">{info.name}</div></div>
                  <div className="column"><div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div></div>
                  <div className="column">
                    <div className="item-action" onClick={() => {
                      if (type === "salon") {
                        window.location = "/booktime/" + locationid + "/null/" + info.id + "/null"
                      } else {
                        window.location = '/itemprofile/' + locationid + '/null/' + info.id + '/null/restaurant'
                      }
                    }}>{type === "salon" ? "Book a time" : "See/Buy"}</div>
                  </div>
                </div>
              }
            </div>
          ))
        }
      </div>
    )
  }

  useEffect(() => getAllMenus(), [refetchMenu])

  return (
    loaded ? 
      <div id="menus">
        {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
          <>
            <div id="menu-input-box">
              <div id="menu-input-container">
                <input 
                  id="menu-input" type="text" 
                  placeholder={
                    "Enter " + 
                    (type === "restaurant" && "meal" || type === "store" && "product" || type === "salon" && "service") 
                    + " # or name"
                  } 
                  onChange={e => setRequestinfo({ ...requestInfo, search: e.target.value, error: false })}
                />
              </div>
              <div id="menu-input-touch" onClick={() => {
                if (requestInfo.search) {
                  if (type === "salon") {
                    window.location = "/booktime/" + locationid + "/null/null/" + requestInfo.search
                  } else {
                    window.location = "/itemprofile/" + locationid + "/null/null/" + requestInfo.search + "/restaurant"
                  }
                } else setRequestinfo({ ...requestInfo, error: true })
              }}>{type === "salon" ? "Book now" : "Order item"}</div>
            </div>
            {requestInfo.error && <div id="menu-input-error">Your request is empty</div>}
          </>
        )}

        {menuInfo.photos.length > 0 && (
          menuInfo.photos[0].row && (
            menuInfo.photos.map(info => (
              info.row.map(item => (
                item.photo && (
                  <div key={item.key} className="menu-photo" style={resizePhoto(item.photo, wsize(95))}>
                    <img alt="" style={{ height: '100%', width: '100%' }} src={item.photo.name ? logo_url + item.photo.name : "/noimage.jpeg"}/>
                  </div>
                )
              ))
            ))
          )
        )}

        {displayList({ id: "", name: "", image: "", list: menuInfo.list })}
      </div>
    :
    <Loadingprogress/>
  )
}

























