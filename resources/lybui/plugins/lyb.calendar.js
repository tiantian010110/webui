//TODO 日历控件
lyb.Calendar = function(id) {
	lyb.Calendar.superClass.constructor.call(this, id);
	this._dayTime = 1000 * 24 * 60 * 60;
	this.weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
};
lyb.extend(lyb.Calendar, lyb.DatePicker, {
	type: 'calendar',
	_init: function() {
		lyb.Calendar.superClass._init.call(this);
	},
	_render: function() {

	}
});
lyb.Register(lyb.Calendar, 'calendar');