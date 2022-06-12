const local_url = true
const test_input = true
const useInput = true

const wifi_api_url = "http://192.168.0.172:5001/flask"
const wifi_socket_url = "http://192.168.0.172:5002"
const server_api_url = "https://www.easygo.tk/flask"
const server_socket_url = "wss://www.easygo.tk"

const url = local_url ? wifi_api_url : server_api_url
const socket_url = local_url ? wifi_socket_url : server_socket_url

export { local_url, test_input, useInput, url, socket_url }