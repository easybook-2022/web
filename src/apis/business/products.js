import axios from 'axios'
import { url } from '../../businessInfo'

export const getProductInfo = id => {
	return axios.get(`${url}/products/get_product_info/${id}`)
}

export const addNewProduct = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("options", JSON.stringify(data.options))
	form.append("others", JSON.stringify(data.others))
	form.append("sizes", JSON.stringify(data.sizes))
	form.append("price", data.price)
	form.append("image", JSON.stringify(data.image))
  form.append("web", true)

	return axios.post(
		`${url}/products/add_product`,
		form
	)
}

export const updateProduct = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("productid", data.productid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("options", JSON.stringify(data.options))
	form.append("others", JSON.stringify(data.others))
	form.append("sizes", JSON.stringify(data.sizes))
	form.append("price", data.price)
	form.append("image", JSON.stringify(data.image))
  form.append("web", true)

	return axios.post(
		`${url}/products/update_product`,
		form
	)
}

export const removeProduct = (id) => {
	return axios.post(`${url}/products/remove_product/${id}`)
}
