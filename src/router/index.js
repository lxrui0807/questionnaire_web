import Vue from 'vue'
import Router from 'vue-router'
import storage, { TOKEN_KEY }from '../public/js/storage.js'

// 异步加载
const Register = () => import('@/components/Register')
const Data = () => import('@/components/Data')
const Edit = () => import('@/components/Edit')
const Fill = () => import('@/components/Fill')
const SubmitEnd = () => import('@/components/submitEnd')
const Login = () => import('@/components/Login')

const Seeview = () => import('@/components/View')
const ViewEditor = () => import('@/components/viewEditor')
const Establish = () => import('@/components/Establish')
const Myquestionnaire = () => import('@/components/Myquestionnaire')
const System = () => import('@/components/System')
const Survey = () => import('@/components/Survey')
const Help = () => import('@/components/Help')
const Template = () => import('@/components/Template')
const Wastepaper = () => import('@/components/Wastepaper')
const CasLogin = () => import('@/components/CasLogin')

Vue.use(Router)

const routes = [
{
    path: '/',
    redirect: '/establish',
    meta: {
    	requiresAuth: true,
    	keepAlive: true
    }
},
  {
    path: '/casLogin',
    component: CasLogin,
    meta: {
      keepAlive: false,
      requiresAuth: false
    }
  },
{
    path: '/login',
    component: Login,
    meta: {
   		keepAlive: false
   	}
},
{
    path: '/myquestionnaire',
    component: Myquestionnaire,
    meta: { 
    	requiresAuth: true,
    	keepAlive: true
    }
},
{
    path: '/survey',
   	component: Survey,
   	meta: {
   		requiresAuth: true,
   		keepAlive: true
   	}
},
{
    path: '/system',
   	component: System,
   	meta: { 
   		requiresAuth: true,
   		keepAlive: true
   	}
},
{
    path: '/help',
   	component: Help,
   	meta: { 
   		requiresAuth: true,
   		keepAlive: true
   	}
},
 {
    path: '/template',
    component: Template,
    meta: { 
    	requiresAuth: true,
    	keepAlive: true
    }
  },
 {
    path: '/seeView',
    component: Seeview,
    meta: { 
    	requiresAuth: true,
    	keepAlive: false
    }
  },
   {
    path: '/viewEditor',
    component: ViewEditor,
    meta: { 
    	requiresAuth: true,
    	keepAlive: false
    }
  },
 {
    path: '/establish',
    component: Establish,
    meta: { 
    	requiresAuth: true,
    	keepAlive: true
    }
  },
  {
    path: '/register',
    component: Register,
    meta: {
   		keepAlive: false
   	}
  },
  {
    path: '/fill',
    component: Fill,
    meta: { 
    	requiresAuth: false,
    	keepAlive: false
    }
  },
  {
    path: '/submitEnd',
    component: SubmitEnd,
  },
  {
    path: '/data',
    name: 'data',
    component: Data,
    meta: { 
    	requiresAuth: true,
    	keepAlive: true
    }
  },
  {
    path: '/edit',
    alias: ['/add', '/re-edit'],
    name: 'edit',
    component: Edit,
    meta: { 
    	requiresAuth: true,
    	keepAlive: true
    }
  },
  {
    path: '/wastepaper',
   	component: Wastepaper,
   	meta: { 
   		requiresAuth: true,
   		keepAlive: true
   	}
}
]

const router = new Router({ routes })
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log(storage.get(TOKEN_KEY));
    if (!storage.get(TOKEN_KEY)) {
      console.log('ddd');
      window.location.href='http://192.168.0.160:8888/cas/login?service=http://192.168.0.160:8089/%23/casLogin';
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
