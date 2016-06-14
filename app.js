var express=require('express');
var fs=require('fs');
var Q=require('q');
var app=express();

function loadMocks()
{
	var deferred = Q.defer();
	fs.readFile('mock/list.json', "utf-8", ((err, data) => {
		deferred.resolve(JSON.parse(data));
		})
	);
	return deferred.promise;
}

function filterByVat(vatNumber)
{
	return loadMocks().then(data => {
		return data.filter(item => {return item.piva == vatNumber});
	});
}

function filterByName(name)
{
	return loadMocks().then(data =>
	{
		var rx = new RegExp(name, "gi");
		return data.filter(item => { return item.name.match(rx)});
	});
}


app.get('/', ((req, res) => { res.send('Usage: /companies or /companies/search?vat=... or /companies/search?name='); }));

app.get('/companies/search', ((req, res) => {
	var op = undefined;
	if(req.query.vat!==undefined) 
		op = filterByVat(req.query.vat);
	if(req.query.name!==undefined)
		op = filterByName(req.query.name);
	op.then(data => {res.json(data)});
}));

app.get('/companies', ((req, res) =>
{
	loadMocks().then(data => { res.json(data) })
		.fail(err => { console.log(err); });
}));

app.listen(8088, function() {
	console.log("Up and running");
});
