<template>
	<div class="container">
		<div class="sub-header">
			<span class="hearder-back" @click="$router.back(-1)">返回</span>
			<span>废纸篓</span>
		</div>
		<div class="add-wrapper" v-if="!paperList.length">
			<p @click="addPaper()">+ 新建问卷</p>
		</div>
		<div class="list-wrapper" v-else>
			<ul>
				<li>标题</li>
				<li>创建时间</li>
				<li>回收量</li>
				<li>状态</li>
				<li>操作</li>
			</ul>
			<ul v-for="(paper,index) in paperList">
				<li>{{ paper.title }}</li>
				<li>{{ paper.createTime }}</li>
				<li>{{ paper.remarks }}</li>
				<li :class="paper.status | transformStatusClass">{{ paper.status | transformStatusText }}</li>
				<li>
					<a @click="showMenu(index)" class="operation">. . .</a>
					<ul class="listOperation hide" :class="{ show:index==current}">
						<li>
							<template>
								<span @click="iterator = recovery(paper); iterator.next()">恢复</span>
								<span @click="iterator = deleteItem(paper); iterator.next()">删除</span>
							</template>
						</li>
					</ul>
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
		
		<div class="overlay" v-show="isShowPrompt">
			<div class="prompt-box">
				<header>
					<span>提示</span>
					<a href="javascript:;" @click="isShowPrompt = false">&times;</a>
				</header>
				<p>{{ promptText }}</p>
				<footer>
					<span @click="iterator.next(); isShowPrompt = false">确定</span>
					<span @click="isShowPrompt = false" class="cancel">取消</span>
				</footer>
			</div>
		</div>
		<div class="overlay" v-show="isShowSharePrompt">
			<div class="prompt">
				<div class="prompt-header">
					<span>分享问卷</span>
					<a href="javascript:;" @click="isShowSharePrompt = false">&times;</a>
				</div>
				<div class="prompt-body">
					<div class="share-link">
						<a :href="shareLink" target="_blank">{{ shareLink }}</a>
					</div>
					<div class="share-qrcode">
						<canvas id="qrcode-canvas"></canvas>
					</div>
					<div class="share-desc">
						<span>(点击右键复制链接/二维码分享问卷)</span>
					</div>
				</div>
			</div>
		</div>
		<loader v-show="isLoading"/>
	</div>
</template>

<script>
import Loader from './Loader'
import { getPaperList, deletePaper,recovery,getRecycleList} from '../api'
import storage from '../public/js/storage'

const QRCode = require('qrcode')

export default {
	name: 'List',

	components:{
		'loader': Loader
	},

	filters: {
		transformStatusText(status) {
			return status === '0' ? '暂停回收' : (status === '1' ? '正在回收' : '已结束')
		},
		transformStatusClass(status) {
			return status === '0' ? 'unrelease' : (status === '1' ? 'released' : 'ended')
		},
	},

	data() {
		return {
			iterator: null,
			paperList: [],
			promptText: '',
			shareLink: '',
			current:-1,
			isShowPrompt: false,
			isShowSharePrompt: false,
			isLoading: false,
			pageInfo: { //分页
                currentPage: 1,
                pageSize: 10,
                pageTotal: 0
            },
		}
	},

	computed: {
		isCheckedAll() {
			return this.paperList.every(item => item.checked)
		}
	},

	created() {
		this._getPaperList()
	},

	methods: {
		addPaper() {
			this.$router.push('/')
		},

		viewPaper(id) {
			this.$router.push({path: '/view', query: {id}})
		},

		viewData(id) {
			this.$router.push({name: 'data', query: {id}})
		},

		showMenu(item) {
			this.current = this.current == item ? -1 : item;
		},
		
		showPrompt(text) {
			this.promptText = text;
			this.isShowPrompt = true;
			this.current=-1;
		},

		sharePaper(id) {
			let canvas = document.getElementById('qrcode-canvas')
			this.shareLink = `${window.location.origin}/questionnaire/#/fill?id=${id}`
			QRCode.toCanvas(canvas, this.shareLink, {
				width: 250
			}, function (error) {
				if (error) console.error(error)
			})
			this.isShowSharePrompt = true
		},

		*editItem(item) {
			yield this.showPrompt(`确认要编辑《${item.title}》？`);
			yield this.$router.push({name: 'edit', query: {id: item.id}});
		},

		*reEditItem(item) {
			yield this.showPrompt(`确认要重新编辑《${item.title}》？`);
			yield this.$router.push({path: 're-edit', query: {id: item.id}});
		},

		*deleteItem(item) {
			let index
			yield (() => {
				index = this.paperList.indexOf(item)
				this.showPrompt(`确认要删除《${item.title}》？`)
			})()
			yield this._deletePaper([item])
		},

		*deleteCheckedItems() {
			let checkedPaperList = this.paperList.filter(item => item.checked)
			if (!checkedPaperList.length) {
				yield this.showPrompt('未选择问卷')
			} else {
				yield this.showPrompt('确认要删除所选问卷？')
				yield this._deletePaper(checkedPaperList)
			}
		},

		_getPaperList() {
			this.isLoading = true
			let config = {
				params: {
					page:this.pageInfo.currentPage,
					limit:this.pageInfo.pageSize
				}
			}
			getRecycleList(config).then(res => {
				console.log(res)
				this.isLoading = false
				if (res.code === 200) {
					this.pageInfo.pageTotal = res.count
		          	this.paperList = res.data;
		        }
			})
		},

		_deletePaper(list) {
			let idList = list.map(item => item.id)
			let data = { idList }
			deletePaper(idList).then(res => {
				console.log(res)
				if (res.code === 200) {
					this._getPaperList()
				}
			})
		},
	    //恢复废纸篓里的问卷
	    *recovery(item){
	      yield (() => {
	        this.showPrompt(`确定要恢复问卷《${item.title}》吗?`)
	      })()
	      recovery(item.id).then(res => {
	        if (res.code === 200) {
	          this._getPaperList()
	        }
	        else {
	          this.$message({type: 'info',message: '操作失败'});
	        }
	      })
	    },
    	/**
         * 分页大小切换
         */
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this._getPaperList();
        },
        /**
         * 分页切换
         */
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this._getPaperList();
        },
	}
}
</script>

<style scoped lang="scss">
@import '../style/public.scss';
@import '../style/_List.scss';
.listOperation.hide{
	display: none;
}
.listOperation.show{
	display: block !important;
	height: auto;
    width:31%;
    background-color: #fff !important;
	padding: 10px;
    border: 1px solid #eee;
    position: relative;
	top: -30px;
	left: 27px;
	box-shadow: 1px 1px 15px 2px #eee;
}
.listOperation li span{
	display: block;
	margin: 5px auto;
	border:none;
}
.operation{
	border: 1px solid #eee;
    padding: 0.5rem 1rem 1rem 1rem;
    border-radius: 5px;
  	cursor: pointer;
  }
.sub-header{
	text-align: center;
	padding:0 10rem;
}
.sub-header .hearder-back{
	cursor: pointer;
	float: right;
	border: 1px solid #eee;
    line-height: 3.5rem;
    padding: 0 2rem;
    position: relative;
    top: 1rem;
}
</style>
