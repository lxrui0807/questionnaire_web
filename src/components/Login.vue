<template>
  <div class="container">
    <div class="login">
      <div class="login-header">
        <img src="../assets/login-header.png" />
      </div>
      <div class="login-result" :class="resultClassName" v-show="isShowResult">
        <p>
          <span>{{ resultText }}</span>
          <a href="javascript:;" @click="isShowResult = false">&times;</a>
        </p>
      </div>
      <div class="login-body">
        <form>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="username" >
          </div>
          <div class="form-group">
            <label>密码</label>
            <input id="password" type="password" autocomplete v-model="password"  @keyup.enter="submit()">
          </div>
          <div class="form-group">
            <input type="button" :value="submitText || '登　录'" @click="submit()">
          </div>
        </form>
      </div>
    	<p class="create-account">
      	<span>没有账号？</span>
      	<a href="javascript:;" @click="switchToRegister()">注册一个</a>
    	</p>
    </div>
    <footer>
    	<p>Copyright  2020 中国农业科学院茶叶研究所版权所有 </p>
    	<p>地址：浙江省杭州市梅灵南路9号  邮编：310008   技术支持：中国农业科学院农业信息研究所   </p>
    </footer>
  </div>
</template>

<script>
  import { login } from '../api'
  import { accountMixin } from '../public/js/mixin'
  import storage, { TOKEN_KEY, EMAIL_KEY, USERNAME_KEY,USERID_KEY,USERID_IMG,USERID_ROLES } from '../public/js/storage'

  export default {
    name: 'Login',

    mixins: [accountMixin],

    data() {
      return {
        username: '',
        password: '',
        submitText: ''
      }
    },

    methods: {
      submit() {
        this.isShowResult = false
        if (this.submitText) {
          return
        }
        let isValidated = this.validateInfo()
        if (isValidated) {
          let data = {
            username: this.username,
            password: this.password
          }
          this.submitText = '登录中...'
          login(this.$qs.stringify(data)).then(res => {
            if (res.code === 200) {
              this.loginSuccess(res.token.accessToken,data.username,res.token.userId,res.user.avatar,res.token.roles[0])

            }else {
              this.showResult('error', res.msg)
              this.submitText = ''
            }
          })
        }
      },

      loginSuccess(access_token,username,userid,userimg,userroles) {
        storage.set(TOKEN_KEY, access_token)
        storage.set(USERNAME_KEY, username)
        storage.set(USERID_KEY, userid)
        storage.set(USERID_IMG, userimg)
        storage.set(USERID_ROLES, userroles)
        this.$router.push('/')
      },

      validateInfo() {

        if (!this.password) {
          this.showResult('error', '请输入密码')
          return false
        }

        return true
      },

      switchToRegister() {
        this.$router.push('register')
      }
    }
  }
</script>

<style lang="scss" scoped>
$name: 'login';
@import '../style/public.scss';
@import '../style/account.scss';
.container {
	position: fixed;
	background-image: url(../assets/login-bg.jpg);
	width: 100%;
  top: 0;
  bottom: 0;
  margin: 0;
  background-color: #f9f9f9;
	overflow: auto;
	.login{
		width: 38rem;
		margin: 0;
		position: relative;
    left: 57%;
    top: 15%;
    .login-body{
    	padding: 5rem 4rem 6.5rem 4rem;
    	box-shadow: 0rem 0rem 1rem 1rem rgba(0,0,0,0.02);
    	border: none;
    	.form-group input{
    		margin: .5rem 0 .5rem 0;
    	}
    	.form-group input[type="button"]{
    		margin-top: 4rem;
    	}
    }
	}
	footer{
		width: 100%;
    position: absolute;
    bottom: 30px;
    text-align: center;
    color: rgba(0,0,0,0.5);
    font-size: 12px;
    p{
    	padding-bottom: 8px;
    }
	}
}
</style>
