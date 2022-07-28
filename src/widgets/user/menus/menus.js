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
  const tableOrder = props.tableOrder ? true : false
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
  const displayListItem = (id, info) => {
    return (
      <div className="item" onClick={() => {
        if (type === "salon") {
          window.location = "/booktime/" + locationid + "/null/" + info.id + "/null"
        } else {
          if (tableOrder) {
            props.orderItem(info.id)
          } else {
            window.location = '/itemprofile/' + locationid + '/null/' + info.id + '/null/restaurant'
          }
        }
      }}>
        <div className="column" style={{ width: '50%' }}>
          {info.image.name && (
            <div className="item-image-holder">
              <img alt="" className="item-image" style={resizePhoto(info.image, 50)} src={logo_url + info.image.name}/>
            </div>
          )}
          <div className="item-header">{info.name}</div>
          <div className="item-miniheader">{info.description}</div>
        </div>

        <div style={{ width: '40%' }}>
          {info.price ? 
            <div className="column"><div className="item-price">$ {info.price} (1 size)</div></div>
            :
            info.sizes.length > 0 ? 
              <>
                {info.sizes.map(size => <div className="item-price">{size.name}: ${size.price}</div>)}
                <div className="item-price" style={{ marginTop: '5%' }}>({info.sizes.length}) sizes</div>
              </>
              :
              info.quantities.map(quantity => <div className="item-price">{quantity.input}: ${quantity.price}</div>)
          }
        </div>
        
        <div className="item-actions" style={{ width: '20%' }}>
          <div className="column">
            <div className="item-action" onClick={() => {
              if (type === "salon") {
                window.location = "/booktime/" + locationid + "/null/" + info.id + "/null"
              } else {
                if (tableOrder) {
                  props.orderItem(info.id)
                } else {
                  window.location = "/itemprofile/" + locationid + "/null/" + info.id + "/null/restaurant"
                }
              }
            }}>{
              type === "salon" ? 
                "Book a time" 
                : 
                tableOrder ? "Order" : "See/Buy"
            }</div>
          </div>
        </div>
      </div>
    )
  }
  const displayList = info => {
    let { id, image, name, list, show = true } = info

    return (
      <div>
        {name ?
          <div className="menu">
            <div className="menu-row" onClick={() => {
              const newList = [...menuInfo.list]

              const toggleMenu = (list, parentId) => {
                list.forEach(function (item) {
                  item.show = false

                  if (item.id == id) {
                    item.show = show ? false : true
                  } else if (item.list) {
                    toggleMenu(item.list, item.id)
                  }
                })
              }

              toggleMenu(newList, "")

              setMenuinfo({ ...menuInfo, list: newList })
            }}>
              {image.name && (
                <div className="menu-image-holder">
                  <img alt="" className="menu-image" style={resizePhoto(image, 50)} src="/noimage.jpeg"/>
                </div>
              )}
                
              <div className="column"><div className="menu-name">({list.length}) {name} (Menu)</div></div>
              <div className="column">
                <div className="menu-show">{show ? "Hide" : "Show"}</div>
              </div>
            </div>
            {list.length > 0 && list.map((listInfo, index) => (
              <div key={"list-" + index}>
                {show && (
                  listInfo.listType === "list" ? 
                    displayList({ id: listInfo.id, name: listInfo.name, image: listInfo.image, list: listInfo.list, show: listInfo.show })
                    :
                    <div>{displayListItem(id, listInfo)}</div>
                )}
              </div>
            ))}
          </div>
          :
          list.map((listInfo, index) => (
            <div key={"list-" + index}>
              {show && (
                listInfo.listType === "list" ? 
                  displayList({ id: listInfo.id, name: listInfo.name, image: listInfo.image, list: listInfo.list, show: listInfo.show })
                  :
                  <div>{displayListItem(id, listInfo)}</div>
              )}
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
        {((menuInfo.photos.length > 0 || menuInfo.list.length > 0) && !tableOrder) && (
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
                    if (tableOrder) {

                    } else {
                      window.location = "/itemprofile/" + locationid + "/null/null/" + requestInfo.search + "/restaurant"
                    }
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
