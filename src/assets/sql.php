<?php
$link = mysql_connect("localhost", "root", "123");
if (!$link) {
	echo "数据库连接失败" . mysql_error();
}
mysql_select_db("police");
mysql_query("SET NAMES utf8");

$postdata = file_get_contents("php://input");
if (isset($postdata) && !empty($postdata)) {
	$request = json_decode($postdata);
	$func = $request->func;
	$data = $request->data;

	call_user_func($func, $data);
	mysql_close($link);
}

function selectCaseAccount($data)
{
	$sql = "select 
				law_case.id caseID,
				caseName,
				caseNumber,
				caseContent,
				start_account.id accountID,
				account,
				accountName,
				tradeTime,
				money,
				queryDuration,
				remark
			from law_case left join start_account 
			on law_case.id = start_account.caseID";

	getSelectResult($sql);
}

function selectAccountOutRecord($data)
{
	$sql = "select * from trade_record 
	where account = '$data->account' 
	and tradeTime >= '$data->startTime' 
	and tradeTime < '$data->endTime' 
	and inOrOut = '借' order by tradeTime";
	getSelectResult($sql);
}

function getSelectResult($sql)
{
	$result = mysql_query($sql);
	$arrResult = array();
	while ($temp = mysql_fetch_assoc($result)) {
		array_push($arrResult, $temp);
	}
	echo json_encode($arrResult);
}

function insert($data)
{
	$tableName = $data->tableName;
	$tableData = $data->tableData;
	$sql = "insert into $tableName (";

	foreach ($tableData as $key => $value) {
		$sql .= $key . ",";
	}
	$sql = substr($sql, 0, strlen($sql) - 1) . ") values (";
	foreach ($tableData as $key => $value) {
		if ($value == 'now()') {
			$sql .= $value . ",";
		} else {
			$sql .= "'" . $value . "',";
		}
	}

	$sql = substr($sql, 0, strlen($sql) - 1) . ")";

	$result = mysql_query($sql);
	$id = mysql_insert_id();
	echo json_encode($id);
}

function insertArray($data)
{
	$sql = "insert ignore into trade_record (";
	$item = $data[0];
	foreach ($item as $key => $value) {
		$sql .= "`$key`,";
	}
	$sql = substr($sql, 0, strlen($sql) - 1) . ") values ";
	$num = count($data);
	for ($i = 0; $i < $num; $i++) {
		$record = $data[$i];
		$sql .= "(";
		foreach ($record as $key => $value) {
			$value == null || $value == 'null' ? $sql .= "null," : $sql .= "'$value',";
		}
		$sql = substr($sql, 0, strlen($sql) - 1) . "),";
	}
	$sql = substr($sql, 0, strlen($sql) - 1);

	$result = mysql_query($sql);
	echo json_encode($result);
	//echo json_encode($sql);
}

function update($data)
{
	$tableName = $data->tableName;
	$tableData = $data->tableData;
	$id = $data->id;
	$sql = "update $tableName set ";
	foreach ($tableData as $key => $value) {
		if($value == null || $value == NaN || $value == '' || $value == 'null')
			$sql.="$key = null,";
		else
			$sql .= "$key='$value',";
	}
	$sql = substr($sql, 0, strlen($sql) - 1) . " where id = $id";

	$result = mysql_query($sql);
	echo json_encode($result);
}

function del($data){
	$tableName = $data->tableName;
	$id = $data->id;
	$sql = "delete from $tableName where id = $id";
	$result = mysql_query($sql);
	echo json_encode($result);
}

function delByIds($data){
	$tableName = $data->tableName;
	$ids = $data->ids;
	$sql = "delete from $tableName where id in($ids)";
	$result = mysql_query($sql);
	echo json_encode($result);
	//echo json_encode($sql);
}

function delRecordByAccount($data){
	$sql = "delete from trade_record where oppositeAccount = '$data->account' and caseID = '$data->caseID'";
	$result = mysql_query($sql);
	echo json_encode($result);
}

?>