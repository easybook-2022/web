import axios from 'axios'
import { url } from '../../info'

const beginUrl = `${url}/dining_tables/`

export const getTable = id => {
  return axios.get(`${beginUrl}get_table/${id}`)
}

export const orderMeal = data => {
  return axios.post(
    `${beginUrl}order_meal`,
    data
  )
}
