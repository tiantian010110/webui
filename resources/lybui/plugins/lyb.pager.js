/**
 * Created by Administrator on 2016/8/23 0023.
 */
// Pager 分页组件
lyb.Pager = function (id) {
    lyb.Pager.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Pager, lyb.Root, {
    type: 'pager',
    _init: function () {
        this.borderEl = jQuery('<div class="pager-border"></div>').appendTo(this.el);
        this._render();
        this.setData(0);
    },
    _initField: function () {
        this.pageNum = 1;
        this.pageSize = lyb.getValid(this.pageSize, 20);
        this.pageList = [10, 20, 50, 100, 500, 1000];
        this.pageTotal = 1;
    },
    _render: function(){
    	this.leftEl = jQuery('<div class="pager-left" style="float: left;"></div>').appendTo(this.borderEl);
    	this.centerEl = jQuery('<ul class="pager-center"></ul>').appendTo(this.borderEl);
    	this.rightEl = jQuery('<div class="pager-right" style="float: right;"></div>').appendTo(this.borderEl);
    	this._renderPageSize();
    	this._renderPager();
    },
    _renderPager: function () {
    	this._renderControl();
    	this._renderInfo();
    },
    _renderPageSize: function(){
    	var size = jQuery('<div class="lyb-combobox pager-size" data-show-empty="false" data-value="'+ this.pageSize +'" style="width: 100px;height: 24px;line-height: 24px;"></div>').appendTo(this.leftEl);
        this.sizeBox = new lyb.ComboBox(size);
        this.sizeBox.setData(this._makePageList());
    },
    _renderControl: function(){
    	var array = [];
    	array.push('<ul class="pager-center">');
	    array.push('<li class="pager-split"><a href="javascript:void(0)"></a></li>');
	    if (this.pageNum <= 1){
	        array.push('<li class="pager-first disabled"><a class="icon icon-fast-backward" href="javascript:void(0)"></a></li>');
	        array.push('<li class="pager-prev disabled"><a class="icon icon-backward" href="javascript:void(0)"></a></li>');
	    }else{
	        array.push('<li class="pager-first enable"><a class="icon icon-fast-backward" href="javascript:void(0)"></a></li>');
	        array.push('<li class="pager-prev enable"><a class="icon icon-backward" href="javascript:void(0)"></a></li>');
	    }
	    if (this.pageNum >= this.pageTotal){
	    	array.push('<li class="pager-next disabled"><a class="icon icon-forward" href="javascript:void(0)"></a></li>');
	        array.push('<li class="pager-last disabled"><a class="icon  icon-fast-forward" href="javascript:void(0)"></a></li>'); 
	    }else{
	    	array.push('<li class="pager-next enable"><a class="icon icon-forward" href="javascript:void(0)"></a></li>');
	        array.push('<li class="pager-last enable"><a class="icon  icon-fast-forward" href="javascript:void(0)"></a></li>');
	    }
	    array.push('<li class="pager-split"><a href="javascript:void(0)"></a></li>');
	    array.push('<li class="pager-reload enable"><a class="icon icon-refresh" href="javascript:void(0)"></a></li>');
	    
	    array.push('</ul>');
	    this.centerEl.html(array.toString());
    },
    _renderInfo: function(){
    	var array = [];
        array.push('<span>第 <input value="' + this.pageNum + '" type="text" class="pager-num"> / ' + this.pageTotal + ' 页 , </span>');
        array.push('<span>共<span class="total"> ' + this.total + ' </span> 条</span>');
        this.rightEl.html(array.toString());
    },
    _makePageList: function(){
    	var result = [];
    	for(var i=0,len=this.pageList.length;i<len;i++){
    		var index = this.pageList[i];
    		result.push({id: index, value: '每页' + index + '条'})
    	}
    	return result;
    },
    _setData: function (total) {
    	this.total = lyb.getValid(total, 1);
        this.pageTotal = Math.ceil( this.total / this.pageSize); // 总页数
        this.pageTotal = isNaN(this.pageTotal) ? 1 : this.pageTotal;
        this._renderPager();
    },
    setPageSize: function(array){
    	this.pageList = array;
    	this.sizeBox.setData(this._makePageList());
    },
    _bindEvents: function () {
        this._on(this.borderEl, ".pager-first", "click", this._onFirstPageClick, this);
        this._on(this.borderEl, ".pager-last", "click", this._onLastPageClick, this);
        this._on(this.borderEl, ".pager-prev", "click", this._onPrevPageClick, this);
        this._on(this.borderEl, ".pager-next", "click", this._onNextPageClick, this);
        this._on(this.borderEl, ".pager-num", "keydown", this._onNumberEnter, this);
        this._on(this.borderEl, ".pager-num", "input propertychange", this._onNumberInput, this);
        this._on(this.borderEl, ".pager-reload", "click", this._onRloadClick, this);
        
        this.sizeBox.bind('change', this._onSizeChange, this);
    },
    _onNumberInput: function (e) {
    	var selector = e.selector;
    	var value = selector.val().replace(/[^1-9]/, '');
    	if(value === ''){
    		value = this.pageNum;
    	}
    	selector.val(value);
    	if(value < 1 || value > this.pageTotal){
    		selector.val(this.pageNum);
    		return;
    	}
    },
    _onNumberEnter: function (e) {
    	var selector = e.selector;
    	var value = selector.val().replace(/[^1-9]/, '');
    	var keycode = e.event.keyCode || e.event.which;
    	if(keycode == 13){
    		if(value !== this.pageNum){
    			this.pageNum = value;
    			e.pageNum = this.pageNum;
    			e.pageSize = this.pageSize;
    			this._renderPager();
    			this._fire('pagechange', e);
    		}
    	}
    },
    _onFirstPageClick: function (e) {
    	var selector = e.selector;
    	if(this.pageNum > 1){
    		this.pageNum = 1;
    		e.pageNum = this.pageNum;
    		e.pageSize = this.pageSize;
    		this._renderPager();
    		this._fire('pagechange', e);
    	}
    },
    _onLastPageClick: function (e) {
    	var selector = e.selector;
    	if(this.pageNum < this.pageTotal){
        	this.pageNum = this.pageTotal;
        	e.pageNum = this.pageNum;
        	e.pageSize = this.pageSize;
        	this._renderPager();
        	this._fire('pagechange', e);
    	}
    },
    _onPrevPageClick: function (e) {
    	var selector = e.selector;
        if(this.pageNum > 1){
	    	this.pageNum = --this.pageNum;
	    	e.pageNum = this.pageNum;
	    	e.pageSize = this.pageSize;
	    	this._renderPager();
	    	this._fire('pagechange', e);
        }
    },
    _onNextPageClick: function (e) {
    	var selector = e.selector;
    	if(this.pageNum < this.pageTotal){
	    	this.pageNum = ++this.pageNum;
	    	e.pageNum = this.pageNum;
	    	e.pageSize = this.pageSize;
	    	this._renderPager();
	    	this._fire('pagechange', e);
    	}
    },
    _onSizeChange: function (e) {
    	e.stopPropagation();
        var size = e.value;
        this.pageSize = Number(size);
        this.pageNum = 1;
        e.pageNum = this.pageNum;
        e.pageSize = this.pageSize;
        this._renderPager();
        this._fire('pagechange', e);
    },
    _onRloadClick: function (e) {
    	e.stopPropagation();
    	var el = e.selector;
    	this.pageNum = 1;
    	e.pageNum = this.pageNum;
    	e.pageSize = this.pageSize;
    	this._renderPager();
    	this._fire('reload', e);
    },
    setData: function (total) {
        this._setData(total);
    },
    setPageSize: function(array){
    	this._setPageSize(array);
    }
});
lyb.Register(lyb.Pager, 'pager');
