<template>
	<div class="container messageboard">
        <!-- 查询区----start -->
        <el-form :label-position="labelPosition" :label-width="labelWidth" :inline="true" ref="formSearch" :model="formSearch" class="demo-form-inline">
            <el-select v-model="formSearch.searchKey"  placeholder="请选择查询类型" class="h-m-select">
              <el-option  v-for="item in options" :key="item.value" :label="item.label"  v-model="item.value">
              </el-option>
            </el-select>
            <el-form-item prop="searchValue">
                 <el-input v-model="formSearch.searchValue" placeholder="请输入输入关键字"></el-input>
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
        	<!--<el-table-column prop="city" label="序号" align="center" width="200">-->
        	<el-table-column align="center" type="index" :index="typeIndex" label="序　号" width="100px" ></el-table-column>
        	<el-table-column prop="nickName" label="账　号" width="200" align="center" sortable>
            </el-table-column>
            <el-table-column prop="username" label="用户名" width="200" align="center" sortable>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" align="center" width="200">
            </el-table-column>
            <el-table-column prop="sex" label="性　别" align="center" width="150">
                 <template slot-scope="scope">
                    <span>{{ scope.row.sex=='男'?'男':'女' }}</span>
                </template>
            </el-table-column>
             <el-table-column prop="roles" label="角　色" align="center" width="180">
             	<template slot-scope="scope">
                    <span v-for="items in scope.row.roles" class="userroleName">{{ items.roleName}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="180" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状　态" align="center" width="180">
            	<template slot-scope="scope">
            		<el-switch class="stateSwitch" v-model="scope.row.state"  :active-value="0" :inactive-value="1" active-text="正常" inactive-text="冻结"  @change=change(scope.$index,scope.row) ></el-switch>
                </template>
            </el-table-column>
            
            <el-table-column label="操　作" fixed="right" min-width="200"　align="center">
                <template slot-scope="scope">
                    <el-button size="mini" plain type="primary" @click="handleDetail(scope.$index, scope.row)">详情</el-button>
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
        	:page-sizes="[10, 20, 50]" 
        	@size-change="handleSizeChange" 
        	@current-change="handleCurrentChange">
        </el-pagination>
        <!-- 表格---end -->

        <!-- 编辑弹框---start -->
        <el-dialog  :title="formEditTitle" :visible.sync="dialogEdittVisible" width="500px" @close="closeDialog('formEdit')">
            <el-form :label-position="labelPosition" :label-width="labelWidth" :rules="rulesEdit" :disabled="formEditDisabled" :inline="true" ref="formEdit" :model="formEdit" class="demo-form-inline">
                <el-form-item label="归属部门" prop="officeId"  >
                  <el-cascader ref="myCascader"  v-model="formEdit.officeId" change-on-select  :props="props" :placeholder="vpcPlaceholder">
                  </el-cascader>
                  <!--<el-cascader  v-model="selectedRegion" change-on-select  :options="officelist" :placeholder="vpcPlaceholder" class="caseder">
                  </el-cascader>-->
                </el-form-item>
                <el-form-item label="账号" prop="nickName">
                    <el-input v-model="formEdit.nickName" placeholder="请输入账号" ></el-input>
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formEdit.username" placeholder="请输入用户名" ></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="formEdit.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                 <el-form-item label="性别" prop="sex">
                    <el-select v-model="formEdit.sex" placeholder="性别">
                        <el-option label="男" value="男"></el-option>
                        <el-option label="女" value="女"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="角色：" prop="roleIds">
                	<el-select v-model="formEdit.roleIds" multiple filterable remote reserve-keyword 
					  placeholder="请选择角色">
					   <el-option v-for="item in roleListData"
					     :key="item.roleId"
					     :label="item.roleName"
					     :value="item.roleId">
					   </el-option>
					</el-select>
				</el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEdittVisible = false">取 消</el-button>
                <el-button v-if="!formEditDisabled" type="primary" @click="handleSave">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 编辑弹框---end -->

    </div>
</template>
		
	<script>
		import {userManagement,userckState,userDelete,officeSel,adduser,rolelist,getOffice,updateUserInfo} from '../api'
		
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
		                searchKey: '',
		                searchValue:'',
		            },
		            formEdit: { //表单编辑
                    	userId:null,
		                username: '',
		                nickName:'',
		                phone:'',
		                officeId:'',
		                sex:null,
                    	roleIds:''
		            },
		             rulesEdit:  {
		                username: [
		                    { required: true, message: "请输入用户名", trigger: "blur" },
		                    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
		                ],
		                nickName: [
		                    { required: true, message: "请输入账号", trigger: "blur" },
		                    { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
		                ],
		                phone:[{ required: true, message: "请输入手机号", trigger: "blur" }]
		                ,
		                officeId: [{ required: true, message: "请选择归属部门", trigger: "change" }],
                   		//selectedRegion: [{ required: true, message: "请选择归属部门", trigger: "change" }],
		                sex: [{ required: true, message: "请选择性别", trigger: "change" }],
                    	roleIds: [{ required: true, message: "请选择角色", trigger: "blur" }]
		            },
		            formEditTitle:'编辑',//新增，编辑和查看标题
		            formEditDisabled:false,//编辑弹窗是否可编辑
		            dialogEdittVisible: false,  //编辑弹框显示
		            dialogType:'',//弹框类型：add,edit,show
		            //表单列表
		            tableData: [],
		            labelPosition: 'right', //lable对齐方式
		            labelWidth: '80px', //lable宽度
		            formLabelWidth: '120px',
		            multipleSelection: [],
                options: [{
                  value: 'username',
                  label: '用户名'
                }, {
                  value: 'nick_name',
                  label: '账号'
                }, {
                  value: 'sex',
                  label: '性别'
                }, {
                  value: 'phone',
                  label: '手机号'
                }],
               officelist:[], //部门级联选择
               officePid:'',
               props: {
                   lazy: true,
                   lazyLoad (node, resolve) {
                     	let data={
                        	pid:node.data?node.data.value:null
                      	}
                      	officeSel(data).then(res => {
	                        if (res.code === 200) {
	                          const nodes = res.data
	                            .map(item => ({
	                              value: item.value,
	                              label: item.label,
	                              leaf: item.haveChildren
	                            }));
	                           resolve(res.data);
	                        }
                      	})
                   }
                },
               roleListData:[],
               selectedRegion: [],
               vpcPlaceholder:'请选择'
			   }
		  	},
		  	watch: {
//			    selectedRegion(nv) {
//			    　		this.loadRegionChild(nv)
//			    },
			},
		  	created() {
		      	this._userManagement()
            	this._rolelist()
            	this.officeID()
		    },
		   	methods: {
//		   		findRegionOption(regionOptions, regionArr) {
//		   			console.log(regionOptions)
//				    console.log(regionArr)
//				      if (_.isEmpty(regionArr) || _.isEmpty(regionOptions)) {
//				        return null
//				      }
//				
//				    let regionId = _.first(regionArr)
//			    	let regionOption = _.find(regionOptions, regionOption => {
//				        return regionOption.value === regionId
//				    })
//				    if (!regionOption) {
//				        return null
//				    }
//				    let tailRegionArr = _.tail(regionArr)
//				    if (_.isEmpty(tailRegionArr)) {
//				        return regionOption
//				    }
//				    console.log(tailRegionArr)
//				    console.log(regionOption)
//				    return this.findRegionOption(regionOption.children, tailRegionArr)
//				},
//				loadRegionChild(regionIdArr) {
//				      let regionOptions = this.officelist
//				      let regionOptionInUI = this.findRegionOption(regionOptions, regionIdArr)
//				      console.log(regionOptionInUI)
//				      if (!regionOptionInUI) {
//				        return null
//				      }
//				
//				      let regionKey = _.last(regionIdArr)
//				      if (!regionKey) {
//				        return null
//				      }
//				    let data={
//	            		pid:regionKey
//	            	}
//					officeSel(data).then(res => {
//	            		if (res.code === 200) {
//	            			regionOptionInUI.children = res.data
//	            		}
//	            	})
//				},
//		   		获取用户表格的方法
		          _userManagement() {
		            let config={
			            params:{
			            	searchKey:this.formSearch.searchKey,
			            	searchValue:this.formSearch.searchValue,
			            	page: this.pageInfo.currentPage,
		               		limit: this.pageInfo.pageSize
			            } 
		            }
		            this.isLoading = true
		            userManagement(config).then(res => {
		            	this.isLoading = false
		              	if (res.code === 200) {
			              	this.pageInfo.pageTotal = res.count
			                this.tableData = res.data
		              	}
		            })
		          },
		          //获取所有角色
		          _rolelist(){
		            this.isLoading = true
		            rolelist().then(res => {
		            	this.isLoading = false
		              	if (res.code === 200) {
		                	this.roleListData = res.rolelist
		              	}
		            })
		          },

//		   		用户状态的判断
			   	change(index,row){
			   		let data = {
			   			userId:row.userId,
			   			state:row.state==1?1 : 0
			   		}
	            userckState(data).then(res => {
				    	this.$message({message: res.msg,type: "success"});
			        }).catch((err) => {
		                this.$message({type: 'info',message: res.msg});
		            });
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
               		this._userManagement()
		        },
//		       	 重置查询
		        onReset(){
		            this.$refs['formSearch'].resetFields();
		            this._userManagement()
		        },
			    handleSave(){
		            if(this.dialogType=='add'){
		                this.save();
		            }
		            else if(this.dialogType=='edit'){
		                this.update();
		            }
		            else{
		                this.$message({message: '操作异常',type: "error"});
		            }
		        },
		        //新增用户
		        save() {
		            this.$refs["formEdit"].validate(valid => {
		              	var index=this.formEdit.officeId.length
		              	if(index>0){
		                	this.formEdit.officeId=this.formEdit.officeId[index-1]
		              	}
			            this.formEdit.roleIds=this.formEdit.roleIds.toString()
			            this.isLoading = true
			            console.log(this.formEdit)
		              	adduser(this.formEdit).then(res => {
			                if (res.code === 200) {
				                this.isLoading = false
				                this._userManagement()//重新加载页面信息
			                    this.dialogEdittVisible = false//关闭弹框
			                  	this.$message({type: 'success',message: res.msg});
			                }else{
			                	this.$message({type: 'info',message: res.msg});
			                }
		              	})
		
		            });
		        },

		         /**
		         * 编辑用户
		         */
		        update() {
		            this.$refs["formEdit"].validate(valid => {
		                var index=this.selectedRegion.length
		                if(index>0){
		                    this.formEdit.officeId=this.selectedRegion[index-1]
		                }else{
		                	this.formEdit.officeId=this.selectedRegion
		                }
		                this.formEdit.roleIds=this.formEdit.roleIds.toString()
		                this.isLoading = true
		                console.log(this.formEdit)
		                updateUserInfo(this.formEdit).then(res => {
		                    if (res.code === 200) {
		                      this.isLoading = false;
		                      this._userManagement()//重新加载页面信息
		                      this.dialogEdittVisible = false//关闭弹框
		                      this.$message({type: 'success',message: res.msg});
		                    }else{
		                    	this.$message({type: 'info',message: res.msg});
		                    }
	                  	})
		            });
		        },
		        /**
		         * 删除
		         */
		        handleDelete(index, rowData) {
		            var data=rowData.userId;
		            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
		                confirmButtonText: '确定',
		                cancelButtonText: '取消',
		                type: 'warning'
		            }).then(() => {
		            	userDelete(data).then(res => {
					    	this.$message({message: res.msg,type: "success"});
					    	this._userManagement()
				        }).catch((err) => {
			                this.$message({type: 'info',message: res.msg});
			            });
		                
		            }).catch(() => {
		                this.$message({type: 'info',message: '已取消删除'});
		            });
		        },
		        /**
		         * 打开编辑弹窗
		         */
		        handleAdd() {
		            this.dialogEdittVisible = true;
		            this.$nextTick(()=>{
		                this.dialogType='add';
		                this.formEditTitle='新增';
		                this.formEditDisabled=false;
		                this.vpcPlaceholder = '请选择'
		            });
		           
		            
		        },

		        
		        /**
		         * 打开编辑弹窗
		         */
		        handleEdit(index, rowData) {
	              	this.dialogEdittVisible = true;//等dom渲染完，读取data中初始值，然后再复制，这样重置的是data中初始值
	              	this.$nextTick(()=> {
		                this.dialogType = 'edit';
		                this.formEditTitle = '编辑';
		                this.formEditDisabled = false;
		                this.editdata(rowData)
	              	})
		        },
		        /**
		         * 打开详情页
		         */
		        handleDetail(index,rowData){
		            this.dialogEdittVisible = true;
		            this.$nextTick(()=>{
		                this.dialogType='show';
		                this.formEditTitle='详情';
		                this.formEditDisabled=true;
                    	this.editdata(rowData);
		                //this.formEdit= Object.assign({}, rowData) ;
		            });
		           
		        },
		        editdata(rowData){
		            this.formEdit.nickName=rowData.nickName
		            this.formEdit.phone=rowData.phone
		            this.formEdit.sex=rowData.sex
		            this.formEdit.username=rowData.username
		            this.formEdit.userId=rowData.userId
		            this.formEdit.roleIds = rowData.roles.map(function (item, index) {
		              return item.roleId;
		            })
		            getOffice(rowData.officeId).then(res => {
		                if (res.code === 200) {
		                	if(res.office!=null){
		                		let str = [],tishi = []
		                		if(res.office.parentIds.length>0){
			                    	var parentoffIds = res.office.parentIds.split(',')
			                    	//先添加第一步的label
			                    	for(var i in this.officelist){
			                    		if(parentoffIds[0] == this.officelist[i].value){
			                    			tishi.push(this.officelist[i].label+'/')
			                    		}
			                    	}
			                    	for(var i in parentoffIds){
			                    		str.push(parentoffIds[i])
			                    	}
			                    	str.push(rowData.officeId)
			                       	this.selectedRegion = str
			                       	for(var i = 0;i<str.length;i++){
			                       		let data={
						            		pid:str[i]
						            	}
			                       		officeSel(data).then(res => {
						            		if (res.code === 200) {
						            			for(var h in str){
							            			for(var j = 0;j<res.data.length;j++){
							            				if(str[h] == res.data[j].value){
							            					tishi.push(res.data[j].label+'/')
							            				}
							            			}
						            			}
						            			let tishi1 = tishi.join('')
						            			this.vpcPlaceholder = tishi1.substring(0,tishi1.length-1)
						            		}
						            	})
			                       	}
			                       	this.formEdit.officeId=this.selectedRegion
			                    }else{
			                       str.push(rowData.officeId)
			                       this.selectedRegion = str
			                       this.formEdit.officeId=this.selectedRegion
			                    }
		                	}else{
		                		this.selectedRegion = []
		                		this.formEdit.officeId=this.selectedRegion
		                		this.vpcPlaceholder = '请选择'
		                	}
		                }
		            });
		            this.formEdit.gender+='';
		          },
		          officeID(){
		          	let data={
	            		pid:null
	            	}
	            	officeSel(data).then(res => {
	            		console.log(res)
	            		if (res.code === 200) {
	            			for(var i in res.data){
	            				let officelistCont = {}
	            				officelistCont.value = res.data[i].value
		            			officelistCont.label = res.data[i].label
		            			officelistCont.haveChildren = res.data[i].haveChildren
		            			officelistCont.children = []
		            			this.officelist.push(officelistCont)
	            			}
	            			
	            		}
	            		console.log(this.officelist)
	            	})
		          },
		        /**
		         * 关闭弹框，数据重置
		         */
		        closeDialog(formName){
		            this.$refs[formName].resetFields();
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
	.el-dialog__body {
		padding: 30px 45px;
	}
	.el-dialog__body .el-form--inline .el-form-item{
		display: block;
	}
	.userroleName{
		height: 18px;
	    line-height: 18px;
	    border: 1px solid #ccc;
	    background-color: #fff;
	    color: #666;
	    margin: 0 3px;
	    padding: 2px;
	}
	.stateSwitch .el-switch__label {
	  position: absolute;
	  display: none;
	  color: #fff;
	}
	.stateSwitch .el-switch__label span{
		font-size: 12px;
	}
	/*打开时文字位置设置*/
	.stateSwitch .el-switch__label--right {
	  z-index: 1;
	  right: -3px;
	}
	/*关闭时文字位置设置*/
	.stateSwitch .el-switch__label--left {
	  z-index: 1;
	  left: 19px;
	}
	/*显示文字*/
	.stateSwitch .el-switch__label.is-active {
	  display: block;
	}
	.stateSwitch.el-switch .el-switch__core,
	.el-switch .el-switch__label {
	  	width: 50px !important;
	    text-align: left;
	}
	.messageboard{
	    // 设置输入框的宽度
	    .el-form-item__content {
	        width: 220px;
	    }
	}
	.el-input__inner::-webkit-input-placeholder{ color: #606266; }
	.el-input__inner:-moz-placeholder{ color: #606266; }
	.el-input__inner::-moz-placeholder{ color: #606266; }
	.el-input__inner:-ms-input-placeholder{ color: #606266; }
</style>
