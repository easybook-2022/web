import axios from 'axios'
import { url } from '../../businessInfo'

export const verifyUser = cellnumber => {
	return axios.get(`${url}/owners/owner_verify/${cellnumber}`)
}

export const loginUser = data => {
	return axios.post(
		`${url}/owners/owner_login`,
		data
	)
}

export const registerUser = data => {
  return axios.post(
    `${url}/owners/owner_register`,
    data
  )
}

export const saveUserInfo = data => {
  const form = new FormData()
  
  form.append("id", data.id)
  form.append("username", data.username)
  form.append("profile", JSON.stringify(data.profile))
  form.append("hours", JSON.stringify(data.hours))
  form.append("web", true)

  return axios.post(
    `${url}/owners/save_user_info`,
    form
  )
}

export const addOwner = data => {
	const form = new FormData()

	form.append("id", data.id)
	form.append("cellnumber", data.cellnumber)
	form.append("username", data.username)
	form.append("password", data.password)
	form.append("confirmPassword", data.confirmPassword)
	form.append("hours", JSON.stringify(data.hours))
  form.append("profile", JSON.stringify(data.profile))
  form.append("web", true)

	return axios.post(
		`${url}/owners/add_owner`,
		form
	)
}

export const updateOwner = data => {
	const form = new FormData()

  form.append("ownerid", data.ownerid)
  form.append("type", data.type)

  switch (data.type) {
    case "cellnumber":
      form.append("cellnumber", data.cellnumber)

      break;
    case "username":
      form.append("username", data.username)

      break;
    case "profile":
      form.append("profile", JSON.stringify(data.profile))
      form.append("web", true)

      break;
    case "password":
      form.append("currentPassword", data.currentPassword)
      form.append("newPassword", data.newPassword)
      form.append("confirmPassword", data.confirmPassword)

      break;
    case "hours":
      form.append("hours", JSON.stringify(data.hours))

      break;
    default:
  }

	return axios.post(
		`${url}/owners/update_owner`,
		form
	)
}

export const deleteOwner = id => {
  return axios.get(`${url}/owners/delete_owner/${id}`)
}

export const getWorkers = locationid => {
  return axios.get(`${url}/owners/get_workers/${locationid}`)
}

export const getWorkerInfo = id => {
  return axios.get(`${url}/owners/get_worker_info/${id}`)
}

export const getAllWorkersTime = id => {
  return axios.get(`${url}/owners/get_all_workers_time/${id}`)
}

export const getOtherWorkers = data => {
  return axios.post(
    `${url}/owners/get_other_workers`,
    data
  )
}

export const getOwnerInfo = id => {
  return axios.get(`${url}/owners/get_owner_info/${id}`)
}

export const setOwnerHours = data => {
  return axios.post(
    `${url}/owners/set_hours`,
    data
  )
}

export const updateNotificationToken = data => {
	return axios.post(
		`${url}/owners/update_notification_token`,
		data
	)
}

export const getAccounts = locationid => {
	return axios.get(`${url}/owners/get_accounts/${locationid}`)
}

export const getCode = cellnumber => {
	return axios.get(`${url}/owners/get_reset_code/${cellnumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${url}/owners/reset_password`,
		data
	)
}
