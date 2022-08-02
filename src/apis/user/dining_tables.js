import axios from 'axios'
import { url } from '../../info'

const beginUrl = `${url}/dining_tables/`

export const getQrCode = id => {
  return axios.get(`${beginUrl}get_qr_code/${id}`)
}

export const orderMeal = data => {
  return axios.post(
    `${beginUrl}order_meal`,
    data
  )
}

export const viewCustomerOrders = id => {
  return axios.get(`${beginUrl}view_customer_orders/${id}`)
}
