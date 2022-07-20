import axios from 'axios'
import { url } from '../../info'

const beginUrl = `${url}/menus/`

export const getMenus = id => {
	return axios.get(`${beginUrl}get_menus/${id}`)
}

export const getRequests = () => {
	return axios.get(`${beginUrl}get_requests`)
}

export const addNewMenu = (data) => {
	const form = new FormData()

  form.append("ownerid", data.ownerid)
  form.append("locationid", data.locationid)
  form.append("parentmenuid", data.parentMenuid)
  form.append("name", data.name)
  form.append("image", JSON.stringify(data.image))
  form.append("web", true)

  return axios.post(
    `${beginUrl}add_menu`,
    form
  )
}

export const removeMenu = id => {
	return axios.get(`${beginUrl}remove_menu/${id}`)
}

export const getMenuInfo = id => {
	return axios.get(`${beginUrl}get_menu_info/${id}`)
}

export const saveMenu = data => {
	const form = new FormData() 

	form.append("menuid", data.menuid)
	form.append("name", data.name)
  form.append("image", JSON.stringify(data.image))
	form.append("web", true)

	return axios.post(
		`${beginUrl}save_menu`,
		form
	)
}

export const uploadMenu = data => {
	const form = new FormData()

	form.append("locationid", data.locationid)
	form.append("image", JSON.stringify(data.image))
  form.append("size", JSON.stringify(data.size))
  form.append("web", true)

	return axios.post(
		`${beginUrl}upload_menu`,
		form
	)
}

export const deleteMenu = data => {
	return axios.post(
		`${beginUrl}delete_menu`,
		data
	)
}
