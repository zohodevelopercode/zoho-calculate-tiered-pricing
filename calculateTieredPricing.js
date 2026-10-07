void automation.calculateTieredPricing1(Int id)
{
deal = zoho.crm.getRecordById("Deals",id);
Deal_Categorizations = deal.get("Deal_Categorizations");
itemList = List();
check = false;
for each  item in deal.get("Product_Details")
{
	check = true;
	if(Deal_Categorizations == "New" || Deal_Categorizations == "Renewal" || Deal_Categorizations == "Expansion")
	{
		if(item.get("Product_Line_Type") == Deal_Categorizations || item.get("Product_Line_Type") == "One-Time")
		{
			product = zoho.crm.getRecordById("Products",item.get("Product_Name").get("id"));
			if(product.get("Product_Type") == "Bank of Cores")
			{
				queryMap = Map();
				queryMap.put("select_query","select Price from Price_List_Rates where (((From_Rate <= '" + item.get("Quantity") + "') and To_Rate >= '" + item.get("Quantity") + "') and Prodcut_Category = '" + product.get("Product_Category") + "' ) limit 2");
				getPrice = invokeurl
				[
					url :"https://www.zohoapis.com/crm/v8/coql"
					type :POST
					parameters:queryMap.toString()
					connection:"zcrm"
				];
				if(getPrice.isNull() == false)
				{
					itemMap = Map();
					itemMap.put("List_Price",getPrice.get("data").getJSON("Price"));
					itemMap.put("id",item.get("id"));
					itemList.add(itemMap);
				}
				else
				{
					itemMap = Map();
					itemMap.put("List_Price",0);
					itemMap.put("id",item.get("id"));
					itemList.add(itemMap);
				}
			}
			else
			{
				itemMap = Map();
				itemMap.put("List_Price",item.get("List_Price"));
				itemMap.put("id",item.get("id"));
				itemList.add(itemMap);
			}
		}
	}
	else if(Deal_Categorizations == "Renewal + Expansion")
	{
		if(item.get("Product_Line_Type") == "Renewal" || item.get("Product_Line_Type") == "Expansion" || item.get("Product_Line_Type") == "One-Time")
		{
			product = zoho.crm.getRecordById("Products",item.get("Product_Name").get("id"));
			if(product.get("Product_Type") == "Bank of Cores")
			{
				queryMap = Map();
				queryMap.put("select_query","select Price from Price_List_Rates where ((From_Rate <= '" + item.get("Quantity") + "') and To_Rate >= '" + item.get("Quantity") + "') limit 2");
				getPrice = invokeurl
				[
					url :"https://www.zohoapis.com/crm/v8/coql"
					type :POST
					parameters:queryMap.toString()
					connection:"zcrm"
				];
				if(getPrice.isNull() == false)
				{
					itemMap = Map();
					itemMap.put("List_Price",getPrice.get("data").getJSON("Price"));
					itemMap.put("id",item.get("id"));
					itemList.add(itemMap);
				}
				else
				{
					itemMap = Map();
					itemMap.put("List_Price",0);
					itemMap.put("id",item.get("id"));
					itemList.add(itemMap);
				}
			}
			else
			{
				itemMap = Map();
				itemMap.put("List_Price",item.get("List_Price"));
				itemMap.put("id",item.get("id"));
				itemList.add(itemMap);
			}
		}
	}
}
updateMap = Map();
updateMap.put("Product_Details",itemList);
updateMap.put("Payment_Profile_Table",{{"Due_Date":deal.get("Closing_Date"),"Amount_Due":deal.get("Grand_Total")}});
updateDeal = zoho.crm.updateRecord("Deals",id,updateMap);
info updateDeal;
if(check == true)
{
	deal = zoho.crm.getRecordById("Deals",id);
	updateMap = Map();
	updateMap.put("Amount",deal.get("Grand_Total"));
	updateDeal = zoho.crm.updateRecord("Deals",id,updateMap);
	info updateDeal;
}
}
