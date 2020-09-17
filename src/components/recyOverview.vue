<template>
	<div>
		<div class="qu-wrap">
			<div class="qu-top">
				<a class="qu-black" @click="$router.back(-1)">返回</a>
			</div>
			<div class="qu-content">
		       	<!--回收概括-->
		        <div class="centerColumn">
		        	<div class="recovery-survey">
			        	<header>
							<p>
								{{ paperDataObj.title }}
								<span>回收量：{{ paperRecycle.recycled }}</span>
							</p>
						</header>
						<div class="surveyBox">
							<div class="survey-line survey">
								<ul>
									<li>
										<h4>回收量</h4>
										<p>{{ paperRecycle.recycled }}</p>
									</li>
									<li>
										<h4>浏览量</h4>
										<p>{{ paperRecycle.views }}</p>
									</li>
									<li>
										<h4>回收率</h4>
										<p>{{paperRecycle.views===0?0:((paperRecycle.recycled/paperRecycle.views)* 100).toFixed(2)}}%</p>
									</li>
									<li>
										<h4>平均完成时间</h4>
										<p>{{ paperRecycle.avgTime }}分</p>
									</li>
								</ul>
								<div id="myChart"></div>
							</div>
							<div class="survey-map survey">
								<h4>地域数量</h4>
								<div class="region-table">
                  				<!-- 表格---start -->
			                  	<el-table :data="tableData"   border stripe style="width: 100%">
				                    <el-table-column prop="areaId" label="名称"  align="center" sortable>
				                    </el-table-column>
				                    <el-table-column prop="answerCount" label="数量" align="center"  sortable>
				                    </el-table-column>
				                    <el-table-column prop="value" label="百分比" align="center"  sortable>
				                    </el-table-column>
			                  	</el-table>
                 		 		<el-pagination background
	                                 layout="total,sizes,prev, pager, next,jumper"
	                                 :current-page="pageInfo.currentPage"
	                                 :page-size="pageInfo.pageSize"
	                                 :total="pageInfo.pageTotal"
	                                 :page-sizes="[10,20,30]"
	                                 @size-change="handleSizeChange"
	                                 @current-change="handleCurrentChange">
                  				</el-pagination>
                  				<!-- 表格---end -->
								</div>
							</div>
						</div>
						<div class="surveyBox">
							<div class="survey-system">
								<div class="survey-pie survey">
									<h4>常用设备</h4>
									<div id="equipmentPie"></div>
									<!--<div class="equipmenType" >
										<p>
											<span class="equipmenType-img">
												<img src="../assets/my.png" />
											</span>
											<span class="equipmenType-name">桌面设备</span>
											<span class="equipmenType-num">100%</span>
										</p>
										<p>
											<span class="equipmenType-img">
												<img src="../assets/my.png" />
											</span>
											<span class="equipmenType-name">移动设备</span>
											<span class="equipmenType-num">10%</span>
										</p>
										<p>
											<span class="equipmenType-img">
												<img src="../assets/my.png" />
											</span>
											<span class="equipmenType-name">其他</span>
											<span class="equipmenType-num">0%</span>
										</p>
									</div>-->
								</div>
								<div class="survey-pie survey survey-systempie">
									<h4>操作系统</h4>
									<div id="systemPie"></div>
                  <!--<div class="equipmenType">
                                        <p>
                                            <span class="equipmenType-img">
                                                <img src="../assets/my.png" />
                                            </span>
                                            <span class="equipmenType-name">Android</span>
                                            <span class="equipmenType-num">100%</span>
                                        </p>
                                        <p>
                                            <span class="equipmenType-img">
                                                <img src="../assets/my.png" />
                                            </span>
                                            <span class="equipmenType-name">Windows</span>
                                            <span class="equipmenType-num">10%</span>
                                        </p>
                                        <p>
                                            <span class="equipmenType-img">
                                                <img src="../assets/my.png" />
                                            </span>
                                            <span class="equipmenType-name">Ios</span>
                                            <span class="equipmenType-num">100%</span>
                                        </p>
                                        <p>
                                            <span class="equipmenType-img">
                                                <img src="../assets/my.png" />
                                            </span>
                                            <span class="equipmenType-name">MacOS</span>
                                            <span class="equipmenType-num">10%</span>
                                        </p>
                                        <p>
                                            <span class="equipmenType-img">
                                                <img src="../assets/my.png" />
                                            </span>
                                            <span class="equipmenType-name">其他</span>
                                            <span class="equipmenType-num">0%</span>
                                        </p>
                                    </div>-->
								</div>
							</div>
							<div class="survey-pie survey channel">
								<h4>渠道来源</h4>
								<div id="channelPie"></div>
							<!--	<ul>
									<li>
										<span class="channelPie-name">www.com</span>
										<span class="channelPie-num">3</span>
										<span class="channelPie-per">40%</span>
									</li>
									<li>
										<span class="channelPie-name">www.com</span>
										<span class="channelPie-num">3</span>
										<span>40%</span>
									</li>
									<li>
										<span class="channelPie-name">www.com</span>
										<span class="channelPie-num">3</span>
										<span class="channelPie-per">40%</span>
									</li>
								</ul>-->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<loader v-show="isLoading"/>
	</div>
</template>

<script>
import Loader from './Loader'
import Datepicker from './Datepicker'
import {getPaperInfo, getPaperRecycleData,getTJRecycleListData,findEquipmentChartData,findSourceChartData,findSystemChartData,findAnswersByAreaCount} from '../api'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'
// 引入legend组件
import 'echarts/lib/component/legend'


export default {
	name: 'Data',

	components: {
		'loader': Loader,
		'date-picker': Datepicker
	},

	filters: {
	},

	data() {
		return {
			paperDataObj: {},
			questionList: [],
			isLoading: false,
			datePickerType: '',
			promptText: '',
			paperObj: {},
      paperRecycle:{
        recycled:0,
        views:0,
        avgTime:0
      }, //试卷回收数据
      multipleTable: [],     //存放选中值的数组
      tableData: [],//表单列表
      pageInfo: { //分页
        currentPage: 1,
        pageSize: 10,
        pageTotal: 0
      }
		}
	},

	created() {
    this._getPaperInfo() //获取试卷信息
    this.getPaperRecycle() //获取试卷回收信息
    this._findAnswersByAreaCount()
	},
	mounted(){
	    this.drawThis();
	    this._findEquipmentChartData();//回收概况的饼图综合
      this._findSourceChartData();//回收概况的饼图综合
      this._findSystemChartData();//回收概况的饼图综合
	  },
	methods: {
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

    getPaperRecycle() {
      let dataId = this.$route.query.id
      this.isLoading = true
      getPaperRecycleData(dataId).then(res => {
        if (res.code === 200) {
          if(res.data){
            this.paperRecycle = res.data
          }
          this.isLoading = false
        }
      })
    },

  //获取查询常用设备统计图表数据
    _findEquipmentChartData() {
      let dataId = this.$route.query.id
      this.isLoading = true
      findEquipmentChartData(dataId).then(res => {
        if (res.code === 200) {
          let equipmentPie = document.getElementById('equipmentPie');//常用设备ID
          this.pieEcharts(equipmentPie,res.data);//常用设备的饼图
          this.isLoading = false
        }
      })
    },

    // 获取查询来源统计图表数据
    _findSourceChartData() {
      let dataId = this.$route.query.id
      this.isLoading = true
      findSourceChartData(dataId).then(res => {
        if (res.code === 200) {
          let channelPie = document.getElementById('channelPie');//渠道来源ID
          this.pieEcharts(channelPie,res.data);//渠道来源的饼图
          this.isLoading = false
        }
      })
    },
    // 获取查询操作系统统计图表数据
    _findSystemChartData() {
      let dataId = this.$route.query.id
      this.isLoading = true
      findSystemChartData(dataId).then(res => {
        if (res.code === 200) {
          let systemPiePie = document.getElementById('systemPie');//操作系统ID
          this.pieEcharts(systemPiePie,res.data);//操作系统的饼图
          this.isLoading = false
        }
      })
    },

    //区域列表
    _findAnswersByAreaCount(){
      let config={
        params: {
          paperId:this.$route.query.id,
          page: this.pageInfo.currentPage,
          limit: this.pageInfo.pageSize
        }
      }
      this.isLoading = true
      findAnswersByAreaCount(config).then(res => {
        if (res.code === 200) {
          this.pageInfo.pageTotal = res.count
          this.tableData = res.data
          this.isLoading = false
        }
      })
    },

    //回收量折线图
    drawThis(){
      let xdata=[]
      let ydata=[]
      let dataId = this.$route.query.id
      this.isLoading = true
      getTJRecycleListData(dataId).then(res => {
        if (res.code === 200) {
          for (let v of res.data) {
            xdata.push(v.paperId)
            ydata.push(v.recycled)
            this.drawLine(xdata,ydata)
            this.isLoading = false

          }
        }
      })
    },
//		回收量
		drawLine(xdata,ydata){
	        let myChart = this.$echarts.init(document.getElementById('myChart'))
	        myChart.setOption({
	        	 title : {
                    x: 'left',
                    align: 'center'
                },
			    tooltip: {
			        trigger: 'axis'
			    },
			    legend: {
			        data:['回收量'],
			    },
			    grid: {
			        left: '3%',
			        right: '4%',
			        bottom: '3%',
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
			            name:'回收量',
			            type:'line',
			            data:ydata,
			            lineStyle:{//设置折线色颜色
             				color:'#39b54a'
    					},
    					itemStyle:{//设置折线折点的颜色
					            normal : {
					                color:'#39b54a'
					        }
    					}
			        }
			    ],
	        });
	    },
    /**
     * 分页大小切换
     */
    handleSizeChange(val) {
      this.pageInfo.pageSize = val;
    },
    /**
     * 分页切换
     */
    handleCurrentChange(val) {
      this.pageInfo.currentPage = val;
      this._findAnswersByAreaCount()

    },
    //统计图
		pieEcharts(element, data) {
     let xData=[];
      data.map((item,key) => {
        xData.push(item.name)
      });
			let myChart = echarts.init(element);
			let option = {
				  tooltip: {
			        trigger: 'item',
			        formatter: '{a} <br/>{b}: {c} ({d}%)'
			    },
        legend: {
          bottom: 1,
          data: xData
          },
			    series: [
			        {
			            name: '选择人数',
			            type: 'pie',
			            radius: ['50%', '70%'],
			            color:['#39b54a','#fcee21','#8cc63f','#fbb03b','#d9e021','#22b573'],
			            avoidLabelOverlap: false,
			            label: {
			                normal: {
			                    show: false,
			                    position: 'center'
			                }
			            },
			            labelLine: {
			                normal: {
			                    show: false
			                }
			            },
			            data:data,
			            itemStyle: {
						}
			        }
			    ]
			};
			myChart.setOption(option);
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
	#myChart{
		width: 100%;
		height: 400px;
	}
	#equipmentPie,#systemPie,#channelPie{
		width: 100%;
		height: 350px;
	}
	.qu-content-echarts{
		width: 500px;
		height: 350px;
		margin: 0 auto;
	}
	#quecharts{
		width: 100%;
		height: 100%;
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
</style>
