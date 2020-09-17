<template>
	<div class="container">
		<div class="sub-header">
			<p @click="addPaper()">+ 新建问卷</p>
			<p @click="recycleList()">废纸篓</p>
		</div>
		<div class="add-wrapper" v-if="!paperList.length">
			<span>
				<img src="../assets/empty.png" />
			</span>
			<!--<p @click="addPaper()">+ 新建问卷</p>-->
		</div>
		<div class="list-wrapper" v-else>
			<ul style="font-weight: 600;">
				<li>标　题</li>
				<li>创建时间</li>
				<li>回收量</li>
				<li>状　态</li>
				<li>操　作</li>
			</ul>
			<ul v-for="(paper,index) in paperList">
				<li>{{ paper.title }}</li>
				<li>{{ paper.createTime }}</li>
				<li>{{ paper.remarks }}</li>
				<li :class="paper.status | transformStatusClass">{{ paper.status | transformStatusText }}</li>
				<li>
					<a @click="showMenu(index)" class="operation" title="请单击进行编辑">. . .</a>
					<ul class="listOperation hide" :class="{ show:index==current}">
						<li>
							<template v-if="paper.status === '0'&&paper.delFlag ==='0'">
				                <span @click="iterator = updateRecycleStatus(paper); iterator.next()">开始回收</span>
				                <span @click="viewData(paper.id)">在线统计</span>
				                <span @click="viewPaper(paper.id)">查看问卷</span>
				                <span @click="iterator = editItem(paper); iterator.next()">编辑</span>
				                <span @click="iterator = exportData(paper.id); iterator.next()">导出</span>
				                <span @click="printPaper(paper.id)">打印</span>
				                <span @click="iterator = moveBasket(paper); iterator.next()">移动到废纸篓</span>
							</template>

							<template v-else-if="paper.status === '1'&&paper.delFlag ==='0'">
				                <span @click="iterator = updateRecycleStatus(paper); iterator.next()">暂停回收</span>
				                <span @click="iterator = sharePaper(paper.id)">投放问卷</span>
				                <span @click="viewData(paper.id)">在线统计</span>
				                <span @click="viewPaper(paper.id)">查看问卷</span>
				                <span @click="iterator = exportData(paper.id); iterator.next()">导出</span>
				                <span @click="printPaper(paper.id)">打印</span>
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
          <!--<span @click="ok(); isShowPrompt = false" class="ok">确定</span>-->
					<span @click="isShowPrompt = false" class="cancel">取消</span>
				</footer>
			</div>
		</div>
		<div class="overlay" v-show="isShowSharePrompt">
			<div class="prompt" style="width: 600px">
				<div class="prompt-header">
					<span>分享问卷</span>
					<a href="javascript:;" @click="isShowSharePrompt = false">&times;</a>
				</div>
				<div class="prompt-body">
					<div class="share-qrcode" id="target">
						<canvas id="qrcode-canvas"></canvas>
					</div>
					<div class="share-content">
						<div class="share-link">
							<a :href="shareLink" target="_blank">{{ shareLink }}</a>
						</div>
						<div class="share-type">
							<p>
								<a href="javascript:void(0);" @click="shareWeixin()" title="微信分享">
									<img src="../assets/weixin.png" alt="微信分享" />
								</a>
							</p>
							<p>
								<a href="javascript:void(0);" @click="shareOther()" title="分享到QQ空间">
									<img src="../assets/qz.png" alt="分享到QQ空间" />
								</a>
							</p>
							<p>
								<a href="javascript:void(0);" @click="shareWeibo()" title="分享到QQ">
									<img src="../assets/qq.png" alt="分享到QQ" />
								</a>
							</p>
							<p class="down-qrode">
								<button @click="download">下载二维码</button>
							</p>
						</div>
						<div class="weixin-overlay"v-show="Weixinqrcode">
							<canvas id="qrcode-weixin"></canvas>
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
import { getPaperList, deletePaper,updateRecycleStatus,moveBasket,getRecycleList,exportAnswer} from '../api'

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
			Weixinqrcode:false,
			shareWeixinqrcode:'',
			shareMach:'',
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
//		微信的分享
		shareWeixin(){
			this.Weixinqrcode = !this.Weixinqrcode
			let canvas = document.getElementById('qrcode-weixin')
			QRCode.toCanvas(canvas,this.shareWeixinqrcode, {
				width: 100
			}, function (error) {
				if (error) console.error(error)
			})
		},
//		QQ空间
		shareOther(){
			window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+this.shareMach+'&title=分享问卷');
		},
//		QQ
		shareWeibo(){
//			let yy = 'http://192.168.0.75:8080/#/fill?id=1245237710776967170'
//			let xx = 'https%3A%2F%2Fwj.qq.com%2Fs2%2F5774829%2Fdaab%2F'
//			console.log(document.location.href)
			window.open('http://connect.qq.com/widget/shareqq/index.html?url='+this.shareMach+'&sharesource=qzone&title=123&pics=456')//QQ的分享
//			window.open('http://service.weibo.com/share/share.php?url='+xx+'&appkey='你的kay)//微博的分享需要kay
		},
		addPaper() {
			this.$router.push('/')
		},
//		查看问卷
		viewPaper(id) {
			this.$router.push({path: '/seeView', query: {id}})
		},
//		打印问卷
		printPaper(id) {
			let routeData = this.$router.resolve({ path: '/seeView', query: {id,print:true}});
			window.open(routeData.href, '_blank');
			this.current=-1;
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
			this.current=-1;
			let canvas = document.getElementById('qrcode-canvas')
			let sourceShare = `${window.location.origin}/#/fill?id=${id}`
			this.shareLink = `${window.location.origin}/#/fill?id=${id}&source='website'`
			this.shareWeixinqrcode = sourceShare
			this.shareMach = `${window.location.origin}/%23/fill?id%3d${id}`//#、=等一些符号需要转化成特殊字符
			QRCode.toCanvas(canvas, sourceShare, {
				width: 200
			}, function (error) {
				if (error) console.error(error)
			})
			this.isShowSharePrompt = true
		},
		
		download(){
			var canvasData = document.getElementById('target').children;
	        var a = document.createElement("a");
	        a.href = canvasData[0].toDataURL();;
	        a.download = "drcQrcode";
	        a.click();
		},

		*editItem(item) {
			yield this.showPrompt(`确认要编辑《${item.title}》？`);
			yield this.$router.push({name: 'edit', query: {id: item.id}});
		},

		*reEditItem(item) {
			yield this.showPrompt(`确认要重新编辑《${item.title}》？`);
			yield this.$router.push({path: 're-edit', query: {id: item.id}});
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
			console.log(config)
			getPaperList(config).then(res => {
				this.isLoading = false
				if (res.code === 200) {
					this.pageInfo.pageTotal = res.count
					this.paperList = res.data
				}
			})
		},

		_deletePaper(list) {
			let idList = list.map(item => item.id)
			let data = { idList }
			deletePaper(idList).then(res => {
				if (res.code === 200) {
					if (res.data === 0) {
						this._getPaperList()
					}
				}
			})
		},
	    //开始回收/暂停回收操作
	    *updateRecycleStatus(item){
	      yield (() => {
	        if(item.status==='1'){
	          this.showPrompt(`暂停回收期间，问卷链接关闭，问卷不回收数据。确定要暂停回收问卷《${item.title}》吗？`)
	        }else {
	          this.showPrompt(`要开始回收问卷《${item.title}》吗？`)
	        }
	      })()
	      let data = {
	        id:item.id,
	        status: item.status==='1'?'0':'1'
	      }
	       updateRecycleStatus(this.$qs.stringify(data)).then(res => {
	        if (res.code === 200) {
	          this._getPaperList()
	        }else {
	          this.showResult('error', res.msg)
	        }
	      })
	    },
	    //移动到废纸篓
	    *moveBasket(item){
	      yield (() => {
	        if(item.status==='1'){
	          this.showPrompt(`确定要将问卷《${item.title}》移动到废纸篓吗?`)
	        }else {
	          this.showPrompt(`要开始回收问卷《${item.title}》吗？`)
	        }
	      })()
	      moveBasket(item.id).then(res => {
	        if (res.code === 200) {
	          this._getPaperList()
	        }else {
	          this.showResult('error', res.msg)
	        }
	      })
	    },
	//  跳转到废纸篓页面
	    recycleList() {
	    	this.$router.push('/wastepaper')
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
      *exportData(id){
        yield this.showPrompt('确认要导出信息吗？')
        yield this._exportAnswer(id)
      },
      //回收信息列表导出
      _exportAnswer(id){
        exportAnswer(id)
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
  .el-pagination{
  	height: 5rem !important;
  	padding: 1rem 5rem;
  }
  .overlay .prompt .prompt-body{
  	overflow: hidden;
  	padding: 0 1.5rem 1.5rem;
  }
  .share-qrcode{
  	width: 30%;
  	float: left;
  }
  .share-content{
  	width: 70%;
  	float: left;
  	position: relative;
  }
  .share-content .share-link{
  	padding: 2rem 0;
  }
  .share-type p{
  	width: 30px;
  	display:inline-block;
  	padding: 1rem 2rem;
  }
  .share-type p img{
  	width: 100%;
  }
  .share-type .down-qrode{
  	width: 100%;
  	display: block;
  	padding: 0;
  }
  .share-type .down-qrode button{
  	background-color: #FFFFFF;
  	border: 1px solid #eee;
  	padding: 1rem 2rem;
  }
  .weixin-overlay{
  	position: absolute;
    bottom: -29%;
    left: 18%;
  }
</style>
