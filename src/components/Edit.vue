<template>
	<div class="container">
		<div class="qu-wrap">
			<footer>
				<!--<template v-if="excelFile === null">-->
				<template>
					<div class="ctrl-part">
						<span @click="iterator = releasePaper(), iterator.next()">发布问卷</span>
					</div>
					<div class="ctrl-part">
						<span @click="$router.back(-1)">返回</span>
					</div>
				</template>
			</footer>
			<div class="qu-content">
				<div class="leftColumn">
					<div class="current">
						<p v-for="(item,index) in subjectList" :class="{active:subjectNmu==index}" @click="subjectBtn(index)">
							{{item}}</p>
					</div>

					<div class="add-box" v-show="subjectNmu == 0">
						<p class="qu-type expand">
							<span @click="addQuestion('radio')" class="btn">单选题</span>
							<span @click="addQuestion('checkbox')">多选题</span>
							<span @click="addQuestion('select')">下拉题</span>
							<span @click="addQuestion('textarea')">文本题</span>
							<span @click="addQuestion('star')">量表题</span>
							<span @click="addQuestion('cascade')">联动题</span>
							<span @click="addQuestion('imgsel')">图片选择</span>
						</p>
					</div>
					<div class="add-box" v-show="subjectNmu == 1">
						<ul class="outline-content">
							<li class="outline-list" v-for="(item, index) in questionInfoList">
								<div @click="anchorPoint(index)">
									<span class="qu-num">{{`${index + 1}`}}.</span>
									<span class="qu-topic">{{ item.title || '请单击此处编辑题目内容' }}{{ item.type | transformQursiotnType}}</span>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div class="centerColumn" :class="{editCont:itemBank == false}">
					<div class="questionnaireCont">
						<header>
							<p v-show="!titleEditing" @click="titleEditing = true">{{ paperObj.paperTitle || '问卷标题' }}</p>
							<input type="{}" v-focus v-model="paperObj.paperTitle" :class="{inlineShow: titleEditing}" @blur="titleEditing = false,titleChange(paperObj)" @keyup.enter="titleEditing = false">
						</header>
						<div class="questionSubTitle">
							<p v-show="!subtitleEditing" @click="subtitleEditing = true">{{ paperObj.paperSubTitle || '为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！' }}</p>
							<textarea rows="40" cols="80"  style="overflow:hidden" v-focus v-model="paperObj.paperSubTitle" :class="{inlineShow: subtitleEditing}" @blur="subtitleEditing = false,subtitleChange(paperObj)" @keyup.enter="subtitleEditing = false"></textarea>
						</div>
						
						<!--显示状态下-->
						<section class="qu-item problemsShow"
						v-for="(item, index) in questionInfoList" :id="'productId'+index">
							<h3 @click="problemShow(item,index+1)">
								<span class="qu-num">{{`Q${index + 1}`}}</span>
								<span class="qu-topic">{{ item.title || '请单击此处编辑题目内容' }}</span>
								<span class="qu-type">{{ item.type | transformQursiotnType}}</span>
							</h3>
							<label class="mustfill">
								<input type="checkbox" v-model="item.remarks=='是'?true:false" style="display: inline-block;" disabled="disabled" /><span>必填</span>
							</label>
							<!--文本题-->
							<textarea v-if="item.type === 'textarea'" rows="8" cols="80" disabled="disabled"></textarea>
							<!--量表题-->
							<div v-else-if="item.type === 'star'">
								<ul class="options-list starGauge" >
									<li v-for="(optioness, optIndex) in item.optionArray">
										<input type="radio" :value="optioness" :name="index + 1"  disabled="disabled">
										<span class="optionText setUpWidth">
											{{ optioness || '请单击此处编辑选项内容' }}
										</span>
									</li>
								</ul>
								<ul class="options-list starGauge scaleProblem" >
									<li>
										<span class="optionText setUpWidth">
											非常不{{item.starType}}
										</span>
									</li>
									<li>
										<span class="optionText setUpWidth">
											非常{{item.starType}}
										</span>
									</li>
								</ul>
							</div>
							<!--下拉题-->
							<select v-else-if="item.type === 'select'" class="options-list" disabled="disabled">
								<option value="">请选择</option>
								<option :value="childrenOption"  v-for="childrenOption in item.optionArray">{{childrenOption}}</option>
							</select>
							<!--图片选择-->
							<div v-else-if="item.type === 'imgsel'">
								<ul class="options-list picExhibition" >
									<li v-for="(optioness, optIndex) in item.optionArray">
										<p class="picImg">
											<img :src="optioness.imgurl" />
										</p>
										<p class="picCont">
											<input type="radio" :value="optioness" :name="index + 1"  disabled="disabled">
											<span class="optionText setUpWidth">
												{{ optioness.texts || '请单击此处编辑选项内容' }}
											</span>
										</p>
									</li>
								</ul>
							</div>
							<!--级联-->
							<el-cascader v-else-if="item.type === 'cascade'" :options="item.optionArray" disabled="disabled">
                  			</el-cascader>
							<!--单选或者多选-->
							<ul v-else class="options-list" >
								<li v-for="childrenOption in item.optionArray">
									<input v-if="item.type === 'radio'" type="radio" :value="childrenOption" :name="index + 1"  disabled="disabled">
									<input v-else-if="item.type === 'checkbox'" type="checkbox" :value="childrenOption" :name="index + 1"  disabled="disabled">
									<span>
										{{ childrenOption || '请单击此处编辑选项内容' }}
									</span>
								</li>
							</ul>
							<ul class="operat-list">
								<li @click="questionCollect(index,item)">收藏</li>
								<li v-if="index !== 0" @click="moveUp(index, questionInfoList)">上移</li>
								<li v-if="index !== questionInfoList.length - 1" @click="moveDown(index, questionInfoList)">下移</li>
								<li v-if="(index !== questionInfoList.length - 1&&item.type === 'radio')||(index !== questionInfoList.length - 1&&item.type === 'select')" @click="logicJump(index,item)">逻辑跳转</li>
								<li v-if="index > 1" @click="relationJump(index,item)">多题跳转</li>
								<li @click="deleteQuestion(index,item)">删除</li>
							</ul>
						</section>

					</div>
				</div>
				<!--题库-->
				<div class="rightColumn" :class="{opened:itemBank == false}">
					<a class="lib_toggle_button" @click="bankShow()" v-show="itemBank == true">
						<img src="../assets/retract.png" />
						收起题库
					</a>
					<a class="lib_toggle_button" @click="bankShow()" v-show="itemBank == false">
						<img src="../assets/open.png" />
						展开题库
					</a>
					<div>
						<div class="lib_title">
							<h3>题库</h3>
							<a @click="bankShow()">&times;</a>
						</div>
						<div class="collect_list">
							<h3 @click="getCollectList()">收藏题目</h3>
							<ul class="lib_content" v-show="isShowCollectList">
								<li v-for="(item,index) in collectList">
									<p @click="changeContent(item,index)">{{item.title}}</p>
									<a @click="delCollect(item)">&times;</a>
								</li>
							</ul>
						</div>
						<div class="collect_list" v-for="(item,index) in list">
							<h3 @click="itemBankList(index)">{{index}}</h3>
							<ul class="lib_content" v-for="(option,optionIndex) in item" v-show="itemBankIndex && itemBankType ===index">
								<li class="bankTpye">
									<p @click="changeContent(option,optionIndex)">{{option.title}}<span></span></p>
								</li>
							</ul>
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
					<span @click="isShowPrompt = false, iterator && iterator.next()">确定</span>
					<span @click="isShowPrompt = false">取消</span>
				</footer>
			</div>
		</div>
		<!--添加问题-->
		<div class="overlay" v-show="editShow">
			<div class="prompt-box" style="width: 800px;">
				<header>
					<span>提示</span>
					<a href="javascript:;" @click="editShow = false">&times;</a>
				</header>
				<div class="qu-content">
					<div class="centerColumn" style="width: 100%;position: inherit;">
						<div class="questionnaireCont">
							<el-alert
				              title="请单击此处编辑题目内容"
				              v-show="isShowTipsPrompt"
				              type="warning"
				              center
				              :closable="false"
				              show-icon>
				            </el-alert>
							<section class="qu-item"
							v-for="(item, index) in questionList"
							:class="{nowEditing: curIndex === index && topicEditing, optEditing: curIndex === index}">
								<h3 @click="curIndex = index; curOptIndex=''; topicEditing = true">
									<span class="qu-topic">{{ item.title || '请单击此处编辑题目内容' }}</span>
									<input type="text"
									v-focus
									v-model="item.title"
									@blur="topicEditing = false"
									@keyup.enter="topicEditing = false">
									<span class="qu-type">{{ item.type | transformQursiotnType}}</span>
								</h3>
								<label class="mustfill">
									<input type="checkbox" v-model="item.remarks=='是'?true:false" style="display: inline-block;" @click="fillBtn(item)"  /><span>必填</span>
								</label>
								<!--文本题-->
								<textarea v-if="item.type === 'textarea'" rows="8" cols="80" disabled="disabled"></textarea>
								<!--量表题-->
								<ul v-else-if="item.type === 'star'" class="options-list" >
									<li>
										<label>量级类型</label>
										<select  class="starFrame" v-model="starListValue">
											<option v-for="item in starList" :label="item.label" :value="item.value"></option>
										</select>
									</li>
									<li>
										<label>量级设置</label>
										<select v-model="starLevel" class="starFrame">
											<option value="2">2级</option>
											<option value="3">3级</option>
											<option value="4">4级</option>
											<option value="5">5级</option>
											<option value="6">6级</option>
											<option value="7">7级</option>
											<option value="8">8级</option>
											<option value="9">9级</option>
											<option value="10">10级</option>
										</select>
									</li>
									<li>
										<label>起始数值</label>
										<input type="number" v-model="starName" class="starFrame" />
									</li>
								</ul>
								<!--图片选择-->
								<div v-else-if="item.type === 'imgsel'">
						            <ul class="options-list pictureSelection" >
										<li class="imgoptionsList pictureSeleOptionsList" v-for="(optioness, optIndex) in item.optionArray"
												:class="{optionEditing: curOptIndex === optIndex}"
										>
											<p class="uploadPicture-list">
												<!--<input type="button" class="photobtn" value="添加照片"></span>-->
												<input type="file" class="fileinp"  @change='onchangeImgFun(optIndex,item.optionArray)' title="">
												<img class="uploadPicture-content" :src="optioness.imgurl" />
											</p>
											<span class="optionText"
												  	@click="curIndex=index; curOptIndex=optIndex; topicEditing = false">
														{{ optioness.texts || '请单击此处编辑选项内容' }}
											</span>
											<input type="text"
											v-focus
											v-model="item.optionArray[optIndex].texts"
											@blur="curIndex=''"
											@keyup.enter="curIndex=''">
											<span class="imgBtn-list" v-if="optIndex === item.optionArray.length - 1" @click="picaddOption(item.optionArray)">添加</span>
											<span class="imgBtn-list" @click="deleteOption(optIndex, item.optionArray)">删除</span>
										</li>
									</ul>
								</div>
								<!--联动-->
								<div v-else-if="item.type === 'cascade'">
									<span style="display:inline-block;text-indent: 2rem;">提示：请按照格式一级写完再填写上级，以此类推。  '1.'后面为一级联动，'2.'后面为二级联动，'3.'后面为三级联动，'4.'后面为四级联动，最多只能到四级。</span>
								    <textarea rows="25" cols="60" v-model="test" placeholder="1.陕西
2.西安
3.高新
4.高新二中
3.雁塔
4.雁塔一中
3.莲湖
2.宝鸡
3.千阳"></textarea>
								</div>
								<!--单选、多选、下拉-->
								<ul v-else class="options-list" >
									<li v-for="(optioness, optIndex) in item.optionArray"
											:class="{optionEditing: curOptIndex === optIndex}"
									>
										<span class="optionText"
											  	@click="curIndex=index; curOptIndex=optIndex; topicEditing = false">
													{{ optioness || '请单击此处编辑选项内容' }}
										</span>
										<input type="text"
										v-focus
										v-model="item.optionArray[optIndex]"
										@blur="curIndex=''"
										@keyup.enter="curIndex=''">
										<ul class="opt-ctrl">
											<li v-if="optIndex === item.optionArray.length - 1" @click="addOption(item.optionArray)">添加</li>
											<li @click="deleteOption(optIndex, item.optionArray)">删除</li>
										</ul>
									</li>
								</ul>
							</section>
						</div>
					</div>
				</div>
				<footer>
					<span @click="iterator = editSave(), iterator.next()">确定</span>
					<span @click="editShow = false, editCancel()">取消</span>
				</footer>
			</div>
		</div>
		<!--逻辑跳转-->
		<div class="overlay" v-show="logicJumpShow">
			<div class="prompt-box" style="width: 800px;">
				<header>
					<span>提示</span>
					<a href="javascript:;" @click="logicJumpShow = false">&times;</a>
				</header>
				<div class="">
					<el-table :data="tableData" border stripe style="width: 100%">
			            <el-table-column align="center" width="100">选择</el-table-column>
			            <el-table-column prop="skipValue" label="选项" align="center">
			            </el-table-column>
			            <el-table-column prop="skipQuestionId" label="跳转到" align="center">
			            	<template slot-scope="scope">
								<el-select size="medium" v-model="state[scope.row.skipValue]" @change="selectRoleChange(scope.row.skipValue)">
									<el-option v-for="(item,index) in amount" :key="item.id" :label="`Q${index+logicNum}`+','+item.title" :value="item.id">
										<!--<el-option v-for="(item,index) in amount" :key="item.id" :label="item.title" :value="item.id">-->
								   	</el-option>
								</el-select>
							</template>
			            </el-table-column>
			        </el-table>
				</div>
				<footer>
					<span @click="logicJumpShow = false,logicJumpSave(tableData)">确定</span>
					<span @click="logicJumpShow = false">取消</span>
				</footer>
			</div>
		</div>
		<!--多题逻辑跳转-->
		<div class="overlay" v-show="relationJumpShow">
			<div class="prompt-box" style="width: 800px;">
				<header>
					<span>提示</span>
					<a href="javascript:;" @click="relationJumpShow = false">&times;</a>
				</header>
				<div class="mostiJump">
					<p class="mostiJump-tlt">当前题目:{{relatedTitle}}</p>
					<div class="mostiJump-cont" v-for="(item,mulindex) in multipleTopics">
						<div>
							<span class="multiQuestionTitle">{{item.value+(mulindex+1)}}</span>
							<el-select placeholder='请选择' v-model="item.order" value-key="item.order" @change="changeInvalid($event,item,mulindex)">
								<el-option label='请选择' value=''>请选择</el-option>
				              	<el-option v-for="chiritem in chirmultipleTopics" :key="chiritem.id" :value="chiritem.id" :label="chiritem.title">{{chiritem.title}}</el-option>
				            </el-select>
							<span class="multiQuestionBtn" v-if="mulindex === multipleTopics.length - 1" @click="relatedaddOption(mulindex,multipleTopics)">添加</span>
							<span class="multiQuestionBtn" @click="relatedelOption(mulindex, multipleTopics)">删除</span>
						</div>
			            <ol>
			            	<li v-for="reitemQue in item.relatedQuestions">
			            		<input type="radio" :value="reitemQue" :name="mulindex + 1" v-model="answerList[mulindex].questionAnswer">
			            		{{reitemQue}}
			            	</li>
			            </ol>
					</div>
				</div>
				<footer>
					<span @click="relationJumpSave()">确定</span>
					<span @click="relationJumpShow = false">取消</span>
				</footer>
			</div>
		</div>
		<loader v-show="isLoading" />
	</div>
</template>

<script>
	import Loader from './Loader'
	import Datepicker from './Datepicker'
	import { userviewPaper, saveQuestion, savePaper, uploadPaper, getList, getCollectList,delPaperQuestion,changePaperQuestion,getListBysort,questionOptions,paperLogical,updateRecycleStatus,questionCollection,dictList,deleteCollection,uploadFile,getManyList,multiJumpSave } from '../api'
	import storage, { USERID_KEY,TOKEN_KEY } from '../public/js/storage'

	const questionTemplate = {
		radio: {
			type: 'radio',
			transformQursiotnType: '单选题',
			title: "",
			optionArray: ["", ""],
			optiones: ["", ""],
			remarks:'否'
		},
		checkbox: {
			type: 'checkbox',
			transformQursiotnType: '多选题',
			title: "",
			optionArray: ["", ""],
			optiones: ["", ""],
			remarks:'否'
		},
		textarea: {
			type: 'textarea',
			transformQursiotnType: '多行文本题',
			title: "",
			optionArray: [],
			optiones: ["", ""],
			remarks:'否'
		},
		select: {
			type: 'select',
			transformQursiotnType: '下拉题',
			title: "",
			optionArray: ["", ""],
			optiones: ["", ""],
			remarks:'否'
		},
		star: {
			type: 'star',
			transformQursiotnType: '量表题',
			title: "",
			optionArray: ["", ""],
			optiones: ["", ""],
			remarks:'否'
		},
		cascade: {
			type: 'cascade',
			transformQursiotnType: '联动题',
			title: "",
			optionArray: [""],
			optiones: [""],
			remarks:'否'
		},
		imgsel: {
			type: 'imgsel',
			transformQursiotnType: '图片选择',
			title: "",
			optionArray: [{imgurl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAABcCAYAAAABM8khAAAACXBIWXMAAAsSAAALEgHS3X78AAABS0lEQVR42u3dsW3rMBSG0Z+GB8gIHOEVHCCjZBSP4lHSm0VG4AjZ4KZRECCAG+dZgYPzAWoECRIOrlSwYauqaJ+OSTLn7Ek6jvs0xnhNkna5XPp2YmG5T3PO5zHG6yFJB3331pyzHzjs8htZSWDv2BPs/XqHvWOwYcMWbNiCDRu2YMMWbNiwBRu2YMMWbNiwBRu2/hx2a6231l5g71NPAluwYcMWbNiCDVuwYcMWbNi61vE3Htpa67l95a4n6a210433r6o6m2yT/f+rqpXkdONX8ZykV9Xp0bBNNmzYgg1bsGHDFmzYgg0btmBfaSU5PyL28dFeeFuePZtswYYNW7BhCzZswYYNW7BhCzZs2IINW7BhwxZs2IINW7B/o22r9XXItnMykrvWxxirVdWn/NN2vI0x3vn8eJr/bZ5fm9xX1dWL9KPW9/3sPwAswUi0SOZWuAAAAABJRU5ErkJggg==',texts:''}],
			optiones: [{imgurl:'',texts:''}],
			remarks:'否'
		},
	}
	const transformQursiotnType = {}
	export default {
		name: 'Edit',

		components: {
			'loader': Loader,
			'date-picker': Datepicker
		},

		directives: {
			focus: {
				update: el => el.focus(),
			}
		},

		filters: {
			transformQursiotnType(type) {
				return type === 'radio' ? '(单选题)' : (type === 'checkbox' ? '(多选题)' : (type === 'textarea' ? '(文本题)' : (type === 'star' ? '(量表题)' :(type === 'cascade' ? '(联动题)' :(type === 'imgsel' ? '(图片选择)' :'(下拉题)')))))
			}
		},

		data() {
			return {
				isFinish: false,
				templateObj: {},
				isblur: false,
				excelFile: null,
				excelFileName: '',
				editShow:false,//开始是否显示
				paperInfo:{//更改标题
					id:'',
					title:'',//试卷标题
					subtitle:''//试卷副标题
				},
				paperObj: {
					paperId:null,
					paperTitle:'问卷标题',//试卷标题
					paperSubTitle:'为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！',//问卷副标题
					templateClassify:'否',//是否模板
					title:null,//问题标题
					type:null,//问题类型
					optiones:null,//问题选项逗号拼接
					subtitle:null,//问题副标题
					remarks:null,// 问题是否必填
					starType:null//量表的类型
				},
				questionInfoList: [],//
				questionList: [],
				subscriptNmu: 0,
				curIndex: '',
				curOptIndex: '',
				promptText: '',
				iterator: null,
				isEditMode: false,
				titleEditing: false,//标题的提示框
				subtitleEditing:false,//副标题的提示框
				topicEditing: false,
				isShowPrompt: false,
				isShowTipsPrompt:false,//提示题目标题是否为空
				isLoading: false,
				subjectList: ['题目控件', '问卷大纲'],
				subjectNmu: 0,
				list: [],
				collectList: [],
				isShowCollectList: false,
				current: -1,
				logicNum:0,
				itemBankIndex:false,//题库的显示
				itemBankType:0,//题库的下标
				itemBank: true, //题库的展开与收起
				logicJumpShow:false,//逻辑跳转展示
				maxsort:'',//逻辑排序
				pitchQuestionId:'',//逻辑中本条消息ID
				tableData:[],
				state: {},
				amount:[],
				starListValue:'满意',
				starList:[],//量表类型
				starLevel:5,//量级设置
				starName:1,//初始数值
				containers:[""],//级联
				test:'',
				//多题逻辑跳转展示开始
				relationJumpShow:false,
				multipleTopics:[{
			        value: '关联题目',
			        order: '',
			        relatedQuestions:[]
			    }],
			    relationJumpQuestionId:'',//被跳转的题目ID
			    relatedTitle:'',//当前的题目
				chirmultipleTopics:[],//关联问题的题目
				answerList: [],
				//多题逻辑跳转展示结束
			}
		},
		watch: {
			templateObj: {
				handler(newValue, oldValue) {
					if(newValue.title !== '') {
						this.isFinish = true
					}
				},
				deep: true
			}
		},
		created() {
			// 设置编辑模式 (add, edit, re-edit)
			this.isEditMode = this.$route.path !== '/add'
			if(this.isEditMode) {
				this._getPaper()
			} else {
//				console.log(storage.get(USERID_KEY))
				this.paperObj = {
					paperId:'',
					paperTitle:'问卷标题',//试卷标题
					paperSubTitle:'为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！',//问卷副标题
					templateClassify:'否',//是否模板
					title:'',//问题标题
					type:'',//问题类型
					optiones:'',//问题选项逗号拼接
					subtitle:'',//问题副标题
					remarks:'',// 问题是否必填
				}
				this.getTemplate()
			}
			this.getList()
//			this.keyUp()
		},
		mounted () {
			this.tableData.forEach(item => {
		      	this.$set(this.state, item.skipValue, '') // 父、  子、  子的赋值
		    })
		},

		methods: {
//			问卷大纲的锚点跳转
			anchorPoint(index){
				console.log(index)
				const returnEle = document.getElementById('productId'+index)
				console.log(returnEle)
		        if (!!returnEle) {
		          returnEle.scrollIntoView(true); // true 是默认的
		        }
			},
//			题库的判断
			getTemplate(){
				this.paperObj.templateClassify = this.$route.query.templateClassify=='是'?'是':'否'
			},
			handleblur() {
				this.topicEditing = false
				this.isblur = true
			},
			//  	题库的展开与收起
			bankShow() {
				this.itemBank = !this.itemBank;
			},
//			点击题库并编辑
			changeContent(event,index) {
				this.editShow = true
				let datas = JSON.parse(JSON.stringify(event))
				let demo = {
					type: datas.type,
					transformQursiotnType: datas.type,
					title: datas.title,
					optionArray:datas.optiones.split(','),
					optiones:datas.optiones.split(','),
					remarks: false
				}
				this.questionList.length = 0;
				this.questionList.push(demo);
			},
//			标题改变
			titleChange(event){
				this.paperInfo.id = event.paperId;
				this.paperInfo.title = event.paperTitle;
				this.paperInfo.subtitle = event.paperSubTitle;
				this.paperInfo.templateClassify = event.templateClassify;
				console.log(this.paperInfo)
				this._savePaper()
			},
//			副标题改变
			subtitleChange(event){
				this.paperInfo.id = event.paperId;
				this.paperInfo.title = event.paperTitle;
				this.paperInfo.subtitle = event.paperSubTitle;
				this.paperInfo.templateClassify = event.templateClassify;
				console.log(this.paperInfo)
				this._savePaper()
			},

			errorPrompt(text) {
				this.iterator = null;
				this.showPrompt(text);
			},
//			跳转逻辑开始
			logicJump(index,event){
				this.logicNum = index+2
				this.logicJumpShow = true;
				let data = {
					params:{
						paperId : this.paperObj.paperId,//试卷ID 
						questionId : event.id//选中的问题id
					}
				}
				this.pitchQuestionId = event.id
//				获取问题选项
				questionOptions(data).then(res => {
					console.log(res)
					if(res.code === 200){
						res.data.optionArray.value = res.data.optiones.split(',')
//						let bb = res.data.optiones.split(',')
						this.tableData = []
						for(var i in res.noskipops){
							let cc = {};
							cc.skipValue =  res.noskipops[i];
							cc.skipQuestionId =  '';
							this.tableData.push(cc)
						}
					}
				})
//				获取大于该问题的题目
				getListBysort(data).then(res => {
					console.log(res)
					if(res.code === 200) {
						this.amount = res.data.quelist
						this.maxsort = res.data.maxsort
//						逻辑回填
						if(res.data.logicallist!=''){
							for(var i=0;i<res.data.logicallist.length;i++){
								for(var j=0;j<this.tableData.length;j++){
									if(this.tableData[j].skipValue==res.data.logicallist[i].skipValue){
										this.tableData[j].skipQuestionId=res.data.logicallist[i].skipQuestionId
									}
								}
							}
							this.tableData.forEach(item => {
						      	this.$set(this.state, item.skipValue, item.skipQuestionId) // 父、  子、  子的赋值
						    })
						}
					}
				})
			},
//			跳转保存
			logicJumpSave(event){
				let datas = [];
				for(var i in event){
					let skips = event[i].skipQuestionId!=undefined&&event[i].skipQuestionId!=''&&event[i].skipQuestionId!=null?'是':'否';
					if(event[i].skipQuestionId!=undefined&&event[i].skipQuestionId!=''&&event[i].skipQuestionId!=null){
						let cc = {
							paperId : this.paperObj.paperId,//试卷ID 
							questionId : this.pitchQuestionId,//选中的问题id
							skip : skips,//是否选项跳转
							skipValue : event[i].skipValue,//跳转选项值
							skipQuestionId : event[i].skipQuestionId,//跳转到问题ID
							sort : this.maxsort,//顺序
							isManySkip : '否',//是否多题跳转
						}
						datas.push(cc)
					}
				}
				let data = {
					paperId : this.paperObj.paperId,//试卷ID 
					questionId : this.pitchQuestionId,//选中的问题id
					json : JSON.stringify(datas)
				}
				paperLogical(data).then(res => {
					if(res.code === 200) {
						this.pitchQuestionId = ''
						this.$message({message: '保存成功',type: "success"});
						this._getPaper()
					}else{
						this.$message({type: 'info',message: '保存失败'});
					}
				})
			},
//			跳转逻辑结束
//			多题跳转开始
			relationJump(index,event){
				this.relationJumpShow = true
				this.relationJumpQuestionId = event.id
				this.chirmultipleTopics = ''
				this.multipleTopics = [{
			        value: '关联题目',
			        order: '',
			        relatedQuestions:[]
			    }]
				//获取当前的题目
				for(var i in this.questionInfoList){
					if(event.id == this.questionInfoList[i].id){
						this.relatedTitle = (Number(i)+1)+'.'+event.title
					}
				}
				//获取多题跳转的题目列表
				let data = {
					params:{
						paperId : this.paperObj.paperId,//试卷ID 
						questionId : event.id//选中的问题id
					}
				}
				getManyList(data).then(res => {
					if(res.code == 200){
						this.maxsort = res.data.maxsort
						this.chirmultipleTopics = res.data.quelist
						if(res.data.logicallist!=''){
							let bb = []
							for(var i=0;i<res.data.logicallist.length;i++){
								for(var j=0;j<this.chirmultipleTopics.length;j++){
									if(this.chirmultipleTopics[j].id == res.data.logicallist[i].questionId){
										let aa = []
										aa.value = '关联题目'
										aa.order = res.data.logicallist[i].questionId;
										aa.relatedQuestions = this.chirmultipleTopics[j].optiones.split(',');
										bb.push(aa)
									}
								}
							}
							this.multipleTopics = bb
							res.data.logicallist.map((item, index) => {
								this.$set(this.answerList, index, {
									questionId: item.questionId,
									questionAnswer: item.skipValue,
								})
							})
						}
					}
				})
			},
			changeInvalid(event,item,index){
				if(this.multipleTopics.length>1){
					for(var j=0;j<this.multipleTopics.length-1;j++){
						if(event == this.multipleTopics[j].order){
							item.relatedQuestions = ''
							this.$message({type: 'info',message: '关联题目不能一样'});
							return false
						}
					}
				}
				for(var i in this.chirmultipleTopics){
					if(event == this.chirmultipleTopics[i].id){
//						console.log(this.chirmultipleTopics[i].optiones)
						item.relatedQuestions = this.chirmultipleTopics[i].optiones.split(',')
						this.initAnswerList(index)
					}
				}
			},
//			关联题目的添加
			relatedaddOption(index,options) {
				if(options[index].order == ''){
					this.$message({type: 'info',message: '请选择关联的题目'});
					return false
				}
				options.push({
			        value: '关联题目',
			        order: '',
			        relatedQuestions:[]
			    })
			},
//			关联题目的删除
			relatedelOption(index, options){
				options.splice(index, 1)
				this.answerList.splice(index, 1)
			},
			initAnswerList(current) {
				this.$set(this.answerList, current, {
					questionId: this.multipleTopics[current].order,
					questionAnswer : ''
				})
			},
			relationJumpSave(){
				if(this.answerList.length!=0&&this.answerList.length<=1){
					this.$message({type: 'info',message: '请选择至少两个关联题目'});
					return false
				}
				if(this.answerList.length>1){
					for(var i in this.answerList){
						if(this.answerList[i].questionAnswer == ''){
							this.$message({type: 'info',message: '请选择关联题目或选项'});
							return false
						}
					}
				}
				let datas = [];
				for(var i in this.answerList){
					let cc = {
						paperId : this.paperObj.paperId,//试卷ID 
						skip : '是',//是否选项跳转
						questionId : this.answerList[i].questionId,//选中的问题id
						skipValue : this.answerList[i].questionAnswer,//跳转选项值
						skipQuestionId : this.relationJumpQuestionId,//跳转到问题ID
						sort : this.maxsort,//顺序
						isManySkip : '是',//是否多题跳转
					}
					datas.push(cc)
				}
				console.log(datas)
				let data = {
					paperId : this.paperObj.paperId,//试卷ID 
					questionId : this.relationJumpQuestionId,//选中的问题id
					json : JSON.stringify(datas)==='[]'?'':JSON.stringify(datas)
				}
				console.log(data)
				multiJumpSave(data).then(res => {
					if(res.code === 200) {
						this.relationJumpQuestionId = ''
						this.relationJumpShow = false
						this.$message({message: '保存成功',type: "success"});
						this._getPaper()
					}else{
						this.$message({type: 'info',message: '保存失败'});
					}
				})
			},
//			多题跳转结束
//			回填数据
			selectRoleChange(val) {
				for(var i in this.tableData){
					if(this.tableData[i].skipValue == val){
						this.tableData[i].skipQuestionId = this.state[val]
					}
				}
			},
			//		删除问卷题目
			deleteQuestion(index,event) {
				let data = {
					paperId : this.paperObj.paperId,//试卷ID 
					queId : event.id//选中的问题id
				}
				delPaperQuestion(data).then(res => {
					if(res.code === 200) {
						this.$message({message: '删除成功',type: "success"});
						this._getPaper()
					}else{
						this.$message({type: 'info',message: '删除失败'});
					}
				})
//				if(this.questionInfoList.length <= 1) {
//					this.errorPrompt(`每份问卷至少一个问题！`);
//					return;
//				}
			},
//			收藏题目
			questionCollect(index,event){
				let data = {
					questionId: event.id,//问题ID
					userId:storage.get(USERID_KEY)//用户ID
				}
				console.log(data)
				questionCollection(data).then(res => {
					console.log(res)
					if(res.code === 200) {
						this.$message({message: '保存成功',type: "success"});
						this.getCollectList()
					}else{
						this.$message({type: 'info',message: res.msg});
					}
				})
			},
//			删除用户收藏题目
			delCollect(event){
				this.$confirm('确认删除该收藏题目吗?', '提示', {
	                confirmButtonText: '确定',
	                cancelButtonText: '取消',
	                type: 'warning'
	            }).then(() => {
	            	let data = {
						id: event.remarks,//问题ID
					}
	            	console.log(data)
	                deleteCollection(data).then(res => {
						console.log(res)
						if(res.code === 200) {
							this.$message({message: '删除成功',type: "success"});
							this.getCollectList()
						}else{
							this.$message({type: 'info',message: res.msg});
						}
					})
	            });
			},
			
			switchItem(data) {
				changePaperQuestion(data).then(res => {
					if(res.code === 200) {
//						this.paperObj.paperId = res.data//问卷ID
						this.$message({message: '移动成功',type: "success"});
						this._getPaper()
					}else{
						this.$message({type: 'info',message: '移动失败'});
					}
				})
			},
			//		上移题目
			moveUp(index, array) {
				let data = {
					paperId : this.paperObj.paperId,//试卷ID 
					queId : array[index].id,//选中的问题id
					queTwoId : array[index-1].id,//被交换的问题id
					op : 'up'//操作
				}
				this.switchItem(data);
			},
			//		下移题目
			moveDown(index, array) {
				let data = {
					paperId : this.paperObj.paperId,//试卷ID 
					queId : array[index].id,//选中的问题id
					queTwoId : array[index+1].id,//被交换的问题id
					op : 'down'//操作
				}
				this.switchItem(data);
			},
//			删除选项
			deleteOption(index, options) {
//				if(options.length <= 1) {
//					this.errorPrompt(`每个问题至少一个选项`);
//					return;
//				}
				options.splice(index, 1)
			},
//			图片选择题型的添加
			picaddOption(options){
				options.push({imgurl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAABcCAYAAAABM8khAAAACXBIWXMAAAsSAAALEgHS3X78AAABS0lEQVR42u3dsW3rMBSG0Z+GB8gIHOEVHCCjZBSP4lHSm0VG4AjZ4KZRECCAG+dZgYPzAWoECRIOrlSwYauqaJ+OSTLn7Ek6jvs0xnhNkna5XPp2YmG5T3PO5zHG6yFJB3331pyzHzjs8htZSWDv2BPs/XqHvWOwYcMWbNiCDRu2YMMWbNiwBRu2YMMWbNiwBRu2/hx2a6231l5g71NPAluwYcMWbNiCDVuwYcMWbNi61vE3Htpa67l95a4n6a210433r6o6m2yT/f+rqpXkdONX8ZykV9Xp0bBNNmzYgg1bsGHDFmzYgg0btmBfaSU5PyL28dFeeFuePZtswYYNW7BhCzZswYYNW7BhCzZs2IINW7BhwxZs2IINW7B/o22r9XXItnMykrvWxxirVdWn/NN2vI0x3vn8eJr/bZ5fm9xX1dWL9KPW9/3sPwAswUi0SOZWuAAAAABJRU5ErkJggg==',texts:''})
			},
//			其他题型的添加
			addOption(options) {
//				if(options.length === 6) {
//					this.errorPrompt(`每个问题至多六个选项`);
//					return;
//				}
				options.push('')
				
			},
			showPrompt(text) {
				this.promptText = text;
				this.isShowPrompt = true;
			},
			//单击题目控件
			addQuestion(type) {
				this.editShow = true
				let template = JSON.parse(JSON.stringify(questionTemplate[type]))
				this.templateObj = template
				this.questionList.length = 0;
				this.questionList.push(template)
				this.dictList()
				if(type == 'cascade'){
					this.test = ''
				}
			},
//			保存题目
			* editSave(){
				let len = this.questionList.length;
				if(this.questionList.filter(item => item.title && item.title.trim()).length === len) {
					this.isShowTipsPrompt = false
					yield this.topicSave()
				} else {
					this.isShowTipsPrompt = true
				}
			},
			topicSave(){
				this.paperObj.id = this.questionList[0].id;//问题类型
				this.paperObj.type = this.questionList[0].type;//问题类型
				this.paperObj.title = this.questionList[0].title;//问题标题
				this.paperObj.remarks = this.questionList[0].remarks;//问题是否必填
				this.paperObj.templateClassify = this.paperInfo.templateClassify!=undefined?this.paperInfo.templateClassify:this.paperObj.templateClassify;//是否题库
				if(this.questionList[0].type == 'star'){
					let starTotalNum = []
					for(var i=Number(this.starName);i<Number(this.starName)+Number(this.starLevel);i++){
						starTotalNum.push(i)
					}
					this.questionList[0].optionArray = starTotalNum
					this.paperObj.optiones = starTotalNum.join(',')
					this.paperObj.starType = this.starListValue//量表的类型
				}else if(this.questionList[0].type == 'cascade'){
				    console.log(this.test.replace(/\s/gi, ''))
				    let aa = this.test.replace(/\s/gi, '')
				    let a = aa.split('1.').slice(1),e = []
				    for(var i in a){
				      	let b = a[i].split('2.').slice(1),c= []
				      	for(var j in b){
				            var formatChildren=[]
				            var child=b[j].split('3.').slice(1)
				            for(var h in child){
				            	var fourChildrenList=[]
				            	var fourchild=child[h].split('4.').slice(1)
				            	if(null!=fourchild&&fourchild.length>0){
					                fourchild.forEach(item => {
					                  fourChildrenList.push({
					                    value:item,
					                    label:item,
					                  })
					                })
					            }
				            	if(fourChildrenList == ''){
				            		var obj3 = {
				            			value:child[h].split('4.')[0],
				            			label:child[h].split('4.')[0],
				            		}
				            	}else{
				            		var obj3 = {
				            			value:child[h].split('4.')[0],
				            			label:child[h].split('4.')[0],
				            			children:fourChildrenList
				            		}
				            	}
				            	formatChildren.push(obj3)
				            }
//				           	如果children为空不显示
				            if(formatChildren == ''){
				            	var obj={
					                value:b[j].split('3.')[0],
					                label:b[j].split('3.')[0],
					            }
				            }else{
				            	var obj={
					                value:b[j].split('3.')[0],
					                label:b[j].split('3.')[0],
					                children:formatChildren
					            }
				            }
				       		c.push(obj)
				    	}
			            var obj2={
			              value:a[i].split('2.')[0],
			              label:a[i].split('2.')[0],
			              children:c
			            }
				     	e.push(obj2)
				    }
				     //console.log(JSON.stringify(e))
				     this.paperObj.optiones = JSON.stringify(e)
				     this.paperObj.cascadeText = this.test
				}else if(this.questionList[0].type == 'imgsel'){
					var array = [];
					for(var i in this.questionList[0].optionArray){
					    var obj = '';
						if(this.questionList[0].optionArray[i].imgurl == 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAABcCAYAAAABM8khAAAACXBIWXMAAAsSAAALEgHS3X78AAABS0lEQVR42u3dsW3rMBSG0Z+GB8gIHOEVHCCjZBSP4lHSm0VG4AjZ4KZRECCAG+dZgYPzAWoECRIOrlSwYauqaJ+OSTLn7Ek6jvs0xnhNkna5XPp2YmG5T3PO5zHG6yFJB3331pyzHzjs8htZSWDv2BPs/XqHvWOwYcMWbNiCDRu2YMMWbNiwBRu2YMMWbNiwBRu2/hx2a6231l5g71NPAluwYcMWbNiCDVuwYcMWbNi61vE3Htpa67l95a4n6a210433r6o6m2yT/f+rqpXkdONX8ZykV9Xp0bBNNmzYgg1bsGHDFmzYgg0btmBfaSU5PyL28dFeeFuePZtswYYNW7BhCzZswYYNW7BhCzZs2IINW7BhwxZs2IINW7B/o22r9XXItnMykrvWxxirVdWn/NN2vI0x3vn8eJr/bZ5fm9xX1dWL9KPW9/3sPwAswUi0SOZWuAAAAABJRU5ErkJggg=='){
							this.$message({type: 'info',message: '图片不能为空'});
							return false
						}
						this.questionList[0].optionArray[i].texts = this.questionList[0].optionArray[i].texts == ''?'""':this.questionList[0].optionArray[i].texts
			            obj = this.questionList[0].optionArray[i].imgurl+'*'+this.questionList[0].optionArray[i].texts;
						array.push(obj);
					}
					this.paperObj.optiones = array.join(',')
				}else{
					this.paperObj.optiones = this.questionList[0].optionArray.join(',');//问题选项逗号拼接
					this.paperObj.starType = null
				}
				if(this.subscriptNmu!=0){
					this.subscriptNmu = 0
				}else{
//					this.questionInfoList = this.questionInfoList.concat(this.questionList)//展示页面的信息列表
				}
//				console.log(this.paperObj)
				this._saveQuestion()
			},
//			是否是必填
			fillBtn(event){
				event.remarks = event.remarks == '是'?'否':'是'
			},
//			编辑题目
			problemShow(event,index){
				this.editShow = true
				this.questionList.length = 0;
				if(event.type == 'star'){
					this.questionList.push(event)
					this.dictList();
					this.starType = event.starType
					this.starName = event.optionArray[0]
				}else if(event.type == 'cascade'){
					this.questionList.push(event)
					this.test = event.cascadeText
				}else{
					this.questionList.push(event)
				}
				
				this.subscriptNmu = index
			},

			validatePaper() {
				if(!this.paperObj.paperTitle) {
					this.errorPrompt('请填写问卷标题')
					return false
				}

				if(!this.questionInfoList.length) {
					this.errorPrompt(`每份问卷至少一个问题！`)
					return false
				}

				let isAllQuestionFull = this.questionInfoList.every(item => {
					let emptyOptionList = item.optiones.filter(optiones => optiones === '')
					return item.title !== '' && !emptyOptionList.length
				})
				if(!isAllQuestionFull) {
					this.errorPrompt('请完善问卷题目内容！')
					return false
				}

				return true
			},
			* releasePaper() {
				yield(() => {
					this.showPrompt(`确认保存并发布问卷吗？`)
				})()
				yield this._releasePaper()
			},
//			获取问卷内容
			_getPaper() {
				let data = {
					id: this.$route.query.id||this.paperObj.paperId
				}
				this.isLoading = true
				userviewPaper(data).then(res => {
					console.log(res)
					this.isLoading = false
					if(res.code === 200) {
						if(this.$route.path === '/re-edit') {
							// 重新编辑模式下 初始化试卷的属性
							delete res.data['id']
							delete res.data['createdTime']
							res.data.status = 0
						}
						this.paperObj.paperId = res.data.paper.id//问卷ID
						this.paperObj.paperTitle = res.data.paper.title//问卷标题
						this.paperObj.paperSubTitle = res.data.paper.subtitle//问卷副标题
						this.paperObj.templateClassify = this.paperObj.templateClassify=='是'?'是':'否'
						this.questionInfoList = res.data.list
						for(var i in res.data.list){
							let b = []
							if(res.data.list[i].type == 'imgsel'){
								for(var j in res.data.list[i].optionArray){
									let c = []
									c.imgurl=res.data.list[i].optionArray[j].split('*')[0]
									c.texts=res.data.list[i].optionArray[j].split('*')[1]
									b.push(c)
								}
								res.data.list[i].optionArray = b
							}
						}
					}else{
						this.$message({type: 'info',message: res.msg});
					}
				})
			},
//			保存问卷题目
			_saveQuestion() {
				let data = this.paperObj
				saveQuestion(data).then(res => {
					if(res.code === 200) {
						this.editShow = false
						this.paperObj.paperId = res.data//问卷ID
						this._getPaper()
						this.$message({message: '保存成功',type: "success"});
					}else{
						this.$message({type: 'info',message: '保存失败'});
					}
				})
			},
//			保存问卷标题
			_savePaper() {
				let data = this.paperInfo
//				console.log(data)
				savePaper(data).then(res => {
					if(res.code === 200) {
						this.paperObj.paperId = res.data//问卷ID
						this._getPaper()
						this.$message({message: '保存成功',type: "success"});
					}else{
						this.$message({type: 'info',message: '保存失败'});
					}
				})
			},
//			取消问卷保存
			editCancel(){
				if(this.$route.query.id == undefined&&this.paperObj.paperId == ''){
					
				}else{
					this._getPaper()
				}
				
			},
			_releasePaper() {
				let data = {
			        id:this.paperObj.paperId,
			        status: '1'
			    }
//			    console.log(data)
			    updateRecycleStatus(this.$qs.stringify(data)).then(res => {
			        if (res.code === 200) {
			        	this.$message({message: '发布成功',type: "success"});
			        	this.$router.back(-1)
			        }else {
			        	this.$message({type: 'info',message: res.msg});
			        }
			    })
			},

			_uploadPaper() {
				let formData = new FormData()
				formData.append('file', this.excelFile)

				uploadPaper(formData).then(res => {
					if(res.code === 200) {
						this.$router.push({
							path: '/'
						})
					} else {
						this.showPrompt(res.msg)
					}
				})
			},

			subjectBtn(index) {
				this.subjectNmu = index;
			},
			dictList(){
				let data = {
					type:'star_type'
				}
				dictList(data).then(res => {
					if(res.code === 200) {
						this.starList = res.dictList
					}
				})
			},
			//获取题库列表信息
			getList() {
				this.isLoading = true
				getList().then(res => {
//					console.log(res)
					if(res.code === 200) {
						this.list = res.data
						this.isLoading = false
					}
				})
			},
			//获取收藏题目列表
			getCollectList() {
				this.isShowCollectList = !this.isShowCollectList
				if(this.isShowCollectList) {
					getCollectList().then(res => {
						console.log(res)
						if(res.code === 200) {
							this.collectList = res.data
						}
					})
				}
			},
			itemBankList(index){
				this.itemBankIndex = !this.itemBankIndex
				this.itemBankType = index
			},
//			上传图片开始
			onchangeImgFun (index,obj) {
				let reader = new FileReader();
				let file = event.target.files[0];
		        var formdata = new FormData()
		        formdata.append("file",file)
				//接口部分
				this.isLoading = true
				uploadFile(formdata).then(res => {
			        console.log(res);
			        this.isLoading = false
		        	if(res.code == 0){
	                    obj[index].imgurl=res.data.fullpath;
	                    this.$message({type: 'success',message: res.msg});
		        	}else{
		        		this.$message({type: 'info',message: res.msg});
		        	}
			    })
		    },
		},
	}
</script>

<style scoped lang="scss">
	@import '../style/_Edit';
	.pictureSelection{
		overflow: hidden;
		
		.pictureSeleOptionsList{
			width: 48%;
			float: left;
			.uploadPicture-list{
				width: 90px;
				height: 90px;
				overflow:hidden;
				padding: 0rem 1rem 1rem 2rem;
				position: relative; 
				.photobtn{
					width: 95%;
					padding: 2px 12px;
				    margin-right: 5px;
				    margin-bottom: 8px;
				    cursor: pointer;
				}
				.fileinp{
					cursor: pointer;
					width: 75%;
					height: 100%;
				    position: absolute;
				    top: 0;
				    opacity: 0;
				}
				.uploadPicture-content{
					width: 100%;
					height: 100%;
				}
			}
		}
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
	.mostiJump {
	    padding: 3rem 2rem;
	    .mostiJump-tlt{
	    	padding: 1rem !important;
	    }
	    .mostiJump-cont{
	    	padding: 1rem;
	    	.multiQuestionTitle{
	    		display: inline-block;
	    		width: 12%;
	    	}
	    	.el-select{
	    		padding : 0 1rem;
	    	}
	    	.multiQuestionBtn{
	    		cursor: pointer;
	    	}
	    	ol{
	    		padding-top: 1rem;
	    		padding-left: 14%;
	    	}
	    }
	}
	
</style>
<style scoped>
	/*刘喜瑞写的*/
	
	.mask {
		background-color: #000;
		opacity: 0.3;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1
	}
	
	.pop {
		background-color: #fff;
		position: fixed;
		top: 312px;
		left: 553px;
		width: calc(80% - 679px);
		height: calc(80% - 420px);
		z-index: 2
	}
	
	.btn {
		background-color: #fff;
		border-radius: 4px;
		border: 1px solid blue;
		padding: 4px 12px;
	}
	
	.editor_question {
		background-color: #fafafa;
		border: 1px red solid;
	}
	/*刘喜瑞写的结束*/
	.el-table--border{
		height: 450px !important;
		overflow-y: auto !important;
	}
	.qu-wrap > footer .ctrl-part{
		width: auto;
	}
	.options-list .starFrame{
		width: 15%;
		display: inline-block;
		border: 1px solid #EEEEEE;
	}
	textarea:disabled {
		background-color: #fff;
	}
	.optionText.setUpWidth{
		min-width: auto !important;
	}
	.options-list.starGauge {
		width: 60% !important;
		display: flex;
		flex-direction: row !important;
		justify-content: space-between;
	}
	.qu-wrap > footer{
		display: block;
		text-align: right;
		padding: 1.2rem 5rem;
	}
	.qu-wrap > footer .ctrl-part{
		display: inline-block;
		margin: 0rem 1rem;
	}
	.qu-wrap > footer .ctrl-part span[data-v-3594053a]:nth-of-type(1){
		padding: 0.2rem 1rem 0rem;
	}
	@media screen and (max-width: 1300px) {
		.scaleProblem{
			margin-top: 10px;
		}
	}
	.cascadecols-list{
	    white-space: nowrap;
        overflow-y: auto;
	}
</style>
<style>
	.el-upload-list--picture-card .el-upload-list__item,.el-upload--picture-card{
		width: 90px !important;
    	height: 90px !important;
    	line-height: 92px !important;
	}
	.el-upload-list--picture-card .el-upload-list__item{
		margin: 0 8px 0px 0 !important;
	}
</style>