export const TOKEN_KEY = '__token__'
export const EMAIL_KEY = '__email__'
export const USERNAME_KEY = '__username__'
export const USERID_KEY = '__userid__'
export const USERID_IMG = '__userimg__'
export const USERID_ROLES = '__userroles__'

export default {
  get(key) {
    return window.sessionStorage.getItem(key)
  },
  set(key, val) {
    window.sessionStorage.setItem(key, val)
  },
  remove(key) {
    window.sessionStorage.removeItem(key)
  },
  clear() {
    window.sessionStorage.clear()
  }
}