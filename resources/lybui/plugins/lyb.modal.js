/**
 * Created by Administrator on 2016/8/24 0024.
 */
// modal 弹窗组件
lyb.Modal = function(id) {
	lyb.Modal.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Modal, lyb.Dialog);
lyb.Register(lyb.Modal, 'modal');
