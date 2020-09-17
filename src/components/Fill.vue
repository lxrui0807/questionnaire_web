<template>
	<div class="container">
		<loader v-show="isLoading"/>
		<div class="qu-wrap">
			<header>
				<p class="paperTitle">{{ paperObj.title }}</p>
				<p class="paperSubtitle">{{ paperObj.subtitle }}</p>
			</header>
			<div class="qu-content">
				<section v-for="(item, index) in questionList"  class="qu-item" :id="'logicalChoose'+index" v-show="showArray[index]">
					<h3>
						<span class="qu-num">{{`Q${index + 1}`}}</span>
						<span class="qu-topic">{{ item.title }}</span>
						<span class="qu-type">{{ item.type | transformQursiotnType}}</span>
						<span v-if="item.remarks == '是'" style="color: red;">*</span>
					</h3>
					<!--多行文本-->
					<textarea rows="8"
						      	cols="80"
					          v-if="item.type === 'textarea'"
										v-model="answerList[index].questionAnswer [0]"
					>
					</textarea>
					<!--下拉题-->
					<select v-else-if="item.type === 'select'" class="options-list" v-model="answerList[index].questionAnswer [0]"  @input="blurEvent($event,item)">
						<option value="">请选择</option>
						<option :value="options"  v-for="(options, optIndex) in item.optionArray">{{options}}</option>
					</select>
					<!--量表题-->
					<p v-else-if="item.type === 'star'">
						<ul class="options-list  gaugeTopic">
							<li  v-for="(options, optIndex) in item.optionArray">
								<label>
									<input type="radio" :value="options" :name="index + 1" v-model="answerList[index].questionAnswer [0]" >
									<span>{{ options }}</span>
								</label>
							</li>
						</ul>
						<ul class="options-list gaugeTopic scaleProblem" >
							<li>
								<span class="setUpWidth">
									非常不{{item.starType}}
								</span>
							</li>
							<li>
								<span class="setUpWidth">
									非常{{item.starType}}
								</span>
							</li>
						</ul>
					</p>
					<!--图片选择-->
					<ul v-else-if="item.type === 'imgsel'" class="options-list picExhibition" >
						<li v-for="(optioness, optIndex) in item.optionArray">
							<p class="picImg">
								<img :src="optioness.imgurl" />
							</p>
							<p class="picCont">
								<input type="radio" :value="optioness.value" :name="index + 1"   v-model="answerList[index].questionAnswer [0]">
								<span class="optionText setUpWidth">
									{{ optioness.texts || '请单击此处编辑选项内容' }}
								</span>
							</p>
						</li>
					</ul>
					<!--联动题-->
					<el-cascader v-else-if="item.type === 'cascade'" change-on-select :options="item.jsonArray" v-model="answerList[index].questionAnswer [0]"  >
					</el-cascader>
					<!--单选或者多选-->
					<ul v-else class="options-list">
						<li  v-for="(options, optIndex) in item.optionArray">
							<label>
								<input v-if="item.type === 'radio'"
											type="radio"
											:value="options"
									    :name="index + 1"
									    @input="blurEvent($event,item)"
											v-model="answerList[index].questionAnswer [0]"
								>
								<input v-else-if="item.type === 'checkbox'"
											type="checkbox"
											:value="options"
									    :name="index + 1"
											v-model="answerList[index].questionAnswer "
								>
								<span>{{ options }}</span>
							</label>
						</li>
					</ul>
				</section>
			</div>
			<footer>
				<span class="btn" @click="iterator = submit(); iterator.next()">提交问卷</span>
			</footer>
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
	</div>
</template>
<script>
import Loader from "./Loader";
import {commitPaper,countView, } from '../api'

export default {
	name: 'Fill',

	components: {
		'loader': Loader
	},

	filters: {
		transformQursiotnType(type) {
			return type === 'radio' ? '(单选题)' : (type === 'checkbox' ? '(多选题)' : (type === 'textarea' ? '(文本题)' : (type === 'star' ? '(量表题)' :(type === 'cascade' ? '(联动题)' :(type === 'imgsel' ? '(图片选择)' :'(下拉题)')))))
		}
	},

	data() {
		return {
			paperObj: {},
			questionList: [],
			answerList: [],
			promptText: '',
			isShowPrompt: false,
			isLoading: false,
			startTime:'',//时间
			equipments:'',//设备
			operatingSystem:'',//操作系统
			coordinateses:'',//定位
			source:'',//渠道来源
			logicalListCont:[],//问题有逻辑的选项
		    manylogicalMap:[],
		    showArray:[]
		}
	},

	created() {
		//获取客户端ip 
		const ip = localStorage.getItem('Ip')
	 	//在控制台打印客户端ip 
	 	this.ipUrl = ip
		this.equipment();
		this.isView()
	},
	methods: {
//		查看问卷
		isView(){
			let data = {
				params:{
					paperId : this.$route.query.id,//试卷ID 
					ipUrl : this.ipUrl//选中的问题id
				}
			}
			console.log(data)
			countView(data).then(res => {
				console.log(res)
				if (res.code === 200) {
					this.paperObj = res.data.paper
					this.questionList = res.data.list
					this.logicalListCont = res.data.logicalList
		            this.manylogicalMap = res.data.manylogicalMap
		            this.initAnswerList()
		            for(var i in res.data.list){
						let b = []
						if(res.data.list[i].type == 'imgsel'){
							for(var j in res.data.list[i].optionArray){
								let c = []
								c.imgurl=res.data.list[i].optionArray[j].split('*')[0]
								c.texts=res.data.list[i].optionArray[j].split('*')[1]
								c.value=res.data.list[i].optionArray[j]
								b.push(c)
							}
							res.data.list[i].optionArray = b
						}
					}
				}else{
					window.alert(res.msg);
//					setTimeout(() => {
//						window.location.href = 'about:blank'
//					}, 5000);
				}
			})
		},
		equipment(){
			this.formatDate();//获取时间
			this.IsPC();//设备
			this.iosOrantran();//操作系统
			this.getSource();//渠道来源
		},
//		获取时间
		formatDate() {
            let date = new Date();
            let y = date.getFullYear();
            let MM = date.getMonth() + 1;
            MM = MM < 10 ? ('0' + MM) : MM;
            let d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            let h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            let m = date.getMinutes();
            m = m < 10 ? ('0' + m) : m;
            let s = date.getSeconds();
            s = s < 10 ? ('0' + s) : s;
           	this.startTime = y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
           	console.log(typeof(this.startTime))
        },
//		pc端还是移动端
		IsPC() {
	        var userAgentInfo = navigator.userAgent;
	        var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone",];//手机端
	        var iPads = ["iPad", "iPod"];//平板端
	        var flag = 0;
	        for (var v = 0; v < Agents.length; v++) {
	            if (userAgentInfo.indexOf(Agents[v]) > 0) {
	                flag = 1;
	                break;
	            }
	            if (userAgentInfo.indexOf(iPads[v]) > 0) {
	                flag = 2;
	                break;
	            }
	        }
	        this.equipments = flag === 0 ? '桌面设备' : (flag === 1 ? '手机端' : '其他')
	        
	    },
//	        用户移动端使用的系统平台
	    iosOrantran(){
	    	var u = navigator.userAgent;
		    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//Android
		        this.operatingSystem = 'Android'
		    } else if (u.indexOf('iPhone') > -1 || u.indexOf('iPad') > -1 || u.indexOf('iPod') > -1) { //iOS
		       this.operatingSystem = 'Ios'
		    } else if (u.indexOf('Windows') > -1) {//Windows
		        this.operatingSystem = 'Windows'
		    } else if (u.indexOf('MacOS') > -1) {//MacOS
		        this.operatingSystem = 'MacOS'
		    } else {
		    	this.operatingSystem = '其他'
		    }
	    },
//	    渠道来源
	    getSource(){
	    	if(this.$route.query.source!=undefined){
	    		this.source = 'website'
	    	}else{
	    		this.source = 'QRcode'
	    	}
	    },
		showPrompt(text) {
			this.promptText = text;
			this.isShowPrompt = true;
		},

		validateAnswer() {
			let noAnswerList = this.answerList.filter((item,index) => {
        if(this.showArray[index]){ //不显示答案不验证
          //this.answerList.splice(index, 1);
          if (item.remarks !== '否' && !item.questionAnswer.length &&item.type !== 'textarea'&&item.type !== 'select') {
            return item
          }
        }

			})
			return !!noAnswerList.length
		},

		initAnswerList() {
			this.questionList.map((item, index) => {
				this.$set(this.answerList, index, {
					remarks:item.remarks,
					type:item.type,
					questionId: item.id,
					questionAnswer : []
				})
        		this.$set(this.showArray, index, true)
			})

      		//逻辑收缩代码
	      	if(this.logicalListCont.length>0){
		        this.logicalListCont.forEach((item, index) => {
		          let startindex = this.questionList.findIndex(quitem => quitem.id == item.questionId);
		          let skipindex = this.questionList.findIndex(quitem => quitem.id == item.skipQuestionId);
		          for (let j = startindex + 1; j < skipindex; j++) {
		            if(this.showArray[j]==true){
		              this.showArray[j]=false
		            }
		          }
		        })
	      	}
	      	if(Object.keys(this.manylogicalMap).length>0){
		        for(var key in this.manylogicalMap) {
		          let manylist=this.manylogicalMap[key];
		          for(var i in manylist) {
		            let skipobj = manylist[i]
		            let skipId = skipobj.skipQuestionId
		            let index = this.questionList.findIndex(item => item.id == skipId); // 跳转问题 获取在数组中的位置(index)；
		            let showMaxindex = 0;
		            let resulist = this.manylogicalMap[skipId]
		            console.info(JSON.stringify(resulist))
		            resulist.forEach((item, iindex) => {
		              let otherindex = this.questionList.findIndex(qitem => qitem.id == item.questionId);
		              if (otherindex > showMaxindex) {
		                showMaxindex = otherindex;
		              }
		            })
		            for (let j = showMaxindex + 1; j < index; j++) {
		              if(this.showArray[j]==true){
		                this.showArray[j]=false
		              }
		            }
		          }
		        }
	      	}
		},

		*commitSuccess() {
			yield this.showPrompt('提交成功')
			yield (() => {
				window.location.href = 'about:blank'
  				window.close()
			})()
		},

		*submit() {
			let text = '';
			console.log(this.validateAnswer())
			if (this.validateAnswer()) {
				text = '有必填题未填写，无法提交！'
				this.iterator = null;
			} else {
				text = `确认提交问卷吗？`
			}

			yield this.showPrompt(text);
			yield this._commitPaper();
		},

		_commitPaper() {
			let datas = [];
      		console.log(this.answerList)
			for(var i in this.answerList){
				let cc = {};
				cc.questionId = this.answerList[i].questionId;
				cc.questionAnswer = this.answerList[i].questionAnswer.join(',')
				datas.push(cc)
			}
			console.log(datas)
			let data = {
				paperId: this.paperObj.id,
				startTimeStr:this.startTime,//开始答题时间(日期转化？)
				ipUrl:this.ipUrl,//用户IP
				equipment:this.equipments,//设备
				operatingSystem:this.operatingSystem,//操作系统
				source:this.source,//操作来源
        		json : JSON.stringify(datas)
			}
			console.log(data)
			commitPaper(data).then(res => {
				if (res.code === 200) {
					this.$message({message:res.msg,type: "success"});
					this.$router.push('/submitEnd')
				}else{
					this.$message({message:res.msg,type: "info"});
				}
			})
		},

	    showSelop(starindex,index){
	      	for (let m = starindex+1; m < this.questionList.length; m++) {
		        let queobj=this.questionList[m]
		        if(queobj.type=='radio'||queobj.type=='select'){
		          var seledVal=this.answerList[m].questionAnswer [0]
		          if(seledVal){
		            this.logicalListCont.forEach((item, iindex) => {
		              if(item.questionId==queobj.id&&seledVal==item.skipValue){
		                let tindex = this.questionList.findIndex(quitem => quitem.id == item.questionId);
		                let tnindex = this.questionList.findIndex(quitem => quitem.id == item.skipQuestionId);
		                let isnon=(tindex>-1&&tnindex>-1)
		                if(index>0){
		                   isnon=(tindex>-1&&tnindex>-1&&index<=tindex)
		                }
		                if(isnon) {
		                  for (let j = tindex + 1; j < tnindex; j++) {
		                    this.showArray[j]=false
		                  }
		                }
		              }
		            })
		
		          }else{
		            continue
		          }
		        }
	      	}
	    },
//		逻辑跳转
	    blurEvent(event,fatherEvent){
	        let qqeindex = this.questionList.findIndex(item => item.id == fatherEvent.id); //根据 已知id（this.a_id） 获取在数组中的位置(index)；
	        this.$set(this.answerList, qqeindex, {
	          	remarks:fatherEvent.remarks,
	          	type:fatherEvent.type,
	          	questionId: fatherEvent.id,
	          	questionAnswer : [event.target.value]
	        }) //解决vue操作数据 不能动态更新
		    let nowQueId=fatherEvent.id
	      	for(var i in this.logicalListCont){
		        let skipobj=this.logicalListCont[i];
		        let starindex = this.questionList.findIndex(item => item.id == skipobj.questionId); //根据 已知id（this.a_id） 获取在数组中的位置(index)；
		        if(skipobj.questionId==nowQueId){
		          	if(skipobj.skipValue==event.target.value){ //选项相同，跳转到跳转问题
			            let index = this.questionList.findIndex(item => item.id == skipobj.skipQuestionId); //根据 已知id（this.a_id） 获取在数组中的位置(index)；
			            for (let k = starindex+1; k < this.questionList.length ; k++) {
			              this.showArray[k]=true
			            }
			            for (let j = starindex+1; j <index ; j++) {
			              this.showArray[j]=false
			            }
			            this.showSelop(starindex,index)
			            return
		          	}else{ //选项不同，进入下一个循环
			            for (let k = starindex+1; k < this.questionList.length ; k++) {
			              this.showArray[k]=true
			            }
			            this.showSelop(starindex,0)
			            continue
		          	}
		        }else{
		          continue
		        }
	      	}
	        this.manyblurEvent(event,fatherEvent)
	    },

    	showManySelop(nowQueId,resulist,showMaxindex,index){
	      	let dscount=0;
		    if(resulist.length>1) {
		        resulist.forEach((item, iindex) => {
		          	let otherindex = this.questionList.findIndex(qitem => qitem.id == item.questionId); //根据 跳转问题 获取在数组中的位置(index)；
		          	if (otherindex > showMaxindex) {
		            	showMaxindex = otherindex;
		          	}
		          	if (this.questionList[otherindex].type == 'radio' || this.questionList[otherindex].type == 'select') {
		            	var seledVal = this.answerList[otherindex].questionAnswer [0]
		            	if (item.questionId == nowQueId && item.skipValue == event.target.value) {
		              		dscount = dscount + 1;
		            	} else {
			              	if (seledVal == item.skipValue) {
			                	dscount = dscount + 1;
			              	}
		            	}
		          	}
		
		        })
		        if (dscount == resulist.length) {
		          for (let k = showMaxindex + 1; k < index; k++) {
		            this.showArray[k] = false
		          }
		        }
	      	}/*else{ //只有这一项 问题到跳转问题之间隐藏
	        for (let k = starindex+1; k < index ; k++) {
	          this.showArray[k]=false
	        }
	      }*/
	    },
    	//	多选逻辑跳转
    	manyblurEvent(event,fatherEvent){
	      	let nowQueId=fatherEvent.id
	      	let starindex = this.questionList.findIndex(item => item.id == nowQueId); //当前问题 获取在数组中的位置(index)；
	      	for(var key in this.manylogicalMap) {
		        let manylist=this.manylogicalMap[key];
		        if(null!=manylist&&manylist.length>0){
		          	for(var i in manylist) {
			            let skipobj=manylist[i]
			            let skipId= skipobj.skipQuestionId
			            let index = this.questionList.findIndex(item => item.id == skipId); // 跳转问题 获取在数组中的位置(index)；
			            let showMaxindex=0;
			            let resulist=this.manylogicalMap[skipId]
			            if(skipobj.questionId==nowQueId){
			              	if(skipobj.skipValue==event.target.value) { //选项相同，获取多题跳转到的问题
			                	this.showManySelop(nowQueId,resulist,showMaxindex,index)
			                	continue
			              	}else{//选项不同，进入下一个循环
			                	resulist.forEach((item, iindex) => {
				                  	let otherindex = this.questionList.findIndex(qitem => qitem.id == item.questionId);
				                  	if (otherindex > showMaxindex) {
				                    	showMaxindex = otherindex;
				                  	}
			                	})
				                for (let k =showMaxindex+1; k < index ; k++) {
				                  	this.showArray[k]=true
				                  	this.logicalListCont.forEach((item, index) => { //判断是否单题跳转 隐藏
					                    if(item.skipQuestionId==this.questionList[k].id){
					                      let qsindex = this.questionList.findIndex(qitem => qitem.id == item.questionId);
					                      if(this.questionList[qsindex].type=='radio'||this.questionList[qsindex].type=='select') {
					                        var seledVal = this.answerList[qsindex].questionAnswer[0]
					                        if(item.skipValue==seledVal){
					                          	for (let h =qsindex+1; h < k ; h++) {
					                            	this.showArray[h]=false
					                          	}
					                        }
					                      }
					                    }
				                  	})
				                }
			                	continue
			              	}
			            }else{ //隐藏多选之间的问题
			              this.showManySelop(nowQueId,resulist,showMaxindex,index)
			              continue
			            }
		          	}
		        }else{
		          continue
		        }
	      	}
	    }
	}
}
</script>

<style scoped lang="scss">
@import '../style/public.scss';
@import '../style/_Fill.scss';
.gaugeTopic{
	display: flex;
	flex-direction: row;
	justify-content:space-between;
}
@media screen and (min-width: 640px) {
	.gaugeTopic{
		width: 50%;
	}
}
span.setUpWidth{
	min-width: auto !important;
}
select.options-list{
	width: 15%;
	margin: 1rem 0 0 1rem;
}
@media screen and (max-width: 1300px) {
	.scaleProblem{
		margin-top: 10px;
	}
}
.el-cascader{
	display: inline-block !important;
}
@media screen and (min-width: 700px) {
	.picExhibition{
		display:flex;
		flex-direction: row;
    	justify-content: space-around;
    
		li{
			height:auto !important;
			text-align: center;
			
			.picImg{
				width:90px;
				height:90px;
				margin: 0 auto;
				img{
					width: 100%;
					height:100%;
				}
			}
		}
	}
}
@media screen and (max-width: 700px) {
	.picExhibition{
		overflow: hidden;
    
		li{
			height:auto !important;
			width:45%;
			text-align: center;
			float: left;
			
			.picImg{
				width:90px;
				height:90px;
				margin: 0 auto;
				img{
					width: 100%;
					height:100%;
				}
			}
		}
	}
}
</style>
