<template>
	<div class="tempate-content">
		<div class="title">
			<p>使用推荐的模板</p>
		</div>
		<div class="tempate-nax">
			<div class="left">
				<ul>
					<li v-for="(paper,index) in getTemplateClassifyPaperList" @click="handleTab(paper.id,index)" :class="{active:current==index}">
			            <a>
			              <span>{{paper.title}}</span>
			            </a>
			        </li>
				</ul>
				<el-pagination background 
		        	layout="total,sizes,prev, pager, next,jumper" 
		        	:current-page="pageInfo.currentPage" 
		        	:page-size="pageInfo.pageSize" 
		        	:total="pageInfo.pageTotal"
		        	:page-sizes="[10,20,50]"
		        	@size-change="handleSizeChange" 
		        	@current-change="handleCurrentChange">
		        </el-pagination>
			</div>
			<div class="right">
				<p class="useTitle">{{paperObj.paperTitle}}</p>
				<ul>
					<li v-for="(paper,index) in questionInfoList">
			            <a>
			              <span class="title">{{index+1}}.{{paper.title}}</span>
			            </a>
			        </li>
				</ul>
				<p class="useBtn">
					<button @click="handleEdit(paperObj.paperId)">使用该模板</button>
				</p>
			</div>
		</div>
		
	</div>
</template>
<script>
	import {getTemplateClassifyPaperList,userviewPaper,templatepaperId} from '../api'
	export default {
		name: 'Template',
		data() {
			return {
				firstCont:'',
				getTemplateClassifyPaperList: [],//模板内容
				pageInfo: { //分页
	                currentPage: 1,
	                pageSize: 10,
	                pageTotal: 0
	            },
	            paperObj:{
	            	paperId:'',
	            	paperTitle:''
	            },
	            questionInfoList:[],
	            current:0
			}
		},
		created() {
	      	this._getTemplateClassifyPaperList()
	    },
		methods: {
//			获取推荐模板
  			_getTemplateClassifyPaperList() {
		        this.isLoading = true
		        let config={
	     			params: {
	           			page:this.pageInfo.currentPage,
						limit:this.pageInfo.pageSize
	     			}
	   			}
		        getTemplateClassifyPaperList(config).then(res => {
		          	this.isLoading = false
		          	if (res.code === 200) {
			          	this.pageInfo.pageTotal = res.count
			            this.getTemplateClassifyPaperList = res.data
			            this.firstCont = res.data[0].id
			            if(this.firstCont!=''){
			            	this.handleTab()
			            }
		          	}
		        })
		    },
		    //单击题目
		    handleTab(rowData,index){
		    	this.current = this.current == index ? -1 : index;
		    	let data = {
					id: rowData||this.firstCont
				}
		    	userviewPaper(data).then(res => {
					if(res.code === 200) {
						this.paperObj.paperId = res.data.paper.id//问卷ID
						this.paperObj.paperTitle = res.data.paper.title//问卷标题
						this.questionInfoList = res.data.list
					}
				})
		    },
//		       使用模板详情
			handleEdit(rowData) {
				console.log(rowData)
				let data = {
					paperId:rowData
				}
				templatepaperId(data).then(res =>{
					console.log(res)
					if(res.code = 200){
						this.$router.push({name: 'edit', query: {id: res.data}})
					}else{
						
					}
					
				})
	      	},
		    /**
	         * 分页大小切换
	         */
	        handleSizeChange(val) {
	            this.pageInfo.pageSize = val;
	            this._getTemplateClassifyPaperList();
	        },
	        /**
	         * 分页切换
	         */
	        handleCurrentChange(val) {
	            this.pageInfo.currentPage = val;
	            this._getTemplateClassifyPaperList();
	        },
		}
	}
</script>
<style scoped lang="scss">
  @import '../style/Establish.scss';
  .tempate-content{
  	width: 70%;
    margin: 0 auto;
    padding: 2rem;
    background-color: #fff;
  }
  .title p{
  	color: #999999;
  	margin-left: 1rem;
  	padding-bottom: 2rem;
  }
  .tempate-nax{
  	height: 600px;
  	display: flex;
    justify-content: space-between;
    flex-direction: row;
  }
  .left,.right{
  	width: 50%;
  }
  .left ul{
  	margin: 0 10px;
  }
  .right ul{
  	margin-left: 30px;
    margin-right: 30px;
    list-style-type: none;
  }
  .left ul li{
  	padding: 0 5px;
  	color: #242424;
    display: block;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    cursor: pointer;
    border-bottom: 1px dashed #eaeaea;
  }
  .left ul li.active{
  	background-color: #fafafa;
  }
  .right{
  	padding: 2rem;
  	background-color: #fafafa;
  }
  .right ul{
  	height: 83%;
    overflow: hidden;
    overflow-y: auto;
  }
  .right ul li{
  	line-height: 32px;
  	color: #999;
  }
  .right .useTitle{
  	height: 5%;
  	text-align: center;
  	font-size: 18px;
  	margin-bottom: 20px;
  	color: #999;
  }
  .right .useBtn{
  	height: 10%;
  	text-align: center;
  }
  .right .useBtn button{
    height: 40px;
    line-height: 40px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    border-radius: 3px;
    padding: 0 35px;
    background-color: #7abd2e;
    border: 1px solid #7abd2e;
  }
  .el-pagination{
  	margin: 2rem 0;
  }
</style>