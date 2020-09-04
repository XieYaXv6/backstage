import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
    {path:'/',redirect:'/login'},
    {path:'/login',component:Login},
    {path:'/home',component:Home},
  ]
})

router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next();

  const tokenstr=window.sessionStorage.getItem('token')
  if(!tokenstr) {
    return next('/login')
  }else{
    next()
  }
})

export default router
