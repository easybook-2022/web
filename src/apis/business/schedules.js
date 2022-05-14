import axios from 'axios'
import { url } from '../../businessInfo'

export const getAppointmentInfo = id => {
	return axios.get(`${url}/schedules/get_appointment_info/${id}`)
}

export const salonChangeAppointment = data => {
  return axios.post(
    `${url}/schedules/salon_change_appointment`,
    data
  )
}

export const cancelSchedule = data => {
	return axios.post(
		`${url}/schedules/cancel_schedule`,
		data
	)
}

export const getAppointments = data => {
	return axios.post(
		`${url}/schedules/get_appointments`,
		data
	)
}

export const searchCustomers = username => {
	return axios.get(`${url}/schedules/search_customers/${username}`)
}

export const getCartOrderers = id => {
	return axios.get(`${url}/schedules/get_cart_orderers/${id}`)
}

export const getCartOrders = id => {
	return axios.get(`${url}/schedules/get_cart_orders/${id}`)
}

export const getOrders = data => {
	return axios.post(
		`${url}/schedules/get_orders`,
		data
	)
}

export const doneService = id => {
  return axios.get(`${url}/schedules/done_service/${id}`)
}
