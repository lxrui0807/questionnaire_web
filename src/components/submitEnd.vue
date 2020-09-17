<template>
	<div class="root-container">
		<div class="skin normal">
			<div class="page-end-content">
				<div></div>
				<h3>问卷到此结束，感谢您的参与！</h3>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'SubmitEnd',
		mounted () {
		    if (window.history && window.history.pushState) {
		        // 向历史记录中插入了当前页
		        history.pushState(null, null, document.URL);
		        window.addEventListener('popstate', this.goBack, false);
		    }
		},
		destroyed () {
		    window.removeEventListener('popstate', this.goBack, false);
		},
		methods: {
		    goBack () {
		        // console.log("点击了浏览器的返回按钮");
		        history.pushState(null, null, document.URL);
		    },
		}
	}
</script>

<style>
	.root-container{
		position: fixed;
		width: 100%;
		height: 100%;
	  	top: 0;
	  	bottom: 0;
	  	margin: 0;
	  	background-color: #f9f9f9;
		overflow: auto;
		z-index: 999;
	}
	.skin{
		position: absolute;
	    top: 0;
	    left: 0;
	    width: 100%;
	    height: 100%;
	}
	.page-end-content{
		width: 100%;
	    position: absolute;
	    top: 50%;
	    left: 50%;
	    transform: translate(-50%, -50%);
	    overflow: auto;
	    padding: 100px 20px 150px;
	    box-sizing: border-box;
	    text-align: center;
	    max-height: 100%;
	}
</style>