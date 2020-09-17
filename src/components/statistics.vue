<template>
	<div>
		<div class="qu-wrap">
			<div class="qu-top">
				<a class="qu-black" @click="$router.back(-1)">返回</a>
			</div>
			<div class="qu-content">
		        <!--统计图表-->
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
					                         <el-date-picker id="startTimeStart" v-model="paperObj.startTimeStr" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" placeholder="开始日期" :picker-options="startDatePicker" @change="searchInfo" ></el-date-picker>
							            </div>
							            <div>
							              <span>截止日期</span>
				                          	<el-date-picker id="endTimeStart" v-model="paperObj.endTimeStr" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" placeholder="结束日期" :picker-options="endDatePicker"  @change="searchInfo"></el-date-picker>
							            </div>
							        <!--</div>-->
									<div class="recovery-geo">
	                					<span>地理位置</span>
	                  					<el-cascader ref="myCascader"  v-model="paperObj.areaId" change-on-select  :props="props" @change="changeArea">
	                  					</el-cascader>
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
									共{{questionInfoList!=undefined?questionInfoList.length:0}}份数据
								</div>
							</div>
						</div>
						<div>
							<div class="qu-item qu-container" v-for="(item, index) in questionInfoList">
				        		<section>
									<h3>
										<span class="qu-num">{{index + 1}}、</span>
										<span class="qu-topic">{{ item.title }}</span>
										<span class="qu-type">{{ item.type | transformQursiotnType}}</span>
									</h3>
									<!--如果是单选或者多选可以选择这种-->
									<ul v-if="item.type == 'imgsel'">
										<li class="percentBar"  v-for="option in item.answerDetails">
											<div class="imgChose-list">
												<div class="imgChose-option">
													<p><img :src="option.questionAnswer.split('*')[0]" >{{option.questionAnswer.split('*')[1]}}</p>
												</div>
												<span class="percentBar-count">{{option.answerCount}}</span>
											</div>
										</li>
									</ul>
									<ul v-else>
										<li class="percentBar"  v-for="option in item.answerDetails">
											<div class="percentBar-bg">
												<span class="percentBar-name">{{option.questionAnswer}}</span>
												<span class="percentBar-count">{{option.answerCount}}</span>
											</div>
										</li>
									</ul>
								</section>
								<section class="ans-data" v-if="item.type==='textarea'||item.type==='cascade'">
									<span>该题无答题数据</span>
								</section>
								<section class="ans-data" v-else>
									<p class="echart"></p>
								</section>
				        	</div>
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
		<loader v-show="isLoading"/>
	</div>
</template>

<script>
import Loader from './Loader'
import Datepicker from './Datepicker'
import {getPaperInfo,getPaperRecycleData,findAnswerPercentList,getAreaById } from '../api'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'

export default {
	name: 'Data',

	components: {
		'loader': Loader,
		'date-picker': Datepicker
	},

	filters: {
    transformQursiotnType(type) {
      return type === 'radio' ? '(单选题)' : (type === 'checkbox' ? '(多选题)' : (type === 'textarea' ? '(文本题)' : (type === 'star' ? '(量表题)' :(type === 'cascade' ? '(联动题)' :(type === 'imgsel' ? '(图片选择)' :'(下拉题)')))))
    }
	},

	data() {
		return {
			paperDataObj: {},//获取试卷信息
			paperRecycle:{
		        recycled:0
		    }, //试卷回收数据
			questionInfoList: [],//获取试卷内容信息
			startDatePicker: this.beginDate(),//开始时间
    		endDatePicker: this.processDate(),//结束时间
			timeReminder:'',
			paperObj: {
		        areaId:'',
		        startTimeStr:'',//开始时间
		        endTimeStr:'',//结束时间
		        source:'',//渠道来源
		        remarks:'',//答题时长
		        value:'',//答题时长
            ipUrl:''
		    },
			isLoading: false,
			isShowPrompt: false,
			promptText: '',
			props: {
		        lazy: true,
		        lazyLoad (node, resolve) {
		          let pid=node.data?node.data.value:'CHINA'
		          getAreaById(pid).then(res => {
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
		    elementSelect:''
		}
	},

	created() {
		this._getPaperInfo()//获取试卷信息
		this.getPaperRecycle()//获取试卷回收信息
		this._findAnswerPercentList()//获取试卷内容信息
	},
	mounted(){
//	    this.channelPie();
	  },
	methods: {
		//获取试卷信息
		_getPaperInfo() {
		    let dataId = this.$route.query.id
		    this.isLoading = true
		    getPaperInfo(dataId).then(res => {
		        if (res.code ===200) {
		          this.paperDataObj = res.data
		          this.isLoading = false
		        }
		    })
	    },
	    //获取试卷回收信息
	    getPaperRecycle() {
	     	let dataId = this.$route.query.id
	      	this.isLoading = true
	      	getPaperRecycleData(dataId).then(res => {
		        if (res.code === 200) {
              if(res.data) {
                this.paperRecycle = res.data
              }
		          this.isLoading = false
		        }
	      	})
	    },
//	        开始时间与结束时间限制
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
//	        查询开始时间与结束时间
	    searchInfo() {
			if(this.paperObj.startTimeStr!=''&&this.paperObj.endTimeStr==''){
				let endinputelement=document.getElementById('endTimeStart')
 				endinputelement.focus()
 				this.timeReminder = '请选择截止时间'
			}else if(this.paperObj.startTimeStr==''&&this.paperObj.endTimeStr!=''){
				let startinputelement=document.getElementById('startTimeStart')
 				startinputelement.focus()
 				this.timeReminder = '请选择开始时间'
			}
			this._findAnswerPercentList()
		},
//	    查询地理信息
	    changeArea(){
	      	var index=this.paperObj.areaId.length
	      	if(index>0){
	        	this.paperObj.areaId=this.paperObj.areaId[index-1]
	      	}
	      	this._findAnswerPercentList()
	    },
//	    查询答题时间
	    durationTime(event){
	      	this.ProductActive = event; //获取option对应的value值
	      	if(this.ProductActive==1){
		        this.paperObj.remarks = '小于'
		        this.paperObj.value = 1
	      	}else if(this.ProductActive==2){
		        this.paperObj.remarks = '小于'
		        this.paperObj.value = 5
	     	}else if(this.ProductActive==3){
		        this.paperObj.remarks = '小于'
		        this.paperObj.value = 10
	      	}else if(this.ProductActive==4){
		        this.paperObj.remarks = '大于'
		        this.paperObj.value = 10
	      	}else{
		        this.paperObj.remarks = ''
		        this.paperObj.value = ''
	      	}
	      	this._findAnswerPercentList()
	    },
	    //渠道来源选择
      	changeInput(event){
	        this.paperObj.source = event; //获取option对应的value值
	        this._findAnswerPercentList()
      	},
      changeipUrl(event){
        this.paperObj.ipUrl = event; //获取option对应的value值
        this._findAnswerPercentList()
      },
//		统计图表
	    statisticsLine(element, xdata,ydata){
//	    	console.log(xdata+'**'+ydata)
	        let quechartss = this.$echarts.init(element)
	        quechartss.setOption({
	        	 title : {
                    x: 'left',
                    align: 'center'
                },
			    tooltip: {
			        trigger: 'axis'
			    },
			   legend: {
			        data:['选择人数']
			    },
			    grid: {
			        left: '2%',
			        right: '3%',
			        bottom: '2%',
			        containLabel: true
			    },
			    toolbox: {
			        feature: {
			            magicType: {type: ['line', 'bar']},//柱状图和西和折线图切换
			            restore: {},//刷新
			            saveAsImage: {},//将图表以折线图的形式展现
			        }
			    },
			    xAxis: {
			    	type: 'category',
       				data: xdata
			    },
			    yAxis: {
			    	name:"℃",
			    	type: 'value',
			    },
			    series: [
			   		{
			            name:'选择人数',
			            type:'line',
			            data:ydata,
			            lineStyle:{//设置折线色颜色
             				color:'#3f89ec'
    					},
    					itemStyle:{//设置折线折点的颜色
					            normal : {
					                color:'#3f89ec'
					        }
    					}
			        }
			    ]
	        })
	    },
		initEchart() {
			let charts = document.querySelectorAll('.echart');
			let multiSelectQuestions = this.questionInfoList,arrt=[]
			for(var i in multiSelectQuestions){
				let typeNum = ''
				if(multiSelectQuestions[i].type == 'textarea'||multiSelectQuestions[i].type == 'cascade'){
					typeNum = 1
				}else{
					typeNum = 2
				}
				if(typeNum == 2){
					arrt.push(multiSelectQuestions[i])
				}
			}
			arrt.map((item, index) => {
				let xdata = ''
				if(item.type == 'imgsel'){
					xdata = item.answerDetails.map((options, i) => {
						return options.questionAnswer.split('*')[1]
					})
				}else{
					xdata = item.answerDetails.map((options, i) => {
						return options.questionAnswer
					})
				}
				let ydata = item.answerDetails.map((options, i) => {
					return options.answerCount
				})
				this.statisticsLine(charts[index],xdata,ydata)	
			})
		},

		_findAnswerPercentList() {
			let config={
		        params: {
		          	paperId:this.$route.query.id,
		          	source:this.paperObj.source,//渠道来源
			        areaId:this.paperObj.areaId,//区域id
			        op:this.paperObj.remarks,//答题时长 小于 、大于 等
			        value:this.paperObj.value,//答题时长 分钟
			        startTimeStr:this.paperObj.startTimeStr,
			        endTimeStr:this.paperObj.endTimeStr,
              		ipUrl:this.paperObj.ipUrl
		        }
		   	}
	      	this.isLoading = true
	      	findAnswerPercentList(config).then(res => {
		        if (res.code === 200) {
		        	this.isLoading = false
		        	if(res.data!=null){
		        		this.questionInfoList = res.data
			        	this.$nextTick(() => {
							this.initEchart()
						})
		        	}else{
		        		this.questionInfoList = ''
		        	}
		        }
	      	})
		}
	},
	watch: {
	}
}

</script>

<style scoped lang="scss">
@import '../style/_Data.scss';
</style>
<style scoped>
	#myChart{
		width: 100%;
		height: 400px;
	}
	#equipmentPie,#systemPie,#channelPie{
		width: 100%;
		height: 300px;
	}
	.qu-content .centerColumn .statisticschart.statisticschart{
		width: 98%;
	}
	.qu-content .centerColumn .qu-item{
		flex-direction: column;
		padding: 1.5rem;
	}
	.qu-content .centerColumn .qu-item .ans-data{
		width: 50%;
		margin: 0 auto;
	}
	.qu-top{
		text-align: right;
		margin-right: 1.5rem;
	}
	a.qu-black{
		cursor: pointer;
		padding: 1rem 3.5rem;
	    background-color: #fff;
	    border: 1px solid #eee;
	}
	.el-alert--warning.is-light{
		width: 25%;
	}
</style>
