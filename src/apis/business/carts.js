import axios from 'axios'
import { url } from '../../info'

export const orderDone = data => {
	return axios.post(
		`${url}/carts/order_done`,
		data
	)
}

export const setWaitTime = data => {
  return axios.post(
    `${url}/carts/set_wait_time`,
    data
  )
}
