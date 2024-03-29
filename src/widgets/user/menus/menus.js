import './menus.scss';
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/fontawesome-free-solid'
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
  const [menus, setMenus] = useState([])
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
          setMenus(res.list)
          setLoaded(true)
        }
      })
  }
  const displayListItem = info => {
    return (
      <div className="item" onClick={() => {
        if (type === "salon") {
          window.location = "/booktime/" + locationid + "/null/" + info.id + "/null"
        } else {
          if (tableOrder) {
            props.getMealInfo(info.id)
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
          <div className="item-header">
            {info.number ? info.number + "." : ""}
            {info.number && <br/>}
            {info.name}
          </div>
          <div className="item-miniheader">{info.description}</div>
        </div>

        <div style={{ width: '40%' }}>
          {info.price ? 
            <div className="column"><div className="item-price">$ {info.price} (1 size)</div></div>
            :
            <>
              {info.sizes.length > 0 && info.sizes.map(size => <div className="item-price">{size.name}: ${size.price}</div>)}
              {info.quantities.length > 0 && info.quantities.map(quantity => <div className="item-price">{quantity.input}: ${quantity.price}</div>)}
            </>
          }

          {info.percents.map(percent => <div className="item-price">{percent.input}: ${percent.price}</div>)}
          {info.extras.map(extra => <div className="item-price">{extra.input}: ${extra.price}</div>)}
        </div>
        
        <div className="item-actions" style={{ width: '20%' }}>
          <div className="column">
            <div className="item-action" onClick={() => {
              if (type === "salon") {
                window.location = "/booktime/" + locationid + "/null/" + info.id + "/null"
              } else {
                if (tableOrder) {
                  props.getMealInfo(info.id)
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
    let { id, image, number = "", name, list, show = true, parentId = "" } = info

    return (
      <div>
        {name ?
          <div className="menu" style={{ backgroundColor: parentId ? 'white' : 'transparent' }}>
            <div className="menu-row" onClick={() => {
              const newList = [...menus]

              const toggleMenu = (list) => {
                list.forEach(function (item) {
                  if (item.parentId == parentId) {
                    item.show = false
                  }

                  if (item.id == id) {
                    item.show = show ? false : true
                  } else if (item.list) {
                    toggleMenu(item.list)
                  }
                })
              }

              toggleMenu(newList)

              setMenus(newList)
            }}>
              {image.name && (
                <div className="menu-image-holder">
                  <img alt="" className="menu-image" style={resizePhoto(image, 50)} src={logo_url + image.name}/>
                </div>
              )}
                
              <div className="column"><div className="menu-name">{name} (Menu)</div></div>
              <div className="column" style={{ marginLeft: 20 }}><FontAwesomeIcon icon={show ? faChevronUp : faChevronDown} size="2x"/></div>
            </div>
            {list.length > 0 && list.map((listInfo, index) => (
              <div key={"list-" + index}>
                {show && (
                  listInfo.listType === "list" ? 
                    displayList({ id: listInfo.id, number: listInfo.number, name: listInfo.name, image: listInfo.image, list: listInfo.list, show: listInfo.show, parentId: listInfo.parentId })
                    :
                    <div>{displayListItem(listInfo)}</div>
                )}
              </div>
            ))}
          </div>
          :
          list.map((listInfo, index) => (
            <div key={"list-" + index}>
              {show && (
                listInfo.listType === "list" ? 
                  displayList({ id: listInfo.id, number: listInfo.number, name: listInfo.name, image: listInfo.image, list: listInfo.list, show: listInfo.show, parentId: listInfo.parentId })
                  :
                  <div>{displayListItem(listInfo)}</div>
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
        {displayList({ id: "", name: "", image: "", list: menus })}
      </div>
    :
    <div style={{ height: '100vw', width: '100vw' }}>
      <Loadingprogress/>
    </div>
  )
}
