// 获取cookie
export function getCookie(name) {
  var arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) {
    return decodeURIComponent(arr[2])
  } else {
    return ''
  }
}


// 设置cookie,增加到vue实例方便全局调用
export function setCookie(c_name, value, expiredays = 7) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = c_name + '=' + escape(value) + (expiredays == null ? '' : ';expires=' + exdate.toGMTString()) + ';path=/'
}

// 删除cookie
export function delCookie(name) {
  var exp = new Date()
  exp.setTime(exp.getTime() - 1)
  var cval = getCookie(name)
  if (cval) document.cookie = name + '=;expires=' + exp.toGMTString() + ';path=/'
}
// setData
export function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// getData
export function getData(key) {
  return JSON.parse(localStorage.getItem(key))
}
