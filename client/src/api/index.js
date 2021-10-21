import axios from 'axios'
import config from '../config'

function getTokenHeader() {
	return { headers: { 'x-auth-token': localStorage.getItem('id_token') } }
}

export function getUsers(params) {
	return axios.post(`${config.apiUrl}/api/users/list`, params, getTokenHeader())
}

export function deleteUser(user_id) {
	return axios.post(`${config.apiUrl}/api/users/delete`, { user_id }, getTokenHeader())
}

export function updateUser(user) {
	return axios.post(`${config.apiUrl}/api/users/update`, user, getTokenHeader())
}

export function createUser(user) {
	return axios.post(`${config.apiUrl}/api/users/create`, user, getTokenHeader())
}