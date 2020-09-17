<template>
  <div id="app">
  	<div v-if="$route.meta.keepAlive">
  		<pageHeader v-if="isRouterAlive"></pageHeader>
  		<router-view></router-view>
  	</div>
  	<router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
import Header from './components/Header'


export default {
  name: 'App',
  components: {
		"pageHeader":Header,
		
  },
  data () {
    return {
      isRouterAlive: true
    }
  },
  provide () {
    return {
      reload: this.reload
    }
  },
  methods:{
  	reload () {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style>
@import "style/reset";

#app {
  min-width: 110rem;
  height: 100%;
  font-family: arial;
  background-color: #f9f9f9;
  overflow: auto;
}

@media screen and (max-width: 640px) {
	#app {
		min-width: 100%;
  }
}
</style>
