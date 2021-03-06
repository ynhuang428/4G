/**
 * 销售品变更
 * 
 * @author wukf
 * date 2013-9-22
 */
CommonUtils.regNamespace("offerChange");

offerChange = (function() {
	
	var _resultOffer = {}; //预校验单接口返回
	
	//初始化套餐变更页面
	var _init = function (){
		var prodInfo = order.prodModify.choosedProdInfo;
		if(prodInfo.prodStateCd!=CONST.PROD_STATUS_CD.NORMAL_PROD){
			$.alert("提示","请选择一个在用产品");
			return;
		}
		OrderInfo.actionFlag = 2;
		if(!query.offer.setOffer()){ //必须先保存销售品实例构成，加载实例到缓存要使用
			return ;
		}
		//规则校验入参
		var boInfos = [{
			boActionTypeCd : CONST.BO_ACTION_TYPE.DEL_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		},{
			boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER,
			instId : prodInfo.prodInstId,
			specId : CONST.PROD_SPEC.CDMA,
			prodId : prodInfo.prodInstId
		}];
		if(!rule.rule.ruleCheck(boInfos)){ //规则校验失败
			return;
		}
		//初始化套餐查询页面
		$.ecOverlay("<strong>正在查询中,请稍后....</strong>");
		var response = $.callServiceAsHtmlGet(contextPath+"/pad/order/prodoffer/prepare",{});	
		$.unecOverlay();
		if(response.code != 0) {
			$.alert("提示","查询失败,稍后重试");
			return;
		}
		SoOrder.step(0,response.data); //订单准备
//		$('#search').bind('click',function(){
//			order.service.searchPack();
//		});
//		order.prodOffer.init();
//		order.service.searchPack(); //查询可以变更套餐
		order.prepare.initOffer();
		order.service.searchPack();
		$("#dlg_cust_prod").popup("close");
		$("#navbar").slideUp(500);
		$.jqmRefresh($("#order_tab_panel_content"));
	};
		
	//套餐变更页面显示
	var _offerChangeView=function(){
		var oldLen = 0 ;
		$.each(OrderInfo.offer.offerMemberInfos,function(){
			if(this.objType==2){
				oldLen++;
			}
		});
		var memberNum = 1; //判断是否多成员 1 单成员2多成员
		var viceNum = 0;
		if(oldLen>1){ //多成员角色，目前只支持主副卡
			memberNum = 2;
		}
		//把旧套餐的产品自动匹配到新套餐中
		if(!_setChangeOfferSpec(memberNum,viceNum)){  
			return;
		};
		//4g系统需要
		if(CONST.getAppDesc()==0){ 
			//老套餐是3G，新套餐是4G
			if(order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){
				if(!offerChange.checkOrder()){ //省内校验单
					return;
				}
			}
			//根据UIM类型，设置产品是3G还是4G，并且保存旧卡
			if(!prod.uim.setProdUim()){ 
				return ;
			}
		}
		//初始化填单页面
		var prodInfo = order.prodModify.choosedProdInfo;
		var param = {
			boActionTypeCd : "S2" ,
			boActionTypeName : "套餐变更",
			actionFlag :"2",
			offerSpec : OrderInfo.offerSpec,
			prodId : prodInfo.prodInstId,
			offerMembers : OrderInfo.offer.offerMemberInfos,
			oldOfferSpecName : prodInfo.prodOfferName,
			prodClass : prodInfo.prodClass,
			appDesc : CONST.getAppDesc()
		};
		order.main.buildMainView(param);
	};
	
	//填充套餐变更页面
	var _fillOfferChange = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_tab_panel_content").hide();
		$("#order_fill_content").show();
		$("#order_fill_content").html(response.data);

		_initOfferLabel();//初始化主副卡标签
		$("#tabs-body .ordercona").eq(0).show();
		$("#fillNextStep").off("click").on("click",function(){
			SoOrder.submitOrder();
		});
		$("#fillLastStep").off("click").on("click",function(){
			order.main.lastStep();
		});
		var prodInfo = order.prodModify.choosedProdInfo; //获取产品信息
		//遍历主销售品构成
		var uimDivShow=false;//是否已经展示了
		$.each(OrderInfo.offerSpec.offerRoles,function(){
			if(ec.util.isArray(this.prodInsts)){
				$.each(this.prodInsts,function(){
					var prodId = this.prodInstId;
					var param = {
						areaId : OrderInfo.getProdAreaId(prodId),
						channelId : OrderInfo.staff.channelId,
						staffId : OrderInfo.staff.staffId,
					    prodId : prodId,
					    prodSpecId : this.objId,
					    offerSpecId : prodInfo.prodOfferId,
					    offerRoleId : this.offerRoleId,
					    acctNbr : this.accessNumber
					};
					var res = query.offer.queryChangeAttachOffer(param);
					$("#attach_"+prodId).html(res);	
					//如果objId，objType，objType不为空才可以查询默认必须
					if(ec.util.isObj(this.objId)&&ec.util.isObj(this.objType)&&ec.util.isObj(this.offerRoleId)){
						param.queryType = "1,2";
						param.objId = this.objId;
						param.objType = this.objType;
						param.memberRoleCd = this.roleCd;
						param.offerSpecId=OrderInfo.offerSpec.offerSpecId;
						//默认必须可选包
						var data = query.offer.queryDefMustOfferSpec(param);
						CacheData.parseOffer(data,prodId);
						//默认必须功能产品
						var data = query.offer.queryServSpec(param);
						CacheData.parseServ(data,prodId);
					}
					/*if(CONST.getAppDesc()==0 && prodInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){	//预校验
					}else{	
					}*/
					AttachOffer.showMainRoleProd(prodId); //显示新套餐构成
					AttachOffer.changeLabel(prodId,this.objId,""); //初始化第一个标签附属
					if(AttachOffer.isChangeUim(prodId)){ //需要补换卡
						//if(!uimDivShow){
							$("#uimDiv_"+prodId).show();
						//}else{
						//	$("#uimDiv_"+prodId).hide();
						//}
					}
					//uimDivShow=true;
				});
			}
		});
		order.dealer.initDealer(); //初始化发展人
		if(CONST.getAppDesc()==0 && order.prodModify.choosedProdInfo.is3G== "Y" && OrderInfo.offerSpec.is3G =="N"){ //3G转4G需要校验
			offerChange.checkOfferProd();
		}
	};
	
	//套餐变更提交组织报文
	var _changeOffer = function(busiOrders){
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
		AttachOffer.setAttachBusiOrder(busiOrders);  //订购退订附属销售品
		if(CONST.getAppDesc()==0){ //4g系统需要,补换卡 
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){ //遍历主销售品构成
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					if(this.objType==CONST.OBJ_TYPE.PROD && this.prodClass==CONST.PROD_CLASS.THREE && OrderInfo.offerSpec.is3G=="N"){//补换卡
						if(OrderInfo.boProd2Tds.length>0){
							var prod = {
								prodId : this.objInstId,
								prodSpecId : this.objId,
								accessNumber : this.accessNumber,
								isComp : "N",
								boActionTypeCd : CONST.BO_ACTION_TYPE.CHANGE_CARD
							};
							var busiOrder = OrderInfo.getProdBusiOrder(prod);
							if(busiOrder){
								busiOrders.push(busiOrder);
							}
						}
					}
				});
			}
		}
	};
			
	//创建退订主销售品节点
	var _createDelOffer = function(busiOrders,offer){	
		offer.offerTypeCd = 1;
		offer.boActionTypeCd = CONST.BO_ACTION_TYPE.DEL_OFFER;
		var prodInfo = order.prodModify.choosedProdInfo;
		OrderInfo.getOfferBusiOrder(busiOrders,offer, prodInfo.prodInstId);
	};
	
	//创建主销售品节点
	var _createMainOffer = function(busiOrders,offer) {
		var prod = order.prodModify.choosedProdInfo;
		var offerSpec = OrderInfo.offerSpec;
		var busiOrder = {
			areaId : OrderInfo.getProdAreaId(prod.prodInstId),  //受理地区ID
			busiOrderInfo : {
				seq : OrderInfo.SEQ.seq--
			}, 
			busiObj : { //业务对象节点
				instId : OrderInfo.SEQ.offerSeq--, //业务对象实例ID
				objId : offerSpec.offerSpecId,  //业务规格ID
				offerTypeCd : "1", //1主销售品
				accessNumber : prod.accNbr  //接入号码
			},  
			boActionType : {
				actionClassCd : CONST.ACTION_CLASS_CD.OFFER_ACTION,
				boActionTypeCd : CONST.BO_ACTION_TYPE.BUY_OFFER
			}, 
			data:{
				ooRoles : [],
				ooOwners : [{
					partyId : OrderInfo.cust.custId, //客户ID
					state : "ADD" //动作
				}]
			}
		};
		//遍历主销售品构成
		$.each(offerSpec.offerRoles,function(){
			var offerRole = this;
			if(this.prodInsts!=undefined){
				$.each(this.prodInsts,function(){
					var ooRoles = {
						objId : this.objId, //业务规格ID
						objInstId : this.prodInstId, //业务对象实例ID,新装默认-1
						objType : this.objType, // 业务对象类型
						offerRoleId : offerRole.offerRoleId, //销售品角色ID
						state : "ADD" //动作
					};
					busiOrder.data.ooRoles.push(ooRoles);
				});
			}
		});

		//销售参数节点
		if(ec.util.isArray(offerSpec.offerSpecParams)){  
			busiOrder.data.ooParams = [];
			for (var i = 0; i < offerSpec.offerSpecParams.length; i++) {
				var param = offerSpec.offerSpecParams[i];
				var ooParam = {
	                itemSpecId : param.itemSpecId,
	                offerParamId : OrderInfo.SEQ.paramSeq--,
	                offerSpecParamId : param.offerSpecParamId,
	                value : param.value,
	                state : "ADD"
	            };
	            busiOrder.data.ooParams.push(ooParam);
			}				
		}
		
		//销售生失效时间节点
		if(offerSpec.ooTimes !=undefined ){
			busiOrder.data.ooTimes = [];
			busiOrder.data.ooTimes.push(offerSpec.ooTimes);
		}
		
		//发展人
		busiOrder.data.busiOrderAttrs = [];
		var $tr = $("tr[name='tr_"+OrderInfo.offerSpec.offerSpecId+"']");
		if($tr!=undefined){
			$tr.each(function(){   //遍历产品有几个发展人
				var dealer = {
					itemSpecId : CONST.BUSI_ORDER_ATTR.DEALER,
					role : $(this).find("select").val(),
					value : $(this).find("input").attr("staffid") 
				};
				busiOrder.data.busiOrderAttrs.push(dealer);
			});
		}
		busiOrders.push(busiOrder);
	};
	
	//填单页面切换
	var _changeTab = function(prodId) {
		/*
		$.each($("#tab_"+prodId).parent().find("li"),function(){
			$(this).removeClass("setcon");
			$("#attach_tab_"+$(this).attr("prodId")).hide();
			$("#uimDiv_"+$(this).attr("prodId")).hide();
		});
		$("#tab_"+prodId).addClass("setcon");
		$("#attach_tab_"+prodId).show();
		if(AttachOffer.isChangeUim(prodId)){
			$("#uimDiv_"+prodId).show();
		}
		*/
	};
	
	//省里校验单
	var _checkOrder = function(prodId){
		if(OrderInfo.actionFlag==3){
			_getAttachOfferInfo();
		}else{
			_getChangeInfo();
		}
		var data = query.offer.updateCheckByChange(JSON.stringify(OrderInfo.orderData));
		OrderInfo.orderData.orderList.custOrderList[0].busiOrder = []; //校验完清空	
		if(data==undefined){
			return false;
		}
		if(data.resultCode==0 && ec.util.isObj(data.result)){ //预校验成功
			offerChange.resultOffer = data.result;
		}else {
			$.alert("预校验规则限制",data.resultMsg);
			offerChange.resultOffer = {}; 
			return false;
		}
		return true;
	};
	
	//3G套餐订购4G流量包时预校验的入参封装
	var _getAttachOfferInfo=function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		//遍历已开通附属销售品列表
		for ( var i = 0; i < AttachOffer.openList.length; i++) {
			var open = AttachOffer.openList[i];
			for ( var j = 0; j < open.specList.length; j++) {  //遍历当前产品下面的附属销售品
				var spec = open.specList[j];
				if(spec.isdel != "Y" && spec.isdel != "C" && spec.ifPackage4G=="Y"){  //订购的附属销售品
					spec.offerTypeCd = 2;
					spec.boActionTypeCd = CONST.BO_ACTION_TYPE.BUY_OFFER;
					spec.offerId = OrderInfo.SEQ.offerSeq--; 
					OrderInfo.getOfferBusiOrder(busiOrders,spec,open.prodId);	
				}
			}
		}
		$.each(busiOrders,function(){
			this.busiObj.state="ADD";
		});
	};
	
	//把旧套餐的产品自动匹配到新套餐中，由于现在暂时只支持主副卡跟单产品，所以可以自动匹配
	var _setChangeOfferSpec = function(memberNum,viceNum){
		if(memberNum==1){ //单产品变更
			var offerRole = getOfferRole();
			if(offerRole==undefined){
				alert("错误提示","无法变更到该套餐");
				return false;
			}
			offerRole.prodInsts = [];
			var flag=false;
			$.each(offerRole.roleObjs,function(){
				if(this.objType==CONST.OBJ_TYPE.PROD){
					var roleObj = this;
					flag=false;
					$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
						if(this.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
							if(roleObj.objId!=this.objId){
								$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+this.roleName+"】角色的规格ID【"+this.objId+"】不一样");
								flag=true;
								return false;
							}
							roleObj.prodInstId = this.objInstId;
							roleObj.accessNumber = this.accessNumber;
							offerRole.prodInsts.push(roleObj);
						}
					});
					if(flag){
						return false;
					}
				}
			});
			if(flag){
				return false;
			}
		}else{  //多成员角色
			for (var i = 0; i < OrderInfo.offer.offerMemberInfos.length; i++) {
				var offerMember = OrderInfo.offer.offerMemberInfos[i];
				if(offerMember.objType==CONST.OBJ_TYPE.PROD){
					var flag = true;
					for (var j = 0; j < OrderInfo.offerSpec.offerRoles.length; j++) {
						var offerRole = OrderInfo.offerSpec.offerRoles[j];
						if(offerMember.roleCd==offerRole.memberRoleCd){ //旧套餐对应新套餐角色
							for (var k = 0; k < offerRole.roleObjs.length; k++) {
								var roleObj = offerRole.roleObjs[k];
								if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
									if(roleObj.objId!=offerMember.objId){
										$.alert("规则限制","新套餐【"+roleObj.offerRoleName+"】角色的规格ID【"+roleObj.objId+"】和旧套餐【"+offerMember.roleName+"】角色的规格ID【"+offerMember.objId+"】不一样");
										return false;
									}
									if(!ec.util.isArray(offerRole.prodInsts)){
										offerRole.prodInsts = [];
									}
									var newObject = jQuery.extend(true, {}, roleObj); 
									newObject.prodInstId = offerMember.objInstId;
									newObject.accessNumber = offerMember.accessNumber;
									offerRole.prodInsts.push(newObject);
									if(offerRole.prodInsts.length>roleObj.maxQty){
										$.alert("规则限制","新套餐【"+offerRole.offerRoleName+"】角色最多可以办理数量为"+roleObj.maxQty+",而旧套餐数量大于"+roleObj.maxQty);
										return false;
									}
									break;
								}
							}
							flag = false;
							break;
						}
					}
					if(flag){
						$.alert("规则限制","旧套餐【"+offerMember.roleName+"】角色在新套餐中不存在，无法变更");
						return false;
					}
				}
			}
		}
		return true;
	};
	
	//获取单产品变更自动匹配的角色
	var getOfferRole = function(){
		//新套餐是主副卡,获取主卡角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			if(offerRole.memberRoleCd==CONST.MEMBER_ROLE_CD.MAIN_CARD){  //主卡
				return offerRole;
			}
		}
		//新套餐不是主副卡，返回第一个包含接入产品的角色
		for ( var i = 0; i < OrderInfo.offerSpec.offerRoles.length; i++) {
			var offerRole = OrderInfo.offerSpec.offerRoles[i];
			for (var j = 0; j < offerRole.roleObjs.length; j++) {
				var roleObj = offerRole.roleObjs[j];
				if(roleObj.objType==CONST.OBJ_TYPE.PROD){  //接入类产品
					return offerRole;
				}
			}
		}
	};
	
	//获取套餐变更节点
	var _getChangeInfo = function(){
		OrderInfo.getOrderData(); //获取订单提交节点	
		OrderInfo.orderData.orderList.orderListInfo.partyId = OrderInfo.cust.custId;
		var busiOrders = OrderInfo.orderData.orderList.custOrderList[0].busiOrder;//获取业务对象数组
		_createDelOffer(busiOrders,OrderInfo.offer); //退订主销售品
		_createMainOffer(busiOrders,OrderInfo.offer); //订购主销售品	
	};
	
	//根据省内返回的数据校验
	var _checkOfferProd = function(){
		if(offerChange.resultOffer==undefined){
			return;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			$.each(prodInfos,function(){
				var prodId = this.accProdInstId;
				//容错处理，省份接入产品实例id传错
				var flag = true;
				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);
					if(this.state=="DEL"){
						if(serv!=undefined){
							var $span = $("#li_"+prodId+"_"+this.prodInstId).find("span");
							$span.addClass("del");
							serv.isdel = "Y";
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){  //在已开通里面，修改不让关闭
							$("#del_"+prodId+"_"+this.prodInstId).hide();
						}else{
							var servSpec = CacheData.getServSpec(prodId,this.productId); //已开通里面查找
							if(servSpec!=undefined){
								$("#del_"+prodId+"_"+this.productId).hide();
							}else {
								if(this.productId!=undefined && this.productId!=""){
									//AttachOffer.addOpenServList(prodId,this.productId,this.prodName,this.ifParams);
									AttachOffer.openServSpec(prodId,this.productId);
								}
							}
						}
					}
				}
			});
		}
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			if(ec.util.isArray(OrderInfo.offer.offerMemberInfos)){//多产品套餐
				$.each(OrderInfo.offer.offerMemberInfos,function(){
					var prodId = this.objInstId;
					$.each(offers,function(){
						if(this.memberInfo==undefined){
							return true;
						}
						var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已开通里面查找
						var flag = true;
						$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
							if(prodId == this.accProdInstId){		
								if(ec.util.isObj(offer)){
									this.prodId = this.accProdInstId;
//									offer.offerMemberInfos = [];
//									offer.offerMemberInfos.push(this);
								}
								flag = false;
								return false;
							}
						});
						if(flag){
							return true;
						}
						if(this.state=="DEL"){
							if(offer!=undefined){
								var $span = $("#li_"+prodId+"_"+this.prodOfferInstId).find("span");
								$span.addClass("del");
								offer.isdel = "Y";
								$("#del_"+prodId+"_"+this.prodOfferInstId).hide();
							}	
						}else if(this.state=="ADD"){
							if(offer!=undefined){ //在已开通里面，修改不让关闭
								$("#del_"+prodId+"_"+this.prodOfferInstId).hide();
							}else{
								var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已开通里面查找
								if(offerSpec!=undefined){
									$("#del_"+prodId+"_"+this.prodOfferId).hide();
								}else {
									if(ec.util.isObj(this.prodOfferId) && this.prodOfferId!=OrderInfo.offerSpec.offerSpecId){
										//AttachOffer.addOpenList(prodId,this.prodOfferId);			
										AttachOffer.addOfferSpecByCheck(prodId,this.prodOfferId);
									}
								}
							}
						}
					});
				});
			}
		}
	};
	
	//根据省内返回的数据校验拼成html
	var _checkAttachOffer = function(prodId){
		var content="";
		if(offerChange.resultOffer==undefined){
			return content;
		}
		//功能产品
		var prodInfos = offerChange.resultOffer.prodInfos;
		if(ec.util.isArray(prodInfos)){
			var str = "";
			$.each(prodInfos,function(){
//				var prodId = this.accProdInstId;
//				//容错处理，省份接入产品实例id传错
//				var flag = true;
//				$.each(OrderInfo.offer.offerMemberInfos,function(){ //遍历旧套餐构成
//					if(this.objType==CONST.OBJ_TYPE.PROD && this.objInstId==prodId){  //接入类产品
//						flag = false;
//						return false;
//					}
//				});
				if(prodId!=this.accProdInstId){
					return true;
				}
				if(prodId!=this.prodInstId){ //功能产品
					var serv = CacheData.getServ(prodId,this.prodInstId);//已开通功能产品里面查找
					var servSpec = CacheData.getServSpec(prodId,this.productId);//已选功能产品里面查找
					if(this.state=="DEL"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span class="del">'+serv.servSpecName+'</span>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+servSpec.servSpecName+'</span>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'" offerspecid="" offerid="'+this.prodInstId+'" isdel="N">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span class="del">'+this.productName+'</span>'
									+'</li>';
							}
						}	
					}else if(this.state=="ADD"){
						if(serv!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
									+'<span>'+serv.servSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else{
							if(servSpec!=undefined){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+servSpec.servSpecName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
							}else if(this.productName!=undefined && this.productName!=""){
								str+='<li id="li_'+prodId+'_'+this.prodInstId+'">'
										+'<dd id="del_'+prodId+'_'+this.prodInstId+'" class="delete"></dd>'
										+'<span>'+this.productName+'</span>'
										+'<dd class="mustchoose"></dd>'
									+'</li>';
								}
						}
					}
				}
			});
			if(str==""){
				content="";
			}else{
				content="<div class='fs_choosed'>订购4G流量包，需订购和取消如下功能产品：<br><ul>"+str+"</ul></div><br>";
			}
		}
		
		
		//可选包
		var offers = offerChange.resultOffer.prodOfferInfos;
		if(ec.util.isArray(offers)){
			var str="";
			$.each(offers,function(){
				if(this.memberInfo==undefined){
					return true;
				}
				var flag = true;
				$.each(this.memberInfo,function(){  //寻找该销售品属于哪个产品
					if(ec.util.isObj(this.accProdInstId)&&prodId == this.accProdInstId){
						flag = false;
						return false;
					}
				});
				if(flag){
					return true;
				}
				var offer = CacheData.getOffer(prodId,this.prodOfferInstId); //已订购里面查找
				var offerSpec = CacheData.getOfferSpec(prodId,this.prodOfferId); //已选里面查找
				if(this.state=="DEL"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span class="del">'+offer.offerSpecName+'</span>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+offerSpec.offerSpecName+'</span>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'" offerspecid="" offerid="'+this.prodOfferInstId+'" isdel="N">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span class="del">'+this.prodOfferName+'</span>'
								+'</li>';
						}
					}	
				}else if(this.state=="ADD"){
					if(offer!=undefined){
						str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
								+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
								+'<span>'+offer.offerSpecName+'</span>'
								+'<dd class="mustchoose"></dd>'
							+'</li>';
					}else{
						if(offerSpec!=undefined){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+offerSpec.offerSpecName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}else if(this.prodOfferName!=undefined && this.prodOfferName!=""){
							str+='<li id="li_'+prodId+'_'+this.prodOfferInstId+'">'
									+'<dd id="del_'+prodId+'_'+this.prodOfferInstId+'" class="delete"></dd>'
									+'<span>'+this.prodOfferName+'</span>'
									+'<dd class="mustchoose"></dd>'
								+'</li>';
						}
					}
				}
			});
			if(str!=""){
				content+="<div class='fs_choosed'>订购4G流量包，需开通和关闭如下可选包：<br><ul>"+str+"</ul></div>";
			}
		}
		
		return content;
	};
	//初始化主副卡标签
	var _initOfferLabel = function() {
		//主副卡标签
		$(".many li").bind("click", function () {
			var index = $(this).index();
			var divs = $("#tabs-body .ordercona");
			$(this).parent().children("li").attr("class", "tab-nav");//将所有选项置为未选中
			$(this).attr("class", "tab-nav-action"); //设置当前选中项为选中样式
			divs.hide();//隐藏所有选中项内容
			divs.eq(index).show(); //显示选中项对应内容
		});
	};
	
	//初始化省内订单属性
	var _initOrderProvAttr = function(){
		//var obj=$("#orderProvAttrIsale").val;
		if($("#orderProvAttrIsale")){
			$("#orderProvAttrIsale").val(OrderInfo.provinceInfo.provIsale);
		}
		var url=contextPath+"/order/provOrderAttrFlag";
		$.ecOverlay("<strong>正在查询是否显示省内订单属性,请稍后....</strong>");
		var response = $.callServiceAsJsonGet(url,{});	
		$.unecOverlay();
		if (response.code==0) {
			if(response.data!=undefined){
				if("0"==response.data){
					$("#orderProvAttrDiv").show();
					if(order.memberChange.reloadFlag=="N"){
						var custOrderAttrs = order.memberChange.rejson.orderList.orderListInfo.custOrderAttrs;
						$.each(custOrderAttrs,function(){
							//省内订单属性
							if(this.itemSpecId==CONST.BUSI_ORDER_ATTR.PROV_ISALE){
								$("#orderProvAttrIsale").val(OrderInfo.provinceInfo.provIsale);
							}
						});
					}
				}
			}
		}
	};
	
	return {
		init 					: _init,
		changeOffer 			: _changeOffer,
		offerChangeView			: _offerChangeView,
		changeTab				: _changeTab,
		checkOrder				: _checkOrder,
		checkAttachOffer		: _checkAttachOffer,
		fillOfferChange			: _fillOfferChange,
		resultOffer				: _resultOffer,
		checkOfferProd			: _checkOfferProd,
		getChangeInfo			: _getChangeInfo,
		setChangeOfferSpec		: _setChangeOfferSpec,
		initOrderProvAttr		: _initOrderProvAttr
	};
})();