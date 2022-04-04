import { Cookies } from 'react-cookie'

const cookies = new Cookies()

const setID = ID => {
  cookies.set('id', ID, { path: '/' })
}

const getID = () => {
  const ID = cookies.get('id') 

  if (ID) {
    return ID
  }
  return null
}

export { setID, getID }