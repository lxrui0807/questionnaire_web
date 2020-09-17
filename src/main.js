// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import ElementUI from 'element-ui' //新添加
import 'element-ui/lib/theme-chalk/index.css' //新添加，避免后期打包样式不同，要放在import App from './App';之前
import Vue from 'vue'
import App from './App'
import router from './router'
import qs from 'qs'
import echarts from 'echarts'
import Print from 'vue-print-nb'//打印组件
import _ from 'lodash'

Vue.use(ElementUI)   //新添加
Vue.use(Print);//打印组件
Vue.prototype.$echarts = echarts
Vue.prototype.$qs = qs
Vue.config.productionTip = false

require('./public/js/mock')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
