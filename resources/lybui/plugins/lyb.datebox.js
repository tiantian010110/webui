//TODO 日历组件
lyb.DateBox = function(id) {
	lyb.DateBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.DateBox, lyb.PopupEdit, {
	type: 'datebox',
	_initField: function() {
		lyb.DateBox.superClass._initField.call(this);
		this.defaultView = this.defaultView || 'month';
	},
	_init: function() {
		lyb.DateBox.superClass._init.call(this);
		this._renderDatePicker();
		this.errorEl.css('right', 40);
	},
	_renderEditButton: function(type){
		var hide = '';
		if(this.readonly || this.disabled){
			hide = 'display: none;';
		}
		return '<span class="edit-button" style="'+ hide +'"><i class="icon clear"></i><i class="icon icon-calendar"></i></span>';
	},
	_renderDatePicker: function() {
		var _uuid = lyb.getUUID();
		var html = ['<div id="' + _uuid + '" class="lyb-datepicker" '];
		if(this.startDate) {
			html.push('data-start-date="' + this.startDate + '" ');
		}
		if(this.endDate) {
			html.push('data-end-date="' + this.endDate + '" ');
		}
		if(this.pickerSize) {
			html.push('data-picker-size="' + this.pickerSize + '" ');
		}
		if(this.defaultView) {
			html.push('data-default-view="' + this.defaultView + '" ');
		}
		if(this.format) {
			html.push('data-format="' + this.format + '" ');
		}
		html.push('style="display: none;position: absolute;z-index: 10;left: 0;"></div>');
		this.datePickerEl = jQuery(html.join(''));
		this.datePickerEl.appendTo(this.el);
		this.datePicker = new lyb.DatePicker(_uuid);
	},
	_destroy: function(){
		this.datePicker._destroy();
		lyb.DateBox.superClass._destroy.call(this);
	},
	_bindEvents: function() {
		lyb.DateBox.superClass._bindEvents.call(this);
		this._on(this.el, '.textbox-border', 'click', this._onEditButtonClick, this);
		this.datePicker.bind('click', this._onDatePickerClick, this);
		this.datePicker.bind('clear', this._onDatePickerClear, this);
		this.datePicker.bind('select', this._onDatePickerSelect, this);
		lyb.globalEvents.pushEvent([this.__hideElement, this, this._uuid], 'click');
	},
	__hideElement: function(){
		if(!/hh:mi/i.test(this.format)){
			this.datePicker._hide();
		}
	},
	_onDatePickerClick: function(e) {
		this._setValue(e.value);
		this._validate();
		e.sender = this;
		this._fire('change', e);
	},
	_onDatePickerClear: function(e) {
		this._setValue('');
		this._validate();
		e.sender = this;
		this._fire('clear', e);
	},
	_onDatePickerSelect: function(e) {
		this._setValue(e.value);
		!e.preventClose && this.datePicker._hide();
		this._validate(this.value);
		e.sender = this;
		this._fire('select', e);
	},
	_onEditButtonClick: function(e) {
		if(!this.allowPopup){
			this.datePicker._hide();
			return;
		}
		if(this.datePickerEl.css('display') == 'block') {
			e.stopPropagation();
		}
		var that = this;
		//用异步的方式解决document.body的click事件
		window.setTimeout(function() {
			var top = that.el.height();
			that.datePickerEl.css('top', top);
			var value = that.value;
			if(value === ''){
				value = lyb.formatDate(that.datePicker.format, new Date());
			}
			that.datePicker._setValue(value);
			that.datePicker._show(that.el);
		}, 0);
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['startDate', 'endDate', 'defaultView', 'format'],
			number: ['pickerSize']
		}, attributes);
		return lyb.DateBox.superClass._getAttrs.call(this, attrs);
	},
	_setStartDate : function(startDate) {
		this.datePicker._setStartDate(startDate);
	},
	_setEndDate : function(endDate) {
		this.datePicker._setEndDate(endDate);
	},
	_setValidDate : function(startDate, endDate) {
		this.datePicker._setValidDate(startDate, endDate);
	},
	_resetValidDate : function() {
		this.datePicker._resetValidDate();
	},
	destroy: function(){
		this._destroy();
	},
	setStartDate : function(startDate) {
		this._setStartDate(startDate);
	},
	setEndDate : function(endDate) {
		this._setEndDate(endDate);
	},
	setValidDate : function(startDate, endDate) {
		this._setValidDate(startDate, endDate);
	},
	resetValidDate : function() {
		this._resetValidDate();
	}
});
lyb.Register(lyb.DateBox, 'datebox');