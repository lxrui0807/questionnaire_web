<template>
  <div class="container">
    <div class="register">
      <div class="register-header">
        <h1>注册</h1>
      </div>

      <div class="register-body">
        <form>
          <div class="form-group">
            <label>昵称</label>
            <input type="text" v-model="nickName">
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="username">
          </div>
          <div>
            <label class="lable">性别</label>
            <label><input v-model="sex" type="radio" value="男"><span>男</span></label>
            <label><input v-model="sex" type="radio" value="女"><span>女</span></label>
          </div>
         <!-- <div>
            <label class="lable">角色</label>
            <label><input type="radio" v-model="roleIds" value="1">管理员</label>
            <label><input type="radio" v-model="roleIds" value="2">普通用户</label>
             </div>-->
          <div class="form-group">
            <label>密码</label>
            <input type="password" autocomplete v-model="password">
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input type="password" autocomplete v-model="password2">
          </div>
          <div class="form-group">
            <label>手机号码</label>
            <input type="text" autocomplete v-model="phone">
          </div>
          <div class="form-group">
            <input type="button" :value="submitText || '注册'" @click="submit()">
          </div>
        </form>
      </div>
      <p class="create-account">
        <span>已有账号？</span>
        <a href="javascript:;" @click="switchToLogin()">点击登录</a>
      </p>
    </div>
    <footer>
    	<p>Copyright  2020 中国农业科学院茶叶研究所版权所有 </p>
    	<p>地址：浙江省杭州市梅灵南路9号  邮编：310008   技术支持：中国农业科学院农业信息研究所   </p>
    </footer>
  </div>
</template>

<script>
  import { register } from '../api'
  import { accountMixin } from '../public/js/mixin'

  export default {
    name: 'Register',
    mixins: [accountMixin],
    data() {
      return {
        nickName:'',
        username: '',
        sex:'',
        roleIds:'2',
        password: '',
        password2: '',
        phone:'',
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
            nickName: this.nickName,
            username: this.username,
            sex: this.sex,
            roleIds:this.roleIds,
            password: this.password,
            phone:this.phone
          }
          this.submitText = '注册中...'
          register(data).then(res => {
            if (res.code === 200) {
                this.registerSuccess()
            } else {
              this.showResult('error', res.msg)
            }
            this.submitText = ''
          })
        }
      },

      registerSuccess() {
      	this.$message({type: 'success',message: '注册成功'});
        this.nickName=''
        this.username = ''
        this.sex=''
        this.roleIds=''
        this.password = ''
        this.password2 = ''
        this.phone=''

        setTimeout(() => {
          this.switchToLogin()
        }, 2000);
      },

      validateInfo() {
        if(!this.nickName){
        	this.$message({type: 'error',message: '请输入昵称'});
          return false
        }
        let username = this.username.trim()
        if (username.length < 3 || username.length > 10) {
        	this.$message({type: 'error',message: '用户名3~10个字符'});
          return false
        }
        if(!this.sex){
        	this.$message({type: 'error',message: '请选择性别'});
          return false
        }
        if (!this.password) {
        	this.$message({type: 'error',message: '请输入密码'});
          return false
        }
        if (this.password !== this.password2) {
        	this.$message({type: 'info',message: '两次密码输入不一致'});
          return false
        }
        let phoneReg = /(^0[1-9]{1}\d{9,10}$)|(^((13\d)|(14\d)|(15\d)|(17\d)|(18\d)||(19\d))\d{8}$)/g;
        if(!phoneReg.test(this.phone)){
        	this.$message({type: 'error',message: '请输入合法手机号码'});
          return false
        }
        return true
      },

      switchToLogin() {
        this.$router.push('login')
      }
    }
  }

</script>

<style lang="scss" scoped>
  $name: 'register';
  @import '../style/public.scss';
  @import '../style/account.scss';
  input[type="radio"] {
    /* padding-left: 80px; */
    margin-left: 93px;
    margin-bottom: 20px;
    font-size: 1.4rem;
    font-weight: 600;
  }
  input[type="checkbox"] {
    /* padding-left: 80px; */
    margin-left: 83px;
    margin-bottom: 20px;
    font-size: 1.4rem;
    font-weight: 600;
  }
  .lable{
    font-weight: 600;
  }
  .container {
	position: fixed;
	width: 100%;
  top: 0;
  bottom: 0;
  margin: 0;
  background-color: #f9f9f9;
	overflow: auto;
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

