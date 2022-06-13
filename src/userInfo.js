import io from 'socket.io-client'
import { local_url, test_input, useInput, url, socket_url } from './info'

const testUsers = [
  { id: 0, username: "robogram", cellnumber: "(000) 000-0000", password: "password", confirmPassword: "" },
  { id: 1, username: "user1", cellnumber: "(111) 111-1111", password: "password", confirmPassword: "" },
  { id: 2, username: "user2", cellnumber: "(222) 222-2222", password: "password", confirmPassword: "" },
  { id: 3, username: "user3", cellnumber: "(333) 333-3333", password: "password", confirmPassword: "" },
  { id: 4, username: "user4", cellnumber: "(444) 444-4444", password: "password", confirmPassword: "" },
  { id: 5, username: "user5", cellnumber: "(555) 555-5555", password: "password", confirmPassword: "" },
  { id: 6, username: "user6", cellnumber: "(666) 666-6666", password: "password", confirmPassword: "" },
  { id: 7, username: "user7", cellnumber: "(777) 777-7777", password: "password", confirmPassword: "" },
  { id: 8, username: "user8", cellnumber: "(888) 888-8888", password: "password", confirmPassword: "" },
  { id: 9, username: "user9", cellnumber: "(999) 999-9999", password: "password", confirmPassword: "" },
  { id: 10, username: "user10", cellnumber: "(101) 010-1010", password: "password", confirmPassword: "" },
  { id: 11, username: "user11", cellnumber: "(010) 101-0101", password: "password", confirmPassword: "" },
  { id: 12, username: "user12", cellnumber: "(123) 123-1234", password: "password", confirmPassword: "" },
  { id: 13, username: "user13", cellnumber: "(234) 234-2345", password: "password", confirmPassword: "" },
  { id: 14, username: "user14", cellnumber: "(345) 345-3456", password: "password", confirmPassword: "" }
]
const realUsers = [
  { id: 0, username: "kevin", cellnumber: "(647) 926-3868", password: "password", confirmPassword: "" }
]
const emptyUser = { username: "", cellnumber: "", password: "", confirmPassword: "" }

const signin = test_input ? testUsers[0] : useInput ? realUsers[0] : emptyUser

export const signinInfo = { username: signin.username, cellnumber: signin.cellnumber, password: signin.password, confirmPassword: signin.confirmPassword, latitude: 43.663631, longitude: -79.351501 }
export const socket = io.connect(socket_url)
export const isLocal = test_input
export const logo_url = url + "/static/"
