import axios from 'axios'
import { url } from '../../userInfo'

export const getMenus = id => {
	return axios.get(`${url}/menus/get_menus/${id}`)
}
