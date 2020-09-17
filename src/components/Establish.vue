<template>
  <div class="establish_content">
    <div class="establish_title">
      <div class="temp1">
        <div class="type_show"></div>
        <h2>创建空白问卷</h2>
        <h3>从一份空白问卷开始创建</h3>
        <a @click="addPaper()">开 始</a>
      </div>
      <div class="temp2">
        <div class="type_show"></div>
        <h2>选择问卷模板</h2>
        <h3>使用提供的专业模板</h3>
        <a @click="addTemplate()">开 始</a>

      </div>
    </div>
    <div class="establish_template">
      <h2>为您推荐</h2>
      <div class="row">
      	<p v-if="!getTemplateClassifyPaperList.length">
      		暂无数据
      	</p>
        <ol v-else>
          <li v-for="(paper,index) in getTemplateClassifyPaperList">
            <a>
              <span class="title" @click="handleEdit(paper)">{{paper.title}}</span>
              <span class="ext">{{paper.remarks}}个问题</span>
            </a>
          </li>
        </ol>
      </div>

    </div>
  </div>
</template>

<script>
  import Loader from './Loader'
  import {getTemplateClassifyPaperList,templatepaperId} from '../api'

  export default {
    name: 'Establish',
    components: {
      'loader': Loader
    }, data() {
      return {
        iterator: null,
        getTemplateClassifyPaperList: [],
        promptText: '',
        shareLink: '',
        current: -1,
        isShowPrompt: false,
        isShowSharePrompt: false,
        isLoading: false
      }
    }, created() {
      this._getTemplateClassifyPaperList()
    },
    methods: {
      //空白问卷
      addPaper() {
        this.$router.push('/add')
      },
      //空白模板
      addTemplate() {
      	this.$router.push('/template')
      },
//    获取推荐模板
      _getTemplateClassifyPaperList() {
        this.isLoading = true
        //首页推荐5个模板
        let config={
     			params: {
           			page: 1,
           			limit: 5
     			}
   			}
        getTemplateClassifyPaperList(config).then(res => {
          this.isLoading = false
          if (res.code === 200) {
            this.getTemplateClassifyPaperList = res.data
          }
        })
      },
//			模板详情
			handleEdit(rowData) {
				this.$confirm('确定使用该模板?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
//          type: 'warning'
        }).then(() => {
        	let data = {
						paperId:rowData.id
					}
					templatepaperId(data).then(res =>{
						if(res.code = 200){
							this.$router.push({name: 'edit', query: {id: res.data}})
						}else{
							
						}
						
					})
        }).catch(() => {
        	
        });
      },
    }
  }
</script>

<style scoped lang="scss">
  @import '../style/Establish.scss';
</style>
