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
		<InvoicePrinterReq>
			<Acc_Nbr>${accNbr}</Acc_Nbr>
			<Billing_Cycle_ID>${billingCycleId}</Billing_Cycle_ID>
			<Receipt_Class>${receiptClass}</Receipt_Class>
			<Query_Flag>${query_Flag}</Query_Flag>
			<Print_Flag>${printFlag}</Print_Flag>
			<Mvno_Id>${ownerId}</Mvno_Id>
		</InvoicePrinterReq>
	</SvcCont>
</ContractRoot>