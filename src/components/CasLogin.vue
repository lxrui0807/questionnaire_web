<template>
	<div class="container">
	</div>
</template>
<script>
  import { login } from '../api'
import storage, { TOKEN_KEY, EMAIL_KEY, USERNAME_KEY,USERID_KEY,USERID_IMG,USERID_ROLES } from '../public/js/storage'

export default {
	name: 'CasLogin',

	created() {
	  // var url=window.location.href;
	  // var turl=url.split("token=")[1];
	  // var token=turl.split("&")[0];
	  // var user=turl.split("user=")[1];
    // //this.loginSuccess(token,user.username.token.userId,res.user.avatar,res.token.roles[0])
    // console.log(window.location.href)
    // console.log(token)
    // console.log(JSON.stringify(user))
    // storage.set(TOKEN_KEY, token)
    // this.$router.push('/establish')
    this.logins();
	},
  methods: {
	  logins(){
      login().then(res => {
        console.log('ddddeeeeeeeeeeeeeeeeedd');
        console.log(res);
        if (res.code === 200) {
          this.loginSuccess(res.token.accessToken,res.user.username,res.token.userId,res.user.avatar,res.token.roles[0])

        }
      })
    },

    loginSuccess(access_token,username,userid,userimg,userroles) {
      storage.set(TOKEN_KEY, access_token)
      storage.set(USERNAME_KEY, username)
      storage.set(USERID_KEY, userid)
      storage.set(USERID_IMG, userimg)
      storage.set(USERID_ROLES, userroles)
      console.log('dddddddfrrrrrrrrrrrrrrr');
      this.$router.push('/establish')
    }
  }
}
</script>

<style scoped lang="scss">
</style>
