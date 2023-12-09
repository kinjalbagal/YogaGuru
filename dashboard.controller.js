function renderDashboard(req,res){
    console.log(req.body);
    res.status(200).render('dashboard',{
        name : req.name,
        email : req.email
    })
}

module.exports = {renderDashboard}