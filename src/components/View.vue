<template>
	<div class="container">
		<loader v-show="isLoading"/>
		<div class="qu-wrap" id="printMe">
			<header>
				<p class="paperTitle">{{ paperObj.title }}</p>
				<p class="paperSubtitle">{{ paperObj.subtitle }}</p>
			</header>
			<div class="qu-content">
				<section class="qu-item" v-for="(item, index) in questionList">
					<h3>
						<span class="qu-num">{{index + 1}}</span>
						<span class="qu-topic">{{ item.title }}</span>
						<span class="qu-type">{{ item.type | transformQursiotnType}}</span>
						<span v-if="item.remarks == '是'" style="color: red;">*</span>
					</h3>
					<!--多行文本-->
					<textarea rows="8"
						      	cols="80"
					          v-if="item.type === 'textarea'"
					>
					</textarea>
					<!--下拉题-->
					<select v-else-if="item.type === 'select'" class="options-list">
						<option :value="options"  v-for="(options, optIndex) in item.optionArray">{{options}}</option>
					</select>
					<!--量表题-->
					<p v-else-if="item.type === 'star'">
						<ul class="options-list  gaugeTopic">
							<li  v-for="(options, optIndex) in item.optionArray">
								<label>
									<input type="radio" :value="options" :name="index + 1" >
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
								<input type="radio" :value="optioness.value" :name="index + 1">
								<span class="optionText setUpWidth">
									{{ optioness.texts || '请单击此处编辑选项内容' }}
								</span>
							</p>
						</li>
					</ul>
					<!--联动-->
					<el-cascader v-else-if="item.type === 'cascade'" change-on-select :options="item.jsonArray">
					</el-cascader>
					<!--单选或者多选-->
					<ul v-else class="options-list">
						<li  v-for="(options, optIndex) in item.optionArray">
							<label>
								<input v-if="item.type === 'radio'"
											type="radio"
											:value="options"
									    :name="index + 1"
								>
								<input v-else-if="item.type === 'checkbox'"
											type="checkbox"
											:value="options"
									    :name="index + 1"
								>
								<span>{{ options }}</span>
							</label>
						</li>
					</ul>
				</section>
			</div>
			<footer v-show="printShow">
				<span class="btn" @click="iterator = submit(); iterator.next()">提交问卷</span>
			</footer>
			<button id="desc1" v-print="'#printMe'" v-show="printBtn">打印</button>
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
import { getPaper, viewPaper, commitPaper,userviewPaper } from '../api'

export default {
	name: 'seeView',

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
			promptText: '',
			isShowPrompt: false,
			isLoading: false,
			printShow:true,
			printBtn:false
		}
	},
	created() {
		console.log(this.$route.query.print)
		
		this._getPaper();
	},
	
	methods: {
		showPrompt(text) {
			this.promptText = text;
			this.isShowPrompt = true;
		},

		*submit() {
			let text = '';
			text = `查看界面不能提交问卷`
			yield this.showPrompt(text);
		},

		_getPaper() {
			let data = {id: this.$route.query.id}
			this.isLoading = true
				userviewPaper(data).then(res => {
					if (res.code === 200) {
						let status = res.data.status
						console.log(res.data)
						this.paperObj = res.data.paper
						this.questionList = res.data.list
						this.isLoading = false
						if(this.$route.query.print){
							this.printShow = false//隐藏提交按钮
							//主动单击打印按钮
							var e = document.createEvent("MouseEvents");
					        e.initEvent("click", true, true);
					        document.getElementById("desc1").dispatchEvent(e);
						}
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
						setTimeout(() => {
							window.location.href = 'about:blank'
						}, 5000);
					}
				})
		},
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
