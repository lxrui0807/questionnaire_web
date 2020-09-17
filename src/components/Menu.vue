<template>
	<div class="container messageboard">
        <!-- 查询区----start -->
        <el-form :label-position="labelPosition" :label-width="labelWidth" :inline="true" ref="formSearch" :model="formSearch" class="demo-form-inline">
            <el-form-item label="搜索" prop="title">
                <el-input v-model="formSearch.title" placeholder="请输入名称"></el-input>
            </el-form-item>
            <el-form-item label=" " style="margin-left:50px;">
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button type="warning" plain @click="onReset">重置</el-button>
                <!--round可以使button变半圆-->
                <el-button type="primary" @click="handleAdd">新增</el-button>
            </el-form-item>
        </el-form>
        <!-- 查询区----end -->
        <!-- 表格---start -->
        <el-table :data="tableData" v-loading="listLoading"  border stripe style="width: 100%">
            <el-table-column prop="title" label="名　称" width="400" align="center" sortable>
            </el-table-column>
          	<el-table-column prop="remarks" label="题目数" align="center" width="400" sortable>
          	</el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="400" sortable>
        	</el-table-column>
            <el-table-column label="操　作" fixed="right" min-width="200" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="mini" plain type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination background 
        	layout="total,sizes,prev, pager, next,jumper" 
        	:current-page="pageInfo.currentPage" 
        	:page-size="pageInfo.pageSize" 
        	:total="pageInfo.pageTotal"
        	:page-sizes="[10,20,50]"
        	@size-change="handleSizeChange" 
        	@current-change="handleCurrentChange">
        </el-pagination>
        <!-- 表格---end -->

    </div>
</template>
		
	<script>
    import {getTemplateClassifyPaperList,deletePaper} from '../api'
    
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
		            formSearch: { //表单查询
                  		title: '',
		            },
		            tableData: [], //表单列表
		            labelPosition: 'right', //lable对齐方式
		            labelWidth: '80px', //lable宽度
		            formLabelWidth: '120px',
		            multipleSelection: []
			   }
		  	},
        	created() {
        		this._getTemplateClassifyPaperList()
      		},
		   methods: {
		   		/**
		         * 查询列表
		         */
		        onSearch(){
            		this._getTemplateClassifyPaperList();
		        },
//		       	 重置查询
		        onReset(){
		            this.$refs['formSearch'].resetFields();
		            this._getTemplateClassifyPaperList();
		        },
		        /**
		         * 删除
		         */
         		handleDelete(index, rowData) {
           			var id=rowData.id;
           			this.$confirm('此操作将永久删除该信息, 是否继续?', '提示', {
             			confirmButtonText: '确定',
             			cancelButtonText: '取消',
             			type: 'warning'
           			}).then(() => {
         				deletePaper(id).then(res => {
               				if (res.code === 200) {
                 				this.$message({type: 'success',message: '删除成功'});
                 				this._getTemplateClassifyPaperList();
               				}
            			 })
           			}).catch(() => {
             			this.$message({type: 'info',message: '已取消删除'});
           			});
         		},
		        /**
		         * 打开新增弹窗
		         */
		        handleAdd() {
		        	this.$router.push({path: 'add', query: {templateClassify: '是'}});
		        },
		        /**
		         * 打开编辑弹窗
		         */
		        handleEdit(index, rowData) {
		        	this.$router.push({name: 'edit', query: {id: rowData.id}})
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
        		 _getTemplateClassifyPaperList() {
           			this.isLoading = true
           			let config={
             			params: {
	               			title:this.formSearch.title,
	               			page: this.pageInfo.currentPage,
	               			limit: this.pageInfo.pageSize
             			}
           			}
           			getTemplateClassifyPaperList(config).then(res => {
	             		this.isLoading = false
	             		if (res.code === 200) {
			               	this.pageInfo.pageTotal = res.count
			               	this.tableData = res.data
	             		}
           			})
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
