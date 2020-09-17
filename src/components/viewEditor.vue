<template>
	<div class="container">
		<loader v-show="isLoading" />
		<div class="qu-wrap">
			<header>
				<p class="paperTitle">{{ paperObj.title }}</p>
				<p class="paperSubtitle">{{ paperObj.subtitle }}</p>
			</header>
			<div class="qu-content basic-content">
				<h3>基本信息</h3>
				<div class="basicInformation">
					<!--<p>编号ID：12</p>-->
					<p>
						<span>开始时间：{{paperAnswers.startTime}}</span>
						<span>结束时间：{{paperAnswers.endTime}}</span>
					</p>
				</div>
			</div>
			<div class="qu-content">
				<h3>答案详情</h3>
				<section class="qu-item" v-for="(item, index) in questionList">
					<h3>
						<span class="qu-num">{{`Q${index + 1}`}}</span>
						<span class="qu-topic">{{ item.title }}</span>
						<span class="qu-type">{{ item.type | transformQursiotnType}}</span>
					</h3>
					<!--多行文本-->
					<textarea rows="8" cols="80" v-if="item.type === 'textarea'" v-model="answerList[index].questionAnswer [0]" :disabled="disabled">
					</textarea>
					<!--下拉题-->
					<select v-else-if="item.type === 'select'" class="options-list" v-model="answerList[index].questionAnswer [0]":disabled="disabled">
						<option value="">请选择</option>
						<option :value="options" v-for="(options, optIndex) in item.optionArray">{{options}}</option>
					</select>
					<!--量表题-->
					<p v-else-if="item.type === 'star'">
						<ul class="options-list  gaugeTopic">
							<li v-for="(options, optIndex) in item.optionArray">
								<label>
									<input type="radio" :value="options" :name="index + 1" v-model="answerList[index].questionAnswer [0]" :disabled="disabled">
									<span>{{ options }}</span>
								</label>
							</li>
						</ul>
						<ul class="options-list gaugeTopic scaleProblem">
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
								<input type="radio" :value="optioness.value" :name="index + 1" v-model="answerList[index].questionAnswer [0]">
								<span class="optionText setUpWidth">
									{{ optioness.texts || '请单击此处编辑选项内容' }}
								</span>
							</p>
						</li>
					</ul>
					<!--联动-->
					<el-cascader v-else-if="item.type === 'cascade'" change-on-select :options="item.jsonArray" v-model="answerList[index].questionAnswer"  >
					</el-cascader>

					<!--单选或者多选-->
					<ul v-else class="options-list">
						<li v-for="(options, optIndex) in item.optionArray">
							<label>
								<input v-if="item.type === 'radio'"
											type="radio"
											:disabled="disabled"
											:value="options"
									    :name="index + 1"
                       v-model="answerList[index].questionAnswer[0] "
								>
								<input v-else-if="item.type === 'checkbox'"
											type="checkbox"
											:disabled="disabled"
											:value="options"
									    :name="index + 1"
                       v-model="answerList[index].questionAnswer"
								>
								<span>{{ options }}</span>
							</label>
						</li>
					</ul>
				</section>
			</div>
			<footer>
				<span class="btn" v-if="isEdit" @click="iterator = submit(); iterator.next()">提交问卷</span>
				<span class="btn" @click="$router.back(-1)">返回</span>
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
	//import BMap from 'BMap';
	import { getAnswerDetails, updatePaperAnswer } from '../api'

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
				paperAnswers: {},
				questionList: [],
				answerList: [],
				promptText: '',
				isShowPrompt: false,
				isEdit: false,
				isLoading: false,
				disabled:false
			}
		},

		created() {
			this._getAnswerDetails()
		},

		mounted() {
			this._isLook() //用户是编辑还是查看
		},
		methods: {
			_isLook() {
				let isv = this.$route.query.isEdit
				if(isv) {
					this.isEdit = isv
				}else{
					this.disabled = true
				}
			},
			_getAnswerDetails() {
				let data = this.$route.query.id
				this.isLoading = true
				getAnswerDetails(data).then(res => {
					console.log(res)
					if(res.code === 200) {
						this.paperObj = res.data.paperInfo
						this.paperAnswers = res.data.paperAnswers
						this.questionList = res.data.quelist
						for(var i in res.data.quelist){
							let b = []
							if(res.data.quelist[i].type == 'imgsel'){
								for(var j in res.data.quelist[i].optionArray){
									let c = []
									c.imgurl=res.data.quelist[i].optionArray[j].split('*')[0]
									c.texts=res.data.quelist[i].optionArray[j].split('*')[1]
									c.value=res.data.quelist[i].optionArray[j]
									b.push(c)
								}
								res.data.quelist[i].optionArray = b
							}
						}
						res.data.quelist.map((item, index) => {
							let anwlist = item.remarks.split(",")
							this.$set(this.answerList, index, {
								type: item.type,
								questionId: item.id,
								questionAnswer: anwlist
							})
						})
						this.isLoading = false
					}
				})
			},

			showPrompt(text) {
				this.promptText = text;
				this.isShowPrompt = true;
			},

			* commitSuccess() {
				yield this.showPrompt('提交成功')
				yield(() => {
					window.location.href = 'about:blank'
					window.close()
				})()
			},

			* submit() {
				let text = '';
				text = `确认提交问卷吗？`

				yield this.showPrompt(text);
				yield this._updatePaperAnswer();
			},

			_updatePaperAnswer() {
				let datas = [];
				for(var i in this.answerList) {
					let cc = {};
					cc.questionId = this.answerList[i].questionId;
//					if(this.answerList[i].type == 'checkbox'){
//						cc.questionAnswer = this.answerList[i].questionAnswer.join(',')
//					}else{
						cc.questionAnswer = this.answerList[i].questionAnswer.join(',')
//					}
					datas.push(cc)
				}
				let data = {
					paperAnswersId: this.$route.query.id, //
					json: JSON.stringify(datas)
				}
				console.log(data)
				updatePaperAnswer(data).then(res => {
					if(res.code === 200) {
						this.$message({
							message: res.msg,
							type: "success"
						});
					} else {
						this.$message({
							message: res.msg,
							type: "info"
						});
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	@import '../style/public.scss';
	@import '../style/_Fill.scss';
	.gaugeTopic {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	
	@media screen and (min-width: 640px) {
		.gaugeTopic {
			width: 50%;
		}
	}
	
	span.setUpWidth {
		min-width: auto !important;
	}
	
	select.options-list {
		width: 15%;
		margin: 1rem 0 0 1rem;
	}
	
	.basic-content.qu-content {
		border-bottom: none;
	}
	
	.qu-content>h3 {
		font-size: 2rem;
		font-weight: bold;
	}
	
	.qu-content .basicInformation {
		margin: 1rem 0;
		padding: 1rem 2rem;
	}
	
	.qu-content .basicInformation p {
		padding: 1rem 0rem;
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