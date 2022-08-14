import axios from 'axios'
import { url } from '../../info'

const beginUrl = `${url}/dining_tables/`

export const getQrCode = id => {
  let time = Date.now()

  return axios.get(`${beginUrl}get_qr_code/${id}`)
}

export const orderMeal = data => {
  return axios.post(
    `${beginUrl}order_meal`,
    data
  )
}

export const viewTableOrders = id => {
  return axios.get(`${beginUrl}view_table_orders/${id}`)
}

export const viewNumTableOrders = id => {
  return axios.get(`${beginUrl}/view_num_table_orders/${id}`)
}
