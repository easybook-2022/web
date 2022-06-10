import axios from 'axios'
import { url } from '../../info'

export const getServices = data => {
	return axios.post(
		`${url}/services/get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${url}/services/get_service_info/${id}`)
}

export const addNewService = data => {
	const form = new FormData()

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("price", data.price)
	form.append("duration", data.duration)
	form.append("image", JSON.stringify(data.image))
  form.append("web", true)

	return axios.post(
		`${url}/services/add_service`,
		form
	)
}

export const updateService = data => {
	const form = new FormData()

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("serviceid", data.serviceid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("price", data.price)
	form.append("duration", data.duration)
	form.append("image", JSON.stringify(data.image))
  form.append("web", true)

	return axios.post(
		`${url}/services/update_service`,
		form
	)
}

export const removeService = (id) => {
	return axios.get(`${url}/services/remove_service/${id}`)
}
