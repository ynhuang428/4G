package com.al.lte.portal.controller.crm;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 销售品控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.OfferController")
@RequestMapping("/offer/*")
public class OfferController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo mktResBmo;
	
	/**
	 * 获取销售品规格构成
	 * @param reqMap
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/queryOfferSpec", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse queryOfferSpec(@RequestParam Map<String, Object> paramMap,Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("staffId", sessionStaff.getStaffId());
        Map<String, Object> resMap = null;
        JsonResponse jsonResponse = null;
        try {
        	resMap = offerBmo.queryOfferSpecParamsBySpec(paramMap,null, sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_SPEC);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_SPEC, e, paramMap);
		}
		return jsonResponse;
    }	
    
	/**
	 * 获取销售品实例构成
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryOfferInst", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryOfferInst(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> resMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		try {
			paramMap.put("staffId", sessionStaff.getStaffId());
			resMap = offerBmo.queryOfferInst(paramMap,null, sessionStaff);			
			jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_PARAM);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_PARAM, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取销售品实例参数
	 * @param reqMap
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/queryOfferParam", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse queryOfferParam(@RequestParam Map<String, Object> paramMap,Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("staffId", sessionStaff.getStaffId());
        Map<String, Object> resMap = null;
        JsonResponse jsonResponse = null;
        try {
        	resMap = offerBmo.queryOfferParam(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_PARAM);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_PARAM, e, paramMap);
		}
		return jsonResponse;
    }
	
	/**
	 * 获取互斥依赖
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryExcludeDepend", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryExcludeDepend(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryExcludeDepend(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取功能产品互斥依赖
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryServExcludeDepend", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryServExcludeDepend(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	Map<String, Object> resMap = offerBmo.queryServExcludeDepend(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_OFFER_EXCLUDE_DEPEND, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取附属销售品实例页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryAttachOffer", method = RequestMethod.GET)
	public String queryAttachOffer(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		try{	
			paramMap =  JsonUtil.toObject(param, Map.class);
			queryLabel(model, paramMap, sessionStaff);
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/offer/attach-offer-change";
	}
	
	/**
	 * 查询已订购销售品和功能产品
	 * @param param
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryOpenedAttachAndServ", method = RequestMethod.GET)
	public @ResponseBody JsonResponse queryOpenedAttachAndServ(@RequestParam("strParam") String param){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		JsonResponse jsonResponse = null;
        try {
        	paramMap = JsonUtil.toObject(param, Map.class);
        	Map<String, Object> resMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 套餐变更附属销售品页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryChangeAttachOffer", method = RequestMethod.GET)
	public String queryChangeAttachOffer(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  JsonUtil.toObject(param, Map.class);
		try{
			//已订购附属销售品查询
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			
			//可订购附属标签查询
			queryLabel(model, paramMap, sessionStaff);
			
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException e) {
			log.error("获取附属销售品变更页面失败", e);
			super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/offer/attach-offer";
	}
	
	/**
	 * 获取附属销售品规格页面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryAttachSpec", method = RequestMethod.GET)
	public String queryAttachSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		Map<String, Object> paramMap = new HashMap();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
			paramMap =  JsonUtil.toObject(param, Map.class);
			
			//默认必开功能产品
			Map<String, Object> openServMap = offerBmo.queryServSpec(paramMap,null,sessionStaff);
			model.addAttribute("openServMap",openServMap);
			model.addAttribute("openServMapJson", JsonUtil.buildNormal().objectToJson(openServMap));
			
			//默认必开附属销售品
			paramMap.remove("queryType");
			paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
			Map<String, Object> openMap = offerBmo.queryMustAttOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			
			queryLabel(model, paramMap, sessionStaff);
			
			model.addAttribute("prodId",paramMap.get("prodId"));	
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
	 	return "/offer/attach-spec";
	}
	
	/**
	 * 涉及到父子标签展示，将可订购附属标签查询封装为一个统一方法
	 * @param model
	 * @param paramMap
	 * @param sessionStaff
	 * @throws Exception
	 */
	private void queryLabel(Model model, Map<String, Object> paramMap,
			SessionStaff sessionStaff) throws Exception {
		//可订购附属标签查询
		Map<String, Object> labelMap = offerBmo.queryLabel(paramMap,null,sessionStaff);	
		// 通过json转换方式，深拷贝map，然后合并父子节点
		Map<String, Object> newLabelMap = JsonUtil.buildNormal().jsonToObject(JsonUtil.buildNormal().objectToJson(labelMap), Map.class);
		List<Map<String, Object>> labelList = (List<Map<String, Object>>) newLabelMap.get("result");
		List<Map<String, Object>> subLabelList;
		// 合并父子节点（目前只支持二级）
		for (Map<String, Object> rootMap : labelList) {
			subLabelList = new ArrayList<Map<String,Object>>();
			if (StringUtils.isBlank((String) rootMap.get("parentLabel"))) {
				for (Map<String, Object> subMap : labelList) {
					if (rootMap.get("label").equals(subMap.get("parentLabel"))) {
						subLabelList.add(subMap);
					}
				}
				rootMap.put("subLabel", subLabelList);
			}
		}
		// 删除子节点
		for (Iterator<Map<String, Object>> iterator = labelList.iterator(); iterator.hasNext();) {
			Map<String, Object> map = (Map<String, Object>) iterator.next();
			if (StringUtils.isNotBlank((String) map.get("parentLabel"))) {
				iterator.remove();	
			}
		}
		model.addAttribute("labelMap",labelMap);
		model.addAttribute("labelMapJson", JsonUtil.buildNormal().objectToJson(labelMap));
		
		model.addAttribute("newLabelMap",newLabelMap);
	}

	/**
	 * 查询默认必须附属销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryDefaultAndRequiredOfferSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryDefaultAndRequiredOfferSpec(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryMustAttOffer(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 查询可订购附属销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryCanBuyAttachSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryCanBuyAttachSpec(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 查询功能产品规格,(默认1，必须2，可订购3)
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryServSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryServSpec(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 查询功能产品规格,(默认1，必须2，可订购3)
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryServSpecPost", method = {RequestMethod.POST})
	public @ResponseBody JsonResponse queryServSpecPost(@RequestBody Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取附属销售品查询页面<br/>
	 * 如果要改造该方法，建议首先过目一下searchAttachOfferSpecPost这个方法，就在该方法的下面
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/searchAttachOfferSpec", method = RequestMethod.GET)
	public String searchAttachOfferSpec(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		Map<String, Object> paramMap = new HashMap();
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
        	paramMap =  JsonUtil.toObject(URLDecoder.decode(param,"utf-8"), Map.class);
        	
        	//搜索可订购销售品
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
    		Map<String, Object> offerMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
    		offerMap = offerBmo.removeAttachOfferExpired(paramMap, offerMap);
    		model.addAttribute("offerMap",offerMap);
    		
        	//搜索可订购功能产品
    		paramMap.put("matchString", paramMap.get("offerSpecName"));
    		Map<String, Object> servMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
    		model.addAttribute("servMap",servMap);
    		
        	model.addAttribute("param",paramMap);
    		model.addAttribute("prodId",paramMap.get("prodId"));
    		if(paramMap.get("yslflag")!=null){
    			model.addAttribute("yslflag",paramMap.get("yslflag"));
    		}
        } catch (BusinessException be) {
        	return super.failedStr(model,be);
        } catch (InterfaceException ie) {
        	return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return "/offer/attach-offer-list";
	}
	
	/**
	 * 获取附属销售品查询页面<br/>
	 * 由于原版方法(就是上面的searchAttachOfferSpec方法)为GET请求，报文长度受限，影响到后期改造，
	 * 同时考虑到该方法为公共方法，为安全起见，故将支持POST请求的该方法独立出来。<br/>
	 * 如果该方法后期改造，应当考虑同步修改上面的原版方法。<br/>
	 * Updated by ZhangYu 2016-03-31
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/searchAttachOfferSpecPost", method = { RequestMethod.POST })
		public String searchAttachOfferSpecPost(@RequestBody Map<String, Object> paramMap, Model model,HttpServletResponse response){
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);	
        	
        	//搜索可订购销售品
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
    		Map<String, Object> offerMap = offerBmo.queryCanBuyAttachSpec(paramMap,null,sessionStaff);
    		offerMap = offerBmo.removeAttachOfferExpired(paramMap, offerMap);
    		model.addAttribute("offerMap",offerMap);
    		
        	//搜索可订购功能产品
    		paramMap.put("matchString", paramMap.get("offerSpecName"));
    		Map<String, Object> servMap = offerBmo.queryCanBuyServ(paramMap,null,sessionStaff);
    		model.addAttribute("servMap",servMap);
    		
        	model.addAttribute("param",paramMap);
    		model.addAttribute("prodId",paramMap.get("prodId"));
    		if(paramMap.get("yslflag")!=null){
    			model.addAttribute("yslflag",paramMap.get("yslflag"));
    		}
        } catch (BusinessException be) {
        	return super.failedStr(model,be);
        } catch (InterfaceException ie) {
        	return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return "/offer/attach-offer-list";
	}
	
	/**
	 * 加载实例
	 * @param param
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/loadInst", method = {RequestMethod.GET})
	@ResponseBody
	public JsonResponse loadInst(@RequestParam Map<String, Object> paramMap,Model model) {
		JsonResponse jsonResponse = null;
		Map resMap = new HashMap();
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);	
        	resMap = offerBmo.loadInst(paramMap,null,sessionStaff);//加载实例		
        	if(ResultCode.R_SUCC.equals(resMap.get("code"))){
        		jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());	
        	}else{
        		jsonResponse = super.failed(resMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
        	}
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.LOAD_INST);
		} catch (Exception e) {
			return super.failed(ErrorCode.LOAD_INST, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 获取主副卡纳入老用户权限
	 */
	@RequestMapping(value = "/areaidJurisdiction", method = RequestMethod.GET)
	@ResponseBody
    public JsonResponse areaidJurisdiction(@RequestParam Map<String, Object> paramMap){
        JsonResponse jsonResponse = null;
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		try {
			Map map = new HashMap();
			String flag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),paramMap.get("areaid").toString());
			String net_vice_card = (String)ServletUtils.getSessionAttribute(super.getRequest(),
					"NET_VICE_CARD"+sessionStaff.getStaffId());
			try{
				if(net_vice_card==null){
					net_vice_card=staffBmo.checkOperatSpec("NET_VICE_CARD",sessionStaff);
					ServletUtils.setSessionAttribute(super.getRequest(),
							"NET_VICE_CARD"+sessionStaff.getStaffId(), net_vice_card);
				}
			} catch (BusinessException e) {
				net_vice_card="1";
	 		} catch (InterfaceException ie) {
	 			net_vice_card="1";
			} catch (Exception e) {
				net_vice_card="1";
			}
			map.put("flag", flag);
			map.put("net_vice_card", net_vice_card);
			jsonResponse = super.successed(map,ResultConstant.SUCCESS.getCode());
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InterfaceException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return jsonResponse;
    }
	/**
	 * 获取附属销售品实例页面 (补换卡专用)
	 * @param param
	 * @param model
	 * @param response
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryAttachOffer2", method = RequestMethod.GET)
	public String queryAttachOffer2(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap =  null;	
		try{	
			paramMap =  JsonUtil.toObject(param, Map.class);
			queryLabel(model, paramMap, sessionStaff);
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
			model.addAttribute("openMap",openMap);
			model.addAttribute("openMapJson", JsonUtil.buildNormal().objectToJson(openMap));
			model.addAttribute("prodId",paramMap.get("prodId"));
			model.addAttribute("param",paramMap);
		} catch (BusinessException be) {
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
	 	return "/offer/card-attach-offer-change";
	}
	/**
	 * 查询默认必须附属销售品  + 功能产品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryDefaultAndRequiredOfferSpecAndServ", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryDefaultAndRequiredOfferSpecAndServ(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryMustAttOfferServ(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MUST_OFFER_SERV);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MUST_OFFER_SERV, e, paramMap);
		}
		return jsonResponse;
	}
	
	//群号查询
    @RequestMapping(value = "/getGroupList", method = RequestMethod.POST)
    public String getGroupList(HttpSession session,Model model ,@RequestBody Map<String, Object> param) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	Integer totalSize = 1;
    	Map returnMap = new HashMap();
    	Map groupMap = new HashMap();
    	String pageIndex = param.get("curPage")==null?"":param.get("curPage").toString();
    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
    	int iPage = 1;
    	int iPageSize = 10 ;
    	Map<String, Object> groupParm = new HashMap<String, Object>(param);
    	try{
    		iPage = Integer.parseInt(pageIndex);
    		iPageSize = Integer.parseInt(pageSize) ;
    		if(iPage>0){
        		returnMap = offerBmo.queryGroupList(groupParm, null, sessionStaff);
        		List prodInstInfos = (List) returnMap.get("prodInstInfos");
        		if(prodInstInfos!=null && prodInstInfos.size()>0){
        			Map map = (Map)prodInstInfos.get(0);
        			List list = (List)map.get("mainProdOfferInstInfos");
        			if(list.size()>0){
        				Map ma = (Map)list.get(0);
        				groupMap.put("prodOfferName", ma.get("prodOfferName").toString());
        			}else{
        				groupMap.put("prodOfferName", "");
        			}
        			groupMap.put("accNbr", map.get("accNbr").toString());
        			groupMap.put("productName", map.get("productName").toString());
        			groupMap.put("prodStateCd", map.get("prodStateCd").toString());
        			groupMap.put("prodStateName", map.get("prodStateName").toString());
        			groupMap.put("feeTypeName", ((Map<String, Object>) map.get("feeType")).get("feeTypeName"));
        		}
    		}
//    		PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
//        			iPage,
//        			iPageSize,
//        			totalSize<1?1:totalSize,
//        					list);
        	model.addAttribute("groupMap", groupMap);
    		model.addAttribute("pageParam", param);
            return "/order/order-dialog-group";
    	}catch(BusinessException be){
    		return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_GROUP_BASIC_INFO);
		}catch(Exception e){
			return super.failedStr(model, ErrorCode.QUERY_GROUP_BASIC_INFO, e, param);
		}
    }
    
    @RequestMapping(value = "/querySeq", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse querySeq(@RequestBody Map<String, Object> param,
			HttpServletResponse response,HttpServletRequest request){
		JsonResponse jsonResponse = null;
		try {
				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                    SysConstant.SESSION_KEY_LOGIN_STAFF);
				Map<String, Object> resMap = offerBmo.querySeq(param,null,sessionStaff);
				if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
					jsonResponse = super.successed(resMap,
							ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(resMap.get("resultMsg"),
							ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
				}
			} catch (BusinessException e) {
				return super.failed(e);
			} catch (InterfaceException ie) {
				return super.failed(ie, param, ErrorCode.QUERY_SEQ);
			} catch (Exception e) {
				return super.failed(ErrorCode.QUERY_SEQ, e, param);
			}
		return jsonResponse;
	}
    
    /**
	 * 查询我的收藏
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/queryMyfavorite", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryMyfavorite(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
        	paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
        	Map<String, Object> resMap = offerBmo.queryMyfavorite(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MY_FAVORITE);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MY_FAVORITE, e, paramMap);
		}
		return jsonResponse;
	}
	/**
	 * 收藏销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/addMyfavorite", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse addMyfavorite(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.addMyfavorite(paramMap,null,sessionStaff);
        	if(ResultCode.R_SUCC.equals(resMap.get("resultCode")+"")){
				jsonResponse = super.successed(resMap,
						ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(resMap.get("msg"),
						Integer.parseInt(resMap.get("code").toString()));
			}
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ADD_MY_FAVORITE);
		} catch (Exception e) {
			return super.failed(ErrorCode.ADD_MY_FAVORITE, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 删除收藏夹中销售品
	 * @param param
	 * @param model
	 * @return
	 * @throws BusinessException
	 */
	@RequestMapping(value = "/delMyfavorite", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse delMyfavorite(@RequestParam Map<String, Object> paramMap,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = offerBmo.delMyfavorite(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.DEL_MY_FAVORITE);
		} catch (Exception e) {
			return super.failed(ErrorCode.DEL_MY_FAVORITE, e, paramMap);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/queryMainCartAttachOffer", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryMainCartAttachOffer(@RequestParam Map<String, Object> paramMap) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
			//已订购附属销售品查询
			Map<String, Object> openMap = offerBmo.queryAttachOffer(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(openMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ATTACH_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ATTACH_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/queryOfferAndServDependForCancel", method = {RequestMethod.POST})
	public @ResponseBody JsonResponse queryOfferAndServDependForCancel(@RequestBody Map<String, Object> paramMap) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		paramMap.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("areaId", sessionStaff.getAreaId());
		paramMap.put("staffId", sessionStaff.getStaffId());
		
        try {
			//已订购附属销售品查询
        	Map<String, Object> openMap = offerBmo.queryOfferAndServDependForCancel(paramMap,null,sessionStaff);
        	jsonResponse = super.successed(openMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_SERVDEPEND_FORCANCEL);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_SERVDEPEND_FORCANCEL, e, paramMap);
		}
		return jsonResponse;
	}
	
	/**
	 * 根据终端串码查询合约
	 */
	@RequestMapping(value = "/queryAgreementAttachOfferSpec", method = { RequestMethod.POST })
		public String queryAgreementAttachOfferSpec(@RequestBody Map<String, Object> paramMap, Model model,HttpServletResponse response,@LogOperatorAnn String flowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);	
		try {
			paramMap.put("receiveFlag","1");
			paramMap.put("channelName",sessionStaff.getCurrentChannelName());
			paramMap.put("staffId",sessionStaff.getStaffId());
			paramMap.put("channelId",sessionStaff.getCurrentChannelId());
			model.addAttribute("prodId",paramMap.get("prodId"));
			/*String offerSpecName = MapUtils.getString(mktInfo, "offerSpecName")==null?" ":MapUtils.getString(mktInfo, "offerSpecName");
			mktInfo.remove("offerSpecName");*/
			Map<String, Object> mktRes = mktResBmo.checkTermCompVal(
					paramMap, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(mktRes) && ResultCode.R_SUCC.equals(mktRes.get("code"))) {
				paramMap.put("mktResCd",mktRes.get("mktResId"));
			}else{
				return "/offer/attach-offer-list";
			}
		} catch (BusinessException be) {
			this.log.error("门户/mktRes/terminal/checkTerminal服务异常", be);
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, paramMap, ErrorCode.CHECK_TERMINAL);
		} catch (Exception e) {
			this.log.error("门户/mktRes/terminal/checkTerminal服务异常", e);
			return super.failedStr(model, ErrorCode.CHECK_TERMINAL, e, paramMap);
		}
		try {
			
			paramMap.put("agreementType","");
            paramMap.put("staffId", sessionStaff.getStaffId());
			Map<String, Object> offerByMtkResCdMap = mktResBmo.queryOfferByMtkResCd(paramMap, flowNum, sessionStaff);
			offerByMtkResCdMap = offerBmo.removeAttachOfferExpired(paramMap, offerByMtkResCdMap);
			if(paramMap.get("yslflag")!=null){
    			model.addAttribute("yslflag",paramMap.get("yslflag"));
    		}
			model.addAttribute("offerByMtkResCdMap",offerByMtkResCdMap);
        } catch (BusinessException be) {
        	return super.failedStr(model,be);
        } catch (InterfaceException ie) {
        	return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return "/offer/attach-offer-list";
	}
	
	/**
	 * 合约查询
	 */
	@RequestMapping(value = "/queryAgreeAttachOfferSpec", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse queryAgreeAttachOfferSpec(@RequestParam("strParam") String param,Model model) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> paramMap = null;
        try {
        	paramMap =  JsonUtil.toObject(param, Map.class);
            paramMap.put("staffId", sessionStaff.getStaffId());
        	Map<String, Object> resMap = mktResBmo.queryOfferByMtkResCd(paramMap, null, sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_MUST_OFFER);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_MUST_OFFER, e, paramMap);
		}
		return jsonResponse;
	}
}
