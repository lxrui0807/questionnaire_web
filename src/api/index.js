import axios from 'axios'
import storage, { TOKEN_KEY } from './../public/js/storage';
import qs from 'qs'
import router from './../router/index';
//export const apiDomain = 'http://106.12.167.195:8088/'
export const apiDomain = 'http://192.168.0.160:8088/'
const baseURL = `${apiDomain}`
const admineURL =`${apiDomain}/v1`

axios.defaults.baseURL = baseURL

// mock数据
// const baseURL = '/api/v1'
// const isMock = true

// 管理员登录成功后的请求需要带上token
export const adminHttp = axios.create({
  baseURL:  `${admineURL}/`,
})
adminHttp.interceptors.request.use(config => {
    if(storage.get(TOKEN_KEY)){
        config.headers.Authorization ='Bearer '+ storage.get(TOKEN_KEY);
    }
    return config
},error =>{
    alert("错误的传参", 'fail')
    return Promise.reject(error)
})
//请求成功后判断token是否失效
adminHttp.interceptors.response.use((response)=>{
	console.log(response)
  if (typeof response.data === 'object' && response.data) {
  if(response.data.code==401||response.data.code==402){
    window.location.href='http://192.168.0.160:8888/cas/login?service=http://192.168.0.160:8089/%23/casLogin';
  }
} else {
  window.location.href='http://192.168.0.160:8888/cas/login?service=http://192.168.0.160:8089/%23/casLogin';
}

	return response
},function(error){
	console.log(error);
})



/*---------------------------------管理员请求的接口------------------------------------*/



// 注册接口
export function register(data) {
  const url = '/register'
  return axios.post(url, qs.stringify(data)).then(res => Promise.resolve(res.data))
}

// 登录接口
// export function login(data) {
//   const url = admineURL+'/user/login'
//   return axios.post(url, data).then(res => Promise.resolve(res.data))
// }
// cas登录接口
export function login() {
  const url = '/user/casLogin'
  return axios.get(url).then(res => Promise.resolve(res.data))
}
// cas登出接口
export function logout() {
  const url = '/user/logout'
  return axios.get(url).then(res => Promise.resolve(res.data))
}
/*****************************************************赵媛***************************************************************/


// 获取接口接口
export function apiDocs() {
  const url = baseURL+'/v2/api-docs'
  return axios.get(url).then(function(res){
    let authList =[];
    let paths = res.data.paths;
    let pathsKeys = Object.keys(paths);
    let sort = 0;
    pathsKeys.forEach((pathKey, index) => {
      let apiObject = paths[pathKey];
      let apiKeys = Object.keys(apiObject);
      apiKeys.forEach((item, index) => {
        let methodObject = apiObject[item];
        sort++;
        let authorities = {
          authority:item + ':' + pathKey,
          authorityName:methodObject.summary,
          parentName:methodObject.tags[0],
          sort:sort
        };
        authList.push(authorities);
      })
    })
    // 保存
    let param={
      json: JSON.stringify(authList)
    }
    return adminHttp.post('/authorities/sync', qs.stringify(param)).then(res => Promise.resolve(res.data))

  })
}

// 管理员获取问卷内容
export function getPaperInfo(id) {
  const url = '/paperInfo/getView/'+id
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

// 管理员获取问卷回收数据
export function getPaperRecycleData(dataId) {
  const url = '/paperRecycle/findRecycledSum?paperId='+dataId
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

// 管理员获取回收量统计图表数据
export function getTJRecycleListData(dataId) {
  const url = '/paperRecycle/findRecycledListByDay?paperId='+dataId
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

// 获取查询常用设备统计图表数据
export function findEquipmentChartData(dataId) {
  const url = '/paperAnswers/findEquipmentChartData?paperId='+dataId
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

// 获取查询来源统计图表数据
export function findSourceChartData(dataId) {
  const url = '/paperAnswers/findSourceChartData?paperId='+dataId
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

// 获取查询操作系统统计图表数据
export function findSystemChartData(dataId) {
  const url = '/paperAnswers/findSystemChartData?paperId='+dataId
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

// 收概况页面回答的地域数量接口
export function findAnswersByAreaCount(data) {
  const url = '/paperAnswers/findAnswersByAreaCount'
  return adminHttp.get(url,data).then(res => Promise.resolve(res.data))
}

// 回收数据—回收答案列表信息
export function findRecycleTongJiData(data) {
  const url = '/paperAnswers/findRecycleTongJiData'
  return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}


// 回收数据—导出回收答案列表信息
export function exportAnswer(dataId) {
  const url = '/paperAnswers/export?paperId='+dataId+'&access_token='+storage.get(TOKEN_KEY)
  window.location.href = `${admineURL}/`+url
}

// 地区联动—根据父Id获取子区域列表
export function getAreaById(dataId) {
  const url = '/area/subSel?pid='+dataId
  return adminHttp.post(url).then(res => Promise.resolve(res.data))
}

//  统计图表页面问题答案统计数量接口
export function findAnswerPercentList(params) {
  const url = '/paperAnswers/findAnswerPercentList'
  return adminHttp.get(url,params).then(res => Promise.resolve(res.data))
}

export function authoritiesPage(params) {
  const url = '/authorities'
  return adminHttp.get(url,params).then(res => Promise.resolve(res.data))
}

export function officeSel(data) {
  const url = '/office/subSel'
  return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}

//保存用户
export function adduser(data) {
  const url = '/user'
  return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}

//获取所有角色
export function rolelist() {
  const url = '/role/list'
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

//根据ID获取部门信息
export function getOffice(dataId) {
  const url = '/office/'+dataId
  return adminHttp.post(url).then(res => Promise.resolve(res.data))
}

//修改用户信息的接口
export function updateUserInfo(data) {
  const url = '/user'
  return adminHttp.put(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}

//查看问卷某个回答
export function getAnswerDetails(data) {
  const url = '/paperAnswers/getAnswerDetails?id='+data
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}

//修改问卷某个回答
export function updatePaperAnswer(data) {
  const url = '/paperAnswers/updatePaperAnswer'
  return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
/*****************************************************赵媛END***************************************************************/
// 管理员获取问卷内容
export function getPaper(data) {
  const url = '/view-paper'
  // if (isMock) {
  //   return axios.post(url, data).then(res => Promise.resolve(res.data))
  // }
  return adminHttp.post(url, data).then(res => Promise.resolve(res.data))
}

// 修改问卷
export function updatePaper(data) {
  const url = '/update-paper'
  return adminHttp.post(url, data).then(res => Promise.resolve(res.data))
}

// 上传问卷表格
export function uploadPaper(data) {
  const url = '/upload'
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  return adminHttp.post(url, data, config).then(res => Promise.resolve(res.data))
}

// 获取问卷答题数据
export function getPaperData(data) {
  const url = '/paper-data'
  // if (isMock) {
  //   return axios.post(url, data).then(res => Promise.resolve(res.data))
  // }
  return adminHttp.post(url, data).then(res => Promise.resolve(res.data))
}


/*---------------------------------答题用户请求的接口------------------------------------*/

// 答题用户获取问卷内容
export function viewPaper(params) {
  const url = '/user/view-paper'
  return axios.get(url, {params}).then(res => Promise.resolve(res.data))
}

/*---------------------------------刘喜瑞的接口------------------------------------*/

// 删除问卷
export function deletePaper(data) {
  const url = '/paperInfo/'+data
  return adminHttp.delete(url, data).then(res => Promise.resolve(res.data))
}
// 获取(非废纸篓)问卷列表
export function getPaperList(params) {
  const url = '/paperInfo/nRecycleList'
  return adminHttp.get(url,params).then(res => Promise.resolve(res.data))
}
//开始回收/暂停回收状态切换接口
export function updateRecycleStatus(data) {
  const url = '/paperInfo/updateRecycleStatus'
  return adminHttp.post(url, data).then(res => Promise.resolve(res.data))
}
//移入废纸篓接口
export function moveBasket(data) {
  const url = '/paperInfo/move/'+data
  return adminHttp.post(url,data).then(res => Promise.resolve(res.data))
}
//恢复废纸篓里的问卷接口
export function recovery(data) {
  const url = '/paperInfo/recovery/'+data
  return adminHttp.post(url).then(res => Promise.resolve(res.data))
}
//查询废纸篓里的问卷列表接口
export function getRecycleList(data) {
  const url = '/paperInfo/recycle/list'
  return adminHttp.get(url,data).then(res => Promise.resolve(res.data))
}
// 查询题库列表接口
export function getList() {
  const url = '/questionInfo/findQuestionBankList'
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}
//getCollectList查询某用户收藏题目列表
export function getCollectList() {
  const url = '/questionInfo/findQuestionCollect'
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}
//getTemplateClassifyPaperList查询每个试卷对应的问题数量，作为首页的推荐列表
export function getTemplateClassifyPaperList(data) {
  const url = '/paperInfo/findTemplateClassify'
  return adminHttp.get(url,data).then(res => Promise.resolve(res.data))
}
//roleManagement角色列表获取接口
export function roleManagement(data) {
  const url = '/role'
  return adminHttp.get(url,data).then(res => Promise.resolve(res.data))
}
//添加角色的信息
export function addUser(data) {
  const url = '/role'
  return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//修改角色的信息
export function updateUser(data) {
  const url = '/role'
  return adminHttp.put(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//删除角色的信息
export function deleteUser(data) {
  const url = '/role/'+data
  return adminHttp.delete(url).then(res => Promise.resolve(res.data))
}
/*---------------------------------张瑞的接口------------------------------------*/
//答题用户获取问卷内容
export function userviewPaper(data) {
  const url = '/paperInfo/viewPaper?id='+data.id
  return adminHttp.get(url,).then(res => Promise.resolve(res.data))
}
//获取个人基本信息
export function getUsermessage() {
  const url = '/user/info'
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}
//修改个人基本信息的接口
export function saveUsermessage(data) {
  const url = '/user/update'
return adminHttp.put(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//修改个人密码的接口
export function saveUserpsw(data) {
  const url = '/user/psw'
return adminHttp.put(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//用户管理的接口
export function userManagement(params) {
  const url = '/user'
  return adminHttp.get(url,params).then(res => Promise.resolve(res.data))
}
//修改用户管理的状态
export function userckState(data) {
  const url = '/user/state'
	return adminHttp.put(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//删除用户的接口
export function userDelete(data) {
const url = '/user/'+data
return adminHttp.delete(url).then(res => Promise.resolve(res.data))
}
//修改接口授权的状态
export function authState(data) {
	const url = '/authorities/role'
	return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//保存问卷题目
export function saveQuestion(data) {
	const url = '/questionInfo/savePaperQuestion'
	return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//保存问卷标题
export function savePaper(data) {
	const url = '/paperInfo/savePaperInfo'
	return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//删除问卷中的问题
export function delPaperQuestion(data) {
	const url = '/questionInfo/delPaperQuestion'
	return adminHttp.put(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//问卷中的问题上移、下移
export function changePaperQuestion(data) {
	const url = '/questionInfo/changePaperQuestion'
	return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//逻辑中获取问题的选项
export function questionOptions(data) {
	const url = '/questionInfo/getLogicalOps'
	return adminHttp.get(url,data).then(res => Promise.resolve(res.data,res.noskipops))
}
//跳转逻辑列表
export function getListBysort(params) {
	const url = '/questionInfo/getListBysort'
	return adminHttp.get(url,params).then(res => Promise.resolve(res.data))
}
//跳转逻辑保存
export function paperLogical(data) {
	const url = '/paperLogical/save'
	return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
// 答题用户刚进页面
export function countView(data) {
  const url = '/paperInfo/countView'
  return adminHttp.get(url, data).then(res => Promise.resolve(res.data))
}

//问卷中有逻辑问题选项/*--------暂时没有使用该接口-----------*/
export function logicalList(params) {
	const url = '/paperLogical/getList'
	return adminHttp.get(url,params).then(res => Promise.resolve(res.data))
}
// 答题用户提交问卷答案
export function commitPaper(data) {
  const url = '/paperAnswers/savePaperAnswer'
  return adminHttp.post(url, qs.stringify(data)).then(res => Promise.resolve(res.data))
}
// 用户收藏题目
export function questionCollection(data) {
  const url = '/questionCollect/save'
  return adminHttp.post(url, qs.stringify(data)).then(res => Promise.resolve(res.data))
}
// 用户删除收藏题目
export function deleteCollection(data) {
  const url = '/questionCollect/cancel'
  return adminHttp.post(url, qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//量表题的类型
export function dictList(data) {
  const url = '/dict/list/'+data.type
  return adminHttp.get(url).then(res => Promise.resolve(res.data))
}
// 使用模板重新赋ID
export function templatepaperId(data) {
  const url = '/questionInfo/saveModelPaperQuestion'
  return adminHttp.post(url, qs.stringify(data)).then(res => Promise.resolve(res.data))
}

//上传头像
export function uploadFile(data) {
	const url = `${admineURL}/`+'/file/uploadFile'
	return axios.post(url,data,{
    headers:{
      'Content-Type':'multipart/form-data',
      'Authorization': "Bearer "+storage.get(TOKEN_KEY)
            }
  }).then(res => Promise.resolve(res.data))
}

// 回收数据中设为无效和有效数据
export function updateAnswerInvalid(data) {
  const url = '/paperAnswers/updateAnswerInvalid'
  return adminHttp.post(url, qs.stringify(data)).then(res => Promise.resolve(res.data))
}
//多题跳转获取题目
export function getManyList(data) {
  const url = '/questionInfo/getManyListBysort'
  return adminHttp.get(url,data).then(res => Promise.resolve(res.data))
}
//跳转逻辑保存
export function multiJumpSave(data) {
	const url = '/paperLogical/manysave'
	return adminHttp.post(url,qs.stringify(data)).then(res => Promise.resolve(res.data))
}
