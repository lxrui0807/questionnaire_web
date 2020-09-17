<template>
	<div class="tabZujian">
        
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="用户管理" name="first" :key="'first'">
                <child1 v-if="isChildUpdate1"></child1>
            </el-tab-pane>
            
            <el-tab-pane label="角色管理" name="second" :key="'second'">
                <child2 v-if="isChildUpdate2"></child2>    
            </el-tab-pane>
            
            <el-tab-pane label="权限管理" name="three" :key="'three'">
                <child3 v-if="isChildUpdate3"></child3>    
            </el-tab-pane>
            
            <el-tab-pane label="模板管理" name="four" :key="'four'">
                <child4 v-if="isChildUpdate4"></child4>    
            </el-tab-pane>
            
        </el-tabs>
        
    </div>
</template>

<script>
	import Survey from '@/components/Survey'//用户管理
	import Role from '@/components/Role'//角色管理
	import Authorities from '@/components/Authorities'//权限管理
	import Menu from '@/components/Menu'//模板管理
	export default {
		name: 'system',
		components:{
	        child1:Survey,
	        child2:Role,
	        child3:Authorities,
	        child4:Menu
	    },
		data() {
			return {
				//默认第一个选项卡
	            activeName: "first",
	            isChildUpdate1:true,
	            isChildUpdate2:false,
	            isChildUpdate3:false,
	            isChildUpdate4:false
			}
		},
		methods: {
		    handleClick(tab) {
	            if(tab.name == "first") {
	                this.isChildUpdate1 = true;
	                this.isChildUpdate2 = false;
	                this.isChildUpdate3 = false;
	                this.isChildUpdate4 = false;
	            } else if(tab.name == "second") {
	                this.isChildUpdate1 = false;
	                this.isChildUpdate2 = true;
	                this.isChildUpdate3 = false;
	                this.isChildUpdate4 = false;
	            }else if(tab.name == "three") {
	                this.isChildUpdate1 = false;
	                this.isChildUpdate2 = false;
	                this.isChildUpdate3 = true;
	                this.isChildUpdate4 = false;
	            }else if(tab.name == "four") {
	                this.isChildUpdate1 = false;
	                this.isChildUpdate2 = false;
	                this.isChildUpdate3 = false;
	                this.isChildUpdate4 = true;
	            }
	        }
		}
	}
	
	
</script>

<style>
	.tabZujian{
		/*padding: 1rem;*/
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
		width: 90%;
		margin: 0 auto;
	}
	.el-tabs__nav-wrap{
		padding-top: 4rem;
	}
	.el-tabs__item{
		display: block;
		padding: 0;
		text-align: center;
	}
	.el-tabs__active-bar,.el-tabs__nav-wrap::after{
		height: 0;
	}
	.el-tabs__content{
		padding: 2rem;
	}
</style>