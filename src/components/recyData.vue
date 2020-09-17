<template>
	<div>
		<div class="qu-wrap">
			<div class="qu-top">
				<a class="qu-black" @click="$router.back(-1)">返回</a>
			</div>
			<div class="qu-content">
				<!--回收数据-->
				<div class="centerColumn">
					<div class="recovery-survey statisticschart">
						<header>
							<p>{{ paperDataObj.title }}
								<span>回收量：{{ paperRecycle.recycled }}</span>
							</p>
						</header>
						<div class="qu-item">
							<div class="option-head">
								<p class="title">筛选</p>
								<div class="option-body">
									<!--<div class="date-part">-->
										<div>
											<span>开始日期</span>
											<el-date-picker id="startTimeStart" v-model="paperObj.startTimeStr" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" placeholder="开始日期" :picker-options="startDatePicker" @change="searchInfo"></el-date-picker>
										</div>
										<div>
											<span>截止日期</span>
											<el-date-picker id="endTimeStart" v-model="paperObj.endTimeStr" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" placeholder="结束日期" :picker-options="endDatePicker" @change="searchInfo"></el-date-picker>
										</div>
									<!--</div>-->
									<div class="recovery-geo">
										<span>地理位置</span>
										<el-cascader ref="myCascader" v-model="paperObj.areaId" change-on-select :props="props" @change="changeArea">
										</el-cascader>
									</div>
									<div class="recovery-geo">
										<span>是否有效</span>
										<el-select placeholder='请选择' v-model="paperObj.isInvalid"  @change="changeInvalid($event)">
							              <el-option label='请选择' value=''>请选择</el-option>
							              <el-option label='有效' value='0'>有效</el-option>
							              <el-option label='无效' value='1'>无效</el-option>
							            </el-select>
									</div>
								</div>
								<el-alert :title="timeReminder" v-show="(paperObj.startTimeStr!=''&&paperObj.endTimeStr=='')||(paperObj.startTimeStr==''&&paperObj.endTimeStr!='')" type="warning" center :closable="false" show-icon></el-alert>
								<div class="option-body">
									<div class="answerTime">
										<span>答题时长</span>
										<el-select placeholder='请选择时长' v-model="elementSelect"  @change="durationTime($event)">
							              <el-option label='请选择' value=''>请选择</el-option>
							              <el-option label='1分钟以内' value='1'>1分钟以内</el-option>
							              <el-option label='5分钟以内' value='2'>5分钟以内</el-option>
							              <el-option label='10分钟以内' value='3'>10分钟以内</el-option>
							              <el-option label='10分钟以上' value='4'>10分钟以上</el-option>
							            </el-select>
									</div>
									<div class="recovery-geo">
										<span>渠道来源</span>
										<el-input v-model="paperObj.source" placeholder="请输入内容" @input="changeInput($event)"></el-input>
									</div>
									<div class="recovery-geo">
										<span>IP地址</span>
										<el-input v-model="paperObj.ipUrl" placeholder="请输入内容" @input="changeipUrl($event)"></el-input>
									</div>
								</div>
								<div class="option-footer">
									共{{testpage.length}}份数据
								</div>
							</div>
						</div>
					</div>
					<div class="question-head">
						<div class="operate">
							<button @click="iterator = exportData(); iterator.next()">导出</button>
						</div>
					</div>
					<div class="qu-item question-table">
						<el-table :data="testpage" border style="width: 100%">
						
							<!-- 要使当页显示分页后的对应数据，其下标应为(当前页-1)*每页数据数 到 当前页*每页数据数。使用slice方法进行取用  -->
							<!--    <el-table-column type="selection" label="选择" align="center" width="55"></el-table-column>-->
							<el-table-column prop="id" label="ID" align="center"></el-table-column>
						
							<el-table-column prop="startTime" label="开始答题时间" align="center"></el-table-column>
						
							<el-table-column prop="endTime" label="结束答题时间" align="center"></el-table-column>
						
							<el-table-column prop="equipment" label="设备" align="center"></el-table-column>
						
							<el-table-column prop="operatingSystem" label="操作系统" align="center"></el-table-column>
						
							<el-table-column prop="source" label="渠道来源" align="center"></el-table-column>
						
							<el-table-column prop="ipUrl" label="ip地址" align="center"></el-table-column>
						
							<el-table-column prop="remarks" label="区域" align="center"></el-table-column>
							<el-table-column prop="isInvalid" label="是否有效" align="center">
								<template slot-scope="scope">
									<span>{{(scope.row.isInvalid == 0?'有效':'无效')}}</span>
								</template>
							</el-table-column>
							<el-table-column label="操作" width="250" align="center">
								<template slot-scope="scope">
									<el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
									<el-button size="mini" plain type="primary" @click="handleSee(scope.$index, scope.row)">查看</el-button>
									<el-button size="mini" @click="handleInvalid(scope.$index, scope.row)">{{(scope.row.isInvalid == 0?'设为无效':'设为有效')}}</el-button>
								</template>
							</el-table-column>
						</el-table>
						<div class="yema">
						
							<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageInfo.currentPage" :page-sizes="[10,20,30]" :page-size="pageInfo.pageSize" :total="pageInfo.pageTotal" layout="total,jumper,prev, pager, next,sizes">
								</el-pagination>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="overlay" v-show="isShowPrompt">
			<div class="prompt-box">
				<header>
					<span>提示</span>
					<a href="javascript:;" @click="isShowPrompt = false">&times;</a>
				</header>
				<p>{{ promptText }}</p>
				<footer>
					<span @click="isShowPrompt = false; iterator && iterator.next()">确定</span>
					<span @click="isShowPrompt = false">取消</span>
				</footer>
			</div>
		</div>
		<loader v-show="isLoading" />
	</div>
</template>

<script>
	import Loader from './Loader'
	import Datepicker from './Datepicker'
	import { getPaperInfo, getPaperRecycleData, findRecycleTongJiData, exportAnswer, getAreaById,updateAnswerInvalid } from '../api'
	import 'echarts/lib/chart/pie'
	import 'echarts/lib/component/tooltip'
	import 'echarts/lib/component/toolbox'

	export default {
		name: 'Data',

		components: {
			'loader': Loader,
			'date-picker': Datepicker
		},

		data() {
			return {
				paperDataObj: {},
				isLoading: false,
				isShowPrompt: false,
				promptText: '',
				startDatePicker: this.beginDate(),//开始时间
    			endDatePicker: this.processDate(),//结束时间
				timeReminder:'',//提示选择时间
				paperObj: {
					areaId: '',
					startTimeStr: '', //开始时间
					endTimeStr: '', //结束时间
					source: '', //渠道来源
					isInvalid:'',//是否有效
					remarks: '', //答题时长
					value: '', //答题时长
					ipUrl: ''
				},
				paperRecycle: {
					recycled: 0
				}, //试卷回收数据
				testpage: [],
				pageInfo: { //分页
					currentPage: 1,
					pageSize: 10,
					pageTotal: 0
				},
				props: {
					lazy: true,
					lazyLoad(node, resolve) {
						let pid = node.data ? node.data.value : 'CHINA'
						getAreaById(pid).then(res => {
							if(res.code === 200) {
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
				elementSelect:''
			}
		},

		created() {
			this._getPaperInfo() //获取试卷信息
			this.getPaperRecycle() //获取试卷回收信息
			this._findRecycleTongJiData() //获取答案列表信息
		},
		methods: {
			* exportData() {
				yield this.showPrompt('确认要导出信息吗？')
				yield this._exportAnswer()
			},

			_getPaperInfo() {
				let dataId = this.$route.query.id
				this.isLoading = true
				getPaperInfo(dataId).then(res => {
					if(res.code === 200) {
						this.paperDataObj = res.data
						this.isLoading = false
					}
				})
			},

			getPaperRecycle() {
				let dataId = this.$route.query.id
				this.isLoading = true
				getPaperRecycleData(dataId).then(res => {
					if(res.code === 200) {
						if(res.data) {
							this.paperRecycle = res.data
						}
						this.isLoading = false
					}
				})
			},
//			开始时间与结束时间限制
			beginDate(){
				const self = this
				return {
				    disabledDate(time){
				     	if (self.paperObj.endTimeStr) {  //如果结束时间不为空，则小于结束时间
				        	return new Date(self.paperObj.endTimeStr).getTime() < time.getTime()
				      	} else {
				        // return time.getTime() > Date.now()//开始时间不选时，结束时间最大值小于等于当天
				      	}
				    }
			  	}
				
			},
			processDate() {
			  	const  self = this
			  	return {
				    disabledDate(time) {
				  		if (self.paperObj.startTimeStr) {  //如果开始时间不为空，则结束时间大于开始时间
			        		return new Date(self.paperObj.startTimeStr).getTime() > time.getTime()
				      	} else {
				        // return time.getTime() > Date.now()//开始时间不选时，结束时间最大值小于等于当天
				      	}
				    }
			  	}
			},
			searchInfo() {
				if(this.paperObj.startTimeStr!=''&&this.paperObj.endTimeStr==''){
					let endinputelement=document.getElementById('endTimeStart')
     				endinputelement.focus()
     				this.timeReminder = '请选择截止时间'
     				return false;
				}else if(this.paperObj.startTimeStr==''&&this.paperObj.endTimeStr!=''){
					let startinputelement=document.getElementById('startTimeStart')
     				startinputelement.focus()
     				this.timeReminder = '请选择开始时间'
     				return false;
				}
				this._findRecycleTongJiData()
			},

			changeArea() {
				var index = this.paperObj.areaId.length
				if(index > 0) {
					this.paperObj.areaId = this.paperObj.areaId[index - 1]
				}
				this._findRecycleTongJiData()
			},
			//回收信息列表（-----------------------------------------------改-------------------）
			_findRecycleTongJiData() {
				let data = {
					paperId: this.$route.query.id,
					source: this.paperObj.source, //渠道来源
					isInvalid:this.paperObj.isInvalid,//是否有效
					areaId: this.paperObj.areaId, //区域id
					remarks: this.paperObj.remarks, //答题时长 小于 、大于 等
					value: this.paperObj.value, //答题时长 分钟
					startTimeStr: this.paperObj.startTimeStr,
					endTimeStr: this.paperObj.endTimeStr,
					ipUrl: this.paperObj.ipUrl,
					page: this.pageInfo.currentPage,
					limit: this.pageInfo.pageSize
				}
				this.isLoading = true
				findRecycleTongJiData(data).then(res => {
					this.isLoading = false
					if(res.code === 200) {
						this.pageInfo.pageTotal = res.count
						this.testpage = res.data
					}
				})
			},
			/**
	         * 打开编辑
	         */
	        handleEdit(index, rowData) {
	        	this.$router.push({path: '/viewEditor', query: {id: rowData.id,isEdit:true}})
	        },
	        /**
	         * 打开查看
	         */
	        handleSee(index, rowData) {
	        	this.$router.push({path: '/viewEditor', query: {id: rowData.id}})
	        },
//	                是否有效
	        handleInvalid(index, rowData){
	        	let data = {
					id: rowData.id,
					isInvalid: rowData.isInvalid == 0?1:0, //渠道来源
				}
	        	updateAnswerInvalid(data).then(res => {
					if(res.code === 200) {
						this.$message({message: res.msg,type: "success"});
						this._findRecycleTongJiData()
					}
				})
	        },

			//回收信息列表导出
			_exportAnswer() {
				let dataId = this.$route.query.id
				exportAnswer(dataId)
			},

			//		回收数据的表格分页开始
			// 		 //分页    初始页currentPage、初始每页数据数pagesize和数据testpage
			handleSizeChange: function(size) {
				this.pagesize = size;
			},
			//分页切换
			handleCurrentChange: function(val) {
				this.pageInfo.currentPage = val;
				this._findRecycleTongJiData()
			},

			//	    答题时长选择
			durationTime(event) {
				this.ProductActive = event; //获取option对应的value值
				if(this.ProductActive == 1) {
					this.paperObj.remarks = '小于'
					this.paperObj.value = 1
				} else if(this.ProductActive == 2) {
					this.paperObj.remarks = '小于'
					this.paperObj.value = 5
				} else if(this.ProductActive == 3) {
					this.paperObj.remarks = '小于'
					this.paperObj.value = 10
				} else if(this.ProductActive == 4) {
					this.paperObj.remarks = '大于'
					this.paperObj.value = 10
				} else {
					this.paperObj.remarks = ''
					this.paperObj.value = ''
				}
				this._findRecycleTongJiData()
			},
			//	   	渠道来源选择
			changeInput(event) {
				this.paperObj.source = event; //获取option对应的value值
				this._findRecycleTongJiData()
			},

			changeipUrl(event) {
				this.paperObj.ipUrl = event; //获取option对应的value值
				this._findRecycleTongJiData()
			},
			changeInvalid(event){
				this.paperObj.isInvalid = event; //获取option对应的value值
				this._findRecycleTongJiData()
			},
			showPrompt(text) {
				this.promptText = text;
				this.isShowPrompt = true;
			},

		},
		watch: {

		}
	}
</script>

<style scoped lang="scss">
	@import '../style/_Data.scss';
</style>
<style scoped>
	.qu-content-echarts {
		width: 500px;
		height: 300px;
		margin: 0 auto;
	}
	
	.qu-content .centerColumn .qu-item.question-table {
		height: auto;
	}
	
	.qu-top {
		text-align: right;
		margin-right: 1.5rem;
	}
	
	a.qu-black {
		cursor: pointer;
		padding: 1rem 3.5rem;
		background-color: #fff;
		border: 1px solid #eee;
	}
	.el-alert--warning.is-light{
		width: 25%;
	}
	.el-button+.el-button {
	    margin-left: 0px;
	}
</style>
