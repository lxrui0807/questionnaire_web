<template>
	<div class="header">
		<h2>
			<img src="../assets/logo.png" />
		</h2>
		<nav>
			<ul class="navigation">
				<li v-for="(item,index) in nav"  @click="routerLink(index)">
					<router-link  :to="item.path" exact :class="{ active:index==navIndex}">{{item.title}}</router-link>
				</li>
			</ul>
		</nav>
		 <div class="user">
			<span class="user_img">
				<img :src="userimg" />
			</span>
			<span class="user_name">{{ username }}</span>
			<span class="user_logout" @click="logout()">退出</span>
		</div> 
		
	</div>
</template>

<script>
  import storage, { TOKEN_KEY, EMAIL_KEY, USERNAME_KEY,USERID_IMG,USERID_ROLES } from '../public/js/storage'
  import { logout} from '../api'
	export default {
		inject: ['reload'],
		name: 'pageHeader',
		data() {
			return {
				nav:[],
	            navIndex:0,
         		username:'',
         		userimg:''
			}
		},
	    created(){
	    	if(storage.get(USERID_ROLES) == 1){//管理员
	    		this.nav = [
	                {title:'创建问卷',path:'/establish'},
	                {title:'我的问卷',path:'/myquestionnaire'},
	                {title:'系统管理',path:'/system'},
	                {title:'个人中心',path:'/help'}
	            ]
	    	}else{
	    		this.nav = [
	                {title:'创建问卷',path:'/establish'},
	                {title:'我的问卷',path:'/myquestionnaire'},
	                {title:'个人中心',path:'/help'}
	            ]
	    	}
	      	this.getUserName();
	    },
	    watch: {
		    $route (to, from) {
		      if (to.path === '/establish') {
		        this.reload()
		      }
		    }
		},
		methods: {
			logout() {
		        this.$confirm('确定要退出登录吗？', '温馨提示', {
		          confirmButtonText: '确定',
		          cancelButtonText: '取消',
		          type: 'warning'
		        }).then(() => {
		          storage.remove(TOKEN_KEY);
		          // this.$router.push({path: '/login'})
              logout().then(res => {
                window.location.href='http://192.168.0.160:8888/cas/logout?service=http://192.168.0.160:8089';
              })

		        }).catch(() => {
		          this.$message({type: 'info',message: '已取消登出'});
		        });
			},
	      	getUserName(){
      			this.username=storage.get(USERNAME_KEY);
      			if(storage.get(USERID_IMG)!='null'){
      				this.userimg=storage.get(USERID_IMG);
      			}else{
      				this.userimg="/static/img/sprites_bg.b2362d8.png"
      			}
	      	},
			routerLink(index) {
				this.navIndex = index;
			},
		},
	}
</script>

<style lang="scss">
	@import "../style/public.scss";

	.header {
		color: #000;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 5rem;
		background-color:#ffffff;
		box-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.3);
		position: relative;

		h2 {
			margin: 0 5rem 0 6rem;
			font-size: 1.8rem;
			img {
				width:80%;
			}
		}
		
		nav {
			text-align: center;
			font-weight: 600;
			
			.navigation {
				list-style: none;
				margin: 0;
				overflow: hidden;
				    
				li {
			        font-size: 1.7rem;
			        height: 2rem;
			        line-height: 2rem;
			        float: left;
			        display: inline-block;
			        padding: 0 2rem;
			        position: relative;
				    
				    a:link{
				    	color: #333;
				    }
				    a:visited{
				    	color: #333;
				    }
				    a:active{
				    	color: #7abd2e;
				    }
				    .active{color:#7abd2e !important;}
				}
			}
		}
		
		.user{
			position: absolute;
			right: 20px;
			
			.user_img{
				display: inline-block;
				width: 2rem;
				height: 2rem;
				padding-right: 5px;
				
				img{
					width: 100%;
					height: 100%;
					border-radius: 50%;
					vertical-align: middle;
				}
			}
			
			.user_name{
				padding-right: 3px;
			}
			
			.user_logout{
				padding-left: 5px;
				border-left: 1px solid #333;
        cursor: pointer;
			}
		}

		h3 {
			font-size: 1.2rem;
			cursor: pointer;
		}
	}
</style>
