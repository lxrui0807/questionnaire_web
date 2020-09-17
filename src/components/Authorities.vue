<template>
	<div class="container messageboard">
        <!-- 查询区----start -->
        <el-form :label-position="labelPosition" :label-width="labelWidth" :inline="true" ref="formSearch" :model="formSearch" class="demo-form-inline">
            <el-form-item label="搜索" prop="keyword">
                <el-input v-model="formSearch.keyword" placeholder="请输入关键字"></el-input>
            </el-form-item>
            <el-form-item label=" " style="margin-left:50px;">
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button type="warning" plain @click="onReset">重置</el-button>
                <!--round可以使button变半圆-->
                <el-button type="primary" @click="handleAdd">同步</el-button>
            </el-form-item>
        </el-form>
        <!-- 查询区----end -->
        <!-- 表格---start -->
        
       	<!--:span-method="objectSpanMethod"为合并方法，方法内容需要修改-->
       	<el-table :data="tableData" border style="width: 100%; margin-top: 20px">
       <!--<el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%; margin-top: 20px">-->
			<el-table-column align="center" type="index" :index="typeIndex" label="序　号" width="100px" ></el-table-column>
			<el-table-column prop="parentName" label="模　块" width="180" align="center">
			</el-table-column>
			<el-table-column prop="authorityName" label="接口名称" align="center">
			</el-table-column>
			<el-table-column prop="authority" label="权限标识" align="center">
			</el-table-column>
			<el-table-column prop="createTime" label="同步时间" align="center">
			</el-table-column>
		</el-table>
        <el-pagination background 
        	layout="total,sizes,prev, pager, next,jumper" 
        	:current-page="pageInfo.currentPage" 
        	:page-size="pageInfo.pageSize" 
        	:total="pageInfo.pageTotal" 
        	:page-sizes="[10, 20, 50]" 
        	@size-change="handleSizeChange" 
        	@current-change="handleCurrentChange">
        </el-pagination>
        <!-- 表格---end -->
    </div>
</template>
		
	<script>
    import {authoritiesPage,apiDocs} from '../api'
    
		export default {
		   	name: 'survey',
		   	data() {
			    return {
			       listLoading : false,//
		            pageInfo: { //分页
		                currentPage: 1,
		                pageSize: 10,
		                pageTotal: 0
		            },
	            	formSearch:{
	            		keyword: ''
	            	},//表单查询
			        tableData: [],
		            labelPosition: 'right', //lable对齐方式
		            labelWidth: '80px', //lable宽度
				}
		  	},
	      	created() {
	        	this._authoritiesPage()
	      	},
		   methods: {
         //	获取权限列表
         _authoritiesPage(){
           let config={
             params: {
               keyword:this.formSearch.keyword,
               page: this.pageInfo.currentPage,
               limit:this.pageInfo.pageSize
             }
           }
           this.isLoading = true
           authoritiesPage(config).then(res => {
	            this.isLoading = false
	            if (res.code === 200) {
	               this.pageInfo.pageTotal = res.count
	               this.tableData = res.data
	            }
           })
         },
//		   		合并表格的方法，暂时隐藏
//			   	objectSpanMethod({
//					row,
//					column,
//					rowIndex,
//					columnIndex
//				}) {
//	//				columnIndex为需要合并的列
//					if(columnIndex === 1) {
//						里面内容需要修改
//						if(row.isFirst) {
//							return {
//								rowspan: row.len,
//								colspan: 1
//							};
//						} else {
//							return {
//								rowspan: 0,
//								colspan: 0
//							};
//						}
//					}
//				},
				//表格序号的获取
         typeIndex(index) {
           let vm = this; //处理分页数据的 index
           return (vm.pageInfo.currentPage - 1) * vm.pageInfo.pageSize + index + 1;
         },

		   		/**
		         * 查询列表
		         */
		        onSearch(){
		        	this._authoritiesPage()
		        },
//		       	 重置查询
		        onReset(){
		            this.$refs['formSearch'].resetFields();
		        },
		        /**
		         * 同步数据
		         */
		        handleAdd() {
		        	this.$confirm('确定进行同步吗?', '信息', {
		                confirmButtonText: '确定',
		                cancelButtonText: '取消',
		                type: 'warning'
		            }).then(() => {
		            	this._apiDocs()
		            }).catch(() => {
		            	
		            });
		        },

           _apiDocs(){
             this.isLoading = true
             apiDocs().then(res => {
               this.isLoading = false
               if (res.code === 200) {
                 this.$message({message: '同步成功',type: "success"});
                 this._authoritiesPage()
               }else{
                 this.$message({message: '同步失败',type: "info"});
               }
             })
           },
		        /**
		         * 分页大小切换
		         */
		        handleSizeChange(val) {
		            this.pageInfo.pageSize = val;
		            this.onSearch();
		        },
		        /**
		         * 分页切换
		         */
		        handleCurrentChange(val) {
		            this.pageInfo.currentPage = val;
		            this.onSearch();
		        },
		   },
		   components: {}
		 }
		</script>
		
<style>
.messageboard{
    // 设置输入框的宽度
    .el-form-item__content {
        width: 220px;
    }
}
</style>
