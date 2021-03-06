<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ActionCode>${TcpCont.ActionCode}</ActionCode>
		<BusCode>${TcpCont.BusCode}</BusCode>
        <ServiceCode>${TcpCont.ServiceCode}</ServiceCode>
        <ServiceContractVer>${TcpCont.ServiceContractVer}</ServiceContractVer>
		<ServiceLevel>${TcpCont.ServiceLevel}</ServiceLevel>
		<SrcOrgID>${TcpCont.SrcOrgID}</SrcOrgID>
		<SrcSysID>${TcpCont.SrcSysID}</SrcSysID>
		<SrcSysSign>${TcpCont.SrcSysSign}</SrcSysSign>
		<DstOrgID>${TcpCont.DstOrgID}</DstOrgID>
		<DstSysID>${TcpCont.DstSysID}</DstSysID>
		<ReqTime>${TcpCont.ReqTime}</ReqTime>		
	</TcpCont>
	<SvcCont>
		<InvoiceReverseReq>
			<Acc_Nbr>${AccNbr}</Acc_Nbr>
			<Oper_Date>${Oper_Date}</Oper_Date>
			<Receipt_Class>${Receipt_Class}</Receipt_Class>
			<Mvno_Id>${ownerId}</Mvno_Id>
			<Channel_Staff_Id>[${channelId}]${staffId}</Channel_Staff_Id>
			<Vat_Item_Detail>
				<Vat_Item_Code>${Vat_Item_Detail.Vat_Item_Code}</Vat_Item_Code>
				<Vat_Item_Number>${Vat_Item_Detail.Vat_Item_Number}</Vat_Item_Number>
			</Vat_Item_Detail>
		</InvoiceReverseReq>
	</SvcCont>
</ContractRoot>
