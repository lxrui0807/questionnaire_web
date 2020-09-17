<template>
	<!--<div>-->
		
		<div class="tabZujian">
			<!--<footer @click="$router.back(-1)">
				<a @click="$router.back(-1)">返回</a>
			</footer>-->
			<el-tabs v-model="activeName" @tab-click="handleClick">
	            <el-tab-pane label="回收概况" name="first" :key="'first'">
	                <child1 v-if="isChildUpdate1"></child1>
	            </el-tab-pane>
	            
	            <el-tab-pane label="回收数据" name="second" :key="'second'">
	                <child2 v-if="isChildUpdate2"></child2>    
	            </el-tab-pane>
	            
	            <el-tab-pane label="统计图表" name="three" :key="'three'">
	                <child3 v-if="isChildUpdate3"></child3>    
	            </el-tab-pane>
	        </el-tabs>
		</div>
	<!--</div>-->
	
</template>

<script>
	import recyOverview from '@/components/recyOverview'//用户管理
	import recyData from '@/components/recyData'//角色管理
	import statistics from '@/components/statistics'//权限管理
	export default {
		name: 'system',
		components:{
	        child1:recyOverview,
	        child2:recyData,
	        child3:statistics
	    },
		data() {
			return {
				//默认第一个选项卡
	            activeName: "first",
	            isChildUpdate1:true,
	            isChildUpdate2:false,
	            isChildUpdate3:false
			}
		},
		methods: {
		    handleClick(tab) {
	            if(tab.name == "first") {
	                this.isChildUpdate1 = true;
	                this.isChildUpdate2 = false;
	                this.isChildUpdate3 = false;
	            } else if(tab.name == "second") {
	                this.isChildUpdate1 = false;
	                this.isChildUpdate2 = true;
	                this.isChildUpdate3 = false;
	            }else if(tab.name == "three") {
	                this.isChildUpdate1 = false;
	                this.isChildUpdate2 = false;
	                this.isChildUpdate3 = true;
	            }
	        }
		}
	}

</script>

<!--<style scoped lang="scss">
@import '../style/_Data.scss';
</style>-->
<style>
	.tabZujian{
		padding: 0.1rem 1rem 0 0
	}
	.tabZujian,.el-tabs{
		height: 100%;
	}
	.el-tabs__header{
	  width: 10%;
	  height: 100%;
	  float: left;
	  background-color: #fff;
	}
	.el-tabs__nav{
		width:100%;
		margin: 0 auto;
	}
	.el-tabs__nav-wrap{
		padding-top: 4rem;
	}
	.el-tabs__item{
		display: block;
		padding: 0;
		text-align: center;
		margin: 1rem 0;
	}
	.el-tabs__active-bar,.el-tabs__nav-wrap::after{
		height: 0;
	}
	.el-tabs__content{
		padding: 2rem;
	}
</style>
