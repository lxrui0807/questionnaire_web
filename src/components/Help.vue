<template>
	<div class="container">
		<div class="qu-content">
			<div class="leftColumn">
		        <div class="current">
		        	<!--<p><router-link  to="/answergroup" exact>基本信息</router-link></p>
		        	<p><router-link  to="/survey" exact>修改信息</router-link></p>-->
		            <p v-for="(item,index) in subjectList" :class="{active:subjectNmu==index}" @click="subjectBtn(index)">
		              {{item}}</p>
		        </div>
	        </div>
			 <div class="centerColumn userBasic" v-show="subjectNmu == 0">
				<el-form ref="getUsermessage" :model="getUsermessage" label-width="80px">
					<el-form-item label="头　　像" ref="uploadElement" prop="imageUrl" class="userImg">
						<p id="fileinpFarter">
							<input type="button" id="btn" value="更换头像"></span>
        					<input type="file" id="fileinp"  @change='onchangeImgFun' title="">
						</p>
					    <img  alt="" :src='getUsermessage.avatar' class="user-header-img user-header-com">
		            </el-form-item>
					<el-form-item label="账　　号" prop='username'>
						<el-input v-model="getUsermessage.username"></el-input>
					</el-form-item>
					<el-form-item label="姓　　名" prop='nickName'>
						<el-input v-model="getUsermessage.nickName"></el-input>
					</el-form-item>
					<el-form-item label="性　　别" prop='sex'>
						<el-input v-model="getUsermessage.sex"></el-input>
					</el-form-item>
					<el-form-item label="联系电话" prop='phone'>
						<el-input v-model="getUsermessage.phone"></el-input>
					</el-form-item>
					<el-form-item label="邮　　箱" prop='email'>
						<el-input v-model="getUsermessage.email"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onSubmit()">更新基本信息</el-button>
						<el-button>取消</el-button>
					</el-form-item>
				</el-form>
			</div>
			 <div class="centerColumn userBasic" v-show="subjectNmu == 1">
			 	<el-form ref="pswForm" :model="pswForm" label-width="80px">
			 		<el-form-item label="原始密码">
						<el-input type="password" v-model="pswForm.oldPsw"></el-input>
					</el-form-item>
					<el-form-item label="新密码">
						<el-input type="password" v-model="pswForm.newPsw"></el-input>
					</el-form-item>
					<el-form-item label="确认密码">
						<el-input type="password" v-model="pswForm.rePsw"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onSubmitPsw">修改密码</el-button>
						<el-button>取消</el-button>
					</el-form-item>
			 	</el-form>
			 </div>
		 </div>
	</div>
</template>

<script>
	import {getUsermessage,saveUsermessage,saveUserpsw,uploadFile} from '../api'
	import storage, {USERID_IMG} from '../public/js/storage'
	export default {
	    data() {
		    return {
		      	subjectList: ['基本信息', '修改密码'],
		      	subjectNmu: 0,
		        getUsermessage: {
		        	userId:'',
		          	username: '',
		          	nickName: '',
		          	sex: '',
		          	phone:'',
		          	email:'',
		          	avatar:''
		        },
		        pswForm: {
		          	oldPsw: '',
		          	newPsw: '',
		          	rePsw: ''
		        }
		    }
	    },
	    created() {
	      this._getUsermessage()
	    },
	    methods: {
//	    	上传图片
			onchangeImgFun (e) {
				let reader = new FileReader();
				let file = event.target.files[0];
		        var formdata = new FormData()
		        formdata.append("file",file)
		        console.log("文件",formdata);
				//接口部分
				//console.log(form)
				uploadFile(formdata).then(res => {
			        console.log(res);
		        	if(res.code == 0){
	                    this.getUsermessage.avatar=res.data.fullpath;
		        	}
			    })
		    },
	    	//获取个人信息的接口
	    	_getUsermessage(){
//	    		this.isLoading = true
			    getUsermessage().then(res => {
			    	console.log(res);
			       this.isLoading = false
			       	if (res.code === 200) {
			        	this.getUsermessage.userId = res.user.userId
			          	this.getUsermessage.username = res.user.username
			          	this.getUsermessage.nickName = res.user.nickName
			          	this.getUsermessage.sex = res.user.sex
			          	this.getUsermessage.phone = res.user.phone
			          	this.getUsermessage.email = res.user.email
			            this.getUsermessage.avatar = res.user.avatar
			        }
		        })
	    	},
//	    	保存个人基本信息
		    onSubmit() {
		    	let data = this.getUsermessage
		    	saveUsermessage(data).then(res => {
			    	this.$message({message: res.msg,type: "success"});
			    	storage.set(USERID_IMG, this.getUsermessage.avatar)
		        }).catch(() => {
	                this.$message({type: 'info',message: res.msg});
	            });
		    },
//		        修改密码
		    onSubmitPsw(){
		    	let isValidated = this.validateInfo()
		    	if (isValidated) {
			    	let data = this.pswForm
			    	saveUserpsw(data).then(res => {
				    	this.$message({message: res.msg,type: "success"});
				    	this.$router.back(-1)
			        }).catch(() => {
		                this.$message({type: 'info',message: res.msg});
		            });
		    	}
		    },
//		    单击左侧tab
			subjectBtn(index) {
		        this.subjectNmu = index;
		    },
		    validateInfo() {
		      	if (this.pswForm.newPsw !== this.pswForm.rePsw) {
		        	this.$message({type: 'info',message: '两次密码输入不一致'});
		          return false
		        }
		      	return true
		    }
	    }
	  }
</script>

<style scoped lang="scss">
@import '../style/_Help.scss';
.userImg>.el-form-item__content{
	text-align: center;
}
#fileinpFarter{
	 position: relative; 
}
#fileinp{
	width: 21%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
}
#btn{
	width: 21%;
	padding: 2px 12px;
    margin-right: 5px;
}
.user-header-img{
	width: 50px;
	height: 50px;
	display: block;
	margin: 0 auto;
}
</style>
