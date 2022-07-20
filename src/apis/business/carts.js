import axios from 'axios'
import { url } from '../../info'

const beginUrl = `${url}/carts/`

export const orderDone = data => {
	return axios.post(
		`${beginUrl}order_done`,
		data
	)
}

export const setWaitTime = data => {
  return axios.post(
    `${beginUrl}set_wait_time`,
    data
  )
}
