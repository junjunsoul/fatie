(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;
				if (!u && a) return a(o, !0);
				if (i) return i(o, !0);
				throw new Error("Cannot find module '" + o + "'")
			}
			var f = n[o] = {
				exports: {}
			};
			t[o][0].call(f.exports, function(e) {
				var n = t[o][1][e];
				return s(n ? n : e)
			}, f, f.exports, e, t, n, r)
		}
		return n[o].exports
	}
	var i = typeof require == "function" && require;
	for (var o = 0; o < r.length; o++) s(r[o]);
	return s
})({
	1: [function(require, module, exports) {
		/*
		 *create by Ashely in 2015/4/29
		 *  title:艾特联系人列表
		 * init:初始化变量
		 * tpl:获取父模板
		 * tplItem：获取子模板
		 * chooseItem:获取搜索联系人的模板
		 * tplJude:判断获取的数组是否有数据
		 * itemChoose：选择联系人的点击事件
		 * searchContact:搜索联系人事件
		 * getData:请求数据
		 * getSearchData：请求搜索联系人的数据
		 * opt:参数数组(boxWrap-输入框的Id，aiteWrap-联系人列表的wrapper)*/
		var RequestUrl = require('../lib/public/requestUrl').RequestUrl;

		function AiteList(opt, isYZJApp) {
			this.boxWrap = opt.boxWrap; //要显示的输入框
			this.searchBool = false; //是否是搜索请求数据
			this.windowHeight = opt.windowHeight; //窗口的高度
			this.sendBtn = opt.sendBtn; //发送按钮
			var requestUrl = new RequestUrl();

			if (typeof(opt.aiteWrap) == undefined || opt.aiteWrap.length == 0) {
				this.aiteWrap = null;
			} else {
				this.aiteWrap = opt.aiteWrap;
			}

			var _this = this;
			$(window).on('popstate', function() {
				_this.scrollAuto();
				_this.aiteWrap.fadeOut();
				if (_this.searchBool) {
					_this.aiteWrap.remove();
				}
			});


			this.init = function(cb) {
				var _this = this;
				_this.cb = cb;

				if (typeof _this == undefined) {
					return;
				}
				this.scrollHidden();
				if (!_this.aiteWrap) {

					var personWrap = _this.tpl();
					_this.aiteWrap = personWrap;
					_this.aiteWrap.appendTo(document.body);

					//搜索按钮的点击事件
					$("#searchAiteBtn", _this.aiteWrap).click(function() {
						var keyword = $(".searchContent", _this.aiteWrap).val();
						if (keyword != null && keyword != "") {
							_this.searchContact();
						}
					});

					//删除事件
					$(".del-search", _this.aiteWrap).on('click', function() {
						$(".searchContent", _this.aiteWrap).val("");
						$(".searchContent", _this.aiteWrap).focus();
						$(".del-search", _this.aiteWrap).css("display", "none");
					});

					//输入事件
					$(".keyword", _this.aiteWrap).on('keyup', function() {
						var _value = $(this).val();
						if (_value != null && _value != "") {
							$(".del-search", _this.aiteWrap).css("display", "inline-block");
						} else {
							$(".del-search", _this.aiteWrap).css("display", "none");
						}
					});

					//获取焦点事件
					$(".keyword", _this.aiteWrap).on('focus', function() {
						if ($(this).val() == "" || $(this).val() == null) {
							$(this).val(" ");
						}
					});

					//从同事圈选择
					$(".select-from-app span", _this.aiteWrap).on('click', function() {
						var aiteTmp = _this.sendBtn.attr('data-yzj-aite');
						XuntongJSBridge.call('selectPerson', {
							'isMulti': true
						}, function(result) {
							if (result.success == 'true' || result.success === true) {
								$.each(result.data.persons, function(index, item) {
									Tribe.util.insert(_this.boxWrap[0], Tribe.util.getCaret(_this.boxWrap[0]), "@" + item.personName + "  ");
									if (aiteTmp == '') aiteTmp = item.personName + ':' + item.personId;
									else aiteTmp = aiteTmp + ',' + item.personName + ':' + item.personId;
								});
								_this.sendBtn.attr('data-yzj-aite', aiteTmp);
								_this.aiteWrap.fadeOut();
							}
						});
					});

					_this.getData();
					history.pushState('aiteList', '联系人', '');

				} else {

					_this.aiteWrap.fadeIn();
					history.pushState('aiteList', '联系人', '');
				}
			};

			this.tpl = function() {

				var tplString = '';
				if (isYZJApp) tplString = "<div class='select-from-app'><span>从同事中选择</span></div>";
				return $("<div class='person-list-wrapper topic-list-wrapper none'  style='height:" + this.windowHeight + "px'>" + tplString + "<div class='wordsEditor'>" + "<div class='wordsBox'>" + "<input class='searchContent keyword' placeholder='输入用户名' />" + "<a class='del-search'></a>" + "</div><a id='searchAiteBtn' class='search-btn'>搜 索</a></div>" + "<p class='titleTab titName'></p>" + "<ul style='' class='contactList'></ul></div>");
			};

			this.tplJude = function(wrap, data) {
				var _this = this;
				var parentWrap = $(wrap).find('ul');
				var data = data;

				if (typeof(data) == undefined || data.length == 0) {

					var txt = $(".searchContent", _this.aiteWrap).val();
					if (txt == undefined) {
						txt = "";
					}
					if (this.searchBool) {
						$(".titleTab", _this.aiteWrap).text("搜索结果");
						$(".contactList", _this.aiteWrap).text("已经尽力了，还是找不到" + txt + "");
					} else {
						$(".titleTab", _this.aiteWrap).text("最近联系人");
						$(".contactList", _this.aiteWrap).text("");
					}

				} else {

					var cbB = function(allNum) {
							var obj = {
								id: '',
								name: 'all' + (allNum ? '(还剩余' + allNum + '次)' : '') + '',
								avatarUrl: ''
							};
							data.unshift(obj);
							cbC();
						}
					var cbA = function(role) {
							if (role) requestUrl.hasALLNum(cbB);
							else cbC();
						}

					requestUrl.isUserAdmin(cbA);

					var cbC = function() {
							_.each(data, function(item) {
								var str = _this.chooseItem(item);

								parentWrap.append(str);

								$(str).click(function() {
									var _b = item;
									return function() {
										_this.itemChoose(_b);
									}
								}());
							});
						}

				}
				if (!_this.searchBool) {
					_this.aiteWrap.fadeIn();
				}
				//初始化列表高度
				var ul_height = $(window).height() - $(".wordsEditor").height() - $(".titName").height();
				if (ul_height && ul_height > 0) {
					$(".contactList").css("height", ul_height + "px");
				}
			};

			this.chooseItem = function(data) {

				var item = "<li class='aite-item' id='<%=id%>'><span class='aite-img avatar'>" + "<%if(avatarUrl == undefined || avatarUrl == ''){%>" + "<img src='/thirdapp/forum/img/load.png' class='avatar-img'/>" + "<%}else{%>" + "<img src='<%=avatarUrl%>' class='avatar-img'/>" + "<%}%></span>" + "<span class='name'><b><%=name%></b></span>" + "</li>";
				item = $(_.template(item)(data));

				return item;
			};


			this.itemChoose = function(data) {
				var _this = this;
				var manName = data.name;

				this.scrollHidden();

				var txt = _this.boxWrap.text();
				if (data.id == "") {
					Tribe.util.insert(_this.boxWrap[0], Tribe.util.getCaret(_this.boxWrap[0]), "@all  ");
				} else {
					Tribe.util.insert(_this.boxWrap[0], Tribe.util.getCaret(_this.boxWrap[0]), "@" + manName + "  ");
					var aiteTmp = _this.sendBtn.attr('data-wx-aite');
					if (aiteTmp == '') aiteTmp = data.name + ':' + data.id;
					else aiteTmp = aiteTmp + ',' + data.name + ':' + data.id;
					_this.sendBtn.attr('data-wx-aite', aiteTmp);
				}
				//_this.boxWrap.val(txt + "@" +manName+"  ");

				_this.aiteWrap.fadeOut();
				if (_this.searchBool) {
					_this.aiteWrap.remove();
					_this.aiteWrap = null;
				}

				$(".searchContent", _this.aiteWrap).val("");
				_this.searchBool = false;

				_this.boxWrap.focus();
				var txtValue = _this.boxWrap.val();
				_this.boxWrap.val("");
				_this.boxWrap.val(txtValue);
				if (typeof _this.cb == "function") {
					_this.cb();
				}

			};

			this.searchContact = function() {

				var txt = $(".searchContent", this.aiteWrap).val();
				this.searchBool = true;
				var data = this.getData();

			};

			this.getData = function() {
				var _this = this;
				var criteria = $(".searchContent", this.aiteWrap).val();
				if (!criteria || criteria == "" || criteria == null) {
					criteria = '';
				}

				$.ajax({
					type: 'get',
					url: '/thirdapp/forum/recentContacts',
					dataType: 'json',
					data: {
						'criteria': criteria
					}
				}).done(function(resp) {
					if (resp.error != undefined) {
						console.log("请求最近联系人列表错误");
						return;
					}
					if (_this.searchBool) {
						$(".titleTab", this.aiteWrap).text("搜索结果");
					} else {
						$(".titleTab", _this.aiteWrap).text("最近联系人");
					}
					$(".contactList", this.aiteWrap).text("");

					//添加列表项
					_this.tplJude(_this.aiteWrap, resp);

				});

			};

			this.scrollAuto = function() {
				$('body').css("height", "auto");
				document.body.style.overflow = 'auto';
				document.documentElement.style.overflow = 'auto';
			};

			this.scrollHidden = function() {
				var _height = $(window).height();
				$('body').css("height", _height + 'px');
				document.body.style.overflow = 'hidden';
				document.documentElement.style.overflow = 'hidden';
			};
		}

		module.exports = AiteList;
	}, {
		"../lib/public/requestUrl": 15
	}],
	2: [function(require, module, exports) {
		'use strict';
		var getUserInfo = require('./getUserInfo');
		var alipayModifyUserName = {
			init: function init() {
				if (!/aliapp/.test(navigator.userAgent.toLowerCase())) return;
				var self = alipayModifyUserName;
				getUserInfo().then(function(resp) {
					var dataJson = resp.message;
					var userName = dataJson.name;
					var account = dataJson.alipayAccount;
					$('.personal img').attr('src', '/space/c/photo/load?id=' + resp.message.photoId);
					if (userName == account) {
						$('body').append(self.modifyUserNameTpl(userName));
						self.modifyUserName();
					}
				});
			},
			modifyUserNameTpl: function modifyUserNameTpl(userName) {
				var tpl = '' + '<div class="modify-user-overlay" style="height: ' + $(window).height() + 'px"></div>' + '<div class="modify-user-dialog" style="position:fixed;top: 0;">' + '<div class="niduft-main">' + '   <p class="name-title">你现在的社区昵称是：</p>' + '   <p class="modify-user-name">' + userName + '</p>' + '   <p><input type="text" value="" placeholder="快输入一个更酷炫的昵称吧！" class="modify-user-text" /></p>' + '   <p class="modify-user-btns">' + '       <a href="javascript:;" class="modify-user-cancel">取消</a>' + '       <a href="javascript:;" class="modify-user-submit">确定</a>' + '   </p>' + '</div>';
				tpl = _.template(tpl)(userName);
				return tpl;
			},
			modifyUserName: function modifyUserName() {
				$('.modify-user-submit').on('tap', function() {
					var name = $.trim($('.modify-user-text').val());
					if (!/^[\dA-Za-z()]{1,20}$/.test(name.replace(/[\u4E00-\u9FA5（）]/g, 'aa'))) {
						Tribe.util.tips("请输入中英文、数字或圆括号，长度小于20个字母或10个汉字", 260);
						return false;
					}
					$.ajax({
						url: '/thirdapp/forum/submitUserNickname',
						type: 'POST',
						dataType: 'json',
						data: {
							userNickname: name
						}
					}).then(function(resp) {
						$('.modify-user-overlay, .modify-user-dialog').remove();
						document.body.scrollTop = 0;
						if (resp.success) {
							Tribe.util.tips("修改成功");
						} else {
							Tribe.util.tips("修改失败");
						}
					});
				});
				$('.modify-user-cancel').on('click', function() {
					$('.modify-user-overlay, .modify-user-dialog').remove();
					document.body.scrollTop = 0;
				});
			}
		};
		module.exports = alipayModifyUserName.init;

	}, {
		"./getUserInfo": 5
	}],
	3: [function(require, module, exports) {
		/*
		 * title:关注公众号
		 * */

		var carePublic = {
			init: function(obj) {
				if (obj && obj.networkId) this._networkId = obj.networkId;

			},
			isShare: function(cb, isDetail) {

				//normal
				var _value = Tribe.util.cookie('pcode') || null;
				var _userId = Tribe.util.cookie('pinvite') || null;
				this.publicArr.isDetail = isDetail;

				if ((_value == null || _userId == null) && isDetail) {
					this.getPublic(cb);
					return;
				}

				this._userId = _userId;
				//this.saveCareNum();
				if (_value != null && _userId != null) {
					this.getPublic(cb, true);
				} else {
					this.getPublic(cb, false);
				}
			},
			_userId: null,
			_networkId: null,
			imgSrc: '',
			publicArr: {},
			_codeWrap: null,
			saveCareNum: function() {
				//var _this = this;
				//$.ajax({
				//    type: 'POST',
				//    url: '/thirdapp/forum/saveCareNum',
				//    data: {
				//        shareUserId: _this.user_id
				//    },
				//    dataType: 'json'
				//}).done(function (resp) {
				//    if (!resp) {
				//        console.log("引流数添加失败");
				//        return;
				//    }
				//
				//});
			},
			getPublic: function(cb, fromSource) {
				var _this = this;
				$.ajax({
					type: 'Get',
					url: '/thirdapp/forum/getPublic',
					async: false,
					dataType: 'json'
				}).done(function(resp) {
					if (!resp) return;

					//公众号
					_this.publicArr.wechatPublicNumber = resp.wechatPublicNumber;
					if (resp.userName && resp.userName != "") {
						_this.publicArr.userName = resp.userName;
						_this.publicArr.headImgUrl = resp.headImgUrl;
						resp.isAuthorize = _this.publicArr.isAuthorize = true;
						resp.isCodeImg = _this.publicArr.isCodeImg = false;
					} else if (resp.customQRCodeUrl && resp.customQRCodeUrl != "") {
						resp.isAuthorize = _this.publicArr.isAuthorize = false;
						resp.isCodeImg = _this.publicArr.isCodeImg = true;
						_this.publicArr.customQRCodeUrl = resp.customQRCodeUrl;
					} else {
						resp.isAuthorize = _this.publicArr.isAuthorize = false;
						resp.isCodeImg = _this.publicArr.isCodeImg = false;
					}

					if (cb && typeof cb == 'function') {
						cb(_this.publicArr);
					}

					Tribe.util.cookie('pcode', null);
					Tribe.util.cookie('pinvite', null);


					//关注公众号弹层
					if (fromSource) {
						if (!resp.isAuthorize && !resp.isCodeImg && (resp.guideFollowLink == "" || resp.guideFollowLink == null)) {
							return;
						}
						if ((resp.isAuthorize || resp.isCodeImg) && _this.publicArr.isDetail) return;

						if ((resp.userName == "" || resp.userName == null) || (resp.headImgUrl == "" || resp.headImgUrl == null)) {
							_this.getSheQuInfo();
							resp.headImgUrl = "/space/c/photo/load?id=" + _this.publicArr.headImgUrl;
							if (resp.wechatPublicNumber == "" || resp.wechatPublicNumber == null) {
								resp.wechatPublicNumber = _this.publicArr.nickName;
							} else {
								_this.publicArr.nickName = resp.wechatPublicNumber;
							}

						}

						var shareWrapper = $(".public-wrapper");
						if (shareWrapper.length > 0) {
							shareWrapper.show();
						} else {
							$('body').append(_this.publicTpl(resp));
							$('.delBtn').on('click', function() {
								_this.delFun($(".public-wrapper"));
							});
							$('.showCodeBtn').on('click', function() {
								_this.showCodeFun();
							});
							$('.careLinkBtn').on('click', function() {
								var href = $(this).attr("data-href");
								window.location.href = href;
							});
						}
					}

				});
			},
			publicTpl: function(resp) {
				var _this = this;
				var _nameWidth = $(window).width() - 220;
				resp._nameWidth = _nameWidth;
				var wrapper = $(".public-wrapper");
				if (wrapper.length == 0) {
					var bottom = '0';
					if ($(".foot").length != 0) {
						bottom = $(".foot").height() + "px";
					}
					var _mask = '<div class="public-wrapper" style="bottom:1rem;" data-userid=' + _this._userId + '>' + '<div class="mask"></div>' + '<div class="care-msg">' + '<img class="care-img" src="<%=headImgUrl%>"/>' + '<p class="p-msg">' + '<% var name = wechatPublicNumber?wechatPublicNumber.substring(0,9):"";' + 'if(wechatPublicNumber && wechatPublicNumber.length>4) name = name + "..."%>' + '<span class="ellipsis" style="max-width:<%=_nameWidth%>px;"><%=name%></span>' + '</p>' + '<%if(isAuthorize || isCodeImg){%>' + '<a class="careBtn showCodeBtn"></a>' + '<%}else{%>' + '<a class="careBtn careLinkBtn" data-href="<%=guideFollowLink%>" target="_blank"></a>' + '<%}%>' + '<a class="delBtn upload_delete"></a>' + '</div>' + '</div>';
					_mask = _.template(_mask)(resp);
					return _mask;
				}
			},
			codeTpl: function(resp) {
				resp._top = ($(window).height() - 300) / 2 + "px";
				resp._right = ($(window).width() - 230) / 2 + "px";
				var _code = '<div class="code-wrapper" style="top:<%=_top%>;">' + '<a class="codeDelBtn">×</a>' + '<div class="codeInfo">' + '   <p class="">长按关注</p>' + '<%if(isAuthorize){%>' + '   <img src="http://open.weixin.qq.com/qr/code/?username=<%=userName%>"/>' + '<%}else if(!isAuthorize && isCodeImg){%>' + '   <img src="<%=customQRCodeUrl%>"/>' + '<%}%>' + '   <p class="ellipsis publicName"><%=wechatPublicNumber?wechatPublicNumber:"关注公众号才能回复、点赞"%></p>' + '</div>' + '</div>';
				return _.template(_code)(resp);
			},
			delFun: function(parentWrapper) {
				if (parentWrapper) parentWrapper.hide();
			},
			showCodeFun: function() {
				var _this = this;
				if (this._codeWrap) {
					var _name = this.publicArr.nickName || this.publicArr.wechatPublicNumber;
					$(".publicName", this._codeWrap).text(_name);
					this._codeWrap.show();
				} else {
					$('body').append(this.codeTpl(this.publicArr));
					this._codeWrap = $(".code-wrapper");
					$(".codeDelBtn").on('click', function() {
						_this.delFun(_this._codeWrap);
					});
				}
			},
			getSheQuInfo: function() {
				var _this = this;
				$.ajax({
					async: false,
					url: '/thirdapp/forum/defaultTribe',
					type: 'get',
					data: {
						"networkId": _this._networkId || Tribe.networkId
					},
					dataType: 'json'
				}).done(function(resp) {
					if (!resp || !resp.networkVO || !resp.networkVO.logoId) {
						console.log("获取本社区公众号错误");
						return;
					}
					_this.publicArr.headImgUrl = resp.networkVO.logoId;
					_this.publicArr.nickName = resp.networkVO.name;
				});
			},
			isShowModule: function(cb) {

				var _isShow = true;
				var _this = this;

				$.ajax({
					url: '/thirdapp/forum/showModule',
					type: 'GET',
					dataType: 'json'
				}).done(function(resp) {
					if (!resp) {
						_isShow = false;
					} else {
						if (resp.onlyFollowerCanReply && _this.publicArr.isAuthorize) {
							_this.isCarePublic(cb);
							return;
						} else {
							_isShow = true;
						}
					}
					if (cb && typeof cb == 'function') {
						cb(_isShow);
					}
				});

			},
			isCarePublic: function(cb) {
				var _isCare = true;
				$.ajax({
					url: '/thirdapp/forum/isFocusPublic',
					type: 'GET',
					dataType: 'json'
				}).done(function(resp) {
					if (resp && resp.message.subscribe) {
						_isCare = true;
					} else {
						_isCare = false;
					}
					if (cb && typeof cb == 'function') cb(_isCare);

				});

			},
			showPublicWindow: function(txt) {
				var _this = this;
				if (!this._codeWrap) {
					$('body').append(this.codeTpl(this.publicArr));
					this._codeWrap = $(".code-wrapper");
					$(".codeDelBtn").on('click', function() {
						_this.delFun(_this._codeWrap);
					});
				} else {
					this._codeWrap.show();
				}
				var _txt = txt ? txt : "关注公众号才能回帖、点赞";
				$("p:first", this._codeWrap).text(_txt);
			}

		}


		module.exports = carePublic;
	}, {}],
	4: [function(require, module, exports) {
		/*
		 * params:
		 * obj:参数数组
		 * wrapper:要清空内容的父标签的className
		 * isError:是否被封号
		 * */
		var fh = {
			init: function(obj) {
				this.isError = obj.isError;

				if (this.isError == "50002") {
					this.fhTpl();
					return true;
				} else {
					return false;
				}
			},
			fhTpl: function() {
				var _height = $(window).height();

				var tpl = '<div class="fh-wrapper" >' + '<div class="fh-box">' + '<img src="/thirdapp/forum/img/fhbg.png"/>' + '<p>您的帐号在此社区有违规行为,<br>暂时被管理员封停<br/></p>' + '<a class="firstBut">返回</a>' + '</div>' + '</div>';
				$('body').append(tpl);
				$(".firstBut").click(function() {
					wx.closeWindow();
				});


				$('body').css("height", _height + 'px');
				document.body.style.overflow = 'hidden';
			}
		}

		module.exports = fh;
	}, {}],
	5: [function(require, module, exports) {
		'use strict';

		var getUserInfo = function getUserInfo() {
				var def = $.Deferred();
				$.ajax({
					url: '/thirdapp/forum/getUser',
					dataType: 'json'
				}).then(function(resp) {
					if (resp && resp.success) def.resolve(resp);
					else def.reject(resp && resp.message.error_description || '获取用户信息失败');
				}, function(msg) {
					def.reject(msg || '获取用户信息失败');
				});
				return def.promise();
			};

		module.exports = getUserInfo;

	}, {}],
	6: [function(require, module, exports) {
		var Uploader = require('../lib/plugin/uploader');

		//上传图片
		var params = {
			// 最大上传多少张
			url: "/microblog/filesvr/upload",
			maxNum: 9,
			fileInput: $(".fileImage"),
			//url: $("#uploadForm").attr("action"),
			filter: function(files) {
				var arrFiles = [];
				var len = files.length > this.maxNum ? this.maxNum : files.length;
				var now_len = document.querySelector('.upload-box-container').getElementsByClassName('upload_append_list').length;


				if ((now_len + len) > 9) {
					len = 9 - now_len;
					Tribe.util.tips("最多只能显示9张图片", 2000);
				}


				for (var i = 0; i < len; ++i) {
					var file = files[i];

					if (Tribe.util.getOS() == 'ios') {
						if ("JPG|JPEG|PNG|GIF|".indexOf(file.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase() + '|') > -1) {
							if (file.size >= 1024000000) {
								Tribe.util.tips('图片"' + file.name + '"文件过大，应小于10M', 2000);
							} else {
								arrFiles.push(file);
							}
						} else {
							Tribe.util.tips('文件"' + file.name + '"不是图片。', 2000);
						}
					} else {
						if (file.size >= 1024000000) {
							Tribe.util.tips('图片"' + file.name + '"文件过大，应小于10M', 2000);
						} else {
							arrFiles.push(file);
						}
					}
				}
				return arrFiles;
			},
			onBeforeSend: function(file) {
				var html = '';
				html = html + '<div data-id="' + file.index + '" class="upload_append_list">' + '<span class="upload_delete" title="删除" data-index="' + file.index + '"></span>' + '<p>' + '<img id="uploadImage_' + file.index + '" src="" class="upload_image" /></p>' + '<div class="progress" id="uploadProgress_' + file.index + '"><div class="progress-bar"><span class="current-progress"></span></div></div>' + '</div>';
				var $add = $("#add");
				$add.before(html);
			},
			onSelect: function(file) {
				var funAppendImage = function() {
						var reader = new FileReader();
						reader.readAsDataURL(file);
						reader.onload = function(e) {
							var $add = $("#add");
							var container = document.querySelector('.upload-box-container');
							var maxWidth = container.parentNode.offsetWidth;
							var addOffsetLeft = $add[0].offsetLeft;
							var addWidth = $add[0].offsetWidth;
							var len = container.getElementsByClassName('upload_append_list').length;

							if (addOffsetLeft + addWidth > maxWidth && len < 9) container.style.left = -$add[0].offsetLeft + maxWidth - addWidth + 'px';

							//testtgtttt
							//$('.upload-box').css('border-bottom', '1px solid #ddd');
						};
					};
				funAppendImage();
				$('#add').css('display', 'inline-block');
				$(".fileImage").val("");
			},
			onProgress: function(file, loaded, total) {
				var eleProgress = $("#uploadProgress_" + file.index),
					percent = (loaded / total * 100).toFixed(2);
				var maxWidth = eleProgress.width();
				eleProgress.show().find('.current-progress').css('width', percent / 100 * maxWidth + 'px');
				$('.upload_delete[data-index="' + file.index + '"]').on('click', function() {
					clickFun(this);
				});
			},
			onSuccess: function(file, response) {
				var fileids = $("#sendMsg").attr('data-fileids');
				$("#sendMsg").attr('data-fileids', (fileids == '') ? response : (fileids += ',' + response)).removeClass('bg-gray');
				if ($('.upload_append_list').length === 9 || $('.upload_append_list').length > 9) {
					$('#add').hide();
					$(".fileImage").attr('disabled', 'disabled')
				}
				$('.upload_delete[data-index="' + file.index + '"]').attr('data-fileid', response);
				var eleProgress = $("#uploadProgress_" + file.index);
				eleProgress.hide();
				$('#uploadImage_' + file.index).attr('src', '/microblog/filesvr/' + response);
			},
			onFailure: function(file) {
				Tribe.util.tips("上传失败", 2000);
				$("#uploadImage_" + file.index).closest('.upload_append_list').remove();
			},
			onComplete: function() {
				//file控件value置空
				$(".fileImage").val("");
			}
		};
		//删除方法
		// $("body").on('tap', '.upload_delete', function () {
		//     clickFun();
		// });

		function clickFun(obj) {
			if (typeof obj == undefined) return;
			var _this = obj;
			$(_this).parents('.upload_append_list').remove();
			var arr = $("#sendMsg").attr('data-fileids').split(',');
			for (var i = 0; i < arr.length; i++) {
				if ($(_this).attr('data-fileid') == arr[i]) {
					arr.splice(i, 1);
				}
			}
			$("#sendMsg").attr('data-fileids', arr.toString());
			if (arr.length === 0) {
				$("#sendMsg").attr('data-fileids', '');
				$('#add').hide();
			}
			if ($('.upload_append_list').length < 9) {
				$('#add').css('display', 'inline-block');
				$(".fileImage").removeAttr('disabled');
			}
			if ($('.upload_append_list').length < 1 && $("#editor").val() == "") {
				$("#sendMsg").addClass('bg-gray');
			}
		}

		module.exports = $.extend({}, Uploader, params);

		//Uploader.init();
	}, {
		"../lib/plugin/uploader": 14
	}],
	7: [function(require, module, exports) {
		/**
		 * Created by Luke on 2015/2/9.
		 */

		(function($, module) {
			function Slider(elem, opts) {
				if (!elem) return;

				opts = opts || {};
				this.elem = elem;
				this.maxWidth = opts.maxWidth || document.body.clientWidth;

				var startPos = {
					x: null,
					y: null,
					left: 0,
					time: null
				};
				var endPos = Object.create(startPos);
				var end = false;

				this.init = function() {
					if (this.maxWidth == 0) return;
					this.elem.addEventListener('touchstart', this.startHandler.bind(this), false);
				};

				this.startHandler = function(e) {
					var touch = e.touches[0];
					startPos.x = touch.pageX;
					startPos.y = touch.pageY;
					var left = parseInt(window.getComputedStyle(this.elem).left, 10);
					startPos.left = left;
					startPos.time = +new Date();
					end = false;

					if (this.isMovable()) {
						this.elem.addEventListener('touchmove', this.moveHandler.bind(this), false);
						this.elem.addEventListener('touchend', this.endHandler.bind(this), false);
					}
				};

				this.moveHandler = function(e) {
					if (e.touches.length > 1 || e.scale && e.scale !== 1) return;

					var touch = e.touches[0];
					endPos.x = touch.pageX - startPos.x;
					endPos.y = touch.pageY - startPos.y;

					// 上下滑动不阻止默认事件
					if ((Math.abs(endPos.y) > 15 && Math.abs(endPos.x) < 15) || (Math.abs(endPos.y) > 10 && endPos.y < 0 && Math.abs(endPos.x) < 10)) {
						removeListener();
						return;
					}

					e.preventDefault();

					var left = startPos.left + endPos.x;
					//var lastElement = this.elem.lastElementChild;
					//lastElement = lastElement.style.display === 'none'
					//    ? lastElement.previousElementSibling : lastElement;
					//var lastOffsetLeft = lastElement.offsetLeft + lastElement.offsetWidth;
					//
					//if(left >= 0) left = 0;
					//else if(endPos.left + lastOffsetLeft < this.maxWidth) left = this.maxWidth - lastOffsetLeft;

					this.elem.style.left = left + 'px';
					endPos.left = left;
				};

				this.transitionEndHandler = function() {
					this.elem.classList.remove('slide-animate');
					this.elem.removeEventListener('transitionend', this.transitionEndHandler);
				};

				this.endHandler = function(e) {
					if (end) return;

					var duration = +new Date() - startPos.time;
					var width = parseInt(this.elem.firstElementChild.offsetWidth, 10);

					if (duration > 100) {

						var index;
						// 右移
						if (endPos.x > 15) {
							index = this.getCurrentIndex(-width / 2);
							if (index > -1) {
								//children = this.elem.children;
								//$(this.elem).animate({
								//    'left': -children[index].offsetLeft + 'px'
								//}, 200);
								//this.elem.style.left = -children[index].offsetLeft + 'px';
								//if(index === 0) this.elem.classList.add('slide-animate');
								if (index === 0) {
									$(this.elem).animate({
										'left': 0
									}, 200);
								}
							}
						}
						// 左移
						else if (endPos.x < -15) {
							var lastElement = this.elem.lastElementChild;
							lastElement = lastElement.style.display === 'none' ? lastElement.previousElementSibling : lastElement;
							var lastOffsetLeft = lastElement.offsetLeft + lastElement.offsetWidth;

							if (endPos.left + lastOffsetLeft < this.maxWidth) {
								$(this.elem).animate({
									'left': -(lastOffsetLeft - this.maxWidth) + 'px'
								}, 200);
								//this.elem.style.left = -(lastOffsetLeft - this.maxWidth) + 'px';
								//this.elem.classList.add('slide-animate');
							}
							//else {
							//    index = this.getCurrentIndex(-width / 2);
							//    if(index > -1) {
							//        children = this.elem.children;
							//        $(this.elem).animate({
							//            'left': -children[index].offsetLeft + 'px'
							//        }, 200);
							//        //this.elem.style.left = -children[index].offsetLeft + 'px';
							//    }
							//}
						}
					}

					removeListener();
					this.elem.addEventListener('transitionend', this.transitionEndHandler.bind(this), false);

					end = true;
				};

				this.isMovable = function(e) {
					var lastElement = this.elem.lastElementChild;
					if (lastElement) {
						lastElement = lastElement.style.display === 'none' ? lastElement.previousElementSibling : lastElement;
						var offsetLeft = lastElement.offsetLeft + lastElement.offsetWidth;
						if (offsetLeft > this.maxWidth) return true;
					}

					return false;
				};

				this.getCurrentIndex = function(offset) {
					offset = offset || 0;
					var children = this.elem.children;

					for (var i = 0, len = children.length; i < len; ++i) {
						var elem = children[i];
						var left = startPos.left + endPos.x;
						var offsetLeft = elem.offsetLeft;
						var visibleLeft = offsetLeft + left + offset;

						if (visibleLeft >= 0 || (elem.nextElementSibling && elem.nextElementSibling.offsetLeft + left + offset >= 0)) return i;
					}

					return -1;
				};

				var removeListener = (function() {
					this.elem.removeEventListener('touchmove', this.moveHandler);
					this.elem.removeEventListener('touchend', this.endHandler);
				}).bind(this);
			}

			module.exports = Slider;
		}($, module));
	}, {}],
	8: [function(require, module, exports) {
		"use strict";

		var _createClass = function() {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}
				return function(Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

		function _classCallCheck(instance, Constructor) {
			if (!(instance instanceof Constructor)) {
				throw new TypeError("Cannot call a class as a function");
			}
		}

		/*
		 * 免费电话
		 * */
		var validate = require("../lib/public/validation");
		var attachFastClick = require("fastclick");

		var FreeCall = function() {
				function FreeCall() {
					_classCallCheck(this, FreeCall);
				}

				_createClass(FreeCall, [{
					key: "init",
					value: function init() {
						var option = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						this.option = option;
						this.validMobile = false; //是否绑定手机号
						this.countMill = 60; //获取验证码倒计时

						this.continueCB = this.option.continueCB; //传入的确认时的回调函数
						this.cancelCB = this.option.cancelCB; //传入的取消时的回调函数
						this.isTipShow = this.option.isTipShow ? true : false; // 是否显示不再提示
						//拨打电话后会出现的状况
						this.statue = {
							"1000": '无效业务代码',
							'1001': '无效主叫号码',
							'1002': '无效被叫号码',
							'1003': '呼叫失败',
							'1004': '欠费'
						};
					}
				}, {
					key: "getUserInfo",
					value: function getUserInfo() {
						var me = this;
						return $.ajax({
							type: 'GET',
							url: '/thirdapp/forum/getUser',
							dataType: 'json'
						});
					}
				}, {
					key: "callNumber",
					value: function callNumber(userId) {
						var _this = this;

						var me = this;
						var toUserId = userId || '';

						if (toUserId == Tribe.userId) {
							Tribe.util.tips("这是你自己发的帖子哦");
							return;
						}

						$.ajax({
							url: '/thirdapp/forum/callNum',
							type: 'POST',
							dataType: 'json',
							data: {
								toUserId: toUserId
							}
						}).then(function(resp) {
							if (!resp || !resp.success) {
								Tribe.util.tips("拨打电话失败");
								return;
							}

							var data = resp.message;
							if (!data.success) {
								if (!data.errorCode) {
									Tribe.util.tips("" + data.errormsg || "拨打电话失败");
									return;
								}
								switch (data.errorCode) {
								case '1004':
									var option = {
										'content': '本月的免费电话已经被大家打完啦，下月1号再继续哦！',
										'cantinueName': '我知道了',
										'hideCancelBtn': true
									};
									Tribe.util.confirm(obj);
									break;
								default:
									Tribe.util.tips(_this.statue[data.errorCode]);
									break;
								}
								return;
							}

							if (data.success) me.callTpl();
						});
					}
				}, {
					key: "callTpl",
					value: function callTpl() {
						var tpl = "<div class=\"j-callBack-wrap freeCallWrap\">\n            <div class=\"abs-bg\"></div>\n\n            <div class=\"bounceIn tplLayerCard mod05 tplIng-card\">\n                <a class=\"j-cB-closeBtn close\">×</a>\n                <div class=\"tpling-con\">\n                <h2>请接听微信社区来电</h2>\n                <div class=\"tpl\">\n                    <p>通话过程不消耗流量</p>\n                </div>\n                <p class=\"tplImg\"></p>\n                <p style=\"text-align: left;\">*部分用户可能因手机套餐类型，由运营商收取接听或漫游费用</p>\n                </div>\n            </div>\n        </div>";
						$('body').append(tpl);

						$('.j-cB-closeBtn', '.j-callBack-wrap').on('click', function() {
							$('.j-callBack-wrap').remove();
						});
					}
				}, {
					key: "bindMobileTpl",
					value: function bindMobileTpl() {
						var _this2 = this;

						var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						if (obj.continueCB || obj.cancelCB) {
							this.continueCB = obj.continueCB; //传入的确认时的回调函数
							this.cancelCB = obj.cancelCB; //传入的取消时的回调函数
							this.isTipShow = obj.isTipShow ? true : false; // 是否显示不再提示
						}

						var tpl = " <div class=\"j-mobile-wrap freeCallWrap\">\n                    <div class=\"abs-bg\"></div>\n                    <div class=\"bounceIn tplLayerCard mod05\">\n                    <div class=\"layer-hd-bg\">\n                        <a class=\"j-closeBtn close\">×</a>\n                        <p class=\"tips-text\">本社区已开通免费电话功能，请绑定手机号码立即体验！</p>\n                    </div>\n                    <div class=\"telInfo\">\n                        <input type=\"text\" placeholder=\"手机号码\" class=\"j-mobile\" />\n                    <div class=\"infoPart\">\n                        <input type=\"text\" placeholder=\"验证码\" class=\"j-codes imageCode\" />\n                        <button class=\"j-codesBtn j-curr getCode\">获取验证码</button>\n                    </div>\n                        <button class=\"j-bindBtn j-curr btn\">确认</button>\n                        <a class=\"blue-text\" href=\"http://www.xingdongliu.com/world/view?key=MDAwMDAwMDAwMDRkNzY2MWFkZTA2\">什么是免费电话</a>\n                        <a class=\"j-tipsBtn " + (this.isTipShow ? '' : 'none') + "\">不再提示</a>\n                    </div>\n                </div>\n                </div>";
						$('body').append(tpl);

						attachFastClick($('.j-mobile-wrap')[0]);

						$('.j-mobile-wrap').on('click', '.j-codesBtn', function(e) {
							return _this2.sendNoteCode(e);
						}); //获取验证码
						$('.j-mobile-wrap').on('click', '.j-bindBtn', function() {
							return _this2.checkNote();
						}); //手机号码绑定
						$('.j-mobile-wrap').on('click', '.j-tipsBtn', function() {
							return _this2.setTip();
						}); //设置不再提示
						$('.j-mobile-wrap').on('click', '.j-closeBtn', function(e) {
							_this2.cancelBind(e);
						});
					}
				}, {
					key: "sendNoteCode",
					value: function sendNoteCode(e) {
						var _this3 = this;

						if (e) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}

						var codeBtn = $('.j-codesBtn');
						if (!codeBtn.hasClass('j-curr')) return;
						var me = this;

						if (this.validateValue()) {

							codeBtn.removeClass('j-curr').addClass('bg-gray').text('60s');
							this.countvariable = setInterval(function() {
								return _this3.countDown();
							}, 1000);

							var mobile = $('.j-mobile').val();
							$.ajax({
								type: 'POST',
								url: '/thirdapp/forum/getOnlyNoteCode',
								data: {
									"mobile": mobile
								},
								dataType: 'json'
							}).then(function(resp) {
								if (!resp || !resp.success) {
									clearInterval(me.countvariable);
									codeBtn.addClass('j-curr').removeClass('bg-gray').text("获取验证码");
									Tribe.util.tips("获取验证码失败，请重新获取");
									return;
								}
							});
						}
					}
				}, {
					key: "countDown",
					value: function countDown() {
						var codeBtn = $('.j-codesBtn');
						this.countMill--;
						codeBtn.text(this.countMill + "s");
						if (this.countMill == 0 || this.countMill < 0) {
							clearInterval(this.countvariable);
							codeBtn.addClass('j-curr').removeClass('bg-gray').text("获取验证码");
							this.countMill = 60;
						}
					}
				}, {
					key: "validateValue",
					value: function validateValue(type) {
						var mobile = $('.j-mobile').val();
						if (mobile == "" || mobile == null) {
							Tribe.util.tips("请输入手机号码");
							return false;
						} else if (!validate.isTel(mobile)) {
							Tribe.util.tips("请输入正确的手机号码");
							return false;
						}

						var code = $('.j-codes').val();
						if ((code == "" || code == null) && type == "bindBtn") {
							Tribe.util.tips("请输入验证码");
							return false;
						}

						return true;
					}
				}, {
					key: "checkNote",
					value: function checkNote() {

						var me = this;
						var vcode = $('.j-codes');
						var bindBtn = $('.j-bindBtn');
						var mobile = $('.j-mobile').val();
						var isBool = this.validateValue("bindBtn");

						if (isBool && bindBtn.hasClass('j-curr')) {

							bindBtn.removeClass('j-curr');

							$.ajax({
								type: 'post',
								url: '/thirdapp/forum/checkVCode',
								data: {
									mobile: mobile,
									vcode: vcode.val()
								},
								dataType: 'json'
							}).then(function(resp) {
								if (!resp || !resp.success) {
									Tribe.util.tips("短信验证码错误,请重填！");
									bindBtn.addClass('j-curr');
									return;
								}

								var isBind = false;
								me.checkNum(mobile).then(function(resp) {

									if (resp && resp.message.status == "ACTIVITED") {
										if ($('.j-mobile-wrap').length != 0) $(".j-mobile-wrap").remove();
										me.reBindTpl(mobile);
									} else if (resp && !resp.success) {
										Tribe.util.tips(resp.message.error_description);
									} else {
										me.bindNumber(mobile);
									}
								});
							});
						}
					}
				}, {
					key: "checkNum",
					value: function checkNum(mobile) {
						//检测该手机号码是否已经绑定
						var accountName = mobile;
						return $.ajax({
							type: 'GET',
							url: '/thirdapp/forum/checkMobile',
							data: {
								accountName: accountName
							},
							dataType: 'json'
						});
					}
				}, {
					key: "reBindTpl",
					value: function reBindTpl(mobile) {
						var me = this;
						var obj = {
							'title': '此号码已被使用',
							'content': "绑定后将保留" + mobile + "的发帖和积分等记录，原账号信息将被清空。",
							continueBtnText: '重新绑定',
							cancelBtnText: '取消'
						};
						this.warningTpl(obj);
						$('.j-warningTip').on('click', '.continueBtn', function() {
							$('.j-warningTip').remove();
							me.bindNumber(mobile);
						});
						$('.j-warningTip').on('click', '.cancelBtn', function(e) {
							$('.j-bindBtn').addClass('j-curr');
							me.cancelBind(e);
						});
					}
				}, {
					key: "cancelBind",
					value: function cancelBind(e) {
						e.stopImmediatePropagation();
						if ($('.j-mobile-wrap').length != 0) $('.j-mobile-wrap').remove();
						if ($('.j-warningTip').length != 0) $('.j-warningTip').remove();
						if (typeof this.cancelCB == 'function') {
							this.cancelCB();
						}
					}
				}, {
					key: "bindNumber",
					value: function bindNumber(moblie) {
						var _this4 = this;

						var me = this;
						var bindBtn = $('.j-bindBtn');
						var codeBtn = $('.j-codesBtn');
						$.ajax({
							type: 'post',
							url: '/thirdapp/forum/bindMobile',
							data: {
								userId: Tribe.userId,
								mobile: moblie
							},
							dataType: 'json',
							error: function error(data) {
								Tribe.util.tips("绑定手机号码失败，请重试！");
								clearInterval(me.countvariable);
								codeBtn.addClass('j-curr').text("获取验证码");
								bindBtn.addClass('j-curr');
								return;
							}
						}).then(function(resp) {

							clearInterval(me.countvariable);
							_this4.countMill = 60;
							codeBtn.addClass('j-curr').text("获取验证码");
							bindBtn.addClass('j-curr');
							if (!resp || !resp.success) {
								Tribe.util.tips("绑定手机号码失败，请重试！");
								return;
							}

							me.validMobile = true;
							Tribe.util.tips("绑定手机号码成功！");

							if ($('.j-mobile-wrap').length != 0) $('.j-mobile-wrap').remove();

							if (typeof me.continueCB == 'function') {
								me.continueCB();
							}
						});
					}
				}, {
					key: "checkTip",
					value: function checkTip() {
						return $.ajax({
							type: 'GET',
							url: '/thirdapp/forum/checkTips',
							data: {
								'function': 'freeCall'
							},
							dataType: 'json'
						});
					}
				}, {
					key: "setTip",
					value: function setTip() {
						var me = this;
						$.ajax({
							type: 'POST',
							url: '/thirdapp/forum/setTips',
							data: {
								'function': 'freeCall'
							},
							dataType: 'json'
						}).then(function(resp) {
							if (!resp || !resp.success) {
								Tribe.util.tips("设置不再提示失败");
								return;
							}

							if (typeof me.continueCB == 'function') {
								me.continueCB();
							}
						});
					}
				}, {
					key: "warningTip",
					value: function warningTip() {
						var option = {
							'content': '当前用户已开启免打扰模式，请稍后再试。',
							'cancelBtnText': '我知道了',
							'isDisplay': 'none'
						};
						this.warningTpl(option);
						$('.j-warningTip').on('click', '.cancelBtn', function(e) {
							$(".j-warningTip").remove();
						});
					}
				}, {
					key: "warningTpl",
					value: function warningTpl() {
						var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						var tpl = "<div class=\"j-warningTip\">\n            <div class=\"abs-bg\"></div>\n            <div class=\"bounceIn tplLayerCard\">\n            <div class=\"mainInfo\">\n                <h3>" + (obj.title || '') + "</h3>\n                <p class=\"about-ad-info-card\">" + (obj.content || '') + "</p>\n            </div>\n            <div class=\"setBtn layout-box\">\n                <a class=\"cancelBtn box-col\">" + (obj.cancelBtnText || '') + "</a>\n                <i class=\"line-gradients\"></i>\n                <a class=\"continueBtn box-col " + obj.isDisplay + "\" >" + (obj.continueBtnText || '') + "</a>\n            </div>\n            </div>\n        </div>";
						$('body').append(tpl);
					}
					//获取和设置免打扰

				}, {
					key: "getNoDisturb",
					value: function getNoDisturb(userId) {

						return $.ajax({
							type: 'GET',
							url: '/thirdapp/forum/checkUserCallStatus',
							data: {
								userId: userId
							},
							dataType: 'json'
						});
					}
				}, {
					key: "setNoDisturb",
					value: function setNoDisturb(status) {

						return $.ajax({
							type: 'POST',
							url: '/thirdapp/forum/setUserCallStatus',
							data: {
								isCloseFreeCall: status
							},
							dataType: 'json'
						});
					}
				}]);

				return FreeCall;
			}();

		module.exports = new FreeCall();

	}, {
		"../lib/public/validation": 16,
		"fastclick": 18
	}],
	9: [function(require, module, exports) {
		var location = {

			init: function() {
				this.readyFun();
				var _this = this;
				$(".site-btn").on("click", function() {
					_this.optionSite(this);
				});
				//判断是否在加载地理位置
				this.isSite = false;
			},
			readyFun: function(obj) {
				var _this = this;

				var requestNetworkInfo = $.ajax({
					url: '/thirdapp/forum/showNetwork',
					type: 'GET',
					dataType: 'json'
				});
				requestNetworkInfo.then(function(resp) {
					_this.getLocation(_this);
				});
			},
			getLocation: function(obj) {
				var _this = obj;
				var getLocation = {
					type: 'gcj02',
					success: function(res) {
						var latitude = res.latitude; //纬度
						var longitude = res.longitude; //经度
						var speed = res.speed; //速度
						var accuracy = res.accuracy; //位置精度
						_this.getName(latitude, longitude);
						_this.isSite = false;
					},
					cancel: function(res) {
						$(".select-site").removeClass("show-curr");
						$(".select-site").addClass("show");
						$(".site-name").text("点击开启定位");
						_this.isSite = false;
					}
				};

				wx.getLocation(getLocation);

			},
			getName: function(latitude, longitude) {
				// var location = latitude +","+longitude;
				$.ajax({
					type: 'GET',
					url: "/thirdapp/forum/getLocation",
					data: {
						latitude: latitude,
						longitude: longitude
					},
					dataType: 'json',
					success: function(resp) {
						$(".select-site").removeClass("show");
						$(".select-site").addClass("show-curr");
						$(".site-name").attr("data-latitude", latitude);
						$(".site-name").attr("data-longitude", longitude);
						$(".site-name").text(resp.location);
					},
					error: function(msg) {
						$(".select-site").removeClass("show-curr");
						$(".select-site").addClass("show");
						$(".site-name").attr("data-latitude", "-1");
						$(".site-name").attr("data-longitude", "-1");
						$(".site-name").text("点击开启定位");
					}
				});
			},
			optionSite: function(obj) {
				var _site = $(".site-btn").text();
				if (_site == "点击开启定位" && !this.isSite) {
					this.isSite = false;
					this.getLocation(this);
					$(".site-name").text("正在定位中...");

				} else {
					$(".select-site").removeClass("show-curr");
					$(".select-site").addClass("show");
					$(".site-name").attr("data-latitude", "-1");
					$(".site-name").attr("data-longitude", "-1");
					$(".site-name").text("点击开启定位");
				}
			}
		};

		module.exports = location;


	}, {}],
	10: [function(require, module, exports) {
		'use strict';

		Object.defineProperty(exports, "__esModule", {
			value: true
		});

		var _createClass = function() {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}
				return function(Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

		function _classCallCheck(instance, Constructor) {
			if (!(instance instanceof Constructor)) {
				throw new TypeError("Cannot call a class as a function");
			}
		}

		/**
		 * 话题列表
		 */

		var Topic = exports.Topic = function() {
				function Topic() {
					var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

					_classCallCheck(this, Topic);

					this.getHotTopicCallback = options.getHotTopicCallback ||
					function() {};
					this.root = options.root;
				}

				_createClass(Topic, [{
					key: 'init',
					value: function init() {
						var topicWrap = '<div class="topic-item-mod"></div>';

						if (!$('.topic-item-mod').length) {
							$(topicWrap).appendTo(this.root);
							this.getHotTopic();
							this.onTopicClick();
						} else {
							$('.topic-item-mod').show();
						}
					}
				}, {
					key: 'getHotTopic',
					value: function getHotTopic() {
						//获取版块
						var _this = this;
						$.ajax({
							'type': 'GET',
							'url': '/thirdapp/forum/getSections',
							data: {},
							'dataType': 'json'
						}).done(function(resp) {
							var $topicItemMod = $(".topic-item-mod");
							if (resp && resp.message.length == 0) {
								$topicItemMod.hide();
								$('.topic-btn-item').parent().hide();
								$(".msg-btn").click();
								return;
							}
							$topicItemMod.html(_this.topicTpl(resp));
							_this.getHotTopicCallback();
						});
					}
				}, {
					key: 'onTopicClick',
					value: function onTopicClick() {
						$('.topic-item-mod').on('click', '.topic-hot-item', function() {
							$(this).toggleClass('curr');
							$(this).siblings('a').removeClass('curr');
						});
					}
				}, {
					key: 'topicTpl',
					value: function topicTpl(resp) {
						var reg = new RegExp(/\//g);
						var isAdmin = $('#sendMsg').attr('data-isAdmin') === 'true' ? true : false;
						var str = '<%if(message.length == 0){}else{%>' + '<%_.each(message,function(item,index){' + 'if(index > 15) return;%>' + '   <a class="topic-hot-item ellipsis" href="javascript:;" data-sectionId="<%=item.id%>"><%=item.sectionName%></a>' + '<%});%>' + '<%}%>';
						if (!isAdmin) {
							str = '<%if(message.length == 0){}else{%>' + '<%_.each(message,function(item,index){' + 'if(index > 15) return;%>' + '<%if(!item.onlyAvailableForAdmin){%>' + '   <a class="topic-hot-item ellipsis" href="javascript:;" data-sectionId="<%=item.id%>"><%=item.sectionName%></a>' + '<%}%>' + '<%});%>' + '<%}%>';
						}
						resp.reg = reg;
						str = _.template(str)(resp);
						return str;
					}
				}], [{
					key: 'getInstance',
					value: function getInstance() {
						for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
							arg[_key] = arguments[_key];
						}

						if (!this.instance) this.instance = new(Function.prototype.bind.apply(this, [null].concat(arg)))();
						this.instance.init();
					}
				}]);

				return Topic;
			}();

	}, {}],
	11: [function(require, module, exports) {
		//视频

		var videoAnalyze = {
			boxWrapper: null,
			videoWrapper: null,
			videoData: null,
			videoNum: 1,
			cb: null,
			init: function(wrapper, cb) {
				var _this = this;
				_this.cb = cb;
				this.boxWrapper = wrapper;
				var videoWrapper = $(".upload-video");
				if (videoWrapper && videoWrapper.length != 0) {
					videoWrapper.show();
				} else {
					this.boxWrapper.append(this.loadTpl);
					this.videoWrapper = $(".upload-video");
					$(".upload-video-btn", this.videoWrapper).bind('click', function() {
						if (!_this.requestVideo) {
							_this.requestVideo = true;
							_this.videoNum = 0;
							_this.analyzeUrl(this);
						}
					});
				}
			},
			loadTpl: '<div class="upload-video"><div class="load-video">' + '<div class="video-linkadd">' + '   <input placeholder="粘贴视频地址" type="url" class="video-addr"/>' + '   <button class="upload-video-btn">上传</button>' + '</div>' + '   <p class="video-txt">将视频播放地址(电脑端和手机端)复制粘贴到上方，支持腾讯视频、优酷、土豆。</p>' + '</div></div>',
			showTpl: function(data) {
				var str = '<div class="show-video none" videoId="<%=vid%>">' + '     <a class="del-video-btn upload_delete" href="#"></a>' + '     <iframe class="video-iframe" src="<%=embedVideoURL%>" frameborder="0" allowfullscreen >' + '     您的浏览器不支持视频播放</iframe> ' + '   <div class="video-info-mod"><span class="ellipsis video-info"><%=title%></span><span class="video-ly"><%=videoTypeName%></span></div>' + '</div>';
				if (data.embedVideoURL.split("?").length == 1) {
					data.embedVideoURL = data.embedVideoURL + "?auto=0&tiny=0";
				} else {
					data.embedVideoURL = data.embedVideoURL + "&auto=0&tiny=0";
				}
				if (data.keys) {
					data.vid = data.keys.vid;
				} else {
					data.vid = '';
				}

				switch (data.videoType) {
				case "TECENT":
					data.videoTypeName = "腾讯视频";
					break;
				case "YOUKU":
					data.videoTypeName = "优酷视频";
					break;
				case "TUDOU":
					data.videoTypeName = "土豆视频";
					break;
				default:
					data.videoTypeName = "";
					break;
				}

				return _.template(str)(data);
			},
			requestVideo: false,
			tips: function(str, time) {
				var _left = ($(window).width() - 145) / 2 + "px";
				var obj = {
					'str': str
				};

				var tipsDiv = $(".videoTips");
				if (tipsDiv.length == 0) {
					var _str = '<div class="videoTips tips" style="left:' + _left + '">' + str + '</div>';
					$('body').append(_.template(_str)(obj));
				} else {
					tipsDiv.text(obj.str);
				}

				$(".videoTips").css("visibility", 'visible');
				if (time) {
					setTimeout(function() {
						$(".videoTips").css("visibility", 'hidden');
					}, time);
				}
			},
			analyzeUrl: function(obj) {
				var _this = this;
				var _url = $(".video-addr").val();
				if (!_url.match(this.urlRex)) {
					_this.requestVideo = false;
					return;
				}
				_this.tips('视频正在上传中,请稍候...');
				$.ajax({
					url: '/thirdapp/forum/analyzeUrl',
					type: 'POST',
					data: {
						url: _url
					},
					dataType: 'json'
				}).done(function(resp) {
					if (resp.success) {
						_this.videoWrapper.append(_this.showTpl(resp.message));
						_this.videoData = resp.message;
						$(".load-video").removeClass("page-from-left");
						$(".load-video").addClass("none");
						$(".show-video").addClass("page-from-left");
						$(".del-video-btn", _this.videoWrapper).bind('click', _this.delVideo);
						_this.requestVideo = false;
						_this.tips("视频上传成功", 3000);

						if (typeof(_this.cb) == 'function') {
							_this.cb(_this.videoData);
						}

					} else {
						_this.videoNum++;
						if (_this.videoNum <= 3) {
							_this.analyzeUrl();
						} else {
							$(".videoTips").css("visibility", 'hidden');
							if (resp.message.error_code == "30017") {
								Tribe.util.tips("该地址暂时不支持获取视频分享内容,请更换地址", 2000);
							} else {
								Tribe.util.tips("上传失败，请检查网络或重新上传", 2000);
							}

							_this.videoNum = 1;
							_this.requestVideo = false;
						}
					}
				});
			},
			urlRex: /(http|https|ftp|Http)\:\/\/[\.\-\_\/a-zA-Z0-9\~\?\%\#\=\@\:\&\;\*\+\!\(\)\{\}]+\b[\?\#\/\*\=]*/g,
			delVideo: function(obj) {
				var _this = obj;
				$(this).parent().remove();
				$(".load-video").addClass("page-from-left");
			}
		}

		module.exports = videoAnalyze;
	}, {}],
	12: [function(require, module, exports) {
		'use strict';

		var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ?
		function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
		};

		var wxUploadImage = {
			localId: [],
			serverId: [],
			downloadId: [],
			getIds: function getIds(lid, sid) {
				var me = this;
				$.ajax({
					url: '/thirdapp/forum/wxUploadImage',
					type: 'POST',
					dataType: 'json',
					data: {
						weixinFileId: sid
					}
				}).then(function(resp) {
					if (resp.success) {
						var fileids = $("#sendMsg").attr('data-fileids');
						var fid = resp.message[sid];
						if (fid) {
							fileids = fileids == '' ? fid : fileids += ',' + fid;
							$("#sendMsg").attr('data-fileids', fileids).removeClass('bg-gray');
							if ($('.upload_append_list').length === 9 || $('.upload_append_list').length > 9) {
								$('#add').hide();
							}
							$('.upload_delete[data-index="' + lid + '"]').attr('data-fileid', fid);
							$("#uploadProgress_" + lid).hide();
						} else {
							Tribe.util.tips("上传失败.5001", 2000);
							$("#uploadImage_" + lid).closest('.upload_append_list').remove();
							$("#fromWx").hide();
							$(".fileImage").show().css("opacity", "0");
						}
					} else {
						Tribe.util.tips("上传失败.5002", 2000);
						$("#uploadImage_" + lid).closest('.upload_append_list').remove();

						//切换上传图片组件
						$("#fromWx").hide();
						$(".fileImage").show().css("opacity", "0");
					}

					if ($('.upload_append_list').length === 9 || $('.upload_append_list').length > 9) {
						$('#add').hide();
					} else {
						$('#add').show();
					}
				}, function(msg) {
					Tribe.util.tips("上传失败.5003", 2000);

					$("#uploadImage_" + lid).closest('.upload_append_list').remove();

					if ($('.upload_append_list').length === 9 || $('.upload_append_list').length > 9) {
						$('#add').hide();
					} else {
						$('#add').show();
					}
					//切换上传图片组件
					$("#fromWx").hide();
					$(".fileImage").show().css("opacity", "0");
				});
			},
			clickFun: function clickFun(obj) {
				if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == undefined) return;
				var _this = obj;
				$(_this).parents('.upload_append_list').remove();
				var arr = $("#sendMsg").attr('data-fileids').split(',');
				for (var i = 0; i < arr.length; i++) {
					if ($(_this).attr('data-fileid') == arr[i]) {
						arr.splice(i, 1);
					}
				}
				$("#sendMsg").attr('data-fileids', arr.toString());
				if (arr.length === 0) {
					$("#sendMsg").attr('data-fileids', '');
					$('#add').hide();
				}
				if ($('.upload_append_list').length < 9) {
					$('#add').css('display', 'inline-block');
					$(".fileImage").removeAttr('disabled');
				}
				if ($('.upload_append_list').length < 1 && $("#editor").val() == "") {
					$("#sendMsg").addClass('bg-gray');
				}
			},
			tpl: function tpl(id) {
				var html = '',
					reg = /\:|\//g,
					itemId = id.replace(reg, ''),
					me = this;
				html += '<div data-id="' + itemId + '" class="upload_append_list">' + '<span class="upload_delete" title="删除" data-index="' + itemId + '"></span>' + '<p>' + '<img id="uploadImage_' + itemId + '" src="' + id + '" class="upload_image" /></p>' + '<div class="progress" id="uploadProgress_' + itemId + '"><div class="progress-bar"></div><img src="/thirdapp/forum/img/new_loading.gif" class="loading" /></div>' + '</div>';
				var $add = $("#add");
				$add.before(html);
				$('.upload_delete[data-index="' + itemId + '"]').on('click', function(e) {
					var target = $(e.currentTarget);
					me.clickFun(target);
				});
			},
			wxUpload: function wxUpload() {
				var i = 0,
					me = this,
					length = me.localId.length,
					reg = /\:|\//g;

				function upload() {
					var lid = me.localId[i].replace(reg, '');
					wx.uploadImage({
						localId: me.localId[i],
						isShowProgressTips: 0,
						success: function success(res) {
							i++;
							//判断微信上传的图片的mediaId是否为空
							if (!res.serverId) {
								$("#uploadImage_" + lid).closest('.upload_append_list').remove();

								//切换上传图片组件
								$("#fromWx").hide();
								$(".fileImage").show().css("opacity", "0");
							} else {
								if (i < length) {
									upload();
								}
								me.getIds(lid, res.serverId);
							}
						},
						fail: function fail(res) {
							Tribe.util.tips("上传失败.5004", 2000);
							$("#uploadImage_" + lid).closest('.upload_append_list').remove();
							i++;
							if (i < length) {
								upload();
							}

							//切换上传图片组件
							$("#fromWx").hide();
							$(".fileImage").show().css("opacity", "0");
						}
					});
				}

				upload();
			},
			chooseImg: function chooseImg() {
				var me = this;
				var i = void 0;
				var now_len = document.querySelector('.upload-box-container').getElementsByClassName('upload_append_list').length;
				wx.chooseImage({
					count: 9 - now_len,
					sourceType: ["album", "camera"],
					success: function success(res) {
						me.localId = res.localIds;
						me.wxUpload();
						for (i = 0; i < me.localId.length; i++) {
							me.tpl(me.localId[i]);
						}
					}
				});
			},
			init: function init() {
				var me = this;
				$("body").on('click', '#fromWx', function() {
					me.chooseImg();
				});
			}
		};
		module.exports = wxUploadImage;

	}, {}],
	13: [function(require, module, exports) {
		/**
		 * ��nodejs��querystringģ���Բ�ѯ�ַ�������һ�¡�
		 * ֻ�ṩ�˺�nodejs��qs.parse()��qs.stringify()����������
		 */

		/**
		 * ����ת�����ַ���
		 * @param {*} a
		 * @returns {String}
		 */

		function stringifyPrimitive(a) {
			switch (typeof a) {
			case 'string':
				return a;
			case 'boolean':
				return a ? 'true' : 'false';
			case 'number':
				return isFinite(a) ? a + '' : '';
			default:
				return '';
			}
		}

		/**
		 * ���������л�(�ᱻ���룬��������ת��)
		 *
		 * @param {Object} obj
		 * @param {String} sep ÿ��key/value�����ӷ�"&"
		 * @param {String} eq key��value�����ӷ���Ĭ��"="
		 * @returns {string}
		 * @example
		 *   var a = {a: 1, b: [1, 2, 3], c: {a: 1, b: 2}};
		 *   stringify(a);
		 *   output: "a=1&b=1&b=2&b=3&c="
		 *
		 */
		var stringify = Object.keys && Array.map && Array.isArray ?
		function(obj, sep, eq) {
			sep = sep || '&';
			eq = eq || '=';

			if (obj === null) obj = undefined;

			if (typeof obj === 'object') {
				return Object.keys(obj).map(function(k) {
					var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;

					if (Array.isArray(obj[k])) {
						return obj[k].map(function(v) {
							return ks + encodeURIComponent(stringifyPrimitive(v));
						}).join(sep);
					} else {
						return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
					}
				}).join(sep);
			}

			return '';
		} : function(obj, sep, eq) {
			sep = sep || '&';
			eq = eq || '=';
			if (obj === null) obj = undefined;

			var str = '';
			if (typeof obj === 'object') {
				var ks, j, v, k, i;

				for (i in obj) {
					if (!obj.hasOwnProperty(i)) continue;

					ks = encodeURIComponent(i) + eq;
					k = obj[i];

					if (Object.prototype.toString.call(obj[i]) === '[object Array]') {
						for (j = 0; j < k.length; j++) {
							v = k[j];
							str += ks + encodeURIComponent(stringifyPrimitive(v)) + sep;
						}
					} else {
						str += ks + encodeURIComponent(stringifyPrimitive(k)) + sep;
					}
				}

				str = str.slice(0, str.length - 1);
			}

			return str;
		};

		/**
		 * ���ַ��������л����ᱻ���룩
		 *
		 * @param {String} qs
		 * @param {String} sep ÿ��key/value�����ӷ�"&"
		 * @param {String} eq key��value�����ӷ���Ĭ��"="
		 * @returns {Object}
		 * @example
		 *   var a = "a=1&b=1&b=2&b=3&c=";
		 *   parse(a);
		 *   output: {a: 1, b: [1, 2, 3], c: ""}
		 */
		var parse = function(qs, sep, eq) {
				sep = sep || '&';
				eq = eq || '=';
				var obj = {};

				if (typeof qs !== 'string' || !qs.length) return obj;

				var regexp = /\+/g;
				qs = qs.split(sep);
				var part, lStr, rStr, index;

				for (var i = 0, len = qs.length; i < len; i++) {
					part = qs[i].replace(regexp, '%20');
					index = part.indexOf(eq);

					if (index >= 0) {
						lStr = part.slice(0, index);
						rStr = part.slice(index + 1);
					} else {
						lStr = part;
						rStr = '';
					}

					lStr = decodeURIComponent(lStr);
					rStr = decodeURIComponent(rStr);

					if (!obj.hasOwnProperty(lStr)) {
						obj[lStr] = rStr;
					} else if (Object.prototype.toString.call(obj[lStr]) === '[object Array]') {
						obj[lStr].push(rStr);
					} else {
						obj[lStr] = [obj[lStr], rStr];
					}
				}

				return obj;
			};

		var QueryString = {
			parse: parse,
			stringify: stringify
		};

		module.exports = QueryString;
	}, {}],
	14: [function(require, module, exports) {
		var Uploader = {
			fileInput: null,
			//html file控件
			//url: "/microblog/filesvr/upload",                        //ajax地址
			fileFilter: [],
			//过滤后的文件数组
			filter: function(files) { //选择文件组的过滤方法
				return files;
			},
			onSelect: function() {},
			//文件选择后
			onDelete: function() {},
			//文件删除后
			onProgress: function() {},
			//文件上传进度
			onSuccess: function() {},
			//文件上传成功时
			onFailure: function() {},
			//文件上传失败时,
			onComplete: function() {},
			//文件全部上传完毕时
			// 文件上传之前
			onBeforeSend: function() {},

			/* 开发参数和内置方法分界线 */

			//获取选择文件
			funGetFiles: function(e) {
				// 获取文件列表对象
				var files = e.target.files || e.dataTransfer.files;
				//继续添加文件
				this.fileFilter = this.filter(files);
				this.funDealFiles();
				return this;
			},
			index: new Date().getTime(),
			//选中文件的处理与回调
			funDealFiles: function() {
				//var file = this.fileFilter[0];
				for (var i = 0, file; file = this.fileFilter[i]; i++) {
					//增加唯一索引值
					file.index = this.index++;
					//执行选择回调
					this.onSelect(this.fileFilter[i]);
				}

				return this;
			},

			//文件上传
			funUploadFile: function() {
				var self = this;
				for (var i = 0, file; file = this.fileFilter[i]; i++) {
					(function(file) {
						var fd = new FormData(),
							nowTime = new Date().getTime();
						fd.append("name", "Html 5 File API/FormData");
						fd.append("fileToUpload", file, file.name);
						var xhr = new XMLHttpRequest();
						if (xhr.upload) {
							self.onBeforeSend(file);
							// 上传中
							xhr.upload.addEventListener("progress", function(e) {
								self.onProgress(file, e.loaded, e.total);
							}, false);

							// 文件上传成功或是失败
							xhr.onreadystatechange = function(e) {
								if (xhr.readyState == 4) {
									if (xhr.status == 200 && xhr.responseText != "" && xhr.responseText != null) {
										self.onSuccess(file, xhr.responseText);
										if (!self.fileFilter.length) {
											//全部完毕
											self.onComplete();
										}
									} else {
										self.onFailure(file, xhr.responseText);
									}
								}
							};

							var networkId = Tribe.networkId || '';
							var userId = Tribe.userId || '';

							// 开始上传
							xhr.open("POST", self.url + '?t=' + nowTime + '&networkId=' + networkId + '&ownerId=' + userId, true);
							xhr.send(fd);
						}
					})(file);
				}

			},

			uploadFile: function(obj) {
				var self = this;
				$.ajax({
					type: 'POST',
					url: '/thirdapp/forum/uploadFile',
					data: {
						'at': Tribe.util.cookie('at')
					},
					success: function(data) {
						if (data.success) {
							Tribe.util.cookie('at', data.result);
							self.funUploadFile(obj);
						} else {
							self.onFailure({});
						}
					},
					error: function(xhr, tye) {
						self.onFailure({});
					}
				});
			},

			init: function() {
				var self = this;

				//文件选择控件选择
				if (this.fileInput.length && this.fileInput.attr('type') == 'file' && !window.user_community) {
					this.fileInput.on("change", function(e) {
						self.funGetFiles(e);
						self.uploadFile(e);
					}, false);
				} else {
					this.fileInput.on("click", function() {
						window.user_community.pickImage();
					});
				}
			}
		};

		window.uploadPicture = function(str) {
			var data = convertBase64ToBlob(str);
			data.name = 'frombuluo.png';
			var obj = {
				target: {
					files: [data]
				}
			};
			Uploader.funGetFiles(obj);
			Uploader.uploadFile(obj);
		};

		function convertBase64ToBlob(base64Data) {
			var bytes = window.atob(base64Data);
			var ab = new ArrayBuffer(bytes.length);
			var ia = new Uint8Array(ab);
			for (var i = 0; i < bytes.length; i++) {
				ia[i] = bytes.charCodeAt(i);
			}

			return new Blob([ab], {
				type: 'image/png'
			});
		}
		module.exports = Uploader;
	}, {}],
	15: [function(require, module, exports) {
		'use strict';

		Object.defineProperty(exports, "__esModule", {
			value: true
		});

		var _createClass = function() {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}
				return function(Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

		function _classCallCheck(instance, Constructor) {
			if (!(instance instanceof Constructor)) {
				throw new TypeError("Cannot call a class as a function");
			}
		}

		/*
		 * 公用的请求的方法
		 * */

		var RequestUrl = exports.RequestUrl = function() {
				function RequestUrl() {
					var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

					_classCallCheck(this, RequestUrl);

					this.obj = obj;
				} /*获得网络信息*/


				_createClass(RequestUrl, [{
					key: 'getNetworkInfo',
					value: function getNetworkInfo(cb) {
						var networkInfo = $.ajax({
							url: '/thirdapp/forum/getNetWorkInfo',
							type: 'GET',
							data: {
								networkId: Tribe.networkId
							},
							dataType: 'json'
						});

						if (typeof cb == 'function') {
							cb(networkInfo);
						} else {
							return networkInfo;
						}
					}
				}, {
					key: 'isUserAdmin',
					value: function isUserAdmin(cb) { /*判断当前用户是否是管理员*/
						var isRole = false;
						this.getNetworkInfo().then(function(resp) {
							if (!resp) isRole = false;

							if (resp) {
								var role = resp.networkOverView.role;
								if (role == 'ADMIN') isRole = true;
							} else {
								isRole = false;
							}

							if (typeof cb == 'function') {
								cb(isRole);
							} else {
								return isRole;
							}
						});
					} /*判断@all次数*/

				}, {
					key: 'hasALLNum',
					value: function hasALLNum(cb) {
						var allNum = 0;
						$.ajax({
							type: 'get',
							url: '/thirdapp/forum/allNum',
							data: {
								"isIncludeTime": true
							},
							dataType: 'json'
						}).then(function(resp) {
							if (!resp || !resp.success) allNum = 0;

							if (resp && resp.message.total != 0) allNum = resp.message.total;

							if (typeof cb == 'function') {
								cb(allNum);
							} else {
								return allNum;
							}
						});
					} /*气泡的展示*/

				}, {
					key: 'createSession',
					value: function createSession() {
						var self = this;
						return $.ajax({
							type: 'POST',
							url: '/thirdapp/forum/uploadFile',
							data: {
								'at': Tribe.util.cookie('at')
							},
							success: function success(data) {
								if (data.success) {
									Tribe.util.cookie('at', data.result);
								}
							},
							error: function error(xhr, type) {
								self.onFailure({});
							}
						});
					}
				}, {
					key: 'showTips',
					value: function showTips(obj) {
						this.createSession().then(function(resp) {
							$.ajax({
								url: '/microblog/rest/snsUser/needTip',
								type: 'POST',
								dataType: 'json',
								data: obj.data
							}).then(function(result) {
								if (result && result.needTip) {
									obj.cb();
								}
							});
						});
					}
				}, {
					key: 'closeTip',
					value: function closeTip(obj) {
						var me = this;
						$(obj.root).on('click', obj.hook, function() {
							$.ajax({
								url: '/microblog/rest/snsUser/closeTip',
								type: 'POST',
								dataType: 'json',
								data: obj.data
							}).then(function(resp) {
								if (resp.success) {
									obj.cb();
								}
							});
						});
					}
				}, {
					key: 'newFeaturesInit',
					value: function newFeaturesInit() {
						var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						var me = this;
						me.obj = obj;
						me.newFeaturesTips = {
							functionName: "newFeaturesTips",
							networkRelated: false,
							version: ''
						};
						me.changeTips = {
							functionName: "changeTips",
							networkRelated: false,
							version: ''
						};

						var wrap = me.obj.wrap;
						if (!wrap) return;

						me.newFeaturesTips.version = me.obj.newVersion;
						me.changeTips.version = me.obj.changeVersion;

						me.showTips({
							data: me.newFeaturesTips,
							cb: function cb() {
								wrap.append('<div style="display:block" class=" j-tips-layer ' + me.obj.cName + '">' + me.obj.content + '</div>');
							}
						});

						me.closeTip({
							root: wrap,
							hook: '.closeIcon',
							data: me.newFeaturesTips,
							cb: function cb() {
								$('.j-tips-layer', wrap).remove();
							}
						});
					}
				}], [{
					key: 'getInstance',
					value: function getInstance() {
						for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
							arg[_key] = arguments[_key];
						}

						if (!this.instance) this.instance = new(Function.prototype.bind.apply(this, [null].concat(arg)))();
						this.instance.init();
					}
				}]);

				return RequestUrl;
			}();

	}, {}],
	16: [function(require, module, exports) {

		var validation = {
			isNull: function(value) {
				if (value == null || typeof(value) == "undefined") return true;
				return false;
			},
			isTel: function(telNum) {
				if (this.isNull(telNum)) return false;
				//判断是否是手机号码
				if (telNum.length != 11) return false;
				var reg1 = /(1[3|5|7|8|][0-9]{9})/g;
				if (telNum.match(reg1)) return true;

				return false;
			},
			isTrim: function(value) {
				if (this.isNull(value)) return false;
				var reg1 = /\S/g;
				var _value = value.match(reg1);
				if (_value) return true;

				return false;
			}
		}

		module.exports = validation;
	}, {}],
	17: [function(require, module, exports) {
		'use strict';

		//发消息，上传
		var Slider = require('../component/imgSlider.js');
		var ImgUploader = require('../component/img-uploader');
		var wxUploadImage = require('../component/wxUploadImage');
		var Topic = require('../component/topic').Topic;
		var qs = require('../lib/plugin/querystring');
		var AiteList = require('../component/aite-list');
		var isYZJApp = /Qing\/.*;(iPhone|Android).*/.test(navigator.userAgent);
		var alipayModifyUserName = require('../component/alipayModifyUserName');
		var GetLocation = require('../component/share-location');
		var fh = require('../component/fh');
		var video = require('../component/video');
		var RequestUrl = require('../lib/public/requestUrl').RequestUrl;
		var openCallFree = require('../component/openCallFree');
		var carePublic = require('../component/care-public');
		var _videoData = '';

		function parseURL() {
			var hashStr = location.search;
			if (!hashStr) return;

			var obj = qs.parse(hashStr.substring(1).split('#')[0]);
			var content = obj.content;
			if (!content) return;

			var editor = document.getElementById('editor');
			editor.value = content + ' ';
			var sendBtn = document.getElementById('sendMsg');
			if (sendBtn.classList.contains('bg-gray')) sendBtn.classList.remove('bg-gray');
		}

		//是否显示地理位置

		function showLocation() {
			$.ajax({
				url: '/thirdapp/forum/showModule',
				type: 'GET',
				dataType: 'json'
			}).done(function(resp) {
				if (!resp) return;
				if (resp.obtainLocation) {
					$(".select-site").css("display", "inline-block");
					$(".site-name").text("正在定位中...");
					GetLocation.init();
					$("#editor").click();
				}
			});
		}

		//发送操作
		var sendMsgOpt = {
			blueprintId: $('#sendMsg').attr('data-blueprintId'),
			init: function init() {
				var _this = this;
				//点击发送按钮
				Tribe.util.PCTaptoClick($('#sendMsg'), function() {
					// checkEnoughCredit
					var $this = $(this);
					if (_this.blueprintId) {
						_this.sendPosts($this, false, false, false);
					} else {
						$.when($.ajax({
							type: 'GET',
							dataType: 'json',
							data: {
								rulesItemAction: 'SendWeibo'
							},
							url: '/thirdapp/forum/checkCreditSendWeibo'
						}), $.ajax({
							type: 'GET',
							dataType: 'json',
							data: {
								rulesItemAction: 'SendWeiboMoreLenthOrPicOrVideo'
							},
							url: '/thirdapp/forum/checkCreditSendWeibo'
						})).then(function(data1, data2) {
							if (data1[0].success && data2[0].success) {
								var isOpen1 = data1[0].message.isOpen;
								var isOpen2 = data2[0].message.isOpen;
								var isBeyondCredit1 = data1[0].message.isBeyondCredit;
								var isBeyondCredit2 = data2[0].message.isBeyondCredit;
								var isAdd = data1[0].message.score > 0 ? true : false;
								_this.sendPosts($this, isOpen1, isOpen2, isBeyondCredit1, isBeyondCredit2, isAdd);
							} else {
								Tribe.util.tips('积分校验失败', 2000);
							}
						});
					}
				});
			},
			sendPosts: function sendPosts(obj, isOpen1, isOpen2, isBeyondCredit1, isBeyondCredit2, isAdd) {
				var _this = this;
				var me = $(obj);
				var fileids = me.attr('data-fileids');
				fileids = fileids && fileids.split(',') || [];
				var networkId = me.attr('data-networkid');
				var content = $.trim($('#editor').html());
				var mb_source = '';
				var videoSource = $(".show-video");
				var $buyersShowSource = $('.j-buyersShowItem');
				var $topicCurr = $('.topic-item-mod a.curr').eq(0);
				var $sendBtn = $('#sendMsg');
				var sectionId = '';
				var aiteTmp = [me.attr('data-wx-aite'), me.attr('data-yzj-aite')];
				var isBuyersShow = false;

				if ($('#editor').attr('data-isBuyersShow') === 'true') {
					isBuyersShow = true;
				}


				if ($topicCurr.length) {
					sectionId = $topicCurr.attr('data-sectionId');
				}

				if (_this.blueprintId && !fileids.length) {
					Tribe.util.tips('晒图集赞帖必须带图片', 2000);
					return false;
				}

				if ($('#editor').attr("data-type") != "") {
					content = '#' + $('#editor').attr("data-type") + '#' + content;
				}

				var phizWrapper = $("#phizWrapper");
				if (phizWrapper.length != 0) phizWrapper.hide();

				if (me.hasClass("bg-gray")) {
					return;
				}

				if ($('.upload_append_list').length > fileids.length) {
					Tribe.util.tips('图片上传中，请稍后', 2000);
					return false;
				}

				if ($.trim($('#editor').val()) == '' && fileids.length) {
					content = content + '分享图片';
				}

				if ($.trim($('#editor').val()) == '' && videoSource.length > 0) {
					content = content + '分享视频"' + _videoData.title + '"';
				}

				for (var i = 0; i < $('.progress').length; i++) {
					if ($('.progress').eq(i).is(':visible')) {
						return false;
					}
				}
				if (!content) {
					$sendBtn.addClass('bg-gray');
					Tribe.util.tips('发送内容为空', 2000);
					return false;
				} else if ($('#sending').is(':visible')) {
					return false;
				} else {
					$('body').append('<div class="tips" id="sending" ><span class="loadIng"></span>发送中...</div>');
				}

				//位置
				var longitude = $(".site-name").attr("data-longitude");
				var latitude = $(".site-name").attr("data-latitude");
				var location = $(".site-name").text();
				if (location == "正在定位中..." || location == "点击开启定位") {
					location = "";
				}

				//视频
				var extraAttach = [];
				if ($(".show-video").length != 0) {
					var _video = video.videoData;
					extraAttach.push({
						type: 'NETMEDIA',
						name: _video.title,
						desc: _video.desc,
						originalURL: _video.originalURL,
						embedVideoURL: _video.embedVideoURL,
						thumbPic: _video.thumbPic,
						videoType: _video.videoType
					});
				}
				//买家秀
				if ($buyersShowSource.length) {
					extraAttach.push({
						"type": "PRODUCT",
						"subType": "YOUZAN",
						"name": $buyersShowSource.attr('data-goodName'),
						"desc": "",
						"url": $buyersShowSource.attr('data-url'),
						"price": $buyersShowSource.attr('data-price'),
						"third_id": "",
						"pic_thumb_url": $buyersShowSource.attr('data-picPath'),
						"urlShowInTop": true
					});
				}
				var isOpenCallFree = false;
				if ($(".j-call-wrap").length != 0) {
					isOpenCallFree = true;
				}

				//@人
				//aiteTmp[index]格式为'name1:id1,name2:id2,...'
				var Name2IdArr = [
					[],
					[]
				];
				$.each(aiteTmp, function(index, item) {
					if (item != '') {
						var aiteArr = item.split(',');
						$.each(aiteArr, function(i, item) {
							var aiteArrTemp = item.split(':');
							switch (index) {
							case 0:
								Name2IdArr[index].push({
									name: aiteArrTemp[0],
									userId: aiteArrTemp[1]
								});
								break;
							case 1:
								Name2IdArr[index].push({
									name: aiteArrTemp[0],
									personId: aiteArrTemp[1]
								});
								break;
							default:
							}
						});
					}
				});

				var cbC = function cbC() {
						$.ajax({
							type: 'POST',
							url: '/thirdapp/forum/sendMsg',
							data: {
								isBuyersShow: isBuyersShow,
								blueprintId: _this.blueprintId,
								'networkId': networkId,
								'content': content,
								sectionId: sectionId,
								'longitude': longitude || '-1',
								'latitude': latitude || '-1',
								'location': location || '',
								'fileids': JSON.stringify([{
									"networkId": networkId,
									"fileIds": fileids
								}]),
								attachFileIds: fileids,
								'extraAttach': JSON.stringify(extraAttach),
								'isOpenCallFree': isOpenCallFree,
								mentionName2IdJSON: JSON.stringify(Name2IdArr[0]),
								mentionName2PersonIdJSON: JSON.stringify(Name2IdArr[1])
							},
							context: $('#msgList'),
							success: function success(data) {
								if (data.success) {
									$('#sending').remove();
									//积分提示 发帖
									if (_this.blueprintId) {
										if (data.message.costscore) {
											Tribe.util.pointTips('积分 -' + data.message.costscore, 'sub');
										}
									} else {
										if (isOpen1 && isOpen2 && !isBeyondCredit2 && isAdd) {
											if (content.length >= 100 || fileids.length > 0 || videoSource.length > 0) {
												Tribe.util.pointTips('积分 +5');
											} else {
												Tribe.util.pointTips('积分 +2');
											}
										} else if (isOpen1 && !isOpen2 && !isBeyondCredit1 && isAdd) {
											Tribe.util.pointTips('积分 +2');
										} else if (!isOpen1 && isOpen2 && !isBeyondCredit2 && isAdd) {
											if (content.length >= 100 || fileids.length > 0 || videoSource.length > 0) {
												Tribe.util.pointTips('积分 +5');
											}
										} else if (isOpen1 && !isAdd) {
											Tribe.util.pointTips('积分 -2', 'sub');
										}
									}

									if (_allNum != 0) Tribe.util.tips('@all推送成功', 3000);

									//跳转到详情页
									setTimeout(function() {
										var type = $('#editor').attr('data-type'),
											topicId = $('#editor').attr('data-topicid');
										var isBuyersShow = $('#editor').attr('data-isBuyersShow') === 'true';
										if (_this.blueprintId) {
											window.location.href = '/thirdapp/forum/network/' + networkId + '/' + data.message.microblog.id + '/pictureZanDetail/' + _this.blueprintId + '?pictureZan=true';
										} else if (isBuyersShow) {
											window.location.href = '/thirdapp/forum/network/' + networkId + '/buyersShowTimeLine';
										} else if (type && topicId) {
											window.location.href = '/thirdapp/forum/' + networkId + '/topic/' + type + '/' + topicId + '#' + data.message.microblog.id + '';
										} else {
											window.location.href = '/thirdapp/forum/network/' + networkId + '#' + data.message.microblog.id + '';
										}
									}, 1000);
								} else {
									$('#sending').remove();
									if (data.message.error_code == 50002) {
										fh.init({
											isError: 50002
										});
									} else if (data.message.error_code == 30048) {
										Tribe.util.tips('发送失败,' + data.message.error_description, 2000);
									} else if (data.message.error_code === 30075) {
										Tribe.util.tips('你已经参与了活动', 2000);
									} else {
										Tribe.util.tips('发送失败,' + data.message.error_description, 2000);
									}
								}
							},
							error: function error(xhr, type) {
								$('#sending').remove();
								Tribe.util.tips('发送失败，请重试', 2000);
								console.log('Ajax error!');
							}
						});
					};

				//判断是否推送成功
				var _request = new RequestUrl();

				var _allNum = 0;
				var cbB = function cbB(allNum) {
						if (allNum != 0) _allNum = allNum;

						cbC();
					};

				var cbA = function cbA(role) {
						if (role) {
							_request.hasALLNum(cbB);
						} else {
							cbC();
						}
					};

				if (content.match(/@all/g)) {
					_request.isUserAdmin(cbA);
				} else {
					cbC();
				}
			}
		};

		//页面操作
		var detailPageOpt = {
			init: function init() {
				var _this = this;
				_this._height = $(window).height();
				//点击视频按钮
				$(".video-btn").click(function(e) {
					_this.getVideo(this);
				});

				if ($('a.topic-btn-item').length) {
					Topic.getInstance({
						getHotTopicCallback: function getHotTopicCallback() {
							_this.sendParams();
						},
						root: $('#editorWrap')
					});
				} else {
					$('.upload-box').show();
					$(".msg-btn").parent().addClass('curr');
				}

				//图片
				$('.topic-btn-item').on('click', function() {
					_this.boxStatus(1, [2, 3, 4, 5, 6, 7]);
				});
				$(".msg-btn").on('click', function(e) {
					_this.getMsg(e, this);
				});
				//表情
				$(".phiz-btn").on('click', function(e) {
					_this.getPhiz(e, this);
				});
				//输入框获得焦点
				$("#editor").on('click', function(e) {
					_this.editorFocus(e);
				});
				//获得艾特人列表
				$(".aite-btn").on('click', function(e) {
					_this.getAite(e, this);
				});
			},
			sendParams: function sendParams() {
				$.ajax({
					'type': 'GET',
					'url': '/thirdapp/forum/sendMsg/sendParams',
					'dataType': 'json'
				}).done(function(resp) {
					if (resp && resp.success) {
						var forceChooseSection = resp.message.forceChooseSection;
						var $sendBtn = $('#sendMsg');
						if (forceChooseSection) {
							$sendBtn.attr('data-section', 'true');
						} else {
							$sendBtn.attr('data-section', 'false');
						}
					} else {}
				});
			},
			imageOrVideo: function imageOrVideo(type) {
				//判断图片或视频是否同时存在
				//type=1 - 点击图片    type=2 - 点击视频
				var _arr;
				switch (type) {
				case 2:
					_arr = $(".upload_append_list");
					break;
				case 1:
					_arr = $(".show-video");
					break;
				default:
					break;
				}

				if (_arr && _arr.length == 0 || !_arr) {
					return false;
				} else {
					return true;
				}
			},
			getVideo: function getVideo(obj) {
				//解析视频
				var _this = obj;
				if (this.imageOrVideo(2)) {
					Tribe.util.tips('图片和视频不能一起上传。', 2000);
					return;
				}
				this.changeStatus(_this);
				this.boxStatus(5, [1, 2, 3, 4, 6, 7]);
				var cb = function cb(data) {
						var video = $(".show-video");
						if (video.length != 0) {
							$("#sendMsg").removeClass("bg-gray");
						}
						_videoData = data;
					};
				video.init($("#editorWrap"), cb);
			},
			changeStatus: function changeStatus(obj) {
				//改变按钮的状态
				$(".post-func-area").children().removeClass("curr");
				$(obj).parent().addClass("curr");
			},
			getAite: function getAite(e, obj) {
				//艾特对象
				e.preventDefault();

				var _this = this;
				var _own = obj;
				var aiteWrap = $(".person-list-wrapper");

				var opt = {};
				opt.boxWrap = $("#editor");
				if (opt.boxWrap) {
					$("#editor").text($("#editor").val());
				}
				opt.aiteWrap = aiteWrap;
				opt.windowHeight = _this._height;
				opt.sendBtn = $("#sendMsg");
				var aiteList = new AiteList(opt, isYZJApp);
				var cb = function cb() {
						$($(".aite-btn")[0].parentNode).removeClass("curr");

						//滚动条的改变
						$('body').css("height", "auto");
						document.body.style.overflow = 'auto';
						document.documentElement.style.overflow = 'auto';

						// 按钮状态改变
						var sendBtn = document.getElementById('sendMsg');
						if (sendBtn.classList.contains('bg-gray')) sendBtn.classList.remove('bg-gray');

						$('.post-func-area li:visible').eq(0).children('a').click();
					};
				aiteList.init(cb);
				this.boxStatus(4, [1, 2, 3, 5, 6, 7]);
				$(".person-list-wrapper").fadeIn();
			},
			getPhiz: function getPhiz(e, obj) {
				//表情
				e.preventDefault();

				var _own = obj;
				var phizWrapper = $("#phizWrapper");
				if (phizWrapper.length == 1 && phizWrapper[0].style.display == "block") {
					return;
				}

				this.changeStatus(this);

				Tribe.util.initArr();
				var cb = function cb() {
						// 按钮状态改变
						var txt = $("#editor").val();
						var sendBtn = document.getElementById('sendMsg');
						if (sendBtn.classList.contains('bg-gray') && txt != "" && txt != null) {
							sendBtn.classList.remove('bg-gray');
						} else if (!sendBtn.classList.contains('bg-gray') && (txt == "" || txt == null)) {
							sendBtn.classList.add('bg-gray');
						}
					};
				var obj = {};
				obj.editorBox = $("#editor");
				obj.wrapper = $("#editorWrap");
				Tribe.util.init(obj, cb);

				this.boxStatus(3, [1, 2, 4, 5, 6, 7]);
			},
			getMsg: function getMsg(e) {
				//图片
				e.preventDefault();
				if (this.imageOrVideo(1)) {
					Tribe.util.tips('图片和视频不能一起上传。', 2000);
					return;
				}
				this.boxStatus(2, [1, 3, 4, 5, 6, 7]);
				$(".upload-box").show();
			},
			editorFocus: function editorFocus(e) {
				//编辑框获得焦点
				// this.boxStatus(this,[1,2,3,4,5]);
				// this.videoOption();
			},
			funcArr: ["topic-item-mod", "upload-box", "phiz-wrapper", "person-list-wrapper", "upload-video", "j-phone-wrapper", "j-buyersShow-wrapper"],
			btnArr: ["topic-btn-item", "msg-btn", "phiz-btn", "aite-btn", "video-btn", "phone-btn", "buyersShow-btn"],
			nowVideoSrc: '',
			boxStatus: function boxStatus(index, typeArr) {
				for (var i = 0; i < typeArr.length; i++) {
					if (typeArr[i] == 5) {
						this.videoOption(false);
					}
					$("." + this.funcArr[typeArr[i] - 1]).hide();
					$("." + this.btnArr[typeArr[i] - 1]).parent().removeClass("curr");
				}

				if (index == 5) {
					this.videoOption(true);
				}
				$("." + this.funcArr[index - 1]).show();
				$("." + this.btnArr[index - 1]).parent().addClass("curr");
			},
			videoSource: '',
			videoOption: function videoOption(isBool) {
				var videoWrap = $(".show-video");
				var _status = videoWrap.css("display");
				var _iframe = $(".video-iframe");

				if (_status == "none" && isBool) {
					var videoSource = this.videoSource;
					$(".video-info-mod").before(this.videoTpl());
					videoWrap.show();
				} else if (_status == "block" && !isBool) {
					this.videoSource = _iframe.attr("src");
					_iframe.remove();
					videoWrap.hide();
				}
			},
			videoTpl: function videoTpl() {
				var str = "<iframe class='video-iframe' src='" + this.videoSource + "' frameborder='0' allowfullscreen='' allowtransparency='false' width='100%'> 您的浏览器不支持视频播放</iframe>";
				return _.template(str)();
			},
			setCursorPos: function setCursorPos() {
				Tribe.util.cursorPos = Tribe.util.getCursortPosition($("#editor")[0]);
			},
			getPhone: function getPhone(e) {
				e.preventDefault();
				this.boxStatus(6, [1, 2, 3, 4, 5, 7]);
				if ($(".j-phone-wrapper").length == 0) {
					this.phoneTpl();
				} else {
					$(".j-phone-wrapper").show();
				}
			},
			phoneTpl: function phoneTpl(e) {
				var str = "<div class='j-phone-wrapper'>" + "   <h3>添加免费电话</h3>" + "   <p>添加后，隐藏你的真实手机号码，但看帖人仅能通过免费电话联系你，确保信息安全沟通有效。</p>" + "   <a class='blue-text' href='http://www.xingdongliu.com/world/view?key=MDAwMDAwMDAwMDRkNzY2MWFkZTA2'>什么是免费电话？</a>" + "   <button class='j-addCallBtn btn'>确定</button>" + "</div>";
				$('body').append(str);
			},
			getTheBuyersShow: function getTheBuyersShow(e) {
				e.preventDefault();
				this.boxStatus(7, [1, 2, 3, 4, 5, 6]);
				if ($(".j-buyersShow-wrapper").length == 0) {
					this.buyersShowTpl();
				} else {
					$(".j-buyersShow-wrapper").show();
				}
			},
			buyersShowTpl: function buyersShowTpl() {
				var str = "<div class='j-buyersShow-wrapper'><div class='j-buyersShow-div join_pic'>" + "   <input type='button' class='j-addBuyersShow fileImage'/>" + "</div></div>";
				$('body').append(str);
			}
		};

		Zepto(function($) {
			var _height = $(window).height();
			var editor = document.getElementById('editor');
			var sendBtn = $("#sendMsg");
			editor.addEventListener('propertychange', editorHandler, false);
			editor.addEventListener('input', editorHandler, false);

			wx.config({
				debug: false,
				appId: sendBtn.attr("data-appid"),
				timestamp: sendBtn.attr("data-timestamp"),
				nonceStr: sendBtn.attr("data-noncestr"),
				signature: sendBtn.attr("data-signature"),
				jsApiList: ['checkJsApi', 'getLocation', 'chooseImage', 'uploadImage', 'downloadImage', 'previewImage']
			});

			wx.ready(function() {
				showLocation();
				wxUploadImage.init();
			});

			function editorHandler(e) {
				var elem = e.target;
				var value = elem.value;
				var btn = document.getElementById('sendMsg');

				if (value) btn.classList.remove('bg-gray');
				else btn.classList.add('bg-gray');
			}

			detailPageOpt.init(); //页面操作
			sendMsgOpt.init(); //发送操作

			//部落应用相关
			if (navigator.userAgent.indexOf('sendUser') > -1 && Tribe.util.getOS() == 'android') {
				$('.fileImage').attr('type', 'button');
			}

			//if(!Tribe.util.is_weixin()){
			//    $(".fileImage").show();
			//}
			ImgUploader.init();

			new Slider(document.getElementsByClassName('upload-box-container')[0]).init();

			parseURL();

			$(window).on('popstate.topic', function() {

				if ($(".aite-btn").length != 0 && $(".topic-btn").length != 0 && $(".video-btn").length != 0 && !$(".video-btn").parent().hasClass("curr")) {
					$($(".aite-btn")[0].parentNode).removeClass("curr");
					$($(".topic-btn")[0].parentNode).removeClass("curr");
					detailPageOpt.boxStatus(1, [2, 3, 4, 5, 6, 7]);
				}
			});
			alipayModifyUserName();
		});
	}, {
		"../component/aite-list": 1,
		"../component/alipayModifyUserName": 2,
		"../component/care-public": 3,
		"../component/fh": 4,
		"../component/img-uploader": 6,
		"../component/imgSlider.js": 7,
		"../component/openCallFree": 8,
		"../component/share-location": 9,
		"../component/topic": 10,
		"../component/video": 11,
		"../component/wxUploadImage": 12,
		"../lib/plugin/querystring": 13,
		"../lib/public/requestUrl": 15
	}],
	18: [function(require, module, exports) {;
		(function() {
			'use strict';

			/**
			 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
			 *
			 * @codingstandard ftlabs-jsv2
			 * @copyright The Financial Times Limited [All Rights Reserved]
			 * @license MIT License (see LICENSE.txt)
			 */

			/*jslint browser:true, node:true*/
			/*global define, Event, Node*/


			/**
			 * Instantiate fast-clicking listeners on the specified layer.
			 *
			 * @constructor
			 * @param {Element} layer The layer to listen on
			 * @param {Object} [options={}] The options to override the defaults
			 */

			function FastClick(layer, options) {
				var oldOnClick;

				options = options || {};

				/**
				 * Whether a click is currently being tracked.
				 *
				 * @type boolean
				 */
				this.trackingClick = false;


				/**
				 * Timestamp for when click tracking started.
				 *
				 * @type number
				 */
				this.trackingClickStart = 0;


				/**
				 * The element being tracked for a click.
				 *
				 * @type EventTarget
				 */
				this.targetElement = null;


				/**
				 * X-coordinate of touch start event.
				 *
				 * @type number
				 */
				this.touchStartX = 0;


				/**
				 * Y-coordinate of touch start event.
				 *
				 * @type number
				 */
				this.touchStartY = 0;


				/**
				 * ID of the last touch, retrieved from Touch.identifier.
				 *
				 * @type number
				 */
				this.lastTouchIdentifier = 0;


				/**
				 * Touchmove boundary, beyond which a click will be cancelled.
				 *
				 * @type number
				 */
				this.touchBoundary = options.touchBoundary || 10;


				/**
				 * The FastClick layer.
				 *
				 * @type Element
				 */
				this.layer = layer;

				/**
				 * The minimum time between tap(touchstart and touchend) events
				 *
				 * @type number
				 */
				this.tapDelay = options.tapDelay || 200;

				/**
				 * The maximum time for a tap
				 *
				 * @type number
				 */
				this.tapTimeout = options.tapTimeout || 700;

				if (FastClick.notNeeded(layer)) {
					return;
				}

				// Some old versions of Android don't have Function.prototype.bind

				function bind(method, context) {
					return function() {
						return method.apply(context, arguments);
					};
				}


				var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
				var context = this;
				for (var i = 0, l = methods.length; i < l; i++) {
					context[methods[i]] = bind(context[methods[i]], context);
				}

				// Set up event handlers as required
				if (deviceIsAndroid) {
					layer.addEventListener('mouseover', this.onMouse, true);
					layer.addEventListener('mousedown', this.onMouse, true);
					layer.addEventListener('mouseup', this.onMouse, true);
				}

				layer.addEventListener('click', this.onClick, true);
				layer.addEventListener('touchstart', this.onTouchStart, false);
				layer.addEventListener('touchmove', this.onTouchMove, false);
				layer.addEventListener('touchend', this.onTouchEnd, false);
				layer.addEventListener('touchcancel', this.onTouchCancel, false);

				// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
				// layer when they are cancelled.
				if (!Event.prototype.stopImmediatePropagation) {
					layer.removeEventListener = function(type, callback, capture) {
						var rmv = Node.prototype.removeEventListener;
						if (type === 'click') {
							rmv.call(layer, type, callback.hijacked || callback, capture);
						} else {
							rmv.call(layer, type, callback, capture);
						}
					};

					layer.addEventListener = function(type, callback, capture) {
						var adv = Node.prototype.addEventListener;
						if (type === 'click') {
							adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
								if (!event.propagationStopped) {
									callback(event);
								}
							}), capture);
						} else {
							adv.call(layer, type, callback, capture);
						}
					};
				}

				// If a handler is already declared in the element's onclick attribute, it will be fired before
				// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
				// adding it as listener.
				if (typeof layer.onclick === 'function') {

					// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
					// - the old one won't work if passed to addEventListener directly.
					oldOnClick = layer.onclick;
					layer.addEventListener('click', function(event) {
						oldOnClick(event);
					}, false);
					layer.onclick = null;
				}
			}

			/**
			 * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
			 *
			 * @type boolean
			 */
			var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

			/**
			 * Android requires exceptions.
			 *
			 * @type boolean
			 */
			var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


			/**
			 * iOS requires exceptions.
			 *
			 * @type boolean
			 */
			var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


			/**
			 * iOS 4 requires an exception for select elements.
			 *
			 * @type boolean
			 */
			var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


			/**
			 * iOS 6.0-7.* requires the target element to be manually derived
			 *
			 * @type boolean
			 */
			var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

			/**
			 * BlackBerry requires exceptions.
			 *
			 * @type boolean
			 */
			var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

			/**
			 * Determine whether a given element requires a native click.
			 *
			 * @param {EventTarget|Element} target Target DOM element
			 * @returns {boolean} Returns true if the element needs a native click
			 */
			FastClick.prototype.needsClick = function(target) {
				switch (target.nodeName.toLowerCase()) {

					// Don't send a synthetic click to disabled inputs (issue #62)
				case 'button':
				case 'select':
				case 'textarea':
					if (target.disabled) {
						return true;
					}

					break;
				case 'input':

					// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
					if ((deviceIsIOS && target.type === 'file') || target.disabled) {
						return true;
					}

					break;
				case 'label':
				case 'iframe':
					// iOS8 homescreen apps can prevent events bubbling into frames
				case 'video':
					return true;
				}

				return (/\bneedsclick\b/).test(target.className);
			};


			/**
			 * Determine whether a given element requires a call to focus to simulate click into element.
			 *
			 * @param {EventTarget|Element} target Target DOM element
			 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
			 */
			FastClick.prototype.needsFocus = function(target) {
				switch (target.nodeName.toLowerCase()) {
				case 'textarea':
					return true;
				case 'select':
					return !deviceIsAndroid;
				case 'input':
					switch (target.type) {
					case 'button':
					case 'checkbox':
					case 'file':
					case 'image':
					case 'radio':
					case 'submit':
						return false;
					}

					// No point in attempting to focus disabled inputs
					return !target.disabled && !target.readOnly;
				default:
					return (/\bneedsfocus\b/).test(target.className);
				}
			};


			/**
			 * Send a click event to the specified element.
			 *
			 * @param {EventTarget|Element} targetElement
			 * @param {Event} event
			 */
			FastClick.prototype.sendClick = function(targetElement, event) {
				var clickEvent, touch;

				// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
				if (document.activeElement && document.activeElement !== targetElement) {
					document.activeElement.blur();
				}

				touch = event.changedTouches[0];

				// Synthesise a click event, with an extra attribute so it can be tracked
				clickEvent = document.createEvent('MouseEvents');
				clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
				clickEvent.forwardedTouchEvent = true;
				targetElement.dispatchEvent(clickEvent);
			};

			FastClick.prototype.determineEventType = function(targetElement) {

				//Issue #159: Android Chrome Select Box does not open with a synthetic click event
				if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
					return 'mousedown';
				}

				return 'click';
			};


			/**
			 * @param {EventTarget|Element} targetElement
			 */
			FastClick.prototype.focus = function(targetElement) {
				var length;

				// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
				if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
					length = targetElement.value.length;
					targetElement.setSelectionRange(length, length);
				} else {
					targetElement.focus();
				}
			};


			/**
			 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
			 *
			 * @param {EventTarget|Element} targetElement
			 */
			FastClick.prototype.updateScrollParent = function(targetElement) {
				var scrollParent, parentElement;

				scrollParent = targetElement.fastClickScrollParent;

				// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
				// target element was moved to another parent.
				if (!scrollParent || !scrollParent.contains(targetElement)) {
					parentElement = targetElement;
					do {
						if (parentElement.scrollHeight > parentElement.offsetHeight) {
							scrollParent = parentElement;
							targetElement.fastClickScrollParent = parentElement;
							break;
						}

						parentElement = parentElement.parentElement;
					} while (parentElement);
				}

				// Always update the scroll top tracker if possible.
				if (scrollParent) {
					scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
				}
			};


			/**
			 * @param {EventTarget} targetElement
			 * @returns {Element|EventTarget}
			 */
			FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

				// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
				if (eventTarget.nodeType === Node.TEXT_NODE) {
					return eventTarget.parentNode;
				}

				return eventTarget;
			};


			/**
			 * On touch start, record the position and scroll offset.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			FastClick.prototype.onTouchStart = function(event) {
				var targetElement, touch, selection;

				// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
				if (event.targetTouches.length > 1) {
					return true;
				}

				targetElement = this.getTargetElementFromEventTarget(event.target);
				touch = event.targetTouches[0];

				if (deviceIsIOS) {

					// Only trusted events will deselect text on iOS (issue #49)
					selection = window.getSelection();
					if (selection.rangeCount && !selection.isCollapsed) {
						return true;
					}

					if (!deviceIsIOS4) {

						// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
						// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
						// with the same identifier as the touch event that previously triggered the click that triggered the alert.
						// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
						// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
						// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
						// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
						// random integers, it's safe to to continue if the identifier is 0 here.
						if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
							event.preventDefault();
							return false;
						}

						this.lastTouchIdentifier = touch.identifier;

						// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
						// 1) the user does a fling scroll on the scrollable layer
						// 2) the user stops the fling scroll with another tap
						// then the event.target of the last 'touchend' event will be the element that was under the user's finger
						// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
						// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
						this.updateScrollParent(targetElement);
					}
				}

				this.trackingClick = true;
				this.trackingClickStart = event.timeStamp;
				this.targetElement = targetElement;

				this.touchStartX = touch.pageX;
				this.touchStartY = touch.pageY;

				// Prevent phantom clicks on fast double-tap (issue #36)
				if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
					event.preventDefault();
				}

				return true;
			};


			/**
			 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			FastClick.prototype.touchHasMoved = function(event) {
				var touch = event.changedTouches[0],
					boundary = this.touchBoundary;

				if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
					return true;
				}

				return false;
			};


			/**
			 * Update the last position.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			FastClick.prototype.onTouchMove = function(event) {
				if (!this.trackingClick) {
					return true;
				}

				// If the touch has moved, cancel the click tracking
				if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
					this.trackingClick = false;
					this.targetElement = null;
				}

				return true;
			};


			/**
			 * Attempt to find the labelled control for the given label element.
			 *
			 * @param {EventTarget|HTMLLabelElement} labelElement
			 * @returns {Element|null}
			 */
			FastClick.prototype.findControl = function(labelElement) {

				// Fast path for newer browsers supporting the HTML5 control attribute
				if (labelElement.control !== undefined) {
					return labelElement.control;
				}

				// All browsers under test that support touch events also support the HTML5 htmlFor attribute
				if (labelElement.htmlFor) {
					return document.getElementById(labelElement.htmlFor);
				}

				// If no for attribute exists, attempt to retrieve the first labellable descendant element
				// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
				return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
			};


			/**
			 * On touch end, determine whether to send a click event at once.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			FastClick.prototype.onTouchEnd = function(event) {
				var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

				if (!this.trackingClick) {
					return true;
				}

				// Prevent phantom clicks on fast double-tap (issue #36)
				if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
					this.cancelNextClick = true;
					return true;
				}

				if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
					return true;
				}

				// Reset to prevent wrong click cancel on input (issue #156).
				this.cancelNextClick = false;

				this.lastClickTime = event.timeStamp;

				trackingClickStart = this.trackingClickStart;
				this.trackingClick = false;
				this.trackingClickStart = 0;

				// On some iOS devices, the targetElement supplied with the event is invalid if the layer
				// is performing a transition or scroll, and has to be re-detected manually. Note that
				// for this to function correctly, it must be called *after* the event target is checked!
				// See issue #57; also filed as rdar://13048589 .
				if (deviceIsIOSWithBadTarget) {
					touch = event.changedTouches[0];

					// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
					targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
					targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
				}

				targetTagName = targetElement.tagName.toLowerCase();
				if (targetTagName === 'label') {
					forElement = this.findControl(targetElement);
					if (forElement) {
						this.focus(targetElement);
						if (deviceIsAndroid) {
							return false;
						}

						targetElement = forElement;
					}
				} else if (this.needsFocus(targetElement)) {

					// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
					// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
					if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
						this.targetElement = null;
						return false;
					}

					this.focus(targetElement);
					this.sendClick(targetElement, event);

					// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
					// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
					if (!deviceIsIOS || targetTagName !== 'select') {
						this.targetElement = null;
						event.preventDefault();
					}

					return false;
				}

				if (deviceIsIOS && !deviceIsIOS4) {

					// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
					// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
					scrollParent = targetElement.fastClickScrollParent;
					if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
						return true;
					}
				}

				// Prevent the actual click from going though - unless the target node is marked as requiring
				// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
				if (!this.needsClick(targetElement)) {
					event.preventDefault();
					this.sendClick(targetElement, event);
				}

				return false;
			};


			/**
			 * On touch cancel, stop tracking the click.
			 *
			 * @returns {void}
			 */
			FastClick.prototype.onTouchCancel = function() {
				this.trackingClick = false;
				this.targetElement = null;
			};


			/**
			 * Determine mouse events which should be permitted.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			FastClick.prototype.onMouse = function(event) {

				// If a target element was never set (because a touch event was never fired) allow the event
				if (!this.targetElement) {
					return true;
				}

				if (event.forwardedTouchEvent) {
					return true;
				}

				// Programmatically generated events targeting a specific element should be permitted
				if (!event.cancelable) {
					return true;
				}

				// Derive and check the target element to see whether the mouse event needs to be permitted;
				// unless explicitly enabled, prevent non-touch click events from triggering actions,
				// to prevent ghost/doubleclicks.
				if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

					// Prevent any user-added listeners declared on FastClick element from being fired.
					if (event.stopImmediatePropagation) {
						event.stopImmediatePropagation();
					} else {

						// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
						event.propagationStopped = true;
					}

					// Cancel the event
					event.stopPropagation();
					event.preventDefault();

					return false;
				}

				// If the mouse event is permitted, return true for the action to go through.
				return true;
			};


			/**
			 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
			 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
			 * an actual click which should be permitted.
			 *
			 * @param {Event} event
			 * @returns {boolean}
			 */
			FastClick.prototype.onClick = function(event) {
				var permitted;

				// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
				if (this.trackingClick) {
					this.targetElement = null;
					this.trackingClick = false;
					return true;
				}

				// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
				if (event.target.type === 'submit' && event.detail === 0) {
					return true;
				}

				permitted = this.onMouse(event);

				// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
				if (!permitted) {
					this.targetElement = null;
				}

				// If clicks are permitted, return true for the action to go through.
				return permitted;
			};


			/**
			 * Remove all FastClick's event listeners.
			 *
			 * @returns {void}
			 */
			FastClick.prototype.destroy = function() {
				var layer = this.layer;

				if (deviceIsAndroid) {
					layer.removeEventListener('mouseover', this.onMouse, true);
					layer.removeEventListener('mousedown', this.onMouse, true);
					layer.removeEventListener('mouseup', this.onMouse, true);
				}

				layer.removeEventListener('click', this.onClick, true);
				layer.removeEventListener('touchstart', this.onTouchStart, false);
				layer.removeEventListener('touchmove', this.onTouchMove, false);
				layer.removeEventListener('touchend', this.onTouchEnd, false);
				layer.removeEventListener('touchcancel', this.onTouchCancel, false);
			};


			/**
			 * Check whether FastClick is needed.
			 *
			 * @param {Element} layer The layer to listen on
			 */
			FastClick.notNeeded = function(layer) {
				var metaViewport;
				var chromeVersion;
				var blackberryVersion;
				var firefoxVersion;

				// Devices that don't support touch don't need FastClick
				if (typeof window.ontouchstart === 'undefined') {
					return true;
				}

				// Chrome version - zero for other browsers
				chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

				if (chromeVersion) {

					if (deviceIsAndroid) {
						metaViewport = document.querySelector('meta[name=viewport]');

						if (metaViewport) {
							// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
							if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
								return true;
							}
							// Chrome 32 and above with width=device-width or less don't need FastClick
							if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
								return true;
							}
						}

						// Chrome desktop doesn't need FastClick (issue #15)
					} else {
						return true;
					}
				}

				if (deviceIsBlackBerry10) {
					blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

					// BlackBerry 10.3+ does not require Fastclick library.
					// https://github.com/ftlabs/fastclick/issues/251
					if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
						metaViewport = document.querySelector('meta[name=viewport]');

						if (metaViewport) {
							// user-scalable=no eliminates click delay.
							if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
								return true;
							}
							// width=device-width (or less than device-width) eliminates click delay.
							if (document.documentElement.scrollWidth <= window.outerWidth) {
								return true;
							}
						}
					}
				}

				// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
				if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
					return true;
				}

				// Firefox version - zero for other browsers
				firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

				if (firefoxVersion >= 27) {
					// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

					metaViewport = document.querySelector('meta[name=viewport]');
					if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
						return true;
					}
				}

				// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
				// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
				if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
					return true;
				}

				return false;
			};


			/**
			 * Factory method for creating a FastClick object
			 *
			 * @param {Element} layer The layer to listen on
			 * @param {Object} [options={}] The options to override the defaults
			 */
			FastClick.attach = function(layer, options) {
				return new FastClick(layer, options);
			};


			if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

				// AMD. Register as an anonymous module.
				define(function() {
					return FastClick;
				});
			} else if (typeof module !== 'undefined' && module.exports) {
				module.exports = FastClick.attach;
				module.exports.FastClick = FastClick;
			} else {
				window.FastClick = FastClick;
			}
		}());

	}, {}]
}, {}, [17])