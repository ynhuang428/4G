package com.al.lte.portal.token.controller.crm;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.SecondBusiness;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
import com.al.lte.portal.bmo.crm.CustBmo;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * **控制层
 *
 * @author liuteng
 * @version V1.0 2016-01-25
 * @createDate 2016-01-25 16:10:36
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.token.controller.crm.SecondBusinessController")
@RequestMapping("/token/secondBusi/*")
public class SecondBusinessController extends BaseController {

    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.SecondBusiness")
    private SecondBusiness secondBusiness;
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
    
   
    
    /**
     * 查询政企客户开关
     * */
    @RequestMapping(value = "/queryCustOnOffJson", method = {RequestMethod.POST})
    @ResponseBody
    public JsonResponse queryCustOnOffJson(@RequestBody Map<String, Object> paramMap, Model model, HttpServletResponse response, @LogOperatorAnn String flowNum) throws BusinessException {

        JsonResponse jsonResponse = new JsonResponse();
        try {
        
            //入参的封装
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            //省份编码
            String provinceCode=sessionStaff.getProvinceCode();
            Map<String, Object> resMap =new HashMap<String,Object>();
            //获取政企客户二次业务鉴权省份开关
            String ONOFF = MDA.TOKEN_AUTHENTICATION.get("Token_"+provinceCode);
            resMap.put("ONOFF", ONOFF);
            jsonResponse= super.successed(resMap,ResultConstant.SUCCESS.getCode());
        }
         catch (Exception e) {
            return super.failed(ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, e, paramMap);
        }
        return jsonResponse;
    }     

    /**
     * 查询二次业务菜单对应的鉴权权限
     *
     * @author wufeng
     */
    @RequestMapping(value = "/querySecondBusinessMenuAuth", method = {RequestMethod.POST})
    public String querySecondBusinessMenuAuth(@RequestBody Map<String, Object> paramMap, Model model, HttpServletResponse response, @LogOperatorAnn String flowNum) throws BusinessException {
        try {
            //入参的封装
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            String menuId = MapUtils.getString(paramMap, "menuId", "");
            String menuName = MapUtils.getString(paramMap, "menuName", "");
            String isSimple = MapUtils.getString(paramMap, "isSimple", "");
           // String typeCd = MapUtils.getString(paramMap, "typeCd", "");
            String areaId = sessionStaff.getAreaId();
            //当前业务标识
            int actionFlag=MapUtils.getInteger(paramMap, "actionFlag");
            Map<String, Object> inParamMap = new HashMap<String, Object>();
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("menuId", menuId);
            }
            if (StringUtils.isNotBlank(menuName)) {
                inParamMap.put("menuName", menuName);
            }
            if (StringUtils.isNotBlank(isSimple)) {
                inParamMap.put("isSimple", isSimple);
            }
            if (StringUtils.isNotBlank(areaId)) {
                inParamMap.put("areaId", areaId);
            }
            //获取渠道开关
            String channelOnOFF=MDA.TOKEN_SALES_CHANNEL.get("Token_"+sessionStaff.getProvinceCode());
            //判断工号是否有跳过权限
            String  iseditOperation=staffBmo.checkOperatSpec(SysConstant.SECOND_JUMPSPECIAL,sessionStaff);
            //渠道大类
            String channelType=sessionStaff.getCurrentChannelType();
           
            int segmentId=MapUtils.getInteger(paramMap, "segmentId");
            //获取协销人开关
            
             //新装写死
            if(actionFlag==1){
            	Map<String, Object> rules = new HashMap<String, Object>();
            	rules.put("channelOnOFF",channelOnOFF);
            	//如果是政企客户
            	//custType
            	if(segmentId==1000){
            		rules.put("rule6","Y");
            	}
            	else{
            		rules.put("rule1","Y");
            	}
                 rules.put("iseditOperation", iseditOperation);
                 rules.put("channelType",channelType);          
                 String rulesJson=JacksonUtil.objectToJson(rules);
                 model.addAttribute("rulesJson", rulesJson);
                 model.addAttribute("rules", rules);
            }
            else{
            	Map<String, Object> resMap=null;
                //服务调用获取数据
            	if(segmentId==1000){
            		inParamMap.put("custType",2);
            	}
            	else{
            		inParamMap.put("custType",1);
            	}
                resMap = secondBusiness.querySecondBusinessMenuAuth(inParamMap, flowNum, sessionStaff);
                if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                    Map<String, Object> resultMap = MapUtils.getMap(resMap, "result");
                    Map<String, Object> rules = new HashMap<String, Object>();

                    if (resultMap != null) {
                        List<Map<String, Object>> scenes = (List<Map<String, Object>>) MapUtils.getObject(resultMap, "scenes");
                        if (scenes != null && scenes.size() > 0) {
                        	//1.证件鉴权 2.短信鉴权3.产品密码鉴权4.直接跳过
                           rules = authCompute(scenes,sessionStaff);
                           rules.put("iseditOperation", iseditOperation);
                           rules.put("channelType",channelType);
                           rules.put("channelOnOFF",channelOnOFF);
                           if(segmentId==1000){
                        	 //账户和使用人信息查询服务
                        	     paramMap.put("areaId",areaId);
                        	     //固定传
                        	     paramMap.put("queryType","1,2,3,4,5"); 
                       	         Map<String, Object> resultMap2 = custBmo.queryAccountAndUseCustInfo(paramMap,flowNum, sessionStaff);
                       	        
                       	          if (resultMap2!=null && resultMap2.size()>0) {
                        	    	 //成功
                        	    	 Map<String,Object>accountMap=(Map<String, Object>)resultMap2.get("account");
                        	         
                        	    	//账户名称
                        	    	String accountName=MapUtils.getString(accountMap, "accountName");
                        	    	//使用人名称
                        	    	String useCustName=MapUtils.getString(resultMap2, "useCustName");

                        	    	rules.put("accountName", accountName);
                        	    	rules.put("useCustId",MapUtils.getString(resultMap2, "useCustId"));
                        	    	rules.put("useCustName", useCustName);
                        	    	rules.put("isSame", MapUtils.getString(resultMap2, "isSame"));
                        	    	Map<String,Object>identityMap=MapUtils.getMap(resultMap2,"identity");
                        	    	rules.put("identidyTypeCd", MapUtils.getInteger(identityMap,"identityTypeCd"));
                        	    	rules.put("identityName", MapUtils.getString(identityMap,"identityName"));
                        	    	rules.put("identityNum",MapUtils.getString(identityMap,"identityNum"));
             
                        	     }
                          }
                           String rulesJson=JacksonUtil.objectToJson(rules);
                           model.addAttribute("rulesJson", rulesJson);
                        }
                    }
                    model.addAttribute("rules", rules);
                }
            }
           
            String types=MapUtils.getString(paramMap, "types", "");
            if(types.equals("pc")){
            	if(segmentId==1000){
            		return "/pctoken/cust/cust-authsub";
            	}
            	else{
            		return "/pctoken/cust/cust-auth";
            	}
            	
            }
            else if(types.equals("app")){
            	if(segmentId==1000){
            		return "/apptoken/cust/cust-authsub";
            	}
            	else{
            		return "/apptoken/cust/cust-auth";
            	}
            	
            }
            else{
            	if(segmentId==1000){
            		 return "/padtoken/cust/cust-authsub";
            	}
            	else{
            		 return "/padtoken/cust/cust-auth";
            	}
            }	  
            
        } catch (BusinessException e) {
            return super.failedStr(model, e);
        } catch (InterfaceException ie) {
            return super.failedStr(model, ie, paramMap, ErrorCode.ORDER_SUBMIT);
        } catch (Exception e) {
            return super.failedStr(model, ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, e, paramMap);
        }
    }
    
   
    /**
     * 查询二次业务菜单对应的鉴权权限(提供给手机客户端使用)
     *
     * @return
     */
    @RequestMapping(value = "/querySecondBusinessMenuAuthJson", method = {RequestMethod.POST})
    @ResponseBody
    public JsonResponse querySecondBusinessMenuAuthJson(@RequestBody Map<String, Object> paramMap, Model model, HttpServletResponse response, @LogOperatorAnn String flowNum) throws BusinessException {

        JsonResponse jsonResponse = new JsonResponse();
        try {
            //入参的封装
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            String menuId = MapUtils.getString(paramMap, "menuId", "");
            String menuName = MapUtils.getString(paramMap, "menuName", "");
            String isSimple = MapUtils.getString(paramMap, "isSimple", "");
            String areaId = sessionStaff.getAreaId();
            Map<String, Object> inParamMap = new HashMap<String, Object>();
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("menuId", menuId);
            }
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("menuName", menuName);
            }
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("isSimple", isSimple);
            }
            if (StringUtils.isNotBlank(menuId)) {
                inParamMap.put("areaId", areaId);
            }

            //服务调用获取数据
            Map<String, Object> resMap = secondBusiness.querySecondBusinessMenuAuth(inParamMap, flowNum, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                Map<String, Object> resultMap = MapUtils.getMap(resMap, "result");
                Map<String, Object> rules = new HashMap<String, Object>();
                if (resultMap != null) {
                    List<Map<String, Object>> scenes = (List<Map<String, Object>>) MapUtils.getObject(resultMap, "scenes");
                    if (scenes != null && scenes.size() > 0) {
                        rules = authCompute(scenes,sessionStaff);
                    }
                }
                jsonResponse = super.successed(rules, ResultConstant.SUCCESS.getCode());
            }
            else{
            	jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }
            
        } catch (BusinessException e) {
        	return super.failed(e);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.ORDER_SUBMIT);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, e, paramMap);
        }
        return jsonResponse;
    }     

    /**
     * 保存鉴权日志调用记录到后台并由后台返回一个日志记录id
     *
     * @return
     */
    @RequestMapping(value = "/saveAuthRecord", method = {RequestMethod.POST})
    @AuthorityValid(isCheck = false)
	@ResponseBody
    public JsonResponse saveAuthRecord(@RequestBody Map<String, Object> paramMap, Model model, HttpServletResponse response, @LogOperatorAnn String flowNum) throws BusinessException {

        JsonResponse jsonResponse = new JsonResponse();
        try {
            //入参的封装
            SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
            paramMap.put("validateType", MapUtils.getString(paramMap, "validateType", ""));
            paramMap.put("validateLevel", MapUtils.getString(paramMap, "validateLevel", ""));
            paramMap.put("custId", MapUtils.getString(paramMap, "custId", ""));
            paramMap.put("accessNbr", MapUtils.getString(paramMap, "accessNbr", ""));
            paramMap.put("certType", MapUtils.getString(paramMap, "certType", ""));
            paramMap.put("certNumber", MapUtils.getString(paramMap, "certNumber", ""));
            paramMap.put("handleDate", DateUtil.getNow(DateUtil.DATE_FORMATE_STRING_A2));
            paramMap.put("resultCode", MapUtils.getString(paramMap, "resultCode", ""));
            paramMap.put("staffId", sessionStaff.getStaffId());
            paramMap.put("channelId", sessionStaff.getCurrentChannelId());
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());

            //服务调用获取数据
            Map<String, Object> resMap = secondBusiness.saveAuthRecord(paramMap, flowNum, sessionStaff);
            if (ResultCode.R_SUCC.equals(resMap.get("resultCode"))) {
                jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(resMap.get("resultMsg"), ResultConstant.SERVICE_RESULT_FAILTURE
                        .getCode());
            }

        } catch (BusinessException e) {
            return super.failed(e);
        } catch (InterfaceException ie) {
            return super.failed(ie, paramMap, ErrorCode.ORDER_SUBMIT);
        } catch (Exception e) {
            return super.failed(ErrorCode.QUERY_BIZ_SECONDBUSINESS_MENU_AUTH, e, paramMap);
        }


        return jsonResponse;
    }

    /**
     * 权限合并计算，返回计算后的鉴权方式
     *
     * @param scenes 二次菜单下包含的所有的功能点所对应的鉴权方式
     * @return 计算后的鉴权方式，取合集。
     */
    private Map<String, Object> authCompute(List<Map<String, Object>> scenes,SessionStaff sessionStaff) throws Exception {
        String authTypeStr = "";
        String isSecondJump = staffBmo.checkOperatSpec(SysConstant.SECOND_JUMPSPECIAL, sessionStaff);
        if (scenes == null || scenes.size() == 0) {
            return null;
        } else if (scenes.size() == 1) {
            Map<String, Object> rulesMap = MapUtils.getMap(scenes.get(0), "rules");
            if (isSecondJump == "0") {
                rulesMap.put("rule4", "Y");
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule1",""))) {
                authTypeStr += "1";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule2",""))) {
                authTypeStr += "2";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule3",""))) {
                authTypeStr += "3";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule4",""))) {
                authTypeStr += "4";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule5",""))) {
                authTypeStr += "5";
            }
            if (SysConstant.STR_Y.equals(MapUtils.getString(rulesMap,"rule6",""))) {
                authTypeStr += "6";
            }
            rulesMap.put("authTypeStr", authTypeStr);

            return rulesMap;
        } else {
            //初始化权限和返回值
            Map<String, Object> resultMap = new HashMap<String, Object>();
            String rule1 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule1", SysConstant.STR_N);
            String rule2 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule2", SysConstant.STR_N);
            String rule3 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule3", SysConstant.STR_N);
            String rule4 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule4", SysConstant.STR_N);
            String rule5 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule5", SysConstant.STR_N);
            String rule6 = MapUtils.getString(MapUtils.getMap(scenes.get(0), "rules"), "rule6", SysConstant.STR_N);

            for (Map<String, Object> scene : scenes) {
                Map<String, Object> rules = MapUtils.getMap(scene, "rules");
                rule1 = or4String(rule1, MapUtils.getString(rules, "rule1", SysConstant.STR_N));//规则1：是/否（Y/N）证件鉴权
                rule2 = or4String(rule2, MapUtils.getString(rules, "rule2", SysConstant.STR_N));//规则2：是/否（Y/N）短信鉴权
                rule3 = or4String(rule3, MapUtils.getString(rules, "rule3", SysConstant.STR_N));//规则3：是/否（Y/N）产品密码鉴权
                rule4 = or4String(rule4, MapUtils.getString(rules, "rule4", SysConstant.STR_N));//规则4：是/否（Y/N）无须出示有效证件，不需核验用户身份即可办理
                rule5 = or4String(rule5, MapUtils.getString(rules, "rule5", SysConstant.STR_N));//规则5：预留字段
                rule6 = or4String(rule6, MapUtils.getString(rules, "rule6", SysConstant.STR_N));//规则6：预留字段
            }
            if (isSecondJump == "0") {
                rule4 = "Y";
            }
            if(SysConstant.STR_Y.equals(rule1)){
                authTypeStr+="1";
            }
            if(SysConstant.STR_Y.equals(rule2)){
                authTypeStr+="2";
            }
            if(SysConstant.STR_Y.equals(rule3)){
                authTypeStr+="3";
            }
            if(SysConstant.STR_Y.equals(rule4)){
                authTypeStr+="4";
            }
            if(SysConstant.STR_Y.equals(rule5)){
                authTypeStr+="5";
            }
            if(SysConstant.STR_Y.equals(rule6)){
                authTypeStr+="6";
            }
            resultMap.put("rule1", rule1);
            resultMap.put("rule2", rule2);
            resultMap.put("rule3", rule3);
            resultMap.put("rule4", rule4);
            resultMap.put("rule5", rule5);
            resultMap.put("rule6", rule6);
            resultMap.put("authTypeStr", authTypeStr);

            return resultMap;
        }

    }

    /**
     * 计算字符串形式表示的布尔值返回Y/N
     * 与操作
     * @param a 将要进行计算的字符串布尔值，取值为Y/N
     * @param b 另一个同类型参数
     * @return 返回字符串Y/N
     */
    private String and4String(String a, String b) {
        Boolean x = BooleanUtils.toBoolean(a);
        Boolean y = BooleanUtils.toBoolean(b);
        if (x && y) {
            return SysConstant.STR_Y;
        } else {
            return SysConstant.STR_N;
        }
    }
    /**
     * 计算字符串形式表示的布尔值返回Y/N
     * 或操作
     * @param a 将要进行计算的字符串布尔值，取值为Y/N
     * @param b 另一个同类型参数
     * @return 返回字符串Y/N
     */
    private String or4String(String a, String b) {
        Boolean x = BooleanUtils.toBoolean(a);
        Boolean y = BooleanUtils.toBoolean(b);
        if (x || y) {
            return SysConstant.STR_Y;
        } else {
            return SysConstant.STR_N;
        }
    }
    
   public static Map<String,Object> getMap(){

	   Map<String, Object> resMap =new HashMap<String,Object>();
	   Map<String, Object> identityMap =new HashMap<String,Object>();
	   Map<String, Object> accountMap =new HashMap<String,Object>();

	   resMap.put("isSame","Y");
	   resMap.put("useCustId","140000888866");
	   resMap.put("useCustName", "张三");
	   identityMap.put("identidyTypeCd","1");
	   identityMap.put("identityName","居民身份证");
	   identityMap.put("identityNum","310230195609173994");
	   accountMap.put("accountAreaGrade","12");
	   accountMap.put("accountId","140001235297");
	   accountMap.put("accountName", "苹果果Q");
	   accountMap.put("accountNumber", "2711060201882");
	   accountMap.put("custId", "140000893520");
	   resMap.put("identity", identityMap);
	   resMap.put("account", accountMap);
	   return resMap;
   }
   
    
    /**
     * 脱敏操作
     * 
     * */
    private static int SIZE =3;
    private static String SYMBOL = "*";
    private static String toConceal(String str) {
		if(null  == str || "".equals(str)) 
			return str;
		int l = str.length();
		int a = l/2;
		int b = a-1;
		int c = l%2;
		StringBuffer sb = new StringBuffer(l);
		if(l <= 2) {
			if(c==1)
				return SYMBOL;
			sb.append(SYMBOL);
			sb.append(str.charAt(l-1));
		}else {
			if(b<=0) {
				sb.append(str.substring(0, 1));
				sb.append(SYMBOL);
				sb.append(str.substring(l-1, l));
			}else if(b>=SIZE/2 && SIZE+1!=l){
				int e  = (l-SIZE)/2;
				sb.append(str.substring(0, e));
				for(int i  = 0;i<SIZE;i++)
					sb.append(SYMBOL);
				if((c==0&&SIZE%2==0)||(c!=0&&SIZE%2!=0)) 
					sb.append(str.substring(l-e, l));
				else 
					sb.append(str.substring(l-(e+1), l)); 
			}else {
				int d  = l -2 ;
				sb.append(str.substring(0, 1));
				for(int i  = 0;i<d;i++)
					sb.append(SYMBOL);
				sb.append(str.substring(l-1, l)); 
			}
		}
		return sb.toString();
	}
    
    /**
     * 前置校验接口
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/preCheckBeforeOrde", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse preCheckBeforeOrde(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpServletRequest request){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object>  map=null;
		//参数拼接
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("channelNbr", sessionStaff.getCurrentChannelCode());
		paramMap.put("salesCode", sessionStaff.getSalesCode());
		paramMap.put("staffCode", sessionStaff.getStaffCode());
		 HttpSession session = request.getSession();
		String areaId = (String) session.getAttribute("preAreaID");
		String PCCustId = (String) session.getAttribute("preCustId");
		String PCAccNbr = (String) session.getAttribute("preAccNbr");
		// 针对选号前置校验，选号校验会传接入号
		if (StringUtils.isBlank((String) paramMap.get("accNbr"))) {
			if("".equals(PCCustId) || PCCustId ==null || PCAccNbr==null || "".equals(PCAccNbr)){
				return super.failed("前置校验参数有误！", ResultConstant.FAILD.getCode());
			}
			paramMap.put("accNbr", PCAccNbr);
			paramMap.put("custId", PCCustId);
		}
		if(!"".equals(areaId) && areaId !=null){
			paramMap.put("areaId", areaId.substring(0, 5) + "00");
		}else{
			 areaId = sessionStaff.getAreaId();
			 paramMap.put("areaId",areaId.substring(0, 5) + "00");
		}
		try {
        	map = this.orderBmo.preCheckBeforeOrde(paramMap, flowNum, sessionStaff);
        	Map<String, Object>  retMap = new HashMap<String, Object>();
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)){
				Map<String, Object> datamap = (Map<String, Object>) map.get("result");
				//List<Map<String, Object>> objReslist = (List<Map<String, Object>>) map.get("result");
				if(datamap !=null){
					boolean flag = false;
					String type = "0";
					StringBuffer sbcheck = new StringBuffer("");
					StringBuffer sbXZ = new StringBuffer("");
					List<Map<String, Object>> checkResultList = null;
                     if (datamap.get("checkResult") != null) {
                         Object obj = datamap.get("checkResult");
                         if (obj instanceof List) {
                        	 checkResultList = (List<Map<String, Object>>) obj;
                         } else {
                        	 checkResultList = new ArrayList<Map<String, Object>>();
                        	 checkResultList.add((Map<String, Object>) obj);
                         }
                         for(Map<String, Object> checkResult : checkResultList){
     						String checkLevel = (String) checkResult.get("checkLevel");
     						String checkInfo = (String) checkResult.get("checkInfo");
     						if("10".equals(checkLevel)){
     							sbcheck.append(checkInfo).append(",");
     							type = "10";
     						}else if("20".equals(checkLevel)){
     							sbXZ.append(checkInfo).append(",");
     							flag = true;
     						}
     					}
                    }
					if(flag){
						retMap.put("checkLevel", "20");
						retMap.put("checkInfo", sbXZ);
					}else if(type.equals("10")){
						retMap.put("checkLevel", "10");
						retMap.put("checkInfo", sbcheck);
					}else{
						retMap.put("checkLevel", "0");
					}
				}else{
					retMap.put("checkLevel", "0");
				}
				jsonResponse = super.successed(retMap,ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(map,ResultConstant.FAILD.getCode());
			}
        }catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.PRE_CHECK_ORDER);
		} catch (Exception e) {
			return super.failed(ErrorCode.PRE_CHECK_ORDER, e, paramMap);
		}
		return jsonResponse;
    }
}
