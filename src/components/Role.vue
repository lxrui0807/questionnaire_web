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
                <el-button type="primary" @click="handleAdd">新增</el-button>
            </el-form-item>
        </el-form>
        <!-- 查询区----end -->
        <!-- 表格---start -->
        <el-table :data="tableData" v-loading="listLoading"  border stripe style="width: 100%">
            <el-table-column align="center" type="index" :index="typeIndex" label="序　号" width="100px" ></el-table-column>
            <el-table-column prop="roleName" label="角色名" width="400" align="center" sortable>
            </el-table-column>
            <el-table-column prop="comments" label="备　注" align="center" width="400">
            </el-table-column>
             <el-table-column prop="createTime" label="创建时间" align="center" width="200" sortable>
            </el-table-column>
            <el-table-column label="操　作" fixed="right" min-width="100" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
                    <el-button size="mini" plain type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    <el-button size="mini" plain type="primary" @click="handleDetail(scope.$index, scope.row)">接口权限</el-button>
                </template>
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

        <!-- 编辑弹框---start -->
        <el-dialog  :title="formEditTitle" :visible.sync="dialogEdittVisible" width="500px" @close="closeDialog('formEdit')">
            <el-form :label-position="labelPosition" :label-width="labelWidth" :rules="rulesEdit" :disabled="formEditDisabled" :inline="true" ref="formEdit" :model="formEdit" class="demo-form-inline">
                 <el-form-item label="角色" prop="roleName">
                    <el-input v-model="formEdit.roleName" placeholder="姓名" ></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="comments">
				      <el-input type="textarea" autosize v-model="formEdit.comments" placeholder="备注"></el-input>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEdittVisible = false">取 消</el-button>
                <el-button v-if="!formEditDisabled" type="primary" @click="handleSave">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 编辑弹框---end -->
        
        <!-- 接口权限弹框---start -->
		<el-dialog title="角色权限管理" :visible.sync="interfaceVisible" center :append-to-body='true' width="50%" @close="closefaceDialog">
			<el-table :data="authData" border style="width: 100%; margin-top: 20px">
				<el-table-column align="center" type="index" :index="typeIndex" label="序号"></el-table-column>
				<el-table-column prop="parentName" label="模块">
				</el-table-column>
				<el-table-column prop="authorityName" label="接口名称">
				</el-table-column>
				<el-table-column prop="authority" label="权限标识">
				</el-table-column>
				<el-table-column prop="checked" label="授权">
					<template slot-scope="scope">
		        		<el-switch class="stateSwitch" v-model="scope.row.checked"  :active-value="1" :inactive-value="0" active-text="ON" inactive-text="OFF"  @change=authchange(scope.$index,scope.row) ></el-switch>
		            </template>
				</el-table-column>
			</el-table>
		    <el-pagination background 
		    	layout="total,sizes,prev, pager, next,jumper" 
		    	:current-page="authpageInfo.authcurrentPage" 
		    	:page-size="authpageInfo.authpageSize" 
		    	:total="authpageInfo.authpageTotal" 
		    	:page-sizes="[10, 20, 50]" 
		    	@size-change="authhandleSizeChange" 
		    	@current-change="authhandleCurrentChange">
		    </el-pagination>
		</el-dialog>
        <!-- 接口权限弹框---end -->
    </div>
</template>
		
	<script>
    import {roleManagement,addUser,updateUser,deleteUser,authoritiesPage,authState} from '../api'
    
		export default {
		   	name: 'survey',
		   	data() {
			    return {
			       	listLoading : false,//
			       	tableData: [ ],//角色表单列表
		            pageInfo: { //角色分页
		                currentPage: 1,
		                pageSize: 10,
		                pageTotal: 0
		            },
		            authData:[],//用户权限列表
		            authpageInfo: { //角色分页
		                authcurrentPage: 1,
		                authpageSize: 10,
		                authpageTotal: 0
		            },
		            formSearch: {keyword:''//表单查询
		            },
		            formEdit: { //表单编辑
		               },
		             rulesEdit:  {
		                name: [
		                    { required: true, message: "请输入姓名", trigger: "blur" },
		                    { min: 2, max: 4, message: "长度在 2 到 4 个字符", trigger: "blur" }
		                ],
		                type: [{ required: true, message: "请选择类别", trigger: "change" }],
		                gender: [{ required: true, message: "请选择性别", trigger: "change" }]
		            },
		            formEditTitle:'编辑',//新增，编辑和查看标题
		            formEditDisabled:false,//编辑弹窗是否可编辑
		            dialogEdittVisible: false,  //编辑弹框显示
		            interfaceVisible:false,  //接口编辑弹框显示
		            dialogType:'',//弹框类型：add,edit,show
		            labelPosition: 'right', //lable对齐方式
		            labelWidth: '80px', //lable宽度
		            formLabelWidth: '120px',
			   }
		  	},
		    created() {
		        this._roleManagement()
		    },
		   methods: {
		         //获取角色列表信息的方法
		         _roleManagement(){
		           this.isLoading = true
		           	let config={
			            params:{
			            	keyword:this.formSearch.keyword,
			            	page: this.pageInfo.currentPage,
		               		limit: this.pageInfo.pageSize
			            } 
		            }
//		           	console.log(config)
		           	roleManagement(config).then(res => {
		           		this.isLoading = false
			            if (res.code === 200) {
			             	this.pageInfo.pageTotal = res.count
			               	this.tableData = res.data
			            }
		           	})
		         },
		         //添加角色方法
		         save(){
		           addUser(this.formEdit).then(res => {
		             if (res.code === 200) {
		                this.dialogEdittVisible=false;
		                this._roleManagement();
		             }
		           })
		         },
		         //修改角色信息的方法
		         updateUser(){
		           updateUser(this.formEdit).then(res => {
		             if (res.code === 200) {
		               this.dialogEdittVisible=false;
		               this._roleManagement();
		             }
		           })
		         },
		         changCompany(val) {
		           console.log(val)
		         },
		   		//表格序号的获取
			   	typeIndex(index) {
			      	let vm = this; //处理分页数据的 index
			      	return (vm.pageInfo.currentPage - 1) * vm.pageInfo.pageSize + index + 1;
			    },
		   		/**
		         * 查询列表
		         */
		        onSearch(){
              		this._roleManagement()
		        },
//		       	 重置查询
		        onReset(){
		            this.$refs['formSearch'].resetFields();
		            this._roleManagement()
		        },
			    handleSave(){
		            if(this.dialogType=='add'){
		                this.save();
		            }
		            else if(this.dialogType=='edit'){
		                this.updateUser();
		            }
		            else{
		                this.$message({message: '操作异常',type: "error"});
		            }
		        },
		         /**
		         * 更新
		         */
		        update() {
		            this.$refs["formEdit"].validate(valid => {
		                console.log(this.formEdit);
		            });
		        },
		        /**
		         * 删除
		         */
		        handleDelete(index, rowData) {
		            var id=rowData.roleId;
		            this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
		                confirmButtonText: '确定',
		                cancelButtonText: '取消',
		                type: 'warning'
		            }).then(() => {
                  deleteUser(id).then(res => {
                    if (res.code === 200) {
                      this.$message({type: 'success',message: '删除成功'});
                      this._roleManagement();
                    }
                  })

		            }).catch(() => {
		                this.$message({type: 'info',message: '已取消删除'});
		            });
		
		        },
		        /**
		         * 打开新增编辑弹窗
		         */
		        handleAdd() {
		            this.dialogEdittVisible = true;
		            this.$nextTick(()=>{
		                this.dialogType='add';
		                this.formEditTitle='新增';
		                this.formEditDisabled=false;
		            });
		           
		            
		        },
		        /**
		         * 打开编辑编辑弹窗
		         */
		        handleEdit(index, rowData) {
		            this.dialogEdittVisible = true;//等dom渲染完，读取data中初始值，然后再复制，这样重置的是data中初始值
		            this.$nextTick(()=>{
		                this.dialogType='edit';
		                this.formEditTitle='编辑';
		                this.formEditDisabled=false;
		                this.formEdit= Object.assign({}, rowData);
		                this.formEdit.gender+='';//必须转换成字符串才能回显
		            });  
		        },
		        /**
		         * 打开接口权限
		         */
		        handleDetail(index,rowData){
		        	this.formEdit= Object.assign({}, rowData);
		            this.interfaceVisible = true;
		            this._authoritiesPage()
		            console.log(rowData+'**'+this.interfaceVisible)
		        },
//		               接口权限方法
		        _authoritiesPage(){
		           	let config={
			            params: {
			             	roleId:this.formEdit.roleId,
			              	page: this.authpageInfo.authcurrentPage,
			               	limit: this.authpageInfo.authpageSize
			            }
			        }
		           	console.log(config)
		           	this.isLoading = true
		           	authoritiesPage(config).then(res => {
		             	if (res.code === 200) {
			               console.info(res.data);
			               this.authpageInfo.authpageTotal = res.count
			               this.authData = res.data
			               this.isLoading = false
		             	}
		           	})
		         },
//		                修改用户授权状态
		        authchange(index,row){
		        	let data = {}
		        	if(row.checked==1){
		        		data = {
				   			roleId:this.formEdit.roleId,
				   			authId:row.authority
				   		}
		        	}else{
		        		data = {
				   			roleId:this.formEdit.roleId,
				   			authId:row.authority,
				   			_method:'DELETE'
				   		}
		        	}
			   		authState(data).then(res => {
				    	this.$message({message: res.msg,type: "success"});
			        }).catch((err) => {
		                this.$message({type: 'info',message: res.msg});
		            });
		        },
		        /**
		         * 关闭弹框，数据重置
		         */
		        closeDialog(formName){
		            this.$refs[formName].resetFields();
		        },
		        closefaceDialog(){
		        	this.interfaceVisible = false;
		        	console.log(this.interfaceVisible)
		        },
		        /**
		         * 角色分页大小切换
		         */
		        handleSizeChange(val) {
		            this.pageInfo.pageSize = val;
		            this.onSearch();
		        },
		        /**
		         * 角色分页切换
		         */
		        handleCurrentChange(val) {
		            this.pageInfo.currentPage = val;
		            this.onSearch();
		        },
		        /**
		         * 权限分页大小切换
		         */
		        authhandleSizeChange(val) {
		            this.authpageInfo.authpageSize = val;
		            this._authoritiesPage();
		        },
		        /**
		         * 权限分页切换
		         */
		        authhandleCurrentChange(val) {
		            this.authpageInfo.authcurrentPage = val;
		            this._authoritiesPage();
		        },
		   },
		   components: {}
		 }
		</script>
		
<style>
	.el-dialog__body .el-form--inline .el-form-item__content{
		width: 42%;
	}
.messageboard{
    // 设置输入框的宽度
    .el-form-item__content {
        width: 220px;
    }
}
</style>
