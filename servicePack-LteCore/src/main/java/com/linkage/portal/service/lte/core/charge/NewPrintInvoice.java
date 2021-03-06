package com.linkage.portal.service.lte.core.charge;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.intf.webservice.WSClient;
import com.ailk.ecsp.intf.webservice.WSConfig;
import com.ailk.ecsp.service.Service;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.SoapUtil;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.exception.ResultConstant;
import com.linkage.portal.service.lte.DataMapUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dto.TcpCont;

/**
 * 新发票打印
 */
public class NewPrintInvoice extends Service {
	@SuppressWarnings("unchecked")
	@Override
	public DataMap exec(DataMap dataMap, String serviceSerial) throws Exception {
		String[] params = {"accNbr", "receiptClass","printFlag","query_Flag"};
		dataMap = DataMapUtil.checkParam(dataMap, params);
		if (StringUtils.isNotBlank(dataMap.getResultCode())) {
			return dataMap;
		}		
		Map inParamMap = new HashMap();
        inParamMap = TcpCont.parseTemplateMap(dataMap.getInParam(), getClass().getSimpleName());
        String inXML = MapUtils.getString(inParamMap, "requestXml");
        if (StringUtils.isBlank(inXML)) {
			return DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTF_PARAM_FAIL);
		}
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> inMap = new HashMap<String, Object>();		
		try {
            inMap.put("in0", inXML);
	    	String url = DataRepository.getInstence().getSysParamValue(LteConstants.CON_CSB_URL_KEY,SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);;
			WSConfig config = new WSConfig();
			config.setUrl(url);	
			config.setMethodName("exchange");
			config.setOutParamType(IConstant.CON_OUT_PARAM_TYPE_TO_MAP);
			config.setInParams(inMap);
			Map<String, Object> resMap = WSClient.getInstance().callWS(config);
			//记录接口日志	
			dataMap.put("inIntParam", inXML);
			dataMap.put("outIntParam", MapUtils.getString(resMap, "resultParam"));
			if (ResultConstant.R_POR_SUCCESS.getCode().equals(MapUtils.getString(resMap, "resultCode"))){
				String resXml = TcpCont.buildInParam(MapUtils.getMap(resMap, "result"), getClass().getSimpleName()+"Res");
				returnMap = SoapUtil.xmlToMap(resXml);
				dataMap.setResultCode(ResultConstant.R_POR_SUCCESS.getCode());
				dataMap.setOutParam(returnMap);
			}else{
				returnMap = resMap;
				dataMap.setResultCode(MapUtils.getString(resMap, "resultCode"));
			}
			dataMap.setOutParam(returnMap);
		} catch (Exception e) {
			DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_INTERFACE_EXCEPTION);
			return dataMap;
		}
//		String rxml = TcpCont.buildInParam(null, "simulate_"
//				+ getClass().getSimpleName() + "Res");
//		String resXml = TcpCont.buildInParam(SoapUtil.xmlToMap(rxml),
//				getClass().getSimpleName() + "Res");
//		returnMap = SoapUtil.xmlToMap(resXml);
//		dataMap = DataMapUtil.setDataMapResult(dataMap, ResultConstant.R_POR_SUCCESS);
//		dataMap.setOutParam(returnMap);
		return dataMap;
	}
}
