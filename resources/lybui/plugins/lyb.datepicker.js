//TODO 日期控件
lyb.DatePicker = function(id) {
	this.monthDay = [ 31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
	this._dayTime = 1000 * 24 * 60 * 60;
	this._time = {};
	this.weekNames = [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ];
	lyb.DatePicker.superClass.constructor.call(this, id);
	if (this.autoLoad)
		this._renderPicker();
};
lyb.extend(lyb.DatePicker, lyb.Root, {
	type : 'datepicker',
	_init : function() {
		lyb.DatePicker.superClass._init.call(this);
		this.borderEl = jQuery('<div class="datepicker-border"></div>').appendTo(this.el);
		this.headEl = jQuery('<div class="datepicker-head"></div>').appendTo(this.borderEl);
		this.bodyEl = jQuery('<div class="datepicker-body"></div>').appendTo(this.borderEl);
		this.footEl = jQuery('<div class="datepicker-foot" style="display: none;"></div>').appendTo(
				this.borderEl);
		this.selectEl = jQuery(
				'<div class="datepicker-selector" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;display: none;"></div>')
				.appendTo(this.borderEl);
	},
	_initDefaultDate : function(value) {// 初始化默认值
		var selectedDate = lyb.formatDate(this.format, value, true);
		this._dateString = this.formatToString(selectedDate, this.format);
		this._currentDate = lyb.formatDate(this.defaultView == 'month' ? 'yyyy-mm-01' : 'yyyy-mm-dd',
				value || selectedDate || this.today, true);
		this._time.hour = this._getHour(selectedDate);
		this._time.minute = this._getMinutes(selectedDate);
	},
	_getHour : function(date) {
		date = date || this.today;
		if (date)
			return date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
		else
			return '';
	},
	_getMinutes : function(date) {
		date = date || this.today;
		if (date)
			return date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
		else
			return '';
	},
	_initField : function() {
		this.today = new Date();
		this.minuteStep = Number(this.minuteStep || 1);
		this.autoLoad = this.autoLoad === false ? false : true;
		this.pickerSize = this.pickerSize || 1;
		this.defaultView = this.defaultView || 'month';
		this.format = this.format || 'yyyy-mm-dd';
		if (/hh|mi|ss/ig.test(this.format)) {
			this.showTime = true;
		}
		this._initDefaultDate(this.value);
		this.startDate = this.startDate ? lyb.formatDate('yyyy-mm-dd hh:mi:ss', this.startDate, true)
				: null;
		this.endDate = this.endDate ? lyb.formatDate('yyyy-mm-dd hh:mi:ss', this.endDate, true) : null;
	},
	_setStartDate : function(startDate) {
		this._setValidDate(startDate, this.endDate);
	},
	_setEndDate : function(endDate) {
		this._setValidDate(this.startDate, endDate);
	},
	_setValidDate : function(startDate, endDate) {
		this.startDate = startDate ? lyb.formatDate('yyyy-mm-dd hh:mi:ss', startDate, true) : null;
		this.endDate = endDate ? lyb.formatDate('yyyy-mm-dd hh:mi:ss', endDate, true) : null;
		this._renderPicker();
	},
	_resetValidDate : function() {
		this._setValidDate();
	},
	updateControl : function() {
		var title = this.formatToString(this._currentDate || this.today, 'yyyy年mm月');
		if (this.pickerSize > 1) {
			var fixDay = this._getskipDays(this._currentDate.getMonth(), this._currentDate
					.getFullYear(), this.pickerSize - 1);
			title += ' - '
					+ this.formatToString(
							new Date(this._currentDate.getTime() + fixDay * this._dayTime), 'yyyy年mm月');
		}
		var html = '<a class="head-prev-button head-btn" href="javascript: void(0);">'
				+ '<i class="icon  icon-angle-left"></i></a>'
				+ '<span class="head-title" style="display: inline-block;">' + title + '</span>'
				+ '<a class="head-next-button head-btn" href="javascript: void(0);">'
				+ '<i class="icon icon-angle-right"></i></a>';
		this.headEl.html(html);
	},
	calculateDate : function(start) {
		var monday;
		var date = start || new Date();
		/*
		 * if(start && this.defaultView != 'month') { monday = date.getTime(); } else {
		 */
		var week = date.getDay();
		week = week === 0 ? 7 : week;
		var day = date.getDate();
		monday = new Date(date.getTime() - (week - 1) * this._dayTime);
		/* } */
		return monday;
	},
	_getFullDays : function(month, year) { // month从0开始索引
		if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
			return [ this.monthDay[month] || 29, 366 ];
		}
		return [ this.monthDay[month] || 28, 365 ];
	},
	_getskipDays : function(month, year, step) { // month从0开始索引
		step = step || 0;
		var count = 0;
		if (this.defaultView == 'month') {
			for (var i = 1; i <= Math.abs(step); i++) {
				var index = step / Math.abs(step);
				if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
					count += this.monthDay[month] || 29;
				} else {
					count += this.monthDay[month] || 28;
				}
				if (month + index > 11) {
					year++;
					month = month + index - 11;
				} else if (month + index < 0) {
					year--
					month = -(month + index);
				} else {
					month += index;
				}
			}
		} else {
			count += this.pickerSize * 7;
		}
		return count * step / Math.abs(step);
	},
	_destroy : function() {
		this._un(this.headEl);
		this._un(this.bodyEl);
		this._un(this.footEl);
		lyb.DatePicker.superClass._destroy.call(this);
	},
	_bindEvents : function() {
		lyb.DatePicker.superClass._bindEvents.call(this);
		this._on(this.headEl, '.head-prev-button', 'click', this._onPrevClick, this);
		this._on(this.headEl, '.head-next-button', 'click', this._onNextClick, this);
		this._on(this.bodyEl, '.valid-day', 'click', this._onValidDayClick, this);
		this._on(this.footEl, '.hour', 'click', this._onHourClick, this);
		this._on(this.footEl, '.hour-list .number.valid', 'click', this._onValidHourClick, this);
		this._on(this.footEl, '.minute', 'click', this._onMinuteClick, this);
		this._on(this.footEl, '.minute-list .number.valid', 'click', this._onValidMinuteClick, this);
		this._on(this.footEl, '.clear', 'click', this._onClearButtonClick, this);
		this._on(this.footEl, '.sure', 'click', this._onSureButtonClick, this);
		// this._on(this.footEl, '.close', 'click', this._onCloseButtonClick, this);
		this._on(this.el, '.datepicker-border', 'click', this._onBorderClick, this);
		this._on(this.el, '.head-title', 'click', this._renderSelectYear, this);
		this._on(this.el, '.year', 'click', this._onSelectYearClick, this);
		this._on(this.el, '.month', 'click', this._onSelectMonthClick, this);
		this._on(this.el, '.change-year', 'click', this._onChangeBtnClick, this);
		this._on(this.el, '.back-home', 'click', this._onBackHomeClick, this);
	},
	_onBackHomeClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var date = el[0].id.split('$');
		if (date[1] == 'month') {
			this._renderSelectYear(date[0]);
		} else {
			this.selectEl.empty().slideUp('fast');
		}
	},
	_onChangeBtnClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var date = el[0].id.split('$');
		this._renderSelectYear(date[0]);
	},
	_onSelectYearClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var year = el[0].id.split('$')[0];
		this._renderSelectMonth(year);
		e.preventClose = true;
		e.year = Number(year);
		this._onSureButtonClick(e);
		
		this._fire('yearselect', e);
	},
	_onSelectMonthClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var date = el[0].id.split('$');
		var year = date[0], month = date[1];
		this._setValue(year + '-' + (Number(month) + 1) + '-01');
		this.selectEl.empty().slideUp('fast');
		e.preventClose = true;
		e.year = Number(year);
		e.month = Number(month) + 1;
		this._onSureButtonClick(e);
		
		this._fire('monthselect', e);
	},
	_onClearButtonClick : function(e) {
		this._fire('clear', e);
	},
	_onHourClick : function(e) {
		this._renderTimeSelector('hour');
	},
	_onValidHourClick : function(e) {
		var selector = e.selector;
		this._time.hour = selector.text();
		this._time.hourEl.val(this._time.hour);
		this._time.hourSelectorEl.hide();
		e.preventClose = true;
		this._onSureButtonClick(e);
		
		e.hour = this._time.hour;
		this._fire('hourclick', e);
	},
	_onMinuteClick : function(e) {
		this._renderTimeSelector('minute');
	},
	_onValidMinuteClick : function(e) {
		var selector = e.selector;
		this._time.minute = selector.text();
		this._time.minuteEl.val(this._time.minute);
		this._time.minuteSelectorEl.hide();
		e.preventClose = true;
		this._onSureButtonClick(e);
		
		e.minute = this._time.minute;
		this._fire('minuteclick', e);
	},
	_onSureButtonClick : function(e) {
		var value = this._getValue();
		e.value = value;
		if(!e.preventClose)
			this._fire('select', e);
	},
	// _onCloseButtonClick: function(e) {
	// this._hide();
	// this._fire('close', e);
	// },
	_onBorderClick : function(e) {
		e.stopPropagation();
	},
	_onPrevClick : function(e) {
		e.stopPropagation();
		var month = this._currentDate.getMonth(), year = this._currentDate.getFullYear();
		this._currentDate = new Date(this._currentDate.getTime()
				+ this._getskipDays(month, year, -this.pickerSize) * this._dayTime);
		this._renderPicker();
		e.viewStartDate = this.currentViewStartDate;
		e.viewEndDate = this.currentViewEndDate;
		this._fire('prevclick', e);
	},
	_onNextClick : function(e) {
		e.stopPropagation();
		var month = this._currentDate.getMonth(), year = this._currentDate.getFullYear();
		this._currentDate = new Date(this._currentDate.getTime()
				+ this._getskipDays(month, year, this.pickerSize) * this._dayTime);
		this._renderPicker();
		e.viewStartDate = this.currentViewStartDate;
		e.viewEndDate = this.currentViewEndDate;
		this._fire('nextclick', e);
	},
	_onValidDayClick : function(e) {
		var selector = e.selector;
		var date = selector[0].dataset.date;
		this._dateString = date;
		e.value = this._getValue();
		if (this.showTime) {
			e.preventClose = true;
		}
		this._renderPicker();
		this._onSureButtonClick(e);
	},
	formatToString : function(date, format) {
		if (!date) {
			return '';
		}
		format = format.toLowerCase();
		format = format.replace('yyyy', date.getFullYear());
		format = format.replace('mm', date.getMonth() + 1 >= 10 ? (date.getMonth() + 1) : ("0" + (date
				.getMonth() + 1)));
		format = format.replace('dd', date.getDate() >= 10 ? date.getDate() : ("0" + date.getDate()));
		format = format
				.replace('hh', date.getHours() >= 10 ? date.getHours() : ("0" + date.getHours()));
		format = format.replace('mi', date.getMinutes() >= 10 ? date.getMinutes() : ("0" + date
				.getMinutes()));
		format = format.replace('ss', date.getSeconds() >= 10 ? date.getSeconds() : ("0" + date
				.getSeconds()));
		format = format.replace('w', date.getDay());
		return format;
	},
	_renderMonth : function(start) {
		var current = this.formatToString(this.today, 'yyyy-mm-dd');
		var month = this.formatToString(start || this.today, 'mm');
		var html = '<table cellspacing="5" cellpadding="0" style="float: left;border-collapse: separate;border-spacing: 5px;">';
		html += '<thead class="head"><th class="mon weekday">一</th><th class="tue weekday">二</th><th class="wed weekday">三</th><th class="thu weekday">四</th><th class="fri weekday">五</th><th class="sta weekend">六</th><th class="sun weekend">日</th></thead>';
		html += '<tbody>';
		var tr = [ '', '', '', '', '', '' ];
		var date = this.calculateDate(start);
		for (var i = 0, j = -1; i < 42; i++) {
			var _day = date.getDate();
			var _month = this.formatToString(date, 'mm');
			var _date = this.formatToString(date, 'yyyy-mm-dd');
			if (i % 7 == 0) {
				j++;
			}
			if (_month < month) {
				this.pickerSize > 1 && (_day = '&nbsp;');
			} else if (month < _month) {
				this.pickerSize > 1 && (_day = '&nbsp;');
			}

			tr[j] += '<td class="' + this._getDayClasses(date, current, month) + '" data-date="'
					+ _date + '">' + this._renderCell(_date, _day) + '</td>';
			date = new Date(date.getTime() + this._dayTime);
		}
		for (var i = 0; i < 6; i++) {
			html += '<tr>' + tr[i] + '</tr>';
		}
		html += '</tbody>';
		html += '</table>';
		return html;
	},
	_rerenderCell : function(current) {
		this._fire('render', {
			day : current
		});
	},
	_renderWeek : function(start) {
		var current = this.formatToString(this.today, 'yyyy-mm-dd');
		var month = this.formatToString(start || this.today, 'mm');
		var html = '<table cellspacing="0" cellpadding="0" style="float: left;margin: 2px;">';
		html += '<thead class="head"><th>日期</th></thead>';
		html += '<tbody>';
		var date = this.calculateDate(start);
		for (var i = 0, j = -1; i < 7; i++) {
			var _day = date.getDate();
			var _month = this.formatToString(date, 'mm');
			var _date = this.formatToString(date, 'yyyy-mm-dd');
			var week = this.weekNames[date.getDay()]

			html += '<tr>';

			html += '<td><div class="' + this._getDayClasses(date, current, month) + '" data-date="'
					+ _date + '">' + this._renderCell(_date, _date + ' ' + week) + '</div></td>';
			html += '</tr>';
			date = new Date(date.getTime() + this._dayTime);
		}
		html += '</tbody>';
		html += '</table>';
		return html;
	},
	_renderCell : function(date, viewValue) {
		var html = '<div class="number">' + viewValue + '</div>';
		var e = {
			date : date,
			current : viewValue,
			html : html
		};
		this._fire('renderday', e);
		return e.html;
	},
	_getDayClasses : function(date, current, month) {
		var _month = this.formatToString(date, 'mm');
		var _date = this.formatToString(date, 'yyyy-mm-dd');
		var _actived = lyb.formatDate('yyyy-mm-dd', lyb.formatDate('yyyy-mm-dd', this._dateString));
		var classes = 'cell-day';
		if (current == _date)
			classes += ' today';
		if (_actived == _date)
			classes += ' actived';
		if (this.defaultView == 'month' && _month < month) {
			classes += ' prev-day';
		} else if (this.defaultView == 'month' && month < _month) {
			classes += ' next-day';
		} else {
			var e = {
				date : date,
				current : this.formatToString(date, 'yyyy-mm-dd'),
				status : true
			};
			this._fire('validaterender', e);
			if (e.status)
				classes += ' valid-day';
			else {
				classes += ' unvalid-day';
			}
		}

		var start = this.startDate ? this.formatToString(this.startDate, 'yyyy-mm-dd') : null;
		if (start && start > _date) {
			classes = 'cell-day unvalid-day';
		}
		var end = this.endDate ? this.formatToString(this.endDate, 'yyyy-mm-dd') : null;
		if (end && end < _date) {
			classes = 'cell-day unvalid-day';
		}

		return classes;
	},
	_renderTime : function() {
		var html = [];
		html.push('<table cellspacing="0" cellpadding="0" style="width: 100%;line-height: initial;">');
		html.push('<td style="width: 34px;">时间</td>');
		html.push('<td style="width: 22px;">');
		html.push('<input id="' + this._uuid + '$hour" type="text" readonly class="hour" value="'
				+ this._time.hour + '"/>');
		html
				.push('<div id="'
						+ this._uuid
						+ '$hour-selector" class="time-list" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;display: none;"></div>');
		html.push('</td>');
		html.push('<td style="width: 9px;">:</td>');
		html.push('<td style="width: 22px;">');
		html.push('<input id="' + this._uuid + '$minute" type="text" readonly class="minute" value="'
				+ this._time.minute + '"/>');
		html
				.push('<div id="'
						+ this._uuid
						+ '$minute-selector" class="time-list" style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;display: none;"></div>');
		html.push('</td>');

		html.push('<td style="text-align: right;">');
		html.push('<input type="button" class="button clear" value="清除"/>');
		html.push('<input type="button" class="button sure" value="确定"/>');
		// html.push('<input type="button" class="button close" value="关闭"/>');
		html.push('</td>');
		html.push('</table>');
		this.footEl.html(html.join(''));
		if (this.showTime) {
			this.footEl.show();
		}
		this._time.hourEl = jQuery('#' + this._uuid + '\\$hour', this.footEl);
		this._time.minuteEl = jQuery('#' + this._uuid + '\\$minute', this.footEl);
		this._time.hourSelectorEl = jQuery('#' + this._uuid + '\\$hour-selector', this.footEl);
		this._time.minuteSelectorEl = jQuery('#' + this._uuid + '\\$minute-selector', this.footEl);
	},
	_renderTimeSelector : function(type) {
		this._time.hourSelectorEl.hide();
		this._time.minuteSelectorEl.hide();
		var selected = this.formatToString(this._currentDate, 'yyyy-mm-dd');
		var html = [], tr = [ '', '', '', '', '', '' ], renderStep = 4, classes = 'hour-list', size = 24, step = 1, renderEl = this._time.hourSelectorEl;
		if (type == 'minute') {
			classes = 'minute-list';
			size = 60;
			tr = [ '', '', '', '', '', '', '', '', '', '' ];
			step = this.minuteStep;
			renderStep = 6;
			renderEl = this._time.minuteSelectorEl;
		}
		renderEl.show();
		var html = '<table cellspacing="5" cellpadding="0" class="' + classes
				+ '" style="width: 100%;height: 100%;border-collapse: separate;border-spacing: 5px;">';
		for (var i = 0, j = 0; i < size; i += step) {
			if (i != 0 && i % renderStep == 0) {
				j++;
			}
			tr[j] += '<td class="number valid' + (i == this._time[type] ? ' actived' : '') + '">'
					+ (i < 10 ? ('0' + i) : i) + '</td>';
		}
		html += '<tr>' + tr.join('</tr><tr>') + '</tr>';
		html += '</table>';
		renderEl.html(html);
	},
	_renderPicker : function(date) {
		this.bodyEl.empty();
		var firstDate = lyb.formatDate(this.defaultView == 'month' ? 'yyyy-mm-01' : 'yyyy-mm-dd',
				this._currentDate, true);
		this.currentViewStartDate = firstDate;
		for (var i = 0; i < this.pickerSize; i++) {
			var html = '', nextTime = 0;
			if (this.defaultView == 'month') {
				html = this._renderMonth(firstDate);
				nextTime = this._getFullDays(firstDate.getMonth(), firstDate.getFullYear())[0]
						* this._dayTime;
			} else {
				html = this._renderWeek(firstDate);
				nextTime = 7 * this._dayTime;
			}
			this.bodyEl.append(html);
			firstDate = new Date(firstDate.getTime() + nextTime);
		}
		this.currentViewEndDate = firstDate;
		this.bodyEl.append('<div style="clear: both;"></div>');
		this._renderTime();
		this.updateControl();
	},
	_renderSelectYear : function(year) {
		year = Number(year) || this.formatToString(this._currentDate, 'yyyy');
		year = Number(year);
		var html = '<table cellspacing="2" cellpadding="0" style="width: 100%;border-collapse: separate;border-spacing: 2px;">';
		var tr = [ '', '', '', '', '' ];
		for (var i = 0, j = 0; i < 25; i++) {
			var start = year - 12 + i;
			if (i != 0 && i % 5 == 0) {
				j++;
			}
			tr[j] += '<td id="' + start + '$year" class="year' + (year === start ? ' current' : '')
					+ '">' + start + '</td>';
		}
		html += '<tr>' + tr.join('</tr><tr>') + '</tr>';
		html += '<tr><td id="' + (year - 12)
				+ '$prev" class="change-year"><i class="prev icon icon-angle-left"></i></td>';
		html += '<td colspan="3" id="' + year
				+ '$year" class="back-home"><i class="home icon icon-home"></i></td>';
		html += '<td id="' + (year + 12)
				+ '$next" class="change-year"><i class="next icon icon-angle-right"></i></td></tr>';
		html += '</table>';
		this.selectEl.html(html);
		this.selectEl.slideDown('fast');
	},
	_renderSelectMonth : function(year) {
		var month = Number(this.formatToString(this._currentDate, 'mm'));
		var html = '<table cellspacing="2" cellpadding="0" style="width: 100%;border-collapse: separate;border-spacing: 2px;">';
		var tr = [ '', '', '', '' ];
		for (var i = 0, j = 0; i < 12; i++) {
			if (i != 0 && i % 3 == 0) {
				j++;
			}
			tr[j] += '<td id="' + year + '$' + i + '" class="month'
					+ (month - 1 === i ? ' current' : '') + '">' + (i + 1) + '</td>';
		}
		html += '<tr>' + tr.join('</tr><tr>') + '</tr>';
		html += '<tr><td colspan="3" id="' + year
				+ '$month" class="back-home" style="width: 100%;"><i class="home icon icon-home"></i></td></tr>';
		html += '</table>';
		this.selectEl.html(html);
	},
	_show : function(el) {
		if (el && el[0]) {
			var win = jQuery(document.body);
			var height = win.height();
			var width = win.width();
			var offset = el.offset();
			var selfElHeight = this.el.outerHeight(true);
			var selfElWidth = this.el.outerWidth(true);
			
			if (width - offset.left <= selfElWidth) {
				this.el.css({left: 'auto', right: 0});
			}else{
				this.el.css({left: 0, right: 'auto'});
			}
			
			if (height - el.height() - offset.top > selfElHeight) {
				this.el.slideDown('fast');
			} else if (offset.top > selfElHeight) {
				this._noslide = true;
				this.el.css('top', 1 - selfElHeight);
				this.el.show();
			} else {
				this.el.slideDown('fast');
			}
		} else {
			this.el.slideDown('fast');
		}
	},
	_hide : function() {
		if (this._noslide)
			this.el.hide();
		else
			this.el.slideUp('fast');
		this.el.css('height', 'auto');
	},
	_setValue : function(value) {
		this._initDefaultDate(value);
		this._renderPicker();
	},
	_getValue : function() {
		if (this._dateString)
			return lyb.formatDate(this.format, this._dateString + ' ' + this._time.hour + ':'
					+ this._time.minute + ':00');
		else
			return '';
	},
	_getAttrs : function(attributes) {
		var attrs = lyb.concat({
			str : [ 'startDate', 'endDate', 'defaultView', 'format' ],
			bool : [ 'autoLoad' ],
			number : [ 'pickerSize', 'minuteStep' ]
		}, attributes);
		return lyb.DatePicker.superClass._getAttrs.call(this, attrs);
	},
	destroy : function() {
		this._destroy();
	},
	getValue : function() {
		return this._getValue();
	},
	setValue : function(value) {
		return this._setValue(value);
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
	},
});
lyb.Register(lyb.DatePicker, 'datepicker');