/**
 * Created by Administrator on 2016/8/24 0024.
 */
// Loading 通知组件
lyb.Loading = function(id) {
	lyb.Loading.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Loading, lyb.Root, {
	type: 'loading',
	_init: function(){
		this.borderEl = jQuery(this._render());
		this.borderEl.appendTo(this.el);
	},
	_render: function(){
		var html = '<div class="loading-mask" style="display: flex;align-items: center;justify-content: center;">';
		html += '<div class="loading-loader"></div>';
		html += '</div>';
		return html;
	},
	_show: function(parent){
		
	},
	_hide: function(){
		
	},
    _destroy: function(){
    	this._fire('destroy');
		lyb.Loading.superClass._destroy.call(this);
    }
});
lyb.Register(lyb.Loading, 'loading');