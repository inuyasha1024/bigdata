(function(){
	var CookieUtil = {
			// get the cookie of the key 
			get: function(name) {
				var cookieName = encodeURIComponent(name) + "=",
					cookieStart = document.cookie.indexOf(cookieName),
					cookieValue = null;
				if (cookieStart > -1) {
					var cookieEnd = document.cookie.indexOf(";", cookieStart);
					if (cookieEnd == -1) {
						cookieEnd = document.cookie.length;
					}
					cookieValue = decodeURIComponent(document.cookie.substring(cookieStart+cookieName.length, cookieEnd));
				}
				return cookieValue;
			},
			// set the name/value pair to browser cookie
			set: function(name, value, expires, path, domain, secure) {
				var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);

				if (expires) {
					// set the expires time
					var expiresTime = new Date();
					expiresTime.setTime(expires);
					cookieText += ";expires=" +  expiresTime.toGMTString();
				}

				if (path) {
					cookieText += ";path=" + path;
				}

				if (domain) {
					cookieText += ";domain=" + domain;
				}

				if (secure) {
					cookieText += ";secure";
				}

				document.cookie = cookieText;
			},
			setExt: function(name, value) {
				this.set(name, value, new Date().getTime() + 315360000000, "/");
			}
	};

	
	var tracker = {
			// configuration
			clientConfig: {
				serverUrl: "http://192.168.80.8/log.gif", //server host
				sessionTimeout: 360, // 360s -> 6min
				maxWaitTime: 3600, // 3600s -> 60min -> 1h
				ver: "1"
			},

			cookieExpiresTime: 864000, // cookie expire time，10 days
			
			columns: {
				// colum name send to server
				eventName: "en",
				version: "ver",
				platform: "pl",
				sdk: "sdk",
				uuid: "u_ud",
				memberId: "u_mid",
				sessionId: "u_sd",
				clientTime: "c_time",
				language: "l",
				userAgent: "b_iev",
				resolution: "b_rst",
				currentUrl: "p_url",
				referrerUrl: "p_ref",
				title: "tt",
				orderId: "oid",
				orderName: "on",
				currencyAmount: "cua",
				currencyType: "cut",
				paymentType: "pt",
				category: "ca",
				action: "ac",
				kv: "kv_",
				duration: "du"
			},

			keys: {
				pageView: "e_pv",
				chargeRequestEvent: "e_crt",
				launch: "e_l",
				eventDurationEvent: "e_e",
				sid: "bftrack_sid",
				uuid: "bftrack_uuid",
				mid: "bftrack_mid",
				preVisitTime: "bftrack_previsit",
				
			},

			/**
			 * get session id
			 */
			getSid: function() {
				return CookieUtil.get(this.keys.sid);
			},

			/**
			 * save session id to cookie
			 */
			setSid: function(sid) {
				if (sid) {
					CookieUtil.setExt(this.keys.sid, sid);
				}
			},

			/**
			 * get uuid from cookie
			 */
			getUuid: function() {
				return CookieUtil.get(this.keys.uuid);
			},

			/**
			 * save uuid to cookie
			 */
			setUuid: function(uuid) {
				if (uuid) {
					CookieUtil.setExt(this.keys.uuid, uuid);
				}
			},

			/**
			 * get memberID
			 */
			getMemberId: function() {
				return CookieUtil.get(this.keys.mid);
			},

			/**
			 * set mid
			 */
			setMemberId: function(mid) {
				if (mid) {
					CookieUtil.setExt(this.keys.mid, mid);
				}
			},

			startSession: function() {
				if (this.getSid()) {
					// id exists，uuid exists
					if (this.isSessionTimeout()) {
						// session expired generate new one
						this.createNewSession();
					} else {
						// session doesnt expire get new time
						this.updatePreVisitTime(new Date().getTime());
					}
				} else {
					// id didnt exist，uuid didnt exist
					this.createNewSession();
				}
				this.onPageView();
			},

			onLaunch: function() {
				// trigger launch event
				var launch = {};
				launch[this.columns.eventName] = this.keys.launch; // set event name
				this.setCommonColumns(launch); // set public columns
				this.sendDataToServer(this.parseParam(launch)); //send encoding data to server
			},

			onPageView: function() {
				// 触发page view事件
				if (this.preCallApi()) {
					var time = new Date().getTime();
					var pageviewEvent = {};
					pageviewEvent[this.columns.eventName] = this.keys.pageView;
					pageviewEvent[this.columns.currentUrl] = window.location.href; // set current page url
					pageviewEvent[this.columns.referrerUrl] = document.referrer; // set pervious page url
					pageviewEvent[this.columns.title] = document.title; // set page title
					this.setCommonColumns(pageviewEvent); // set public columns
					this.sendDataToServer(this.parseParam(pageviewEvent)); // set encoding data
					this.updatePreVisitTime(time);
				}
			},

			onChargeRequest: function(orderId, name, currencyAmount, currencyType, paymentType) {
				// 触发订单产生事件
				if (this.preCallApi()) {
					if (!orderId || !currencyType || !paymentType) {
						this.log("订单id、货币类型以及支付方式不能为空");
						return ;
					}

					if (typeof(currencyAmount) == "number") {
						// 金额必须是数字
						var time = new Date().getTime();
						var chargeRequestEvent = {};
						chargeRequestEvent[this.columns.eventName] = this.keys.chargeRequestEvent;
						chargeRequestEvent[this.columns.orderId] = orderId;
						chargeRequestEvent[this.columns.orderName] = name;
						chargeRequestEvent[this.columns.currencyAmount] = currencyAmount;
						chargeRequestEvent[this.columns.currencyType] = currencyType;
						chargeRequestEvent[this.columns.paymentType] = paymentType;
						this.setCommonColumns(chargeRequestEvent); // 设置公用columns
						this.sendDataToServer(this.parseParam(chargeRequestEvent)); // 最终发送编码后的数据ss
						this.updatePreVisitTime(time);
					} else {
						this.log("订单金额必须是数字");
						return ;
					}	
				}
			},
			
			onEventDuration: function(category, action, map, duration) {
				// 触发event事件
				if (this.preCallApi()) {
					if (category && action) {
						var time = new Date().getTime();
						var event = {};
						event[this.columns.eventName] = this.keys.eventDurationEvent;
						event[this.columns.category] = category;
						event[this.columns.action] = action;
						if (map) {
							for (var k in map){
								if (k && map[k]) {
									event[this.columns.kv + k] = map[k];
								}
							}
						}
						if (duration) {
							event[this.columns.duration] = duration;
						}
						this.setCommonColumns(event); // 设置公用columns
						this.sendDataToServer(this.parseParam(event)); // 最终发送编码后的数据ss
						this.updatePreVisitTime(time);
					} else {
						this.log("category和action不能为空");
					}
				}
			},

			/**
			 * 执行对外方法前必须执行的方法
			 */
			preCallApi: function() {
				if (this.isSessionTimeout()) {
					// 如果为true，表示需要新建
					this.startSession();
				} else {
					this.updatePreVisitTime(new Date().getTime());
				}
				return true;
			},

			sendDataToServer: function(data) {
				// 发送数据data到服务器，其中data是一个字符串
				var that = this;
				var i2 = new Image(1,1);
				i2.onerror = function(){
					// 这里可以进行重试操作
				};
				i2.src = this.clientConfig.serverUrl + "?" + data;
			},

			/**
			 * 往data中添加发送到日志收集服务器的公用部分
			 */
			setCommonColumns: function(data) {
				data[this.columns.version] = this.clientConfig.ver;
				data[this.columns.platform] = "website";
				data[this.columns.sdk] = "js";
				data[this.columns.uuid] = this.getUuid(); // 设置用户id
				data[this.columns.memberId] = this.getMemberId(); // 设置会员id
				data[this.columns.sessionId] = this.getSid(); // 设置sid
				data[this.columns.clientTime] = new Date().getTime(); // 设置客户端时间
				data[this.columns.language] = window.navigator.language; // 设置浏览器语言
				data[this.columns.userAgent] = window.navigator.userAgent; // 设置浏览器类型
				data[this.columns.resolution] = screen.width + "*" + screen.height; // 设置浏览器分辨率
			},

			/**
			 * 创建新的会员，并判断是否是第一次访问页面，如果是，进行launch事件的发送。
			 */
			createNewSession: function() {
				var time = new Date().getTime(); // 获取当前操作时间
				// 1. 进行会话更新操作
				var sid = this.generateId(); // 产生一个session id
				this.setSid(sid);
				this.updatePreVisitTime(time); // 更新最近访问时间
				// 2. 进行uuid查看操作
				if (!this.getUuid()) {
					// uuid不存在，先创建uuid，然后保存到cookie，最后触发launch事件
					var uuid = this.generateId(); // 产品uuid
					this.setUuid(uuid);
					this.onLaunch();
				}
			},

			/**
			 * encode perameter 
			 */
			parseParam: function(data) {
				var params = "";
				for (var e in data) {
					if (e && data[e]) {
						params += encodeURIComponent(e) + "=" + encodeURIComponent(data[e]) + "&";
					}
				}
				if (params) {
					return params.substring(0, params.length - 1);
				} else {
					return params;
				}
			},

			/**
			 * generate uuid
			 */
			generateId: function() {
				var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
				var tmpid = [];
				var r;
				tmpid[8] = tmpid[13] = tmpid[18] = tmpid[23] = '-';
				tmpid[14] = '4';

				for (i=0; i<36; i++) {
					if (!tmpid[i]) {
						r = 0| Math.random()*16;
						tmpid[i] = chars[(i==19) ? (r & 0x3) | 0x8 : r];
					}
				}
				return tmpid.join('');
			},

			/**
			 * 判断这个会话是否过期，查看当前时间和最近访问时间间隔时间是否小于this.clientConfig.sessionTimeout<br/>
			 * 如果是小于，返回false;否则返回true。
			 */
			isSessionTimeout: function() {
				var time = new Date().getTime();
				var preTime = CookieUtil.get(this.keys.preVisitTime);
				if (preTime) {
					// 最近访问时间存在,那么进行区间判断
					return time - preTime > this.clientConfig.sessionTimeout * 1000;
				}
				return true;
			},

			/**
			 * update visiting time
			 */
			updatePreVisitTime: function(time) {
				CookieUtil.setExt(this.keys.preVisitTime, time);
			},

			/**
			 * print log
			 */
			log: function(msg) {
				console.log(msg);
			},
			
	};

	// exposed methods to user
	window.__AE__ = {
		startSession: function() {
			tracker.startSession();
		},
		onPageView: function() {
			tracker.onPageView();
		},
		onChargeRequest: function(orderId, name, currencyAmount, currencyType, paymentType) {
			tracker.onChargeRequest(orderId, name, currencyAmount, currencyType, paymentType);
		},
		onEventDuration: function(category, action, map, duration) {
			tracker.onEventDuration(category, action, map, duration);
		},
		setMemberId: function(mid) {
			tracker.setMemberId(mid);
		}
	};

	// auto loading method 
	var autoLoad = function() {
		// 进行参数设置
		var _aelog_ = _aelog_ || window._aelog_ || [];
		var memberId = null;
		for (i=0;i<_aelog_.length;i++) {
			_aelog_[i][0] === "memberId" && (memberId = _aelog_[i][1]);
		}
		// 根据是给定memberid，设置memberid的值
		memberId && __AE__.setMemberId(memberId);
		// start session
		__AE__.startSession();
	};

	autoLoad();
})();