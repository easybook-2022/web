import axios from 'axios'
import { url } from '../../info'

export const registerLocation = data => {
	return axios.post(
		`${url}/locations/register_location`, 
		data
	)
}

export const loginLocation = data => {
	return axios.post(
		`${url}/locations/login_location`,
		data
	)
}

export const setupLocation = data => {
  const form = new FormData()

  form.append("storeName", data.storeName)
  form.append("phonenumber", data.phonenumber)
  form.append("addressOne", data.addressOne)
  form.append("addressTwo", data.addressTwo)
  form.append("city", data.city)
  form.append("province", data.province)
  form.append("postalcode", data.postalcode)
  form.append("hours", JSON.stringify(data.hours))
  form.append("type", data.type)
  form.append("longitude", data.longitude)
  form.append("latitude", data.latitude)
  form.append("ownerid", data.ownerid)
  form.append("web", true)
  form.append("logo", JSON.stringify(data.logo))

  return axios.post(
    `${url}/locations/setup_location`, 
    form
  )
}

export const updateLocation = data => {
	const form = new FormData()

  form.append("id", data.id)
	form.append("storeName", data.storeName)
	form.append("phonenumber", data.phonenumber)
	form.append("addressOne", data.addressOne)
	form.append("addressTwo", data.addressTwo)
	form.append("city", data.city)
	form.append("province", data.province)
	form.append("postalcode", data.postalcode)
	form.append("longitude", data.longitude)
	form.append("latitude", data.latitude)
	form.append("ownerid", data.ownerid)
  form.append("web", true)
  form.append("logo", JSON.stringify(data.logo))

	return axios.post(
		`${url}/locations/update_location`,
		form
	)
}

export const fetchNumRequests = id => {
	return axios.get(`${url}/locations/fetch_num_requests/${id}`)
}

export const fetchNumAppointments = id => {
	return axios.get(`${url}/locations/fetch_num_appointments/${id}`)
}

export const fetchNumCartOrderers = id => {
	return axios.get(`${url}/locations/fetch_num_cartorderers/${id}`)
}

export const fetchNumorders = id => {
	return axios.get(`${url}/locations/fetch_num_orders/${id}`)
}

export const setLocationHours = data => {
	return axios.post(
		`${url}/locations/set_location_hours`,
		data
	)
}

export const setReceiveType = data => {
  return axios.post(
    `${url}/locations/set_receive_type`,
    data
  )
}

export const getDayHours = data => {
  return axios.post(
    `${url}/locations/get_day_hours`,
    data
  )
}

export const getLocationHours = id => {
	return axios.get(`${url}/locations/get_location_hours/${id}`)
}

export const getAllLocations = id => {
  return axios.get(`${url}/locations/get_all_locations/${id}`)
}

export const getLocationProfile = data => {
	return axios.post(
		`${url}/locations/get_location_profile`,
		data
	)
}
