
CommonUtils.regNamespace("order", "main");

order.main = (function(){ 
	
	/**
	 * 填单页面展示
	 * param = {
	 * 		boActionTypeCd : S1,
	 * 		boActionTypeName : "订购",
	 *		offerSpecId : 1234,//销售品规格ID
	 *		offerSpecName : "乐享3G-129套餐",//销售品名称,
	 *		feeType : 2100,付费类型
	 *		viceCardNum : 2,//副卡数量
	 *		offerNum : 3,//销售品数量
	 *		type : 1,//1购套餐2购终端3选靓号
	 *		terminalInfo : {
	 *			terminalName : "iphone",
	 *			terminalCode : "2341234124"
	 *		},
	 *		offerRoles : [
	 *			{
	 *				offerRoleId : 1234,
	 *				offerRoleName : "主卡",
	 *				memberRoleCd : "0",
	 *				roleObjs : [{
	 *					offerRoleId : 1,
	 *					objId : ,
	 *					objName : "CDMA",
	 *					objType : 2
	 *				}]
	 *			},
	 *			{
	 *				offerRoleId : 2345,
	 *				offerRoleName : "副卡",
	 *				memberRoleCd : "1"
	 *			}
	 *		]
	 *	}
	 * 
	 */
	var _buildMainView = function(param) {
		if (param == undefined || !param) {
			param = _getTestParam();
		}
		if(!ec.util.isArray(OrderInfo.oldprodInstInfos)){
		    if(OrderInfo.actionFlag == 6){//主副卡成员变更 付费类型判断 如果一致才可以进行加装
				var is_same_feeType=false;//
				if(param.feeTypeMain=="2100" && (param.offerSpec.feeType=="2100"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1200" && (param.offerSpec.feeType=="1200"||param.offerSpec.feeType=="3100"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}else if(param.feeTypeMain=="1201" && (param.offerSpec.feeType=="1201"||param.offerSpec.feeType=="3101"||param.offerSpec.feeType=="3102"||param.offerSpec.feeType=="3103")){
					is_same_feeType=true;
				}
				if(!is_same_feeType){
					$.alert("提示","主副卡付费类型不一致，无法进行主副卡成员变更。");
					return;
				}
			}
		}
		$.callServiceAsHtml(contextPath+"/app/order/main",param,{
			"before":function(){
				$.ecOverlay("<strong>正在加载中,请稍等...</strong>");
			},"done" : function(response){
				if(!response){
					$.unecOverlay();
					 response.data='查询失败,稍后重试';
				}
				if(response.code != 0) {
					$.unecOverlay();
					$.alert("提示","查询失败,稍后重试");
					return;
				}
				OrderInfo.actionFlag = param.actionFlag;
				
				
				OrderInfo.actionFlag = param.actionFlag;
				if(OrderInfo.actionFlag == 2){
					setTimeout(function () { 
						$.unecOverlay();
						offerChange.fillOfferChange(response,param);
				    }, 800);
				}else if(OrderInfo.actionFlag == 21){//副卡换套餐
					order.memberChange.fillmemberChange(response,param);
				}else {
					$.unecOverlay();
					_callBackBuildView(response,param);
				}
			}
		});
	};
	
	//展示回调函数
	var _callBackBuildView = function(response, param) {
		SoOrder.initFillPage(); //并且初始化订单数据
		$("#order_prepare").hide();
		$("#member_prepare").hide();
		var content$ = $("#order").html(response.data).show();
		$.refresh(content$);
		
		_initTounch();
		//_initOfferLabel();//初始化主副卡标签
		_initFeeType(param);//初始化付费方式
		if(param.actionFlag==''){
			OrderInfo.actionFlag = 1;
		}
		
		if(ec.util.isArray(OrderInfo.oldprodInstInfos) && OrderInfo.actionFlag==6){//主副卡纳入老用户
			_loadAttachOffer(param);
		}else{
			_loadOther(param);//页面加载完再加载其他元素
		}
		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
			_initAcct(0);//初始化主卡帐户列表 
		}
		//_loadOther(param);//页面加载完再加载其他元素
//		if(OrderInfo.actionFlag==1 || OrderInfo.actionFlag==6 || OrderInfo.actionFlag==13 || OrderInfo.actionFlag==14){
//			_initAcct();//初始化帐户列表 
//			$("#acctName").val(OrderInfo.cust.partyName);
//			order.dealer.initDealer();//初始化协销		
//		}
//		_addEvent();//添加页面事件*/
		if(OrderInfo.actionFlag==1){
			//为主套餐属性自动设置服务参数
			if(CacheData.setParam(-1,OrderInfo.offerSpec)){ 
//				$("#mainOffer").removeClass("canshu").addClass("canshu2");
			}
//			$("#templateOrderDiv").show();
		}
		order.phoneNumber.initOffer('-1');//主卡自动填充号码入口已选过的号码
		$("#fillNextStep").off("click").on("click",function(){
			//SoOrder.submitOrder();
			if(!SoOrder.checkData()){ //校验通过
				return false;
			}
			$("#order-content").hide();
			$("#order-dealer").show();
			order.dealer.initDealer();
		});
		if (param.memberChange) {
			$("#orderedprod").hide();
			$("#order_prepare").hide();
			$("#productDiv .pdcardcon:first").show();
//			try{
//			  order.prepare.step(1);
//			}catch(){
//				
//			}
			$("#fillLastStep").off("click").on("click",function(){
				order.prodModify.cancel();
			});
		}else{
			$("#fillLastStep").off("click").on("click",function(){
				_lastStep();
			});
		}
	};
	
	//初始化帐户展示
	var _initAcct = function(flag) {

			//主副卡成员变更业务不能更改帐户，只展示主卡帐户
			if(OrderInfo.actionFlag==6){
				var param = {};
				if(flag==1){
					for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
						param.prodId=OrderInfo.oldprodInstInfos[i].prodInstId;
						param.acctNbr=OrderInfo.oldprodInstInfos[i].accNbr;
						param.areaId=OrderInfo.oldprodInstInfos[i].areaId;
						var jr = $.callServiceAsJson(contextPath+"/apporder/queryProdAcctInfo", param);
						if(jr.code==-2){
							$.alertM(jr.data);
							return;
						}
						var prodAcctInfos = jr.data;
						prodAcctInfos[0].accessNumber = OrderInfo.oldprodInstInfos.accNbr;
						OrderInfo.oldprodAcctInfos.push({"prodAcctInfos":prodAcctInfos});
					}
				}else{
					param.prodId=order.prodModify.choosedProdInfo.prodInstId;
					param.acctNbr=order.prodModify.choosedProdInfo.accNbr;
					param.areaId=order.prodModify.choosedProdInfo.areaId;
					var jr = $.callServiceAsJson(contextPath+"/app/order/queryProdAcctInfo", param);
					if(jr.code==-2){
						$.alertM(jr.data);
						return;
					}
					var prodAcctInfos = jr.data;
					//$("#accountDiv").find("label:eq(0)").text("主卡帐户：");
					$.each(prodAcctInfos, function(i, prodAcctInfo){
						OrderInfo.acctId = prodAcctInfo.acctId;
						OrderInfo.acctCd = prodAcctInfo.acctCd;
//						$("<option>").text(prodAcctInfo.name+" : "+prodAcctInfo.acctCd).attr("value",prodAcctInfo.acctId)
//						.attr("acctcd",prodAcctInfo.acctCd).appendTo($("#acctSelect"));					
					});
				//	$("#accountDiv").find("a:eq(0)").hide();
				}
			}
	};
	
	var _initTounch = function(){
		touch.on('.item', 'touchstart', function(ev){
//			ev.preventDefault();
		});
		$(".item").each(function(i){
			touch.on(this, 'swiperight', function(ev){
				$("#carousel-example-generic").carousel('prev');
			});
			
			touch.on(this, 'swipeleft', function(ev){
				$("#carousel-example-generic").carousel('next');
			});
		});

	};
	
	var _loadAttachOffer = function(param) {
		for(var i=0;i<OrderInfo.oldprodInstInfos.length;i++){
			var prodInfo = OrderInfo.oldprodInstInfos[i]; //获取老用户产品信息
//			var uimDivShow=false;//是否已经展示了
			//var prodId = prodInfo.prodInstId;
			$.each(OrderInfo.oldoffer,function(){
				if(this.accNbr == prodInfo.accNbr){
					var oldoffer = this;
					$.each(oldoffer.offerMemberInfos,function(){
						var member = this;
						var prodId = this.objInstId;
						var param = {
								areaId : OrderInfo.getProdAreaId(prodId),
								channelId : OrderInfo.staff.channelId,
								staffId : OrderInfo.staff.staffId,
							    prodId : prodId,
							    prodSpecId : member.objId,
							    offerSpecId : prodInfo.mainProdOfferInstInfos[0].prodOfferId,
							    offerRoleId : "",
							    acctNbr : member.accessNumber,
							    partyId:prodInfo.custId,
							    distributorId:OrderInfo.staff.distributorId,
							    mainOfferSpecId:prodInfo.mainProdOfferInstInfos[0].prodOfferId,
							    soNbr:OrderInfo.order.soNbr
							};
						if(ec.util.isObj(prodInfo.prodBigClass)){
							param.prodBigClass = prodInfo.prodBigClass;
						}
						$.each(OrderInfo.oldofferSpec,function(){
							if(this.accNbr==prodInfo.accNbr){
								$.each(this.offerSpec.offerRoles,function(){
									if(this.memberRoleCd==CONST.MEMBER_ROLE_CD.VICE_CARD || this.memberRoleCd==CONST.MEMBER_ROLE_CD.COMMON_MEMBER){
										param.offerRoleId = this.offerRoleId;
									}
								});
							}
						});
						var res = query.offer.queryChangeAttachOffer(param);
						$("#attach_"+prodId).html(res);	
						//如果objId，objType，objType不为空才可以查询默认必须
						if(ec.util.isObj(member.objId)&&ec.util.isObj(member.objType)&&ec.util.isObj(member.offerRoleId)){
							param.queryType = "1,2";
							param.objId = member.objId;
							param.objType = member.objType;
							param.memberRoleCd = "401";
							//默认必须可选包
							var data = query.offer.queryDefMustOfferSpec(param);
							CacheData.parseOffer(data);
							//默认必须功能产品
							var data = query.offer.queryServSpec(param);
							CacheData.parseServ(data);
						}
						if(ec.util.isArray(OrderInfo.oldofferSpec)){ //主套餐下的成员判断
//								var member = CacheData.getOfferMember(prodId);
							$.each(OrderInfo.oldofferSpec,function(){
								if(this.accNbr == prodInfo.accNbr){
									var offerRoles = this.offerSpec.offerRoles;
									$.each(offerRoles,function(){
										if(this.offerRoleId==member.offerRoleId && member.objType==CONST.OBJ_TYPE.PROD){
											var offerRole = this;
											$.each(this.roleObjs,function(){
												if(this.objType==CONST.OBJ_TYPE.SERV){
													var serv = CacheData.getServBySpecId(prodId,this.objId);//从已订购功能产品中找
													if(serv!=undefined){ //不在已经开跟已经选里面
														var $oldLi = $('#li_'+prodId+'_'+serv.servId);
														if(this.minQty==1){
														//	$oldLi.append('<dd class="mustchoose"></dd>');
														}
														//$oldLi.append('<dd id="jue_'+prodId+'_'+serv.servId+'" class="jue2" title="'+offerRole.offerRoleName+'"></dd>');
													}
												}
											});
											return false;
										}
									});
								}
							});
						}
						AttachOffer.changeLabel(prodId,prodInfo.productId,"");
					});
				}
			});
			var oldoffer = {};
			if(ec.util.isArray(OrderInfo.oldoffer)){ //主套餐下的成员判断
//				var member = CacheData.getOfferMember(prodId);
			    $.each(OrderInfo.oldoffer,function(){
			    	if(this.accNbr == prodInfo.accNbr){
			    		oldoffer = this;
			    	}
			    });
			}
			//老用户加入副卡需要预校验,主卡是4G，加入的老用户为3G
			if(order.prodModify.choosedProdInfo.is3G== "N" && prodInfo.mainProdOfferInstInfos[0].is3G =="Y"){
				if(!order.memberChange.checkOrder(prodInfo,oldoffer)){ //省内校验单
					return;
				}
				order.memberChange.checkOfferProd(oldoffer);
			}
			
		}
					
};
	//动态添加产品属性、附属销售品等
	var _loadOther = function(param) {
		$.each(OrderInfo.offerSpec.offerRoles,function(){ //遍历主套餐规格
			var offerRole = this;
			for ( var i = 0; i < this.prodInsts.length; i++) {
				var prodInst = this.prodInsts[i];
				var param = {   
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					prodSpecId : prodInst.objId,
					offerRoleId: prodInst.offerRoleId,
					prodId : prodInst.prodInstId,
					queryType : "1,2",
					objType: prodInst.objType,
					objId: prodInst.objId,
					memberRoleCd : prodInst.memberRoleCd
				};
				AttachOffer.queryAttachOfferSpec(param);  //加载附属销售品
				var obj = {
					div_id : "item_order_"+prodInst.prodInstId,
					prodId : prodInst.prodInstId,
					offerSpecId : OrderInfo.offerSpec.offerSpecId,
					compProdSpecId : "",
					prodSpecId : prodInst.objId,
					roleCd : offerRole.roleCd,
					offerRoleId : offerRole.offerRoleId,
					partyId : OrderInfo.cust.custId
				};
				order.main.spec_parm(obj); //加载产品属性
			}			
		});
	};
	
	var _paymethodChange = function(obj){
		$(".paymethodChange").each(function(){
			if($(this).attr("id")!=$(obj).attr("id")){
				$(this).val($(obj).val());
			}
		});
	};
	
	var _templateTypeCheck = function(obj){
		if($("#isTemplateOrder").attr("checked")=="checked"){//如果选择批量模板
			var paytype=$('select[name="pay_type_-1"]').val(); 
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paytype!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paytype!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			/*
			var paymethod = null ;
			var paymethodid = null ;
			$(".paymethodChange").each(function(){//获取第一个付费方式
				if(paymethod==null){
					paymethod = $(this).val();
					paymethodid = $(this).attr("id");
				}
			});
			if(obj&&$(obj).val()){//如果是 批量模板 选择 批开模板，直接提示
				if($(obj).val()=="0"&&paymethod!="2100"){//如果不是预付费
					$.alert("提示","您选择批开活卡模板，付费方式需改成'预付费'！");
					$("html").scrollTop(0);
					return false ;
				}
			}else{//如果是 订单提交时 判断
				var templeVal = $("#templateOrderDiv select").val();
				if(templeVal){
					if(templeVal=="0"&&paymethod!="2100"){//如果不是预付费
						$.alert("提示","您选择批开活卡模板，付费方式需改成预付费！");
						$("html").scrollTop(0);
						return false ;
					}
				}
			}
			*/
		}
		return true ;
	};
	
	var _initFeeType = function(param) {
		if (param.feeType != undefined && param.feeType && param.feeType != CONST.PAY_TYPE.NOLIMIT_PAY) {
			$("input[name^=pay_type_][value="+param.feeType+"]").attr("checked","checked");
			$("input[name^=pay_type_]").attr("disabled","disabled");
		}
	};
	
	
	//展示帐户
	var _showAcct = function(accountInfos){
		$("#acctListTab tbody").empty();
		$.each(accountInfos,function(i, accountInfo){
			var tr = $("<tr></tr>").appendTo($("#acctListTab tbody"));
			if(accountInfo.name){
				$("<td class='teleNum'>"+accountInfo.name+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.acctId){
				$("<td acctId='"+accountInfo.acctId+"'>"+accountInfo.accountNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.owner){
				$("<td>"+accountInfo.owner+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			if(accountInfo.accessNumber){
				$("<td>"+accountInfo.accessNumber+"</td>").appendTo(tr);
			}
			else{
				$("<td></td>").appendTo(tr);
			}
			tr.click(function(){
				var found = false;
				var custAccts = $("#acctSelect").find("option");
				$.each(custAccts, function(i, custAcct){
					if(custAcct.value==accountInfo.acctId){
						$("#acctSelect").find("option[value="+custAcct.value+"]").attr("selected","selected");
						found = true;
						return false;
					}					
				});					
				$(this).dispatchJEvent("chooseAcct",accountInfo);				
				easyDialog.close();
				$("#defineNewAcct").hide();
			});
		});
	};
	
	
	function _spec_parm(param){
		$.callServiceAsHtmlGet(contextPath + "/app/order/orderSpecParam",param, {
			"done" : function(response){
				if(response && response.code == -2){
					return ;
				}else if(response && (response.data == 0||response.data == "0")){
					return;
				}
				$("#"+param.div_id).append(response.data);
//				$("div[name='spec_params']").each(function(){
					$.refresh($(this));
//				});
				//判断使用人产品属性是否必填
				_checkUsersProdAttr(param.prodId, $("#"+param.div_id));
				//$('#choose_user_btn_'+param.prodId).parent().parent().parent().hide();
				//只有在新装的时候才可编辑“是否信控”产品属性
				var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId);
				if(xkDom.length == 1){
					if(OrderInfo.actionFlag != 1&& OrderInfo.actionFlag != 14){
						$(xkDom).attr("disabled","disabled");
					} else {
						$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+param.prodId+" option[value='']").remove(); //去除“请选择”空值选项
						$(xkDom).val("20"); //默认为“是”
						if(OrderInfo.offerSpec.feeType == CONST.PAY_TYPE.BEFORE_PAY){ //“预付费”默认选是，且不可编辑
							$(xkDom).attr("disabled","disabled");
						}
					}
					$(xkDom).addClass("styled-select");
				}
			},
			fail:function(response){
				$.unecOverlay();
			}
		});
	}
	
	//产品属性 提交
	function _spec_parm_change_save(){
		//OrderInfo.initData(CONST.ACTION_CLASS_CD.PROD_ACTION,CONST.BO_ACTION_TYPE.PRODUCT_PARMS,0,CONST.getBoActionTypeName(CONST.BO_ACTION_TYPE.PRODUCT_PARMS),"");
		if(!_check_parm("order_spc_update")){
			return ;
		}
		var boProdItems = new Array();
		//input
		var chang_row = 0;
		$("#order_spc_update input").each(function(){
			//订单属性 是否模板 由公共类自动添加，这里不加入属性
			if($(this).attr("id")!="order_remark"&&$(this).attr("id")!="isTemplateOrder"&&$(this).attr("id")!="templateOrderName"&&$(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		//select
		$("#order_spc_update select").each(function(){
			if($(this).attr("id")!="templateOrderType"){
				if($(this).attr("itemSpecId")!=null&&$(this).attr("itemSpecId")!=""){
					if("1"==$(this).attr("addtype")){//如果实例没有，通过规格带出的属性，做ADD
						if($(this).val()!=null&&$(this).val()!=""){
							var row1 = {
									"itemSpecId":$(this).attr("itemSpecId"),
									"prodSpecItemId":$(this).attr("prodSpecItemId"),
									"state":"ADD",
									"value":$(this).val()
							};
							boProdItems.push(row1);
							chang_row++;
						}
					}else{
						if($(this).val()!=$(this).attr("oldValue")){
							if($(this).attr("oldValue")!=null&&$(this).attr("oldValue")!=""){
								var row2 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"DEL",
										"value":$(this).attr("oldValue")
								};
								boProdItems.push(row2);
								chang_row++;
							}
							if($(this).val()!=null&&$(this).val()!=""){
								var row3 = {
										"itemSpecId":$(this).attr("itemSpecId"),
										"prodSpecItemId":$(this).attr("prodSpecItemId"),
										"state":"ADD",
										"value":$(this).val()
								};
								boProdItems.push(row3);
								chang_row++;
							}
						}
					}
				}
			}
		});
		var busiOrderAttrs ;
		if($("#order_remark").val()){
			busiOrderAttrs = [{
				atomActionId : OrderInfo.SEQ.atomActionSeq--,
				itemSpecId : CONST.ITEM_SPEC_ID_CODE.busiOrderAttrs ,//"111111122",//备注的ID，待修改
				value : $("#order_remark").val()
			}];
			chang_row++;
		}
		if(chang_row<1){
			$.alert("提示","您未修改订单属性");
			return ;
		}
		/*
		if(!SoOrder.builder()){//加载实例缓存，并且初始化订单数据
			return;
		} 
		*/
		//配置参数：来调用产品属性修改的ser
		//OrderInfo.boProdItems = boProdItems ;
		var data = {boProdItems:boProdItems} ;
		if(busiOrderAttrs){
			data.busiOrderAttrs = busiOrderAttrs ;
		}
		OrderInfo.actionFlag=33;//改产品属性
		SoOrder.submitOrder(data);

	}
	//产品属性-校验所有属性
	function _check_parm(ul_id){
		var f = true ;
		$("#"+ul_id).find("input").each(function(){
			if(f){
				f = _check_parm_self(this);
			}
		});
		return f;
	}
	//产品属性-校验单个属性
	function _check_parm_self(obj){
		//alert("---"+$(obj).val());
		if($(obj).attr("check_option")=="N"){
			if($(obj).val()==null||$(obj).val()==""){
				$.alert("提示",$(obj).attr("check_name")+" 尚未填写");
				return false;
			}
		}
		
		if($(obj).attr("check_type")=="check"){
			var len = $(obj).attr("check_len");
			//alert($(this).val()+"--"+len);
			if(len>0){
				//alert($(this).val().length+"---"+len);
				if($(obj).val().length>len){
					$.alert("提示",$(obj).attr("check_name")+" 长度过长(<"+len+")");
					return false;
				}
			}
			var mask = $(obj).attr("check_mask");
			if(mask!=null&&$(obj).val()!=null&&$(obj).val()!=""){
				//alert($(obj).val()+"---"+mask);
				//mask= "^[A-Za-z]+$";
				var pattern = new RegExp(mask) ;
				if(!pattern.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 校验失败：" + $(obj).attr("check_mess"));
					return false;
				}
			}
			var v_len = $(obj).val().length;
			if(v_len>0&&$(obj).attr("dataType")=="3"){//整数
				if(!/^[0-9]+$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非数字，请修改");
					return false;
				}
			}else if(v_len>0&&$(obj).attr("dataType")=="5"){//小数
				if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test($(obj).val())){
					$.alert("提示",$(obj).attr("check_name")+ " 非小数，请修改");
					return false;
				}
			}else if(v_len>0&&($(obj).attr("dataType")=="4"||$(obj).attr("dataType")=="16")){//日期
				/*
				if(/Invalid|NaN/.test(new Date($(obj).val().substring(0,10)))){
					$.alert("提示",$(obj).attr("check_name")+ " 非日期，请修改");
					return false;
				}
				*/
			}
		}
		return true ;
	}
	//滚动分页回调 ok
	var _queryScroll = function(scrollObj){
		if(scrollObj && scrollObj.page){
			_queryStaffPage(scrollObj.page,scrollObj.scroll);
		}
	};
	//协销人-查询-入口 ok
	var _queryStaff = function(dealerId,objInstId){
		$.callServiceAsHtmlGet(contextPath + "/pad/staffMgr/getStaffListPrepare",{"dealerId":dealerId,"objInstId":objInstId},{
			"done" : function(response){
				//统一弹出框
				var popup = $.popup("#div_staff_dialog",response.data,{
					cache:true,
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){}
				});
				$("#btn_staff_select_chk").off("tap").on("tap",function(){_setStaff(objInstId);});
				$("#a_order_staff_qry").off("tap").on("tap",function(){_queryStaffPage(1);});
			}
		});
	};
	//协销人-查询 -列表 ok
	var _queryStaffPage = function(qryPage,scroller){
		var param = {
				"dealerId" :$("#dealer_id").val(),
				"qrySalesCode":$("#qrySalesCode").val(),
				"staffName":$("#qryStaffName").val(),
				"staffCode":$("#qryStaffCode").val(),
				"staffCode2":$("#qryStaffCode").val(),
				"salesCode":$("#qrySalesCode").val(),
				"pageIndex":qryPage,
				"objInstId":$("#objInstId").val(),
				"pageSize" :10
			};
		
		$.callServiceAsHtml(contextPath + "/pad/staffMgr/getStaffList",param,{
			"before":function(){
				if(qryPage==1)$.ecOverlay("<strong>正在查询中,请稍等...</strong>");
			},
			"always":function(){
				if(qryPage==1)$.unecOverlay();
			},
			"done" : function(response){
				var _data = "";
				if(!response){
					_data='';
				}else{
					_data = response.data;
				}
				var content$ = $("#div_order_dealer_list");
				//首页时直接覆盖,其它页追加
				if(qryPage==1)content$.html(_data);
				else content$.find("tbody").append(_data);
				
				content$.find("tr").each(function(){
					$(this).off("tap").on("tap",function(event){
						$(this).addClass("userorderlistlibg").siblings().removeClass("userorderlistlibg");
					});
				});
				
				//回调刷新iscroll控制数据,控件要求
				if(scroller && $.isFunction(scroller)) scroller.apply(this,[]);
			}
		});	

	};
	//选中协销人 ok
	var _setStaff = function(objInstId){
		var $staff = $("#div_order_dealer_list tr.userorderlistlibg");
		$staff.each(function(){
			$("#dealer_"+objInstId).val($(this).attr("staffName")).attr("staffId", $(this).attr("staffId"));
		});
		if($staff.length > 0){
			$("#div_staff_dialog").popup("close");
		}else{
			$.alert("提示","请先选择协销人！");
		}
	};
	/*
	function _setStaff(v_id,staffId,staffCode,staffName){
		//alert(v_id+"--"+staffId+"=="+staffName);
		$("#"+v_id).val(staffName+"("+staffCode+")").attr("staffId",staffId);
		if(!$("#acctDialog").is("hidden")) {
			easyDialog.close();
		}
	}
	*/
	
	//帐户查询
	var _chooseAcct = function() {
		$("#acctDialog .contract_list td").text("帐户查询");
		$("#acctDialog .selectList").show();
		easyDialog.open({
			container : 'acctDialog'
		});
		$("#acctPageDiv").show();
		var listenerName = "chooseAcct";
		var $sel = $("#acctSelect");
		if (!$sel.hasJEventListener(listenerName)) {
			$sel.addJEventListener(listenerName,function(data){
				//遍历当前帐户列表，如果已存在，则直接显示，如果不存在，则加上一个option
				var found = false;
				$.each($sel.find("option"), function(i, option) {
					if ($(option).val() == data.acctId) {
						found = true;
						return false;
					}
				});
				if (found==false) {
					$("<option>").text(data.name+" : "+data.accountNumber).attr("value",data.acctId).attr("acctcd",data.accountNumber).appendTo($sel);
				}
				$sel.find("option[value="+data.acctId+"]").attr("selected","selected");
				if(data.acctId>0){
					$("#account").find("a:eq(1)").show();
				}
			});
		}
		//初始化弹出框
		$("#acctListTab tbody").empty();
		$("#acctPageDiv").empty();
	};
	
	//新增帐户
	var _createAcct = function() {
		$("#acctSelect").append("<option value='-1' style='color:red'>[新增] "+OrderInfo.cust.partyName+"</option>");
		$("#acctSelect").find("option[value='-1']").attr("selected","selected");
		$("#acctName").val(OrderInfo.cust.partyName);//默认帐户名称为客户名称
		//新增帐户自定义支付属性
		$("#defineNewAcct").show();
		//隐藏帐户信息的按钮
		$("#account").find("a:gt(0)").hide();
		//获取账单投递信息主数据并初始化新建帐户自定义属性
		window.setTimeout("order.main.showNewAcct()", 0);
	};
	//获取账单投递信息主数据并初始化新建帐户自定义属性
	var _showNewAcct = function(){
		acct.acctModify.ifCanAdjustBankPayment();//查询工号权限：能否选择银行托收
		acct.acctModify.getBILL_POST(function(){
			acct.acctModify.paymentType();
			acct.acctModify.billPostType();
		});
	};
	
	//展示帐户信息
	var _acctDetail = function() {
		var acctSel = $("#acctSelect");
		if(!acctSel.val()){
			$.alert("提示","请选择一个帐户");
			return
		}
		if(acctSel.val() == -1){
			$.alert("提示","该帐户是新建帐户");
			return;
		}
		$("#acctDialog .contract_list td").text("帐户信息");
		$("#acctDialog .selectList").hide();
		$("#acctPageDiv").hide();
		$("#acctListTab tbody").empty();
		easyDialog.open({
			container : 'acctDialog'
		});
		var acctQueryParam = {
			acctCd : acctSel.find("option:selected").attr("acctcd")
		};			
		$.callServiceAsJson(contextPath+"/order/account", acctQueryParam, {
			"before":function(){
				$.ecOverlay("<strong>正在查询中,请稍等会儿....</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done" : function(response){
				if(response.code==-2){
					$.alertM(response.data);
					return;
				}
				if(response.code==0){
					_showAcct(response.data.accountInfos);					
				}
				else{
					$("<tr><td colspan=4>"+response.data+"</td</tr>").appendTo($("#acctListTab tbody"));
				}
				$("#acctListTab tr").off("click");				
			}			
		});
	};
	
	var _lastStep = function(callbackFunc) {
		//购手机第二个页面没下单，返回无需提示取消订单
		if(OrderInfo.actionFlag == 13 && OrderInfo.order.step == 2){
			var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
			if(typeof(callbackFunc)=="function"){
					callbackFunc();
				}
		}else{
		$.confirm("确认","确定要取消该订单吗？",{
			yes:function(){
				//TODO　may initialize something;				
				var boProdAns = OrderInfo.boProdAns;
				var boProd2Tds = OrderInfo.boProd2Tds;
				//取消订单时，释放被预占的UIM卡
				if(boProd2Tds.length>0){
					for(var n=0;n<boProd2Tds.length;n++){
						var param = {
								numType : 2,
								numValue : boProd2Tds[n].terminalCode
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//释放预占的号码
				if(boProdAns.length>0){
					for(var n=0;n<boProdAns.length;n++){
						if(boProdAns[n].idFlag){
							continue;
						}
						var param = {
								numType : 1,
								numValue : boProdAns[n].accessNumber
						};
						$.callServiceAsJson(contextPath+"/app/mktRes/phonenumber/releaseErrorNum", param, {
							"done" : function(){}
						});
					}
				}
				//清除号码的缓存！
				order.phoneNumber.resetBoProdAn();
				//$("#order_prepare").show();
				//$("#order").hide();
				if(typeof(callbackFunc)=="function"){
					callbackFunc();
				}
			},no:function(){
				
			}},"question");
		}
	};
	
	var _getTestParam = function() {
		return {
			boActionTypeCd : S1,
			boActionTypeName : "订购",
			offerSpecId : 1234,
			offerSpecName : "乐享3G-129套餐",
			feeType : 1200,
			viceCardNum : 3,
			offerNum : 3,
			type : 1,//1购套餐2购终端3选靓号
			terminalInfo : {
				terminalName : "IPhone5",
				terminalCode : "46456457345"
			},
			offerRoles : [
				{
					offerRoleId : 1234,
					offerRoleName : "主卡",
					memberRoleCd : "0",
					roleObjs : [{
						offerRoleId : 1,
						objId : CONST.PROD_SPEC.CDMA,
						objName : "CDMA",
						objType : 2
					}]
				},
				{
					offerRoleId : 2345,
					offerRoleName : "副卡",
					memberRoleCd : "1"
				}
			]
		};
	};
	

	var _genRandPass6Input = function(id){
		var pass = _genRandPass6();
		$("#"+id).val(pass);
	};
	
	var _genRandPass6 = function(){
		var str = "" ;
		var lastOneS = "" ;
		var thisOneS = "" ;
		var thisOneI = 0 ;
		for(var k=0;k<6;k++){
			do{
				if(str.length>0){
					lastOneS = str.substring(str.length-1,str.length) ;
				}
				thisOneI = parseInt(Math.random()*9+1);
				thisOneS = ""+thisOneI ;
				if(str.length==5){
					if(_checkIncreace6(str + thisOneS)){
						continue;
					}
				}
			}while(lastOneS==thisOneS);
			str = str + thisOneS ;
		}
		if(str.length!=6){
			return null ;
		}
		return str ;
	};
	
	var _checkIncreace6 = function(str){
		var newStr = "";
		if(str && str.length==6){
			var int0 = str[0];
			for(var i=0;i<str.length;i++){
				var int1 = parseInt(str.substring(i,i+1));
				newStr += Math.abs(int1-int0);
			}
			if("012345"==newStr||"543210"==newStr){
				return true ;
			}else{
				return false ;
			}
		}else{
			return false ;
		}
	};
	
	var _passwordCheckInput = function(id,accNbr){
		var val = $("#"+id).val();
		return _passwordCheckVal(val,accNbr);
	};
	
	var _passwordCheckVal = function(val,accNbr){
		var detail = "<div style='text-indent:0px;'>密码设置规则：<br/>1、密码必须为六位全数字；<br/>2、密码不能与接入号中的信息重复；<br/>3、密码不能包含连续相同的数字；<br/>4、密码不能是连续的六位数字。</div>";
		var reg = new RegExp("^([0-9]{6})$");//6位纯数字 0~9
		if(val==null){
			$.alertMore("提示", "", "密码不可为空！", detail, "");
			return false ;
		}else if(!reg.test(val)){
			$.alertMore("提示", "", "密码包含非数字或长度不是6位", detail, "");
			return false ;
		}
		if(accNbr!=null && accNbr.indexOf(val)>=0){
			$.alertMore("提示", "", "密码不能与接入号中的信息重复，请修改！", detail, "");
			return false ;
		}
		for(var k=0;k<5;k++){
			lastOneS = val.substring(k,k+1) ;
			thisOneS = val.substring(k+1,k+2) ;
			if(lastOneS==thisOneS){
				$.alertMore("提示", "", "密码中包含连续相同数字，请修改！", detail, "");
				return false ;
			}
		}
		if(_checkIncreace6(val)){
			$.alertMore("提示", "", "密码不可是连续6位数字，请修改！", detail, "");
			return false ;
		}
		return true ;
	};
	
	//付费类型选项变更时级联更新相关的产品属性
	var _feeTypeCascadeChange = function(dom,prodId){
		var feeType = $(dom).val();
		var xkDom = $("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId);
		//“是否信控”产品属性，预付费时默认为“是”且不可编辑，其他默认为“是”但可编辑
		if(feeType == CONST.PAY_TYPE.BEFORE_PAY){
			//增加付费方式对翼支付助手功能产品的限制
			if((OrderInfo.actionFlag==1||OrderInfo.actionFlag==3||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14)
					&&CacheData.getServSpec(-1,381000960)!=null){
				var yiPaySpec = CacheData.getServSpec(-1,381000960);
				if(yiPaySpec.isdel==undefined||yiPaySpec.isdel!="Y"){
					$.confirm("信息确认","您已选择开通【翼支付交费助手】功能产品，如果修改付费类型为预付费，其属性将赋为默认值！",{ 
						yesdo:function(){
							for ( var j = 0; j < yiPaySpec.prodSpecParams.length; j++) {							
								var prodSpecParam = yiPaySpec.prodSpecParams[j];
								prodSpecParam.setValue = prodSpecParam.value;
//								if (!!prodSpecParam.valueRange[0]) 
//									prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
								}
						},
						no:function(){
							$(dom).find("option[value='1200']").attr("selected",true);
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").removeAttr("disabled");
						}
					});
				}				
			}
			$(xkDom).val("20");
			$(xkDom).attr("disabled", true);
		} else {
			if((OrderInfo.actionFlag==1||OrderInfo.actionFlag==3||OrderInfo.actionFlag==6||OrderInfo.actionFlag==14)
					&&CacheData.getServSpec(-1,381000960)!=null){
				var yiPaySpec = CacheData.getServSpec(-1,381000960);
				if(yiPaySpec.isdel==undefined||yiPaySpec.isdel!="Y"){
					// #610119需求增加：托收的属性需要分省下发。
					var agentFlag = offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3));
					$.confirm("信息确认","您已选择开通【翼支付交费助手】功能产品，如果修改付费类型为后付费，" + ("ON" == agentFlag ? "只可变更“翼支付托收”。" : "属性不可变更。"),{ 
						yesdo:function(){
							for ( var j = 0; j < yiPaySpec.prodSpecParams.length; j++) {							
								var prodSpecParam = yiPaySpec.prodSpecParams[j];
								if (CONST.YZFitemSpecId4 == prodSpecParam.itemSpecId && "ON" == offerChange.queryPortalProperties("AGENT_" + (OrderInfo.staff.soAreaId+"").substring(0,3))) {
									if (prodSpecParam.value!="") {
										prodSpecParam.setValue = prodSpecParam.value;
									} else if (!!prodSpecParam.valueRange[0]&&prodSpecParam.valueRange[0].value!="")
										//默认值为空则取第一个
										prodSpecParam.setValue = prodSpecParam.valueRange[0].value;
								} else {
									prodSpecParam.setValue = "";
								}	
							}
						},
						no:function(){
							$(dom).find("option[value='2100']").attr("selected",true);
							$("#"+CONST.PROD_ATTR.IS_XINKONG+"_"+prodId).val("20").attr("disabled","disabled");
						}
					});
				}				
			}
			$(xkDom).attr("disabled", false);
		}
		$(xkDom).addClass("styled-select");
	};

	//判断使用人产品属性是否必填，mantis 0147689: 关于政企单位用户实名制信息录入相关工作的要求 ；
	function _checkUsersProdAttr(prodId, dom){
		//1）新建客户新装，如果是政企客户，填单时必须填写使用人；
		//2）老客户新装，根据客户查询判断是政企客户（segmentId=1000）时，填单必须填写使用人；
		var itemId = CONST.PROD_ATTR.PROD_USER + '_' + prodId;
		
		if($('#'+itemId).length > 0){
			 var propertiesKey = "FUKA_SHIYR_"+(OrderInfo.staff.soAreaId+"").substring(0,3);
		     var isFlag = offerChange.queryPortalProperties(propertiesKey);
		     var isOptional = true;
			if(OrderInfo.cust && OrderInfo.cust.custId && OrderInfo.cust.custId != '-1'){ //老客户
				// 根据证件类型来判断
				if(cust.isCovCust(OrderInfo.cust.identityCd)){
					//政企客户
					isOptional = false;
				}else if(OrderInfo.actionFlag =='6' && isFlag=="ON"){//主副卡加装副卡
					isOptional = false;
					OrderInfo.roleType = "Y";
				}else if(OrderInfo.actionFlag ==1 && prodId < -1 && isFlag=="ON"){
					isOptional = false;
					OrderInfo.roleType = "Y";
				}
			} else { //新建客户
				if(OrderInfo.boCustInfos && OrderInfo.boCustInfos.partyTypeCd == '2'){ //政企客户
					isOptional = false;
				}else if(prodId !=-1 && isFlag=="ON"){//新装prodId不为-1表示有副卡新装
					OrderInfo.roleType = "Y";
					isOptional = false;
				}
			}
			if(!isOptional){
				for(var i=0;i<OrderInfo.prodAttrs.length;i++){
					if(OrderInfo.prodAttrs[i].id == itemId){
						OrderInfo.prodAttrs[i].isOptional = 'N';
						break;
					}
				}
				//绑定弹出框事件，用于定位客户
				$('#'+itemId).attr({'check_option':'N','readonly':'readonly','disabled':'disabled'}).show();				
			} else {
				$('#choose_user_btn_'+prodId).parent().parent().parent().hide();
			}
		}
	};
	
	
	//客户类型关联证件类型下拉框
	var _certTypeByPartyType = function(_partyTypeCd){
		var params = {"partyTypeCd":_partyTypeCd} ;
		var url=contextPath+"/cust/queryCertType";
		var response = $.callServiceAsJson(url, params, {});
       if (response.code == -2) {
					$.alertM(response.data);
				}
	   if (response.code == 1002) {
		   			$.alert("错误","根据员工类型查询员工证件类型无数据,请配置");
					return;
				}
	   if(response.code==0){
					var data = response.data ;
					var currentCT = $("#currentCT").val();//渠道类型
					//只有定义的渠道类型新建客户的时候可以选择非身份证类型,其他的渠道类型只能选择身份证类型。
					var isAllowChannelType = false;
					if (currentCT == CONST.CHANNEL_TYPE_CD.ZQZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.HYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.SYKHZXDL
						|| currentCT == CONST.CHANNEL_TYPE_CD.XYKHZXDL || currentCT == CONST.CHANNEL_TYPE_CD.GZZXJL
						|| currentCT == CONST.CHANNEL_TYPE_CD.ZYOUT || currentCT == CONST.CHANNEL_TYPE_CD.ZYINGT
						|| currentCT == CONST.CHANNEL_TYPE_CD.WBT) { // || _partyTypeCd != "1" //新建政企客户时同样有这个限制
						isAllowChannelType = true;
					}
					if(data!=undefined && data.length>0){
						OrderInfo.certTypedates = data;
						for(var i=0;i<OrderInfo.certTypedates.length;i++){
							var certTypedate = OrderInfo.certTypedates[i];
							
							if (certTypedate.certTypeCd == "1") {//身份证
								$("#p_cust_identityCd_choose").append("<option value='"+certTypedate.certTypeCd+"' selected='selected'>"+certTypedate.name+"</option>");
							}else  if(isAllowChannelType){//如果自有渠道，开放所有
								$("#p_cust_identityCd_choose").append("<option value='"+certTypedate.certTypeCd+"' >"+certTypedate.name+"</option>");
							}
						}
						_useridentidiesTypeCdChoose(($("#p_cust_identityCd_choose option[selected='selected']")),"p_cust_identityNum_choose");
//						if(id=='p_cust_identityCd_choose'){
//							//创建经办人证件类型选择事件
////							$("#orderIdentidiesTypeCd option[value='1'").attr("selected", true);
//							_useridentidiesTypeCdChoose(($("#p_cust_identityCd_choose option[selected='selected']")),"p_cust_identityNum_choose");
//						}
					}

					
				}
	};	
	
	//证件类型选择事件
	var _useridentidiesTypeCdChoose = function(scope) {
		var identidiesTypeCd=$(scope).val();
//		if(identidiesTypeCd==undefined){
//			identidiesTypeCd=$("#div_cm_identidiesType  option:selected").val();
//		}
		if(identidiesTypeCd==-1){
			$("#cust_identityNum_choose_label").html("电话号码"); 
		} else {
			$("#cust_identityNum_choose_label").html("证件号码"); 
		}
	}

//打开使用人弹出框
function _showUser(prodId){		
		var ad = ""+OrderInfo.staff.areaId;
		var areaId = ad.substring(0,3)+'0000';
		$("#p_cust_identityCd_choose").empty();
		if(cust.isCovCust(OrderInfo.cust.identityCd)){
			$("#p_cust_identityCd_choose").append("<option value=\"-1\">接入号码</option><option value=\"acctCd\">合同号</option><option value=\"custNumber\">客户编码</option>")
			
		}else {
			$("#p_cust_identityCd_choose").append("<option value=\"-1\">接入号码</option>")
			_certTypeByPartyType(1);
		}
		 _queryChildNode(areaId);
		$("#queryUser").off("click").on("click",function(){
			_queryUser(prodId);
			
			
		});
		$('#chooseUserBtn').off('click').on('click',function(){
//			var prodId=$('#prodId').val();
			if(!!cust.tmpChooseUserInfo && cust.tmpChooseUserInfo.custId){
				//保存并显示使用人信息，清空弹出框的客户信息、临时保存的客户信息，关闭弹出框
				OrderInfo.updateChooseUserInfos(prodId, cust.tmpChooseUserInfo);
				$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId+'_name').val(cust.tmpChooseUserInfo.partyName);
				$('#'+CONST.PROD_ATTR.PROD_USER+'_'+prodId).val(cust.tmpChooseUserInfo.custId);
				cust.tmpChooseUserInfo = {};
				$("#userModal").modal("hide");
//				$('#p_cust_identityNum_choose').val('');
//				$('#chooseUserInfo td').html('');
				$('#chooseUserList2').hide();
				$('#sureDiv').hide();
			} else {
				$.alert("提示","请定位客户作为使用人");
				return false;
			}
		});
	};
//查询地区节点
function _queryChildNode(upRegionId) {
	var params = {
		'upRegionId' : upRegionId,
		'areaLevel' : 3,
		"areaLimit" : 0
	};
	$.callServiceAsJson(contextPath + "/app/orderQuery/areaTreeAllChilden",
			params, {
				"before" : function() {
				//	$.ecOverlay("地区加载中，请稍等...");
				},
				"done" : function(response) {
					if (response.data) {
						var selectHtml = "";
						var list = response.data;
						if (list.length > 0) {
							for(var i=0;i<list.length;i++){
								var ari = ""+OrderInfo.staff.areaId;
								ari = ari.substring(0,5)+'00'
								if(list[i].commonRegionId==ari){
									selectHtml=selectHtml+"<option  selected='selected' value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
								}else{
									selectHtml=selectHtml+"<option value='" +list[i].commonRegionId + "' zone_number='" +list[i].zoneNumber +"' name='" +list[i].regionName + "'>" + list[i].regionName + "</option>";
								}
							}
							$("#diqu2").html(selectHtml);
							$("#diqu2").addClass("styled-select");
							$("#userModal").modal("show");
						}
					}
				}
			});
};

function _showUserCreate(prodId){
	$("#closeUSER").off("click").on("click",function(){
		mktRes.terminal.closeUSER(prodId)
	});
	$("#user").show();
}


// 使用人-查询
function _queryUser(prodId){
	if($("#p_cust_identityNum_choose").val().trim() == ""){
		$.alert("操作提示","查询号码不能为空！");
		return;
	}
	var identityCd="";
	var idcard="";
	var diffPlace="";
	var acctNbr="";
	var identityNum="";
	var queryType="";
	var queryTypeValue="";
	identityCd=$("#p_cust_identityCd_choose").val();
	identityNum=$.trim($("#p_cust_identityNum_choose").val());
	authFlag="0"; // 需要鉴权
	if(identityCd==-1){
		acctNbr=identityNum;
		identityNum="";
		identityCd="";
	}else if(identityCd=="acctCd"||identityCd=="custNumber"){
		acctNbr="";
		identityNum="";
		identityCd="";
		queryType=$("#p_cust_identityCd_choose").val();
		queryTypeValue=$.trim($("#p_cust_identityNum_choose").val());
	}
	diffPlace="local";
	areaId=$("#diqu2").val();
	// lte进行受理地区市级验证
	if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
		$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
		return;
	}
	var param = {
			"acctNbr":acctNbr,
			"identityCd":identityCd,
			"identityNum":identityNum,
			"partyName":"",
			"custQueryType":$("#custQueryType_choose").val(),
			"diffPlace":diffPlace,
			"areaId" : areaId,
			"queryType" :queryType,
			"queryTypeValue":queryTypeValue,
			"identidies_type":$("#p_cust_identityCd_choose  option:selected").text()
	};
	$.callServiceAsHtml(contextPath+"/cust/queryCust",param, {
		"before":function(){
			$.ecOverlay("<strong>正在查询中，请稍等...</strong>");
		},"always":function(){
			//$.unecOverlay();
		},	
		"done" : function(response){
			if (response.code == -2) {
				return;
			}
			if(response.data.indexOf("false") ==0) {
				$.unecOverlay();
				$("#order-content").hide();//办号卡
				$("#terminalMain").hide();//购手机
				$('#choose_multiple_user_dialog').hide();
				$('#overlay').hide();
				$("#userModal").modal("hide");
				_showUserCreate(prodId);
				$("#user").show();//显示经办人
				cust.clearUserForm();
				$.alert("提示","抱歉，没有定位到当前客户，请新建使用人。");
				 return;
			}else{
			$.unecOverlay();
			cust.jumpAuthflag = $(response.data).find('#jumpAuthflag').val();
			var custInfoSize = $(response.data).find('#custInfoSize').val();
			// 使用人定位时，存在多客户的情况
//			if (custInfoSize == 1) {
				cust.showCustAuth($(response.data).find('#custInfos'),"user");
//			}
//			else if (custInfoSize > 1) {
//				$("#choose_multiple_user_dialog").html(response.data);
//				easyDialog.open({
//					container: 'choose_multiple_user_dialog',
//					callback: function () {
//					}
//				});
//			}
			$(".userclose").off("click").on("click",function(event) {
				try {
					easyDialog.close();
				} catch (e) {
					$('#choose_multiple_user_dialog').hide();
					$('#overlay').hide();
				}
				authFlag="";
				$(".usersearchcon").hide();
			});
			if($("#custListTable").attr("custInfoSize")=="1"){
				$(".usersearchcon").hide();
			}
		}
		},
		"fail":function(response){
			$.unecOverlay();
			$.alert("提示","查询失败，请稍后再试！");
		}
	});

};

/*
 * 使用人弹出框显示查询列表
 */
function _showChooseUserTable(custInfo){
	if(custInfo != null && custInfo.custId){
		//将客户信息作为使用人tmpChooseUserInfo，确认后保存到OrderInfo.choosedUserInfos
		cust.tmpChooseUserInfo = custInfo;
//		order.cust.tmpChooseUserInfo.prodId = '';
		$('#chooseUserInfoName2').html(custInfo.partyName);
		$('#chooseUserInfoNum2').html(custInfo.identityName + '/' + custInfo.idCardNumber);
		$('#chooseUserInfoAreaName2').html(custInfo.areaName);
		$('#chooseUserList2').show();
		$('#sureDiv').show();
	} else {
		$('#chooseUserInfo td').html('');
		$('#chooseUserList2').hide();
		$('#sureDiv').hide();
	}
};

/*
 * 经办人人填充返回信息
 */
function _showJbrInfo(custInfo){
	if(custInfo != null && custInfo.custId){
		//将客户信息作为使用人tmpChooseUserInfo，确认后保存到OrderInfo.choosedUserInfos
		cust.tmpJbrInfo = custInfo;
		OrderInfo.jbr.custId = custInfo.custId;
		if(OrderInfo.jbr.identityCd != custInfo.identityCd || OrderInfo.jbr.identityNum != custInfo.idCardNumber){
			OrderInfo.jbr.identityCd = custInfo.identityCd;
			OrderInfo.jbr.identityNum = custInfo.idCardNumber;
			OrderInfo.virOlId = "";
		}
//		order.cust.tmpChooseUserInfo.prodId = '';
		$('#orderAttrName').val(custInfo.partyName);
		$('#orderAttrAddr').val(custInfo.areaName);
		$('#orderAttrPhoneNbr').val(custInfo.accNbr);
		$.alert("提示","经办人信息查询成功！\n请对经办人进行拍照");
	} 
};


//经办人-查询
function _queryJbr(){
	$('#jbrFormdata').data('bootstrapValidator').validate();
	if(!$('#jbrFormdata').data('bootstrapValidator').isValid()){
		return;
	}
	var identityCd="";
	var idcard="";
	var diffPlace="";
	var acctNbr="";
	var identityNum="";
	var queryType="";
	var queryTypeValue="";
	identityCd=$("#orderIdentidiesTypeCd  option:selected").val();;
	if(identityCd==1){
		var identityNum = $('#sfzorderAttrIdCard').val();//证件号码
	}else{
		var identityNum = $('#orderAttrIdCard').val();//证件号码
	}
	
	if(ec.util.isObj($.trim($("#orderIdentidiesTypeCd").val()))||ec.util.isObj($.trim($("#sfzorderAttrIdCard").val()))||ec.util.isObj($.trim($("#orderAttrIdCard").val()))){
		if(!ec.util.isObj($.trim($("#orderIdentidiesTypeCd").val()))){
			$.alert("提示","请选择证件类型！");
			return false;
		}
		if($.trim($("#orderIdentidiesTypeCd").val())==1){
			if(!ec.util.isObj($.trim($("#sfzorderAttrIdCard").val()))){
				$.alert("提示","证件号码为空，无法进行查询！");
				return false;
			}
		}
		if($.trim($("#orderIdentidiesTypeCd").val())!=1){
			if(!ec.util.isObj($.trim($("#orderAttrIdCard").val()))){
				$.alert("提示","证件号码为空，无法进行查询！");
				return false;
			}
		}
	}

	authFlag="1"; // 不需要鉴权
	if(identityCd==-1){
		
		acctNbr=$("#orderAttrPhoneNbr").val();
		identityNum="";
		identityCd="";
	}
	diffPlace="local";
	areaId=OrderInfo.staff.areaId;
	// lte进行受理地区市级验证
	if(CONST.getAppDesc()==0&&areaId.indexOf("0000")>0){
		$.alert("提示","省级地区无法进行定位客户,请选择市级地区！");
		return;
	}
	var param = {
			"acctNbr":acctNbr,
			"identityCd":identityCd,
			"identityNum":identityNum,
			"partyName":"",
			"custQueryType":$("#custQueryType_choose").val(),
			"diffPlace":diffPlace,
			"areaId" : areaId,
			"queryType" :queryType,
			"queryTypeValue":queryTypeValue,
			"identidies_type":$("#orderIdentidiesTypeCd  option:selected").text()
	};
	$.callServiceAsHtml(contextPath+"/cust/queryCust",param, {
		"before":function(){
			$.ecOverlay("<strong>正在查询中，请稍等...</strong>");
		},"always":function(){
			//$.unecOverlay();
		},	
		"done" : function(response){
			if (response.code == -2) {
				return;
			}
			if(response.data.indexOf("false") ==0) {
				$.unecOverlay();
//				$.alert("提示","抱歉，没有定位到客户，请尝试其他客户。");
				
				if(!ec.util.isObj($.trim($("#orderAttrName").val()))||!ec.util.isObj($.trim($("#orderAttrAddr").val()))){
					if(!ec.util.isObj($.trim($("#orderAttrName").val()))){
						$.alert("提示","抱歉，未查询到经办人信息！经办人姓名为空，请完善经办人信息！");
						return false;
					}
					if(!ec.util.isObj($.trim($("#orderAttrAddr").val()))){
						$.alert("提示","抱歉，未查询到经办人信息！证件地址为空，请完善经办人信息！");
						return false;
					}
				} 
				
					
					if(OrderInfo.cust.custId == -1 && OrderInfo.cust.identityCd == identityCd 
							&& OrderInfo.cust.identityNum == identityNum){
						$.alert("提示","抱歉，未查询到经办人信息！\n 当前经办人为用户本人，请对经办人进行拍照！");
						OrderInfo.jbr.custId = OrderInfo.cust.custId;
						OrderInfo.jbr.identityNum = identityNum;
						OrderInfo.jbr.identityCd = identityCd;
						return;
					}
					$.alert("提示","抱歉，未查询到经办人信息！\n提交经办人信息成功,请对经办人进行拍照");
					cust.jbrSubmit();
				 return;
			}else{
			$.unecOverlay();
			cust.jumpAuthflag = $(response.data).find('#jumpAuthflag').val();
			var custInfoSize = $(response.data).find('#custInfoSize').val();
			var custInfos = $(response.data).find('#custInfos');
			// 使用人定位时，存在多客户的情况
			if (custInfoSize == 1) {
				cust.showCustAuth($(response.data).find('#custInfos'),"jbr");
				
			} 
			
			else if (custInfoSize > 1) {
				cust.showCustAuth(custInfos,"jbr");
			} else {
				$.alert("提示","抱歉，未查询到经办人信息！\n提交经办人信息成功。");
				cust.jbrSubmit();
			}
//			$(".userclose").off("click").on("click",function(event) {
//				try {
//					easyDialog.close();
//				} catch (e) {
//					$('#choose_multiple_user_dialog').hide();
//					$('#overlay').hide();
//				}
//				authFlag="";
//				$(".usersearchcon").hide();
//			});
//			if($("#custListTable").attr("custInfoSize")=="1"){
//				$(".usersearchcon").hide();
//			}
		}
		},
		"fail":function(response){
			$.unecOverlay();
			$.alert("提示","查询失败，请稍后再试！");
		}
	});

};


	return {
		buildMainView 				:				 _buildMainView,
		feeTypeCascadeChange		:				 _feeTypeCascadeChange,
		initTounch					:				 _initTounch,
		spec_parm					: 				 _spec_parm,
		check_parm			: _check_parm,
		queryScroll			: _queryScroll,
		queryStaff			: _queryStaff,
		queryStaffPage		: _queryStaffPage,
		setStaff			: _setStaff,
		chooseAcct 			: _chooseAcct,
		check_parm_self		: _check_parm_self,
		createAcct 			: _createAcct,
		showNewAcct 		: _showNewAcct,
		acctDetail 			: _acctDetail,
		//spec_parm_change: _spec_parm_change,
		spec_parm_change_save:_spec_parm_change_save,
		//spec_password_change:_spec_password_change,
		//spec_password_change_save:_spec_password_change_save,
		paymethodChange		:_paymethodChange,
		templateTypeCheck	:_templateTypeCheck,
		lastStep 			: _lastStep,
		genRandPass6		:_genRandPass6,
		genRandPass6Input	:_genRandPass6Input,
		passwordCheckInput	:_passwordCheckInput,
		passwordCheckVal	:_passwordCheckVal,
		checkIncreace6		:_checkIncreace6,
		checkUsersProdAttr  :_checkUsersProdAttr,
		showUser            :_showUser,
		queryChildNode      :_queryChildNode,
		queryUser          :_queryUser,
		showChooseUserTable:_showChooseUserTable,
		queryJbr			:_queryJbr,
		showJbrInfo 		:_showJbrInfo,
		useridentidiesTypeCdChoose	:_useridentidiesTypeCdChoose
	};
})();

