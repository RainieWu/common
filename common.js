/*
	author: 吴颖琳
	contact: ng.winglam@qq.com
	date: 2018.01.12-2018.02.11
	ps: 依赖jQuery
*/



/*
	功能：完成手机号码的基本验证及获取验证码
	参数：必选，对象，获取验证码所用到的表单和ajax的相关设置
		{
			form: {							// 必选，对象，获取验证码的表单设置
				phoneNumName: "",			// 可选，字符串，填写手机号码的input标签的name属性值，默认为"phoneNum"
				getCodeClass: "",			// 可选，字符串，获取验证码按钮的button标签的class，默认为"getCode"
				countdown: 0,				// 可选，数值，重新获取验证码的等待时间，默认为60
				countdownText: ""			// 可选，字符串，等待重新获取验证码时按钮的文本内容，默认为"重新发送"
			},
			ajax: {							// 必选，对象，获取验证码的ajax设置
				url: "",					// 必选，字符串，获取验证码的请求地址
				type: "",					// 可选，字符串，请求方式，默认为"POST"
				dataType: "",				// 可选，字符串，返回的数据类型，默认为"json"
				dataName: "",				// 可选，字符串，发送给服务器的数据对象中手机号码名值对的名，默认为"phoneNum"
				resultCodeName: "",			// 可选，字符串，返回数据的状态码名称，默认为"code"
				resultMsgName: "",			// 可选，字符串，返回数据的消息名称，默认为"msg"
				successCode: ""				// 可选，字符串或数值，返回数据的成功状态码，使用严格比较运算符进行比较，默认为1
			},
			alertBox: {						// 可选，对象，弹窗显示获取验证码的结果，不弹窗显示时可访问全局变量getCodeMsg
				close: true,				// 可选，布尔值，是否有关闭按钮，默认为false
				title: "",					// 可选，字符串，标题文本，默认无标题
				buttons: [{					// 可选，数组，默认为一个“确定”按钮
					value: "",				// 必选，字符串，按钮文本
					callback: function() {}	// 可选，函数，点击按钮的回调函数，默认操作为关闭弹窗
				}]
			}
		}
		参数示例1：
			{
				form: {
					phoneNumName: "phoneNum",
					getCodeClass: "getCode",
					countdown: 60,
					countdownText: "重新发送"
				},
				ajax: {
					url: "getCode.do",
					type: "POST",
					dataType: "json",
					dataName: "phoneNum",
					resultCodeName: "code",
					resultMsgName: "msg",
					successCode: 1
				},
				alertBox: {
					close: true,
					title: "标题",
					buttons: [{
						value: "确定",
						callback: function() {
							console.log("确定");
						}
					}, {
						value: "取消",
						callback: function() {
							console.log("取消");
						}
					}]
				}
			}
		参数示例2：
			{
				form: {},
				ajax: {
					url: "getCode.do"
				}
			}
*/
var getCodeMsg = "";
function getCode(param) {
	if(!param.form.phoneNumName) {
		param.form.phoneNumName = "phoneNum";
	}
	if(!param.form.getCodeClass) {
		param.form.getCodeClass = "getCode";
	}
	if(!param.form.countdown) {
		param.form.countdown = 60;
	}
	if(!param.form.countdownText) {
		param.form.countdownText = "重新发送";
	}

	if(!param.ajax.type) {
		param.ajax.type = "POST";
	}
	if(!param.ajax.dataType) {
		param.ajax.dataType = "json";
	}
	if(!param.ajax.dataName) {
		param.ajax.dataName = "phoneNum";
	}
	if(!param.ajax.resultCodeName) {
		param.ajax.resultCodeName = "code";
	}
	if(!param.ajax.resultMsgName) {
		param.ajax.resultMsgName = "msg";
	}
	if(!param.ajax.successCode) {
		param.ajax.successCode = 1;
	}


	var getCodeElement = $("." + param.form.getCodeClass);
	var normalText = getCodeElement.text();
	getCodeElement.click(function(e) {
		e.preventDefault();
		var phoneNum = $("input[name='" + param.form.phoneNumName + "']").val();
		if(phoneNum == "") {
			getCodeMsg = "请输入手机号码";
			if(param.alertBox) {
				param.alertBox.message = getCodeMsg;
				setAlertBox(param.alertBox);
			}
		} else if(phoneNum.length != 11) {
			getCodeMsg = "请输入位数正确的手机号码";
			if(param.alertBox) {
				param.alertBox.message = getCodeMsg;
				setAlertBox(param.alertBox);
			}
		} else if(!/^1[0-9]{10}$/.test(phoneNum)) {
			getCodeMsg = "请输入正确的手机号码";
			if(param.alertBox) {
				param.alertBox.message = getCodeMsg;
				setAlertBox(param.alertBox);
			}
		} else {
			getCodeElement.attr("disabled", "disabled").text(param.form.countdownText + "(" + param.form.countdown + ")");
			var timer = setInterval(function() {
				if(param.form.countdown == 1) {
					clearInterval(timer);
					getCodeElement.removeAttr("disabled").text(normalText);
				} else {
					param.form.countdown--;
					getCodeElement.text(param.form.countdownText + "(" + param.form.countdown +")");
				}
			}, 1000);

			var data = {};
			data[param.ajax.dataName] = phoneNum;
			$.ajax({
				url: param.ajax.url,
				type: param.ajax.type,
				dataType: param.ajax.dataType,
				data: data,
				success: function(result) {
					if(result[param.ajax.resultCodeName] !== param.ajax.successCode) {
						clearInterval(timer);
						getCodeElement.removeAttr("disabled").text(normalText);
						if(param.alertBox) {
							param.alertBox.message = getCodeMsg;
							setAlertBox(param.alertBox);
						}
					}
					getCodeMsg = result[param.ajax.resultMsgName];
				},
				error: function(result) {
					clearInterval(timer);
					getCodeElement.removeAttr("disabled").text(normalText);
					getCodeMsg = "发送验证码失败";
					if(param.alertBox) {
						param.alertBox.message = getCodeMsg;
						setAlertBox(param.alertBox);
					}
				}
			});
		}
	});
}


/*
	功能：设置弹窗，包括关闭按钮、标题、弹窗信息、按钮
	参数：必选，对象，设置弹窗所用到的信息
		{
			className: "",				// 可选，字符串，弹窗额外的类名
			close: true,				// 可选，布尔值，是否有关闭按钮，默认为false
			maskClose: true,			// 可选，布尔值，点击遮罩能否关闭弹窗，默认为false
			title: "",					// 可选，字符串，标题文本，默认无标题
			message: "",				// 必选，字符串，弹窗信息文本
			buttons: [{					// 可选，数组，默认为一个“确定”按钮
				value: "",				// 必选，字符串，按钮文本
				callback: function() {}	// 可选，函数，点击按钮的回调函数，默认操作为关闭弹窗
			}]
		}
		参数示例1：
			{
				className: "my-alert-box",
				close: true,
				maskClose: true,
				title: "标题",
				message: "弹窗信息",
				buttons: [{
					value: "确定",
					callback: function() {
						console.log("确定");
					}
				}, {
					value: "取消",
					callback: function() {
						console.log("取消");
					}
				}]
			}
		参数示例2：
			{
				message: "弹窗信息"
			}
*/
function setAlertBox(param) {
	if(!param.buttons) {
		param.buttons = [{
			value: "确定",
			callback: function() {
				$(".alert-box").remove();
			}
		}];
	}

	var html = "";
	if(param.className) {
		html += "<div class='alert-box " + param.className +"'>";
	} else {
		html += "<div class='alert-box'>";
	}
	html += "<div class='box'>";
	if(param.close) {
		html += "<span class='close'></span>";
	}
	if(param.title) {
		html += "<p class='title'>" + param.title +"</p>";
	}
	html += "<div class='message'>" + param.message + "</div>"
		 + "<div class='buttons'>";
	for(var i = 0; i < param.buttons.length; i++) {
		html += "<button index=" + (i + 1) +" class='btn" + (i + 1) +"'>" + param.buttons[i].value +"</button>";
		if(!param.buttons[i].callback) {
			param.buttons[i].callback = function() {
				$(".alert-box").remove();
			}
		}
	}
	html += "</div>" + "</div>" + "</div>";
	$("body").append(html);
	$(".alert-box").hide().fadeIn();

	if(param.close) {
		$(".alert-box .close").click(function() {
			$(".alert-box").remove();
		});
	}
	if(param.maskClose) {
		$(".alert-box").click(function(e) {
			if($(e.target).parent().is(("body"))) {
				$(".alert-box").remove();
			}
		});
	}
	$(".alert-box .buttons button").click(function(e) {
		param.buttons[$(e.target).attr("index") - 1].callback();
	});
}


/*
	功能：设置加载动画
*/
function setLoading() {
	if($("body").find(".loading").length == 0) {
		var html = "<div class='loading'>";
		for(var i = 0; i < 10; i++) {
			html += "<span></span>";
		}
		html += "</div>";
		$("body").append(html);
		$(".loading").hide().fadeIn();
	} else {
		$(".loading").fadeIn();
	}
}

/*
	功能：移除加载动画
*/
function removeLoading() {
	$(".loading").fadeOut();
}


/*
	功能：对身份证进行格式、地址编码和校验位的验证
	参数：必选，字符串，身份证号码
	返回值: 对象，身份证验证的结果
		{
			isCorrect: true,			// 布尔值，身份证验证的结果标记
			msg: "身份证号码格式正确"	// 字符串，身份证验证的信息
		}
*/
function identityCoeValid(code) {
    var result = {
        isCorrect: true,
        msg: "身份证号码格式正确"
    };
    var city = {11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"};
    if(!code || !(/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code))) {
        result.isCorrect = false;
        result.msg = "身份证号码格式错误";
    } else if(!city[code.substr(0, 2)]) {
        result.isCorrect = false;
        result.msg = "地址编码错误";
    } else {
        // 18位身份证验证最后一位校验位
        if(code.length == 18) {
            code = code.split("");
            // 加权因子
            var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            // 校验位
            var parity = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];
            var sum = 0, ai = 0, wi = 0;
            for(var i = 0; i < 17; i++) {
                ai = code[i];
                wi = factor[i];
                sum += ai * wi;
            }
            if(parity[sum % 11] != code[17]) {
                result.isCorrect = false;
                result.msg = "校验位错误";
            }
        }
    }
    return result;
}


/*
	功能：精确相加两个数值，包括整数和小数
	参数：必选，数值，整数或小数
	返回值: 数值，两个数相加的结果
*/
function accAdd(num1, num2) {
    try {
        var decimalLength1 = num1.toString().split(".")[1].length;
    } catch(e) {
        var decimalLength1 = 0;
    }
    try {
        var decimalLength2 = num2.toString().split(".")[1].length;
    } catch(e) {
        var decimalLength2 = 0;
    }
    var multiple = Math.pow(10, Math.max(decimalLength1, decimalLength2));
    return (num1 * multiple + num2 * multiple) / multiple;
}