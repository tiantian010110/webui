/**
 * @author 田鑫龙
 */
// 富文本编辑
lyb.RichText = function(id) {
	lyb.RichText.superClass.constructor.call(this, id);
};

lyb.extend(lyb.RichText, lyb.TextBox, {
	uiCls : 'lyb-richtext',
	type: 'richtext',
	_init: function() {
		lyb.RichText.superClass._init.call(this);
		this.borderEl.css({'height': 'auto', 'padding': 0});
		this.errorEl.css({'top': 'initial','bottom': 2});
		this._create();
	},
	_initField : function() {
		lyb.RichText.superClass._initField.call(this);
		this.height = this.height < 160 ? 160 : this.height;
		this.width = this.width < 400 ? 400 : this.height;
		this.uploadLimit = this.uploadLimit || 10;
	},
	_renderEditButton: function(type){
		return '<span class="hide-button"></span>';
	},
	_renderEditor: function(){
		var height = this.el.height() - 3 || 100;
		return '<div id="'+ lyb.getUUID() +'" style="height:'+ height +'px;">'+ this.value +'</div>';
	},
	_create : function() {
		var that = this;
		var menus = [ 'fontfamily', 'fontsize', 'bold', 'underline', 'italic', 'strikethrough', 'eraser',
		'forecolor', 'bgcolor','quote', 'head', 'link', 'unlink', 'unorderlist',
		'orderlist', 'alignleft', 'aligncenter', 'alignright', 'table', 'undo', 'redo', 'fullscreen' ];
		
		this.editor = new wangEditor(this.textEl[0].id);
		this.editor.config.hideLinkImg= true;
		if(this.uploadImgUrl){
			if(this.allowImg){
				menus.splice(17, 0, 'img');
			}
			this.editor.config.uploadImgUrl = this.uploadImgUrl;
		}
		this.editor.config.uploadImgFns.onload= function (resultText, xhr) {
	        // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
	        // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
	        var originalName = this.uploadImgOriginalName || '';  

	        // 如果 resultText 是图片的url地址，可以这样插入图片：
			this.command(null, 'insertHtml', '<img src="' + resultText + '" alt="' + originalName + '" style="max-width:100%;"/>');
	        
	        //this.command(null, 'InsertImage', resultText);// 如果不想要 img 的 max-width 样式，也可以这样插入：
	    };
	    this.editor.config.uploadImgFns.ontimeout= function (xhr) {
	        alert('上传超时');
	    };
	    this.editor.config.uploadImgFns.onerror= function (xhr) {
	        alert('上传错误');
	    };
	    if(!this.fullMenus)
	    	this.editor.config.menus = menus;
	    this.editor.onchange = function () {
	        that._onTextChange.call(that, {sender: that, sender: that, value: this.$txt.html()});
	    };
		this.editor.create();
		this.textEl = this.editor.$txt;
	},
	_bindEvents : function() {
		lyb.RichText.superClass._bindEvents.call(this);
	},
	_onTextChange: function(e){
		var _value = this.value;
		this.value = e.value;
		this._validate(this.value.replace(/<p><br><\/p>/g, ''));
        if(_value !== e.value){
        	this._fire('input', e);
        }
	},
	_getText : function() {
		return this.textEl.text();
	},
	_setValue : function(value) {
		this.value = value;
		this.textEl.html(value);
	},
	_getAttrs : function(attributes) {
		var attrs = lyb.concat({
			str : [ 'uploadImgUrl' ],
			bool : ['allowImg', 'fullMenus'],
			json : [ 'menus' ],
			number: ['uploadLimit', 'height']
		}, attributes || {});
		return lyb.RichText.superClass._getAttrs.call(this, attrs);
	},
	getText : function() {
		return this._getText();
	}
});

lyb.Register(lyb.RichText, 'richtext');
