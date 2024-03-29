import './menu.scss';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faTimesCircle, faCirclePlus, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { logo_url } from '../../../businessInfo'
import { getId, resizePhoto } from 'geottuse-tools'
import { getLocationProfile } from '../../../apis/business/locations'
import { getOwnerInfo } from '../../../apis/business/owners'
import { getMenus, addNewMenu, removeMenu, getMenuInfo, saveMenu, uploadMenu, deleteMenu } from '../../../apis/business/menus'
import { getProductInfo, removeProduct } from '../../../apis/business/products'
import { getServices, getServiceInfo, removeService } from '../../../apis/business/services'

// widgets
import Loadingprogress from '../../../widgets/loadingprogress';

const height = window.innerWidth
const width = window.innerHeight
const wsize = p => {return window.innerWidth * (p / 100)}

export default function Menu(props) {
  const params = useParams()

  const [camComp, setCamcomp] = useState(null)
  const [fileComp, setFilecomp] = useState(null)

  const [locationType, setLocationtype] = useState('')
  const [isOwner, setIsowner] = useState(false)

  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [] })

  const [loaded, setLoaded] = useState(false)

  const [menuForm, setMenuform] = useState({ 
    show: false, type: '', id: '', 
    index: -1, name: '', info: '', 
    image: { uri: '', name: '' }, errormsg: '' 
  })

  const [createOptionbox, setCreateoptionbox] = useState({ show: false, id: -1, allow: null })
  const [uploadMenubox, setUploadmenubox] = useState({ show: false, action: '', uri: '', name: '', size: { width: 0, height: 0 }, loading: false })
  const [menuPhotooption, setMenuphotooption] = useState({ show: false, action: '', photo: '' })
  const [removeMenuinfo, setRemovemenuinfo] = useState({ show: false, id: "", name: "" })
  const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", image: "", price: 0 })
  const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", image: "", sizes: [], others: [], options: [], price: 0 })

  const getTheLocationProfile = () => {
    const locationid = localStorage.getItem("locationid")
    const data = { locationid }

    setLoaded(false)

    getLocationProfile(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { type } = res.info

          setLocationtype(type)
          getAllMenus()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheOwnerInfo = async() => {
    const ownerid = localStorage.getItem("ownerid")

    getOwnerInfo(ownerid)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setIsowner(res.isOwner)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  // menus
  const getAllMenus = () => {
    const locationid = localStorage.getItem("locationid")

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
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const displayList = info => {
    let { id, name, image, list } = info

    return (
      <div>
        {name ? 
          <div className="menu">
            <div className="menu-row">
              <div className="menu-image-holder">
                <img alt="" style={resizePhoto(image, width * 0.08)} src={image.name ? logo_url + image.name : "/noimage.jpeg"}/>
              </div>
                
              <div className="column"><div className="menu-name">{name} (Menu)</div></div>

              {isOwner === true && (
                <div className="column">
                  <div className="menu-actions">
                    <div className="menu-action" onClick={() => window.location = "/addmenu/" + id + "/" + id}>Change</div>
                    <div className="menu-action" onClick={() => removeTheMenu(id)}>Delete</div>
                  </div>
                </div>
              )}
            </div>

            {list.length === 0 ?
              <div style={{ margin: '0 auto', marginTop: 10 }}>
                <div className="item-add" onClick={() => {
                  if ((locationType === "hair" || locationType === "nail")) {
                    window.location = "/addservice/" + id + "/null"
                  } else {
                    window.location = "/addproduct/" + id + "/null"
                  }
                }}>
                  <div className="column">
                    <div className="item-add-header">
                      Add{' '}
                      {(locationType === "hair" || locationType === "nail") && "service"}
                      {locationType === "restaurant" && "meal"}
                      {locationType === "store" && "product"}
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faCirclePlus} size="2x"/>
                </div>
              </div>
              :
              list.map((info, index) => (
                <div key={"list-" + index} style={{ backgroundColor: 'white' }}>
                  {info.listType === "list" ? 
                    displayList({ id: info.id, name: info.name, image: info.image, list: info.list })
                    :
                    <div className="item">
                      <div className="item-row">
                        <div className="item-image-holder">
                          <img alt="" style={resizePhoto(info.image, width * 0.09)} src={info.image.name ? logo_url + info.image.name : "/noimage.jpeg"}/>
                        </div>
                          
                        <div className="column"><div className="item-header">{info.name}</div></div>
                        <div className="column"><div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div></div>

                        {isOwner === true && (
                          <div className="column">
                            <div className="item-actions">
                              <div className="item-action" onClick={() => {
                                if ((locationType === "hair" || locationType === "nail")) {
                                  window.location = "/addservice/" + id + "/" + info.id
                                } else {
                                  window.location = "/addproduct/" + id + "/" + info.id
                                }
                              }}>Change</div>
                              <div className="item-action" onClick={() => (locationType === "hair" || locationType === "nail") ? removeTheService(info.id) : removeTheProduct(info.id)}>Delete</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  }

                  {(list.length - 1 === index && info.listType !== "list") && (
                    <div style={{ margin: '0 auto', backgroundColor: 'white' }}>
                      <div className="item-add" onClick={() => window.location = "/" + ((locationType === "hair" || locationType === "nail") ? "addservice" : "addproduct") + "/" + id + "/null"}>
                        <div className="column">
                          <div className="item-add-header">
                            Add {' '}
                            {(locationType === "hair" || locationType === "nail") && "service"}
                            {locationType === "restaurant" && "meal"}
                            {locationType === "store" && "product"}
                          </div>
                        </div>
                        <FontAwesomeIcon icon={faCirclePlus} size="2x"/>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
          :
          list.map((info, index) => (
            <div key={"list-" + index}>
              {info.listType === "list" ? 
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list })
                :
                <div className="item">
                  <div className="item-row">
                    <div className="item-image-holder">
                      <img alt="" style={resizePhoto(info.image, width * 0.09)} src={info.image.name ? logo_url + info.image.name : "/noimage.jpeg"}/>
                    </div>

                    <div className="item-header">{info.name}</div>
                    <div className="item-header">{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</div>

                    {isOwner === true && (
                      <div className="item-actions">
                        <div className="item-action" onClick={() => window.location = "/" + ((locationType === "hair" || locationType === "nail") ? "addservice" : "addproduct") + "/" + (id ? id : "null") + "/" + info.id}>Change</div>
                        <div className="item-action" onClick={() => (locationType === "hair" || locationType === "nail") ? removeTheService(info.id) : removeTheProduct(info.id)}>Delete</div>
                      </div>
                    )}
                  </div>
                </div>
              }
            </div>
          ))
        }
      </div>
    )
  }

  const removeTheMenu = id => {
    if (!removeMenuinfo.show) {
      getMenuInfo(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { name, image } = res.info

            setRemovemenuinfo({ ...removeMenuinfo, show: true, id, name, image })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      removeMenu(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setRemovemenuinfo({ ...removeMenuinfo, show: false })
            getTheLocationProfile()
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const removeTheProduct = id => {
    if (!removeProductinfo.show) {
      getProductInfo(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { image, name, options, others, price, sizes } = res.productInfo

            setRemoveproductinfo({ ...removeProductinfo, show: true, id, name, image, sizes, others, options, price })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      removeProduct(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setRemoveproductinfo({ ...removeProductinfo, show: false })
            getTheLocationProfile()
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const removeTheService = id => {
    if (!removeServiceinfo.show) {
      getServiceInfo(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { name, price, image } = res.serviceInfo

            setRemoveserviceinfo({ ...removeServiceinfo, show: true, id, name, price, image })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      removeService(id)
        .then((res) => {
          if (res.status === 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setRemoveserviceinfo({ ...removeServiceinfo, show: false })
            getTheLocationProfile()
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }

  const choosePhoto = e => {
    if (e.target.files && e.target.files[0]) {
      setUploadmenubox({ ...uploadMenubox, loading: true })

      let reader = new FileReader()
      let char = getId()

      reader.onload = e => {
        let imageReader = new Image()
        let size = {}

        imageReader.onload = () => {
          size['width'] = imageReader.width
          size['height'] = imageReader.height

          setUploadmenubox({ ...uploadMenubox, action: 'choose', uri: e.target.result, name: `${char}.jpg`, size, action: 'choose' })
        }

        imageReader.src = e.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }
  const uploadMenuphoto = () => {
    const locationid = localStorage.getItem("locationid")
    const { uri, name, size } = uploadMenubox
    const image = { uri, name }
    const data = { locationid, image, size }

    uploadMenu(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setUploadmenubox({ ...uploadMenubox, show: false, action: '', uri: '', name: '' })
          getAllMenus()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { status, errormsg } = err.response.data
        }
      })
  }
  const deleteTheMenu = () => {
    const locationid = localStorage.getItem("locationid")
    const { info } = menuPhotooption
    const data = { locationid, photo: info.name }

    deleteMenu(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setMenuphotooption({ ...uploadMenubox, show: false, action: '', photo: '' })
          getAllMenus()
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
  }, [])

  return (
    <div id="menu-box">
      {loaded ? 
        <div id="box">
          <div style={{ height: '90%', overflowY: 'scroll', width: '100%' }}>
            <div style={{ padding: '10px 0' }}>
              <div className="menus-header">Photo(s)</div>
              {menuInfo.photos.length > 0 && (
                menuInfo.photos[0].row && (
                  <div style={{ width: '100%' }}>
                    {menuInfo.photos.map(info => (
                      <div key={info.key} className="menu-row">
                        {info.row.map(item => (
                          <div key={item.key} className="menu-item">
                            {item.photo && (
                              <>
                                <div className="menu-item-photo">
                                  <img alt="" style={resizePhoto(item.photo, width * 0.3)} src={logo_url + item.photo.name}/>
                                </div>

                                <div id="menu-photo-actions">
                                  {isOwner === true && <div className="menu-photo-action" onClick={() => setMenuphotooption({ ...menuPhotooption, show: true, action: 'delete', info: item.photo })}>Delete</div>}
                                  <div className="menu-photo-action" onClick={() => setMenuphotooption({ ...menuPhotooption, show: true, action: '', info: item.photo })}>See</div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              )}
              {isOwner === true && (
                <div style={{ margin: '0 auto' }}>
                  <div className="menu-start" onClick={() => setUploadmenubox({ ...uploadMenubox, show: true, uri: '', name: '' })}>Upload photo</div>
                  <div style={{ textAlign: 'center' }}>(Easier for you)</div>
                </div>
              )}

              <div style={{ marginTop: 200 }}>
                <div className="menus-header">List(s)</div>
                {displayList({ id: "", name: "", image: "", list: menuInfo.list })}

                {isOwner === true && (
                  <div style={{ margin: 'auto 0' }}>
                    <div className="menu-start" onClick={() => setCreateoptionbox({ show: true, id: "", allow: "both" })}>Create manually</div>
                    <div style={{ textAlign: 'center' }}>(Easier for {locationType === "nail" || locationType === "hair" ? "clients to book" : "customers to order"})</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div id="bottom-navs">
            <div id="bottom-navs-row">
              <div className="bottom-nav" onClick={() => window.location = "/main"}>
                <FontAwesomeIcon icon={faHome}/>
              </div>

              <div className="bottom-nav" onClick={() => {
                localStorage.clear()

                window.location = "/auth"
              }}>Log-Out</div>
            </div>
          </div>

          {createOptionbox.show && (
            <div id="create-option-container">
              <div id="create-option-box">
                <div id="create-option-close" onClick={() => setCreateoptionbox({ show: false, id: -1 })}>
                  <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                </div>
                <div id="create-option-actions">
                  {createOptionbox.allow === "both" && (
                    <div className="create-option-action" onClick={() => {
                      setCreateoptionbox({ ...createOptionbox, show: false, id: -1 })

                      window.location = "/addmenu/" + (!createOptionbox.id ? "null" : createOptionbox.id) + "/null"
                    }}>Add menu</div>
                  )}
                    
                  <div className="create-option-action" onClick={() => {
                    setCreateoptionbox({ show: false, id: -1 })

                    if ((locationType === "hair" || locationType === "nail")) {
                      window.location = "/addservice/" + (!createOptionbox.id ? "null" : createOptionbox.id) + "/null"
                    } else {
                      window.location = "/addproduct/" + (!createOptionbox.id ? "null" : createOptionbox.id) + "/null"
                    }
                  }}>
                    Add{' '}
                    {(locationType === "hair" || locationType === "nail") && "service"}
                    {locationType === "restaurant" && "meal"}
                    {locationType === "store" && "product"}
                  </div>
                </div>
              </div>
            </div>
          )}
          {uploadMenubox.show && (
            <div id="upload-menu-container">
              {!uploadMenubox.action ? 
                <div id="upload-menu-box">
                  <div id="upload-menu-close" onClick={() => setUploadmenubox({ show: false, uri: '', name: '' })}>
                    <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                  </div>
                  <div id="upload-menu-actions">
                    <div className="upload-menu-action" onClick={() => fileComp.click()}>Choose from phone</div>
                  </div>

                  <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                </div>
                :
                <div id="upload-menu-camera-container">
                  <div id="upload-menu-close" onClick={() => setUploadmenubox({ show: false, uri: '', name: '', action: '' })}>
                    <FontAwesomeIcon icon={faTimesCircle} size="3x"/>
                  </div>
                  
                  {uploadMenubox.uri && (
                    <div id="upload-menu-camera">
                      <img alt="" style={{ height: '100%', width: '100%' }} src={uploadMenubox.uri}/>
                    </div>
                  )}

                  {!uploadMenubox.uri ? 
                    <div id="upload-menu-camera-actions">
                      <div className="upload-menu-camera-action" style={{ opacity: uploadMenubox.loading ? 0.5 : 1, pointerEvents: uploadMenubox.loading ? "none" : "" }} onClick={() => setUploadmenubox({ ...uploadMenubox, action: '' })}>Cancel</div>
                      <div className="upload-menu-camera-action" style={{ opacity: uploadMenubox.loading ? 0.5 : 1, pointerEvents: uploadMenubox.loading ? "none" : "" }} onClick={() => fileComp.click()}>Choose instead</div>
                      
                      <input type="file" ref={r => {setFilecomp(r)}} onChange={choosePhoto} style={{ display: 'none' }}/>
                    </div>
                    :
                    <div id="upload-menu-camera-actions">
                      <div className="upload-menu-camera-action" onClick={() => setUploadmenubox({ ...uploadMenubox, action: '', uri: '', name: '' })}>Cancel</div>
                      <div className="upload-menu-camera-action" onClick={() => setUploadmenubox({ ...uploadMenubox, uri: '', name: '' })}>Restart</div>
                      <div className="upload-menu-camera-action" onClick={() => uploadMenuphoto()}>Done</div>
                    </div>
                  }
                </div>
              }
            </div>
          )}
          {menuPhotooption.show && (
            <div id="menu-photo-option-container">
              <div id="menu-photo-option-photo" style={resizePhoto(menuPhotooption.info, width * 0.35)}>
                <img 
                  alt="" 
                  style={{ height: '100%', width: '100%' }} 
                  src={menuPhotooption.info.name ? logo_url + menuPhotooption.info.name : "/noimage.jpeg"}
                />
              </div>

              {menuPhotooption.action === "delete" ? 
                <div id="menu-photo-option-bottom-container">
                  <div id="menu-photo-option-actions-header">Are you sure you want to delete<br/>this menu ?</div>
                  <div id="menu-photo-option-actions">
                    <div className="menu-photo-option-action" onClick={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', info: {} })}>No</div>
                    <div className="menu-photo-option-action" onClick={() => deleteTheMenu()}>Yes</div>
                  </div>
                </div>
                :
                <div id="menu-photo-option-bottom-container">
                  <div id="menu-photo-option-actions">
                    <div className="menu-photo-option-action" onClick={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', info: {} })}>Close</div>
                  </div>
                </div>
              }
            </div>
          )}
          {removeMenuinfo.show && (
            <div id="menu-info-container">
              <div id="menu-info-box">
                <div id="menu-info-box-header">Delete menu confirmation</div>

                <div style={{ margin: '0 auto' }}>
                  <div id="menu-info-image-holder" style={resizePhoto(removeMenuinfo.image, width * 0.5)}>
                    <img alt="" src={removeMenuinfo.image.name ? logo_url + removeMenuinfo.image.name : "/noimage.jpeg"}/>
                  </div>

                  <div id="menu-info-name">{removeMenuinfo.name}</div>
                </div>

                <div id="menu-info-header">Are you sure you want to delete<br/>this menu and its items</div>

                <div id="menu-info-actions">
                  <div className="menu-info-action" onClick={() => setRemovemenuinfo({ ...removeMenuinfo, show: false })}>No</div>
                  <div className="menu-info-action" onClick={() => removeTheMenu(removeMenuinfo.id)}>Yes</div>
                </div>
              </div>
            </div>
          )}
          {removeProductinfo.show && (
            <div id="product-info-container">
              <div id="product-info-box">
                <div id="product-info-box-header">Delete product confirmation</div>

                <div id="product-info-image-holder" style={resizePhoto(removeProductinfo.image, (width * 0.5))}>
                  <img alt="" style={{ height: '100%', width: '100%' }} src={removeProductinfo.image.name ? logo_url + removeProductinfo.image.name : "/noimage.jpeg"}/>
                </div>

                <div id="product-info-name">{removeProductinfo.name}</div>

                <div style={{ margin: '0 auto' }}>
                  {removeProductinfo.options.map((option, infoindex) => (
                    <div key={option.key}>
                      <div style={{ fontWeight: 'bold' }}>{option.header}: </div> 
                      {option.type === 'percentage' && '%'}
                    </div>
                  ))}

                  {removeProductinfo.others.map((other, otherindex) => (
                    <div key={other.key}>
                      <div style={{ fontWeight: 'bold' }}>{other.name}: </div>
                      <div>{other.input}</div>
                      <div> ($ {other.price.toFixed(2)})</div>
                    </div>
                  ))}

                  {removeProductinfo.sizes.map((size, sizeindex) => (
                    <div key={size.key}>
                      <div style={{ fontWeight: 'bold' }}>Size #{sizeindex + 1}: </div>
                      <div>{size.name} ($ {size.price.toFixed(2)})</div>
                    </div>
                  ))}
                </div>

                {removeProductinfo.price ? 
                  <div id="product-info-price"><div style={{ fontWeight: 'bold' }}>Price: </div>$ {(removeProductinfo.price).toFixed(2)}</div>
                : null }

                <div id="product-info-header">Are you sure you want to delete this product</div>

                <div id="product-info-actions">
                  <div className="product-info-action" onClick={() => setRemoveproductinfo({ ...removeProductinfo, show: false })}>Cancel</div>
                  <div className="product-info-action" onClick={() => removeTheProduct(removeProductinfo.id)}>Yes</div>
                </div>
              </div>
            </div>
          )}
          {removeServiceinfo.show && (
            <div id="service-info-container">
              <div id="service-info-box">
                <div id="service-info-box-header">Delete service confirmation</div>

                <div id="service-info-image-holder" style={resizePhoto(removeServiceinfo.image, width * 0.5)}>
                  <img alt="" style={{ height: '100%', width: '100%' }} src={removeServiceinfo.image.name ? logo_url + removeServiceinfo.image.name : "/noimage.jpeg"}/>
                </div>

                <div id="service-info-name">{removeServiceinfo.name}</div>
                <div id="service-info-price"><div style={{ fontWeight: 'bold' }}>Price: </div>$ {(removeServiceinfo.price).toFixed(2)}</div>
                <div id="service-info-header">Are you sure you want to delete this service</div>

                <div id="service-info-actions">
                  <div className="service-info-action" onClick={() => setRemoveserviceinfo({ ...removeServiceinfo, show: false })}>Cancel</div>
                  <div className="service-info-action" onClick={() => removeTheService(removeServiceinfo.id)}>Yes</div>
                </div>
              </div>
            </div>
          )}
        </div>
        :
        <div id="loading">
          <div className="loading"><FontAwesomeIcon icon={faCircleNotch} size="2x"/></div>
        </div>
      }

      {(uploadMenubox.loading) && <div id="hidden-box"><Loadingprogress/></div>}
    </div>
  )
}
